const cron = require("node-cron");
const { researchKeywords } = require("../services/keyword.service");
const { generateBlog } = require("../services/gemini.service");
const { generateUniqueSlug } = require("../utils/slug");
const { calculateSeoScore } = require("../utils/seo");
const db = require("../services/sql.service");
const { triggerIndexing } = require("../routes/blog.routes");

// ─── CONFIGURATION ────────────────────────────────────────────────────────────

const SYSTEM_USER_ID = "rankai-system-01";
const NICHES = [
  "AI tools",
  "SaaS growth",
  "SEO strategies",
  "make money online",
  "ecommerce",
  "freelancing",
  "productivity"
];

const FORMATS = [
  "how-to guide",
  "listicle",
  "comparison review",
  "technical tutorial"
];

/**
 * Main Autonomous Job Function
 * Researches, generates, and publishes one high-quality blog post.
 */
async function runDailySystemBlog() {
  const jobStartTime = new Date().toISOString();
  console.log(`\n[AUTONOMOUS JOB] Starting Daily Cycle: ${jobStartTime}`);

  try {
    // 1. SELECT NICHE (Rotating based on day of month)
    const dayOfMonth = new Date().getDate();
    const niche = NICHES[dayOfMonth % NICHES.length];
    const format = FORMATS[dayOfMonth % FORMATS.length];
    
    console.log(`[AUTONOMOUS JOB] Target Niche: "${niche}" | Target Format: "${format}"`);

    // 2. RESEARCH KEYWORDS
    console.log(`[AUTONOMOUS JOB] Fetching keywords for niche...`);
    const keywords = await researchKeywords(niche);

    // 3. SELECTION (Pick the best unique keyword)
    // Filter for easy/medium and sort by volume
    const sortedKeywords = keywords
      .filter(k => k.difficulty !== "hard")
      .sort((a, b) => b.search_volume - a.search_volume);

    let selectedKw = null;
    for (const kw of sortedKeywords) {
      // Check if we've already generated a blog for this exact keyword
      const { rows } = await db.query(
        "SELECT id FROM blogs WHERE keyword = $1 LIMIT 1",
        [kw.keyword.toLowerCase()]
      );
      if (rows.length === 0) {
        selectedKw = kw;
        break;
      }
      console.log(`[AUTONOMOUS JOB] Skipping duplicate keyword: "${kw.keyword}"`);
    }

    if (!selectedKw) {
       console.warn("[AUTONOMOUS JOB] No unique keywords found in this niche today. Skipping.");
       return;
    }

    console.log(`[AUTONOMOUS JOB] Selected Optimal Keyword: "${selectedKw.keyword}" (Vol: ${selectedKw.search_volume})`);

    // 4. GENERATE CONTENT
    console.log(`[AUTONOMOUS JOB] Generating high-quality content...`);
    const blogData = await generateBlog(`${selectedKw.keyword} (${format})`);
    
    // 5. SEO & SLUG
    const analysis = calculateSeoScore({
      title: blogData.title,
      metaDescription: blogData.metaDescription,
      content: blogData.content,
      keyword: selectedKw.keyword,
    });

    const { rows: slugRows } = await db.query("SELECT slug FROM blogs WHERE user_id = $1", [SYSTEM_USER_ID]);
    const slug = generateUniqueSlug(blogData.title, slugRows.map(r => r.slug));

    // 6. SAVE & PUBLISH
    const insertQuery = `
      INSERT INTO blogs (
        user_id, title, content, meta_description, keyword, image_url, slug, analysis, faq, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    const { rows: [savedBlog] } = await db.query(insertQuery, [
      SYSTEM_USER_ID,
      blogData.title,
      blogData.content,
      blogData.metaDescription,
      selectedKw.keyword.toLowerCase(),
      blogData.imageUrl,
      slug,
      JSON.stringify(analysis),
      JSON.stringify(blogData.faq || []),
      "published"
    ]);

    console.log(`[AUTONOMOUS JOB] ✅ Successfully Published: ${savedBlog.title} | Slug: ${savedBlog.slug}`);

    // 7. TRIGGER INDEXING
    await triggerIndexing(savedBlog.slug);

  } catch (error) {
    console.error(`[AUTONOMOUS JOB] ❌ Fatal Error during autonomous cycle:`, error.message);
  }
}

/**
 * Initialize the system blog job
 */
function startSystemBlogJob() {
  // Run daily at 2 AM
  cron.schedule("0 2 * * *", () => {
    runDailySystemBlog();
  });

  console.log("[AUTONOMOUS JOB] Scheduler initialized: 2 AM Daily Cycle.");

  // Optional: Run immediately on startup in development mode for easier debugging
  if (process.env.DEBUG_AUTO_JOB === "true") {
    console.log("[AUTONOMOUS JOB] DEBUG_AUTO_JOB is true. Triggering cycle now...");
    runDailySystemBlog();
  }
}

module.exports = { startSystemBlogJob, runDailySystemBlog };
