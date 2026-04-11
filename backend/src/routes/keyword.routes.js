const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth.middleware");
const { generationLimiter } = require("../middleware/rateLimit");
const { researchKeywords } = require("../services/keyword.service");
const { generateBlog } = require("../services/gemini.service");
const { calculateSeoScore } = require("../utils/seo");
const { generateUniqueSlug } = require("../utils/slug");
const db = require("../services/sql.service");

// ─── POST /keywords/research ──────────────────────────────────────────────────
// Generate 20-50 keywords for a given niche and save them to the DB.
// Skips duplicates for the same user via the unique DB index.
router.post("/research", verifyToken, generationLimiter, async (req, res) => {
  try {
    const { niche, project_id } = req.body;
    const userId = req.user.uid;

    if (!niche || !niche.trim() || !project_id) {
      return res.status(400).json({ success: false, error: "niche and project_id are required" });
    }

    // Verify project ownership
    const { rows: projectRows } = await db.query(`SELECT id FROM projects WHERE id = $1 AND user_id = $2`, [project_id, userId]);
    if (projectRows.length === 0) return res.status(403).json({ success: false, error: "Project not found or access denied." });

    console.log(`[Keywords] Researching niche: "${niche}" for project: ${project_id}`);

    const keywords = await researchKeywords(niche.trim());

    // Bulk-insert, ignore duplicates (ON CONFLICT DO NOTHING)
    const insertedKeywords = [];
    for (const kw of keywords) {
      try {
        const { rows } = await db.query(
          `INSERT INTO keyword_research (user_id, project_id, niche, keyword, search_volume, difficulty, intent)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (user_id, keyword) DO NOTHING
           RETURNING *`,
          [userId, project_id, niche.trim(), kw.keyword, kw.search_volume || 0, kw.difficulty || "medium", kw.intent || "informational"]
        );
        if (rows[0]) insertedKeywords.push(rows[0]);
      } catch (dbErr) {
        console.warn(`[Keywords] Skipping duplicate keyword: "${kw.keyword}"`);
      }
    }

    return res.status(201).json({
      success: true,
      data: insertedKeywords,
      count: insertedKeywords.length,
      total_generated: keywords.length,
      message: `${insertedKeywords.length} new keywords saved (${keywords.length - insertedKeywords.length} duplicates skipped).`,
    });
  } catch (error) {
    console.error("[Keywords /research] Error:", error.message);
    return res.status(500).json({ success: false, error: "Failed to research keywords: " + error.message });
  }
});

// ─── GET /keywords ────────────────────────────────────────────────────────────
// List all keywords for the authenticated user.
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const { niche, status, project_id } = req.query;

    let query = `SELECT * FROM keyword_research WHERE user_id = $1`;
    const params = [userId];

    if (project_id) {
      params.push(project_id);
      query += ` AND project_id = $${params.length}`;
    }
    if (niche) {
      params.push(`%${niche}%`);
      query += ` AND niche ILIKE $${params.length}`;
    }
    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    query += ` ORDER BY created_at DESC`;

    const { rows } = await db.query(query, params);

    return res.status(200).json({ success: true, data: rows, count: rows.length });
  } catch (error) {
    console.error("[Keywords GET /] Error:", error.message);
    return res.status(500).json({ success: false, error: "Failed to fetch keywords: " + error.message });
  }
});

// ─── POST /keywords/:id/generate ─────────────────────────────────────────────
// Trigger blog generation for a specific keyword ID.
// Marks the keyword as 'generating' immediately, then runs the pipeline.
router.post("/:id/generate", verifyToken, generationLimiter, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    // Fetch the keyword to ensure it belongs to this user
    const { rows: [kw] } = await db.query(
      `SELECT * FROM keyword_research WHERE id = $1 AND user_id = $2 LIMIT 1`,
      [id, userId]
    );

    if (!kw) return res.status(404).json({ success: false, error: "Keyword not found." });
    if (kw.status === "generated") {
      return res.status(409).json({ success: false, error: "Blog already generated for this keyword." });
    }
    if (kw.status === "generating") {
      return res.status(409).json({ success: false, error: "Blog generation is already in progress." });
    }

    // Check per-user daily limit (manual triggers count toward the limit)
    const { rows: [limitRow] } = await db.query(
      `SELECT COUNT(*) as cnt FROM keyword_research
       WHERE user_id = $1 AND status = 'generated'
       AND updated_at >= NOW() - INTERVAL '24 hours'`,
      [userId]
    );
    if (parseInt(limitRow.cnt) >= 5) {
      return res.status(429).json({
        success: false,
        error: "Daily generation limit reached (5 blogs/day). Please try again tomorrow.",
      });
    }

    // Mark as generating immediately so UI can show progress
    await db.query(
      `UPDATE keyword_research SET status = 'generating', updated_at = NOW() WHERE id = $1`,
      [id]
    );

    // Run the blog generation pipeline (async — respond fast, process in background)
    res.status(202).json({
      success: true,
      message: `Blog generation started for keyword: "${kw.keyword}"`,
      keywordId: id,
    });

    // Background pipeline (after response is sent)
    (async () => {
      try {
        const blogData = await generateBlog(kw.keyword);
        const analysis = calculateSeoScore({
          title: blogData.title,
          metaDescription: blogData.metaDescription,
          content: blogData.content,
          keyword: kw.keyword,
        });

        const { rows: slugRows } = await db.query(
          "SELECT slug FROM blogs WHERE user_id = $1", [userId]
        );
        const slug = generateUniqueSlug(blogData.title, slugRows.map(r => r.slug));

        const { rows: [savedBlog] } = await db.query(
          `INSERT INTO blogs (user_id, project_id, title, content, meta_description, keyword, image_url, slug, analysis, faq)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
          [userId, kw.project_id, blogData.title, blogData.content, blogData.metaDescription,
           kw.keyword, blogData.imageUrl, slug,
           JSON.stringify(analysis), JSON.stringify(blogData.faq || [])]
        );

        await db.query(
          `UPDATE keyword_research SET status = 'generated', blog_id = $1, updated_at = NOW() WHERE id = $2`,
          [savedBlog.id, id]
        );

        console.log(`[Keywords] Blog generated for keyword "${kw.keyword}" → blog ID: ${savedBlog.id}`);
      } catch (pipelineErr) {
        console.error(`[Keywords] Pipeline failed for keyword "${kw.keyword}":`, pipelineErr.message);
        await db.query(
          `UPDATE keyword_research SET status = 'failed', updated_at = NOW() WHERE id = $1`, [id]
        );
      }
    })();

  } catch (error) {
    console.error("[Keywords POST /:id/generate] Error:", error.message);
    return res.status(500).json({ success: false, error: "Failed to start generation: " + error.message });
  }
});

module.exports = router;
