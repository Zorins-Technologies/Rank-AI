const db = require("./sql.service");

/**
 * Initializes the database schema and performs idempotent migrations.
 * This should be called during server startup.
 */
async function runMigrations() {
  console.log('[Database] Initializing schema migrations...');
  
  try {
    // 0. Enable UUID Extension
    await db.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // 1. users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id                   TEXT PRIMARY KEY,
        email                TEXT UNIQUE NOT NULL,
        stripe_customer_id   TEXT,
        subscription_status  TEXT DEFAULT 'trialing',
        plan                 TEXT DEFAULT 'starter',
        trial_ends_at        TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
        created_at           TIMESTAMPTZ DEFAULT NOW(),
        updated_at           TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // 2. projects table
    await db.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id      TEXT NOT NULL,
        website_url  TEXT NOT NULL,
        niche_type   TEXT NOT NULL CHECK (niche_type IN ('preset', 'custom')),
        niche_value  TEXT NOT NULL,
        brand_name   TEXT,
        language     TEXT DEFAULT 'English',
        target_country TEXT DEFAULT 'Global',
        audience_type TEXT,
        brand_voice   TEXT,
        primary_goals TEXT,
        content_style TEXT,
        key_offerings TEXT[],
        competitors   TEXT[],
        status       TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused')),
        created_at   TIMESTAMPTZ DEFAULT NOW(),
        updated_at   TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // 3. blogs table
    await db.query(`
      CREATE TABLE IF NOT EXISTS blogs (
        id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id          TEXT NOT NULL,
        project_id       UUID,
        title            TEXT NOT NULL,
        content          TEXT NOT NULL,
        meta_description TEXT,
        keyword          TEXT,
        image_url        TEXT,
        slug             TEXT UNIQUE NOT NULL,
        analysis         JSONB,
        faq              JSONB,
        status           TEXT DEFAULT 'draft',
        pipeline_status  TEXT DEFAULT 'published',
        seo_score        INT DEFAULT 0,
        aeo_score        INT DEFAULT 0,
        structured_data  JSONB,
        created_at       TIMESTAMPTZ DEFAULT NOW(),
        updated_at       TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // 4. keyword_research table
    await db.query(`
      CREATE TABLE IF NOT EXISTS keyword_research (
        id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id      TEXT NOT NULL,
        project_id   UUID,
        niche        TEXT NOT NULL,
        keyword      TEXT NOT NULL,
        search_volume INT DEFAULT 0,
        difficulty   TEXT DEFAULT 'medium',
        intent       TEXT DEFAULT 'informational',
        status       TEXT DEFAULT 'pending',
        blog_id      UUID,
        created_at   TIMESTAMPTZ DEFAULT NOW(),
        updated_at   TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, keyword)
      )
    `);

    // 5. growth_plans table
    await db.query(`
      CREATE TABLE IF NOT EXISTS growth_plans (
        id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        project_id       UUID NOT NULL,
        user_id          TEXT NOT NULL,
        topic            TEXT NOT NULL,
        keyword          TEXT,
        intent           TEXT,
        priority         INT DEFAULT 0,
        publish_day      INT,
        status           TEXT DEFAULT 'pending',
        strategy_reason  TEXT,
        traffic_potential TEXT,
        ranking_difficulty TEXT,
        ai_visibility_score INT DEFAULT 0,
        created_at       TIMESTAMPTZ DEFAULT NOW(),
        updated_at       TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // 6. aeo_checks table
    await db.query(`
      CREATE TABLE IF NOT EXISTS aeo_checks (
        id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        project_id   UUID NOT NULL,
        engine       TEXT NOT NULL,
        query        TEXT NOT NULL,
        is_mentioned BOOLEAN DEFAULT false,
        context      TEXT,
        sentiment    TEXT DEFAULT 'neutral',
        checked_at   TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // 7. backlink_campaigns table
    await db.query(`
      CREATE TABLE IF NOT EXISTS backlink_campaigns (
        id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        blog_id          UUID,
        project_id       UUID,
        platform         TEXT NOT NULL,
        task_description TEXT,
        status           TEXT DEFAULT 'pending',
        url              TEXT,
        domain_authority INT DEFAULT 0,
        anchor_text      TEXT,
        created_at       TIMESTAMPTZ DEFAULT NOW(),
        updated_at       TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // 8. cms_connections table
    await db.query(`
      CREATE TABLE IF NOT EXISTS cms_connections (
        id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        project_id   UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        cms_type     TEXT NOT NULL CHECK (cms_type IN ('wordpress', 'webflow')),
        site_url     TEXT NOT NULL,
        secret_name  TEXT NOT NULL,
        config       JSONB DEFAULT '{}',
        created_at   TIMESTAMPTZ DEFAULT NOW(),
        updated_at   TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(project_id, cms_type)
      )
    `);

    // 9. backlink_platforms reference table
    await db.query(`
      CREATE TABLE IF NOT EXISTS backlink_platforms (
        id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name             VARCHAR(100) NOT NULL UNIQUE,
        base_url         TEXT NOT NULL,
        domain_authority INT DEFAULT 0,
        platform_type    VARCHAR(50),
        is_active        BOOLEAN DEFAULT true,
        monthly_capacity INT DEFAULT 10
      )
    `);

    // 9. Seed Backlink Platforms
    const platforms = [
      ['Medium', 'https://medium.com', 95, 'blog'],
      ['LinkedIn', 'https://linkedin.com', 99, 'social'],
      ['Reddit', 'https://reddit.com', 91, 'social'],
      ['Quora', 'https://quora.com', 93, 'qa'],
      ['Wikipedia', 'https://wikipedia.org', 100, 'directory'],
      ['Substack', 'https://substack.com', 89, 'blog'],
      ['ProductHunt', 'https://producthunt.com', 90, 'directory'],
    ];
    for (const [p_name, url, da, type] of platforms) {
      await db.query(
        `INSERT INTO backlink_platforms (name, base_url, domain_authority, platform_type)
         VALUES ($1, $2, $3, $4) ON CONFLICT (name) DO NOTHING`,
        [p_name, url, da, type]
      );
    }

    // 10. Multi-tenant Schema Hardening (Ensuring older installs are unified)
    await handleSchemaEvolution();

    console.log('[Database] Migration sequence successful.');
  } catch (err) {
    console.error('[Database Migration Error]:', err.message);
    throw err;
  }
}

async function handleSchemaEvolution() {
  // Add missing columns across various tables
  const columnUpdates = [
    ['projects', 'brand_name', 'TEXT'],
    ['projects', 'language', 'TEXT DEFAULT \'English\''],
    ['projects', 'target_country', 'TEXT DEFAULT \'Global\''],
    ['projects', 'audience_type', 'TEXT'],
    ['projects', 'brand_voice', 'TEXT'],
    ['projects', 'primary_goals', 'TEXT'],
    ['projects', 'content_style', 'TEXT'],
    ['projects', 'key_offerings', 'TEXT[]'],
    ['projects', 'competitors', 'TEXT[]'],
    ['projects', 'autopilot_enabled', 'BOOLEAN DEFAULT false'],
    ['blogs', 'project_id', 'UUID'],
    ['blogs', 'pipeline_status', 'TEXT DEFAULT \'published\''],
    ['blogs', 'status', 'TEXT DEFAULT \'planned\''],
    ['blogs', 'seo_score', 'INT DEFAULT 0'],
    ['blogs', 'aeo_score', 'INT DEFAULT 0'],
    ['blogs', 'structured_data', 'JSONB'],
    ['keyword_research', 'project_id', 'UUID'],
    ['keyword_research', 'blog_id', 'UUID'],
  ];

  for (const [table, col, type] of columnUpdates) {
    try {
      await db.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ${col} ${type}`);
    } catch (_) { /* column exists */ }
  }

  // Enforce Foreign Keys if possible
  try {
    await db.query(`ALTER TABLE blogs ADD CONSTRAINT blogs_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE`);
    await db.query(`ALTER TABLE keyword_research ADD CONSTRAINT keyword_research_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE`);
  } catch (_) { /* constraints exist */ }
}

module.exports = { runMigrations };
