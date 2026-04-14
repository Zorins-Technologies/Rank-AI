const { generateBlog } = require("../services/gemini.service");
const { generateUniqueSlug } = require("../utils/slug");
const db = require("../services/sql.service");
const { generateBacklinkTasks } = require("../services/backlink.service");

const DAILY_LIMIT_PER_USER = 5;
const INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Auto-generation background job.
 * Runs every 24 hours and generates blogs based on the Growth Plan.
 */
async function runAutoGenerateJob() {
  console.log("[AutoGenerate Job] Running Growth Roadmap automation...");

  try {
    // Get all distinct projects that have pending growth plan items
    const { rows: projectRows } = await db.query(
      `SELECT DISTINCT p.id as project_id, p.user_id 
       FROM growth_plans gp 
       JOIN projects p ON gp.project_id = p.id
       WHERE gp.status = 'pending' AND p.status = 'active'`
    );

    if (projectRows.length === 0) {
      console.log("[AutoGenerate Job] No pending growth plan items for active projects. Sleeping.");
      return;
    }

    console.log(`[AutoGenerate Job] Processing ${projectRows.length} project(s) with growth roadmaps.`);

    for (const { project_id, user_id } of projectRows) {
      try {
        // Check daily limit
        const { rows: [limitRow] } = await db.query(
          `SELECT COUNT(*) as cnt FROM blogs
           WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '24 hours'`,
          [user_id]
        );

        const generatedToday = parseInt(limitRow.cnt);
        const slotsAvailable = DAILY_LIMIT_PER_USER - generatedToday;

        if (slotsAvailable <= 0) {
          console.log(`[AutoGenerate Job] User ${user_id} reached daily limit. Skipping.`);
          continue;
        }

        // Fetch the next pending growth plan items for THIS project
        const { rows: pendingItems } = await db.query(
          `SELECT * FROM growth_plans
           WHERE project_id = $1 AND status = 'pending'
           ORDER BY publish_day ASC, created_at ASC
           LIMIT $2`,
          [project_id, slotsAvailable]
        );

        for (const item of pendingItems) {
          try {
            // Mark as generating
            await db.query(
              `UPDATE growth_plans SET status = 'generating', updated_at = NOW() WHERE id = $1`,
              [item.id]
            );

            // Run the blog generation pipeline
            console.log(`[AutoGenerate Job] Generating blog for: "${item.topic}"`);
            const blogData = await generateBlog(item.keyword || item.topic);
            
            const { rows: slugRows } = await db.query(
              "SELECT slug FROM blogs WHERE user_id = $1", [user_id]
            );
            const slug = generateUniqueSlug(blogData.title, slugRows.map(r => r.slug));

            // Save blog with AEO features and Pipeline Status
            const { rows: [savedBlog] } = await db.query(
              `INSERT INTO blogs (
                user_id, project_id, title, content, meta_description, 
                keyword, image_url, slug, analysis, faq, 
                structured_data, pipeline_status, seo_score, aeo_score
              )
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING id`,
              [
                user_id, project_id, blogData.title, blogData.content, blogData.metaDescription,
                item.keyword || item.topic, blogData.imageUrl, slug,
                JSON.stringify(blogData.analysis), JSON.stringify(blogData.faq),
                JSON.stringify(blogData.structured_data), 'published',
                blogData.analysis.seo_score, blogData.analysis.aeo_score
              ]
            );

            // Mark growth plan item as completed
            await db.query(
              `UPDATE growth_plans SET status = 'completed', updated_at = NOW() WHERE id = $1`,
              [item.id]
            );

            // Generate backlink tasks
            await generateBacklinkTasks(savedBlog.id, project_id, blogData.title, item.keyword || item.topic);

            console.log(`[AutoGenerate Job] Success: Generated blog and backlink tasks for project ${project_id}`);

            // Small delay
            await new Promise(r => setTimeout(r, 2000));

          } catch (itemErr) {
            console.error(`[AutoGenerate Job] Item Failed: "${item.topic}":`, itemErr.message);
            await db.query(
              `UPDATE growth_plans SET status = 'failed', updated_at = NOW() WHERE id = $1`, [item.id]
            );
          }
        }

      } catch (projectErr) {
        console.error(`[AutoGenerate Job] Error processing project ${project_id}:`, projectErr.message);
      }
    }

    console.log("[AutoGenerate Job] Growth Roadmap cycle complete.");

  } catch (err) {
    console.error("[AutoGenerate Job] Fatal error:", err.message);
  }
}

/**
 * Start the background job.
 */
function startAutoGenerateJob() {
  console.log("[AutoGenerate Job] Growth Engine initialized.");
  setTimeout(() => {
    runAutoGenerateJob();
    setInterval(runAutoGenerateJob, INTERVAL_MS);
  }, 60 * 1000);
}

module.exports = { startAutoGenerateJob };
