const { generateBlog } = require("../services/gemini.service");
const { calculateSeoScore } = require("../utils/seo");
const { generateUniqueSlug } = require("../utils/slug");
const db = require("../services/sql.service");

const DAILY_LIMIT_PER_USER = 5;
const INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Auto-generation background job.
 * Runs every 24 hours and generates blogs for pending keywords,
 * respecting a per-user daily limit of 5.
 */
async function runAutoGenerateJob() {
  console.log("[AutoGenerate Job] Running scheduled keyword automation...");

  try {
    // Get all distinct projects that have pending keywords
    const { rows: projectRows } = await db.query(
      `SELECT DISTINCT p.id as project_id, p.user_id 
       FROM keyword_research kr 
       JOIN projects p ON kr.project_id = p.id
       WHERE kr.status = 'pending' AND p.status = 'active'`
    );

    if (projectRows.length === 0) {
      console.log("[AutoGenerate Job] No pending keywords for active projects. Sleeping.");
      return;
    }

    console.log(`[AutoGenerate Job] Processing ${projectRows.length} project(s) with pending keywords.`);

    for (const { project_id, user_id } of projectRows) {
      try {
        // Check how many blogs this user/project has already generated today
        // (Global daily limit of 5 per user still applies for now)
        const { rows: [limitRow] } = await db.query(
          `SELECT COUNT(*) as cnt FROM keyword_research
           WHERE user_id = $1 AND status = 'generated'
           AND updated_at >= NOW() - INTERVAL '24 hours'`,
          [user_id]
        );

        const generatedToday = parseInt(limitRow.cnt);
        const slotsAvailable = DAILY_LIMIT_PER_USER - generatedToday;

        if (slotsAvailable <= 0) {
          console.log(`[AutoGenerate Job] User ${user_id} has reached daily limit (${DAILY_LIMIT_PER_USER}). Skipping.`);
          continue;
        }

        // Fetch the oldest pending keywords for THIS project up to the remaining slots
        const { rows: pendingKeywords } = await db.query(
          `SELECT * FROM keyword_research
           WHERE project_id = $1 AND status = 'pending'
           ORDER BY created_at ASC
           LIMIT $2`,
          [project_id, slotsAvailable]
        );

        console.log(`[AutoGenerate Job] Project ${project_id}: ${slotsAvailable} slot(s) available, processing ${pendingKeywords.length} keyword(s).`);

        for (const kw of pendingKeywords) {
          try {
            // Mark as generating
            await db.query(
              `UPDATE keyword_research SET status = 'generating', updated_at = NOW() WHERE id = $1`,
              [kw.id]
            );

            // Run the blog generation pipeline
            const blogData = await generateBlog(kw.keyword);
            const analysis = calculateSeoScore({
              title: blogData.title,
              metaDescription: blogData.metaDescription,
              content: blogData.content,
              keyword: kw.keyword,
            });

            const { rows: slugRows } = await db.query(
              "SELECT slug FROM blogs WHERE user_id = $1", [user_id]
            );
            const slug = generateUniqueSlug(blogData.title, slugRows.map(r => r.slug));

            const { rows: [savedBlog] } = await db.query(
              `INSERT INTO blogs (user_id, project_id, title, content, meta_description, keyword, image_url, slug, analysis, faq)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
              [user_id, project_id, blogData.title, blogData.content, blogData.metaDescription,
               kw.keyword, blogData.imageUrl, slug,
               JSON.stringify(analysis), JSON.stringify(blogData.faq || [])]
            );

            await db.query(
              `UPDATE keyword_research SET status = 'generated', blog_id = $1, updated_at = NOW() WHERE id = $2`,
              [savedBlog.id, kw.id]
            );

            console.log(`[AutoGenerate Job] ✅ Generated blog for user ${user_id}, keyword: "${kw.keyword}"`);

            // Small delay between generations to avoid rate limits
            await new Promise(r => setTimeout(r, 2000));

          } catch (kwErr) {
            console.error(`[AutoGenerate Job] ❌ Failed for keyword "${kw.keyword}":`, kwErr.message);
            await db.query(
              `UPDATE keyword_research SET status = 'failed', updated_at = NOW() WHERE id = $1`, [kw.id]
            );
          }
        }

      } catch (userErr) {
        console.error(`[AutoGenerate Job] Error processing user ${user_id}:`, userErr.message);
      }
    }

    console.log("[AutoGenerate Job] ✅ Job cycle complete.");

  } catch (err) {
    console.error("[AutoGenerate Job] Fatal error:", err.message);
  }
}

/**
 * Start the background job. Runs immediately on boot, then every 24 hours.
 */
function startAutoGenerateJob() {
  console.log("[AutoGenerate Job] Scheduler initialized. First run in 60 seconds, then every 24 hours.");

  // Delay first run by 60s so DB is fully warmed up before processing
  setTimeout(() => {
    runAutoGenerateJob();
    setInterval(runAutoGenerateJob, INTERVAL_MS);
  }, 60 * 1000);
}

module.exports = { startAutoGenerateJob };
