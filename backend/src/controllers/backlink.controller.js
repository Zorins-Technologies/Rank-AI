const db = require("../services/sql.service");
const { generateBacklinkTasks } = require("../services/backlink.service");

/**
 * Controller for backlink orchestration
 */
const backlinkController = {
  /**
   * Fetches all backlink campaigns for a project
   * GET /api/backlinks/:projectId
   */
  getByProject: async (req, res) => {
    try {
      const { projectId } = req.params;

      const { rows } = await db.query(
        `SELECT bc.*, b.title as blog_title, b.slug as blog_slug
         FROM backlink_campaigns bc
         LEFT JOIN blogs b ON bc.blog_id = b.id
         WHERE bc.project_id = $1
         ORDER BY bc.created_at DESC`,
        [projectId]
      );
      
      const { rows: [stats] } = await db.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'pending') as pending,
          COUNT(*) FILTER (WHERE status = 'submitted') as submitted,
          COUNT(*) FILTER (WHERE status = 'live') as live,
          COUNT(*) FILTER (WHERE status = 'lost') as lost,
          COALESCE(SUM(domain_authority) FILTER (WHERE status = 'live'), 0) as total_da
        FROM backlink_campaigns WHERE project_id = $1
      `, [projectId]);

      return res.json({ success: true, data: rows, stats });
    } catch (error) {
      console.error("[BacklinkController] getByProject error:", error.message);
      return res.status(500).json({ success: false, error: "Failed to fetch backlink tasks." });
    }
  },

  /**
   * Generates backlink tasks for a specific blog
   * POST /api/backlinks/:projectId/generate
   */
  generateTasks: async (req, res) => {
    try {
      const { projectId } = req.params;
      const { blog_id } = req.body;

      if (!blog_id) return res.status(400).json({ success: false, error: "blog_id required." });

      const { rows: [blog] } = await db.query(
        `SELECT id, title, keyword FROM blogs WHERE id = $1 AND project_id = $2`,
        [blog_id, projectId]
      );

      if (!blog) return res.status(404).json({ success: false, error: "Blog not found." });

      const result = await generateBacklinkTasks(blog.id, projectId, blog.title, blog.keyword);
      return res.status(201).json(result);
    } catch (error) {
      console.error("[BacklinkController] generateTasks error:", error.message);
      return res.status(500).json({ success: false, error: "Generation failed." });
    }
  },

  /**
   * Updates a specific backlink task
   * PATCH /api/backlinks/:taskId
   */
  updateTask: async (req, res) => {
    try {
      const { taskId } = req.params;
      const { status, url, anchor_text } = req.body;

      const updates = [];
      const values = [taskId];

      if (status) { values.push(status); updates.push(`status = $${values.length}`); }
      if (url) { values.push(url); updates.push(`url = $${values.length}`); }
      if (anchor_text) { values.push(anchor_text); updates.push(`anchor_text = $${values.length}`); }

      if (updates.length === 0) return res.status(400).json({ success: false, error: "No valid updates provided." });

      const query = `UPDATE backlink_campaigns SET ${updates.join(", ")}, updated_at = NOW() WHERE id = $1 RETURNING *`;
      const { rows: [updated] } = await db.query(query, values);
      
      if (!updated) return res.status(404).json({ success: false, error: "Task not found." });

      return res.json({ success: true, data: updated });
    } catch (error) {
      console.error("[BacklinkController] updateTask error:", error.message);
      return res.status(500).json({ success: false, error: "Update failed." });
    }
  },

  /**
   * Lists available backlink platforms
   * GET /api/backlinks/platforms/list
   */
  getPlatforms: async (req, res) => {
    try {
      const { rows } = await db.query(
        `SELECT * FROM backlink_platforms WHERE is_active = true ORDER BY domain_authority DESC`
      );
      return res.json({ success: true, data: rows });
    } catch (error) {
      console.error("[BacklinkController] getPlatforms error:", error.message);
      return res.status(500).json({ success: false, error: "Fetch failed." });
    }
  }
};

module.exports = backlinkController;
