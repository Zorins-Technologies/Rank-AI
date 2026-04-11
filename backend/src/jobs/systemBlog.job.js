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
 * Researches, generates, and publishes blog posts for ALL active projects.
 */
async function runDailySystemBlog() {
  const jobStartTime = new Date().toISOString();
  console.log(`\n[AUTONOMOUS JOB] Starting Daily Cycle: ${jobStartTime}`);

  try {
    // 1. FETCH ALL ACTIVE PROJECTS
    const { rows: projects } = await db.query(
      "SELECT * FROM projects WHERE status = 'active'"
    );

    if (projects.length === 0) {
      console.log("[AUTONOMOUS JOB] No active projects found. Cycle complete.");
      return;
    }

    console.log(`[AUTONOMOUS JOB] Found ${projects.length} active project(s). Processing...`);

    const dayOfMonth = new Date().getDate();
    const format = FORMATS[dayOfMonth % FORMATS.length];

    for (const project of projects) {
      try {
        const { id: projectId, user_id: userId, niche_value: niche } = project;
        console.log(`[AUTONOMOUS JOB] Processing Project: ${projectId} | Niche: "${niche}"`);

        // 2. RESEARCH KEYWORDS FOR THIS NICHE
        const keywords = await researchKeywords(niche);

        // 3. SELECTION (Pick the best unique keyword NOT already used in this project)
        const sortedKeywords = keywords
          .filter(k => k.difficulty !== "hard")
          .sort((a, b) => b.search_volume - a.search_volume);

        let selectedKw = null;
        for (const kw of sortedKeywords) {
          const { rows } = await db.query(
            "SELECT id FROM blogs WHERE project_id = $1 AND keyword = $2 LIMIT 1",
            [projectId, kw.keyword.toLowerCase()]
          );
          if (rows.length === 0) {
            selectedKw = kw;
            break;
          }
        }

        if (!selectedKw) {
          console.warn(`[AUTONOMOUS JOB] No unique keywords for project ${projectId}. Skipping.`);
          continue;
        }

        console.log(`[AUTONOMOUS JOB] Selected: "${selectedKw.keyword}" for Project ${projectId}`);

        // 4. GENERATE CONTENT
        const blogData = await generateBlog(`${selectedKw.keyword} (${format})`);
        
        // 5. SEO & SLUG
        const analysis = calculateSeoScore({
          title: blogData.title,
          metaDescription: blogData.metaDescription,
          content: blogData.content,
          keyword: selectedKw.keyword,
        });

        const { rows: slugRows } = await db.query("SELECT slug FROM blogs WHERE user_id = $1", [userId]);
        const slug = generateUniqueSlug(blogData.title, slugRows.map(r => r.slug));

        // 6. SAVE & PUBLISH
        const insertQuery = `
          INSERT INTO blogs (
            user_id, project_id, title, content, meta_description, keyword, image_url, slug, analysis, faq, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING *
        `;
        
        const { rows: [savedBlog] } = await db.query(insertQuery, [
          userId,
          projectId,
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

        console.log(`[AUTONOMOUS JOB] ✅ Published: ${savedBlog.title} (Project: ${projectId})`);

        // 7. TRIGGER INDEXING (Async)
        triggerIndexing(savedBlog.slug);

        // Optional delay to respect rate limits between projects
        await new Promise(r => setTimeout(r, 2000));

      } catch (projectErr) {
        console.error(`[AUTONOMOUS JOB] ❌ Error processing project ${project.id}:`, projectErr.message);
      }
    }

    console.log(`[AUTONOMOUS JOB] ✅ Full Cycle Complete: ${new Date().toISOString()}`);

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
