const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./src/config'); 
const db = require('./src/services/sql.service');
const blogRoutes = require('./src/routes/blog.routes.js');
const keywordRoutes = require('./src/routes/keyword.routes.js');
const projectRoutes = require('./src/routes/project.routes.js');
const { apiLimiter } = require('./src/middleware/rateLimit');
const { startAutoGenerateJob } = require('./src/jobs/autoGenerate.job');
const { startSystemBlogJob } = require('./src/jobs/systemBlog.job');

const app = express();
const PORT = process.env.PORT || 8080;

// Required for Cloud Run to correctly identify user IPs for rate limiting
app.set('trust proxy', 1);

// 1. CORS CONFIGURATION (Must be first to handle preflights)
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options("*", cors());

// Raw Headers Fallback to guarantee CORS compliance
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// 2. Standard Middlewares
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 3. Rate Limiting (Applied AFTER CORS)
app.use(apiLimiter);

// Professional Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health Check Endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    service: 'Rank AI SaaS Backend', 
    project: config.gcpProjectId,
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/health-db', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT NOW()');
    res.json({ dbTime: rows[0].now });
  } catch (error) {
    console.error('DB health check error:', error);
    res.status(500).json({ error: 'Database connection error' });
  }
});

// Business Logic Routes (SaaS)
app.use('/', blogRoutes);
app.use('/keywords', keywordRoutes);
app.use('/api/projects', projectRoutes);

// Compatibility fallback for root access
app.get('/', (req, res) => {
  res.redirect('/health');
});

// Final Catch-All for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ success: false, error: 'CORS Error: Origin not allowed' });
  }
  console.error('[CRITICAL SERVER ERROR]:', err.stack);
  res.status(500).json({ 
    success: false, 
    error: 'Internal Server Error',
    // Only expose error details in development
    ...(process.env.NODE_ENV !== 'production' && { message: err.message })
  });
});

// ─── On-Boot Database Migration ─────────────────────────────────────────────
async function runMigrations() {
  try {
    await db.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // 1. Create Projects Table
    await db.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id      TEXT NOT NULL,
        website_url  TEXT NOT NULL,
        niche_type   TEXT NOT NULL CHECK (niche_type IN ('preset', 'custom')),
        niche_value  TEXT NOT NULL,
        status       TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused')),
        created_at   TIMESTAMPTZ DEFAULT NOW(),
        updated_at   TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    await db.query(`CREATE INDEX IF NOT EXISTS projects_user_id_idx ON projects (user_id)`);

    // 2. Update Keyword Research Table
    await db.query(`ALTER TABLE keyword_research ADD COLUMN IF NOT EXISTS project_id UUID`);
    // Foreign key will be added after migration to ensure safety
    
    // 3. Update Blogs Table
    await db.query(`ALTER TABLE blogs ADD COLUMN IF NOT EXISTS project_id UUID`);

    // 4. PERFORM DATA MIGRATION (Default Project for existing users)
    console.log('[Migration] Checking for users needing a Default Project...');
    
    // Get unique users from both blogs and keyword_research who don't have a project yet
    const { rows: orphanUsers } = await db.query(`
      SELECT DISTINCT user_id FROM (
        SELECT user_id FROM blogs WHERE project_id IS NULL
        UNION
        SELECT user_id FROM keyword_research WHERE project_id IS NULL
      ) as orphans
    `);

    for (const { user_id } of orphanUsers) {
      console.log(`[Migration] Creating Default Project for user: ${user_id}`);
      // Check if user already has any project (defensive)
      const { rows: projects } = await db.query(`SELECT id FROM projects WHERE user_id = $1 LIMIT 1`, [user_id]);
      
      let projectId;
      if (projects.length === 0) {
        const { rows: [newProject] } = await db.query(`
          INSERT INTO projects (user_id, website_url, niche_type, niche_value, status)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id
        `, [user_id, 'https://default.com', 'preset', 'General', 'active']);
        projectId = newProject.id;
      } else {
        projectId = projects[0].id;
      }

      // Update their records
      await db.query(`UPDATE blogs SET project_id = $1 WHERE user_id = $2 AND project_id IS NULL`, [projectId, user_id]);
      await db.query(`UPDATE keyword_research SET project_id = $1 WHERE user_id = $2 AND project_id IS NULL`, [projectId, user_id]);
    }

    // 5. Finalize Constraints (Once migration is done)
    // Note: We only enforce NOT NULL if we are sure all orphans are cleared
    try {
       await db.query(`ALTER TABLE blogs ALTER COLUMN project_id SET NOT NULL`);
       await db.query(`ALTER TABLE blogs ADD CONSTRAINT blogs_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE`);
       await db.query(`ALTER TABLE keyword_research ADD CONSTRAINT keyword_research_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE`);
       console.log('[Migration] Multi-tenant project constraints enforced.');
    } catch (constErr) {
       console.warn('[Migration] Constraints already exist or table is empty during constraint phase.');
    }

    // Existing Keyword Research table adjustments
    await db.query(`
      CREATE TABLE IF NOT EXISTS keyword_research (
        id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id      TEXT NOT NULL,
        niche        TEXT NOT NULL,
        keyword      TEXT NOT NULL,
        search_volume INT DEFAULT 0,
        difficulty   TEXT DEFAULT 'medium',
        intent       TEXT DEFAULT 'informational',
        status       TEXT DEFAULT 'pending',
        blog_id      UUID REFERENCES blogs(id) ON DELETE SET NULL,
        created_at   TIMESTAMPTZ DEFAULT NOW(),
        updated_at   TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    // Re-run original keyword project indexes if they were missing or needed update
    await db.query(`CREATE INDEX IF NOT EXISTS keyword_research_project_idx ON keyword_research (project_id)`);

    console.log('[Migration] Multi-tenant project system ready.');
  } catch (err) {
    console.error('[Migration] Error:', err.message);
  }
}

// Startup logic
const server = app.listen(PORT, '0.0.0.0', async () => {
  console.log(`\n============================================`);
  console.log(`  Rank AI SaaS — UP & RUNNING on 0.0.0.0:${PORT}`);
  console.log(`  Project: ${config.gcpProjectId}`);
  console.log(`  Modernized April 2026 (Gen AI SDK)`);
  console.log(`============================================\n`);

  await runMigrations();
  startAutoGenerateJob();
  startSystemBlogJob();
});

// Graceful Shutdown Handler
const shutdown = (signal) => {
  console.log(`\n[${signal}] Received. Shutting down Rank AI Backend...`);
  server.close(() => {
    console.log('  -> Server closed. Clean exit.');
    process.exit(0);
  });
  
  // Force exit after 3 seconds if server.close is hanging
  setTimeout(() => {
    console.error('  -> Could not close connections in time, forcing shut down.');
    process.exit(1);
  }, 3000);
};

// Listen for termination signals
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Graceful Port Management
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n[FATAL]: Port ${PORT} already in use. Please clear old processes.`);
    process.exit(1);
  }
});
