const db = require("../services/sql.service");
const { researchKeywords } = require("../services/keyword.service");
const { generateBlogPipeline } = require("../services/blog.orchestrator");

/**
 * Controller for keyword research and management
 */
const keywordController = {
  /**
   * Performs keyword research for a niche
   * POST /api/keywords/research
   */
  research: async (req, res) => {
    try {
      const { niche, project_id } = req.body;
      const userId = req.user.uid;

      if (!niche || !project_id) {
        return res.status(400).json({ success: false, error: "Niche and project ID are required" });
      }

      // Ownership check
      const { rows: projectRows } = await db.query(
        `SELECT id FROM projects WHERE id = $1 AND user_id = $2`, 
        [project_id, userId]
      );
      if (projectRows.length === 0) {
        return res.status(403).json({ success: false, error: "Access denied." });
      }

      console.log(`[KeywordController] Researching keywords for: "${niche}"`);
      const keywords = await researchKeywords(niche.trim());

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
        } catch (err) {
          // Skip duplicates silently or log as warn
        }
      }

      return res.status(201).json({
        success: true,
        data: insertedKeywords,
        count: insertedKeywords.length,
        message: `Discovered ${insertedKeywords.length} new keywords.`,
      });
    } catch (error) {
      console.error("[KeywordController] research error:", error.message);
      return res.status(500).json({ success: false, error: "Research failed." });
    }
  },

  /**
   * Lists keywords for the user
   * GET /api/keywords
   */
  getAll: async (req, res) => {
    try {
      const userId = req.user.uid;
      const { project_id, status } = req.query;

      let query = `SELECT * FROM keyword_research WHERE user_id = $1`;
      const params = [userId];

      if (project_id) {
        params.push(project_id);
        query += ` AND project_id = $${params.length}`;
      }
      if (status) {
        params.push(status);
        query += ` AND status = $${params.length}`;
      }

      query += ` ORDER BY created_at DESC`;
      const { rows } = await db.query(query, params);

      return res.status(200).json({ success: true, data: rows });
    } catch (error) {
      console.error("[KeywordController] getAll error:", error.message);
      return res.status(500).json({ success: false, error: "Fetch failed." });
    }
  },

  /**
   * Triggers blog generation for a keyword
   * POST /api/keywords/:id/generate
   */
  generateForKeyword: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.uid;

      const { rows: [kw] } = await db.query(
        `SELECT * FROM keyword_research WHERE id = $1 AND user_id = $2 LIMIT 1`,
        [id, userId]
      );

      if (!kw) return res.status(404).json({ success: false, error: "Keyword not found." });
      if (kw.status === "generating" || kw.status === "generated") {
        return res.status(409).json({ success: false, error: "Already processed or in progress." });
      }

      // Mark as generating
      await db.query(
        `UPDATE keyword_research SET status = 'generating', updated_at = NOW() WHERE id = $1`,
        [id]
      );

      // Respond immediately to UI
      res.status(202).json({
        success: true,
        message: `Generation started for: ${kw.keyword}`,
      });

      // Background process using Orchestrator
      (async () => {
        try {
          const result = await generateBlogPipeline(userId, kw.keyword, kw.project_id);
          
          await db.query(
            `UPDATE keyword_research SET status = 'generated', blog_id = $1, updated_at = NOW() WHERE id = $2`,
            [result.id, id]
          );
          console.log(`[KeywordController] Background generation completed for: ${kw.keyword}`);
        } catch (err) {
          console.error(`[KeywordController] Background generation failed: ${err.message}`);
          await db.query(
            `UPDATE keyword_research SET status = 'failed', updated_at = NOW() WHERE id = $1`, 
            [id]
          );
        }
      })();
    } catch (error) {
      console.error("[KeywordController] generateForKeyword error:", error.message);
      return res.status(500).json({ success: false, error: "Failed to start generation." });
    }
  }
};

module.exports = keywordController;
