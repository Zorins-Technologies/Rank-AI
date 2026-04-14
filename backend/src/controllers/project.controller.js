const db = require("../services/sql.service");
const { createGrowthPlan, generateGuestPreview } = require("../services/growthPlan.service");

/**
 * Controller for project management
 */
const projectController = {
  /**
   * Generates a preview for guests without saving to DB
   * POST /api/projects/guest-preview
   */
  getGuestPreview: async (req, res) => {
    try {
      const { url, website_url, context } = req.body;
      const targetUrl = website_url || url;

      if (!targetUrl) {
        return res.status(400).json({ success: false, error: "Website URL required" });
      }
      
      let finalUrl = targetUrl;
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = 'https://' + finalUrl;
      }
      
      const result = await generateGuestPreview(finalUrl, context);
      return res.status(200).json({ 
        success: true, 
        preview_topics: result.preview_topics || [] 
      });
    } catch (error) {
      console.error("[ProjectController] guestPreview error:", error);
      return res.status(500).json({ success: false, error: "Failed to generate preview." });
    }
  },

  /**
   * Creates a new project and triggers growth plan generation
   * POST /api/projects
   */
  create: async (req, res) => {
    try {
      let { 
        website_url, 
        niche_type = 'custom', 
        niche_value = 'General SEO', 
        brand_name, 
        language, 
        target_country, 
        audience_type, 
        key_offerings, 
        competitors,
        brand_voice,
        primary_goals,
        content_style
      } = req.body;

      // Handle anonymous users (demo/landing page users)
      const userId = req.user ? req.user.uid : 'anonymous_' + Date.now();

      if (website_url && !website_url.startsWith('http://') && !website_url.startsWith('https://')) {
        website_url = 'https://' + website_url;
      }

      console.log(`[ProjectController] Creating project for ${userId} - ${website_url}`);

      const { rows: [newProject] } = await db.query(
        `INSERT INTO projects (user_id, website_url, niche_type, niche_value, brand_name, language, target_country, audience_type, key_offerings, competitors, brand_voice, primary_goals, content_style)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
        [userId, website_url, niche_type, niche_value, brand_name, language, target_country, audience_type, key_offerings, competitors, brand_voice, primary_goals, content_style]
      );

      // Trigger Growth Plan Generation (Strategic roadmap)
      await createGrowthPlan(newProject.id, userId, website_url, niche_value, req.body);

      // Fetch preview topics for immediate user feedback
      const { rows: previewTopics } = await db.query(
        `SELECT * FROM growth_plans WHERE project_id = $1 ORDER BY priority DESC LIMIT 5`,
        [newProject.id]
      );

      return res.status(201).json({ 
        success: true, 
        data: {
          project: newProject, 
          previewTopics 
        }
      });
    } catch (error) {
      console.error("[ProjectController] create error:", error.message);
      return res.status(500).json({ success: false, error: "Failed to create project." });
    }
  },

  /**
   * Fetches all projects for the authenticated user
   * GET /api/projects
   */
  getAll: async (req, res) => {
    try {
      const userId = req.user.uid;

      const { rows } = await db.query(
        `SELECT p.*, COUNT(b.id) as blog_count
         FROM projects p
         LEFT JOIN blogs b ON p.id = b.project_id
         WHERE p.user_id = $1
         GROUP BY p.id
         ORDER BY p.created_at DESC`,
        [userId]
      );

      return res.status(200).json({ success: true, data: rows });
    } catch (error) {
      console.error("[ProjectController] getAll error:", error.message);
      return res.status(500).json({ success: false, error: "Failed to fetch projects." });
    }
  },

  /**
   * Get a single project's details
   * GET /api/projects/:id
   */
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.uid;

      const { rows: [project] } = await db.query(
        `SELECT * FROM projects WHERE id = $1 AND user_id = $2 LIMIT 1`,
        [id, userId]
      );

      if (!project) {
        return res.status(404).json({ success: false, error: "Project not found." });
      }

      return res.status(200).json({ success: true, data: project });
    } catch (error) {
      console.error("[ProjectController] getById error:", error.message);
      return res.status(500).json({ success: false, error: "Failed to fetch project." });
    }
  },

  /**
   * Update project settings
   * PATCH /api/projects/:id
   */
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.uid;
      const { niche_value, status } = req.body;

      const updates = [];
      const values = [id, userId];

      if (niche_value) {
        values.push(niche_value);
        updates.push(`niche_value = $${values.length}`);
      }
      if (status && ["active", "paused"].includes(status)) {
        values.push(status);
        updates.push(`status = $${values.length}`);
      }

      if (updates.length === 0) {
        return res.status(400).json({ success: false, error: "No updates provided." });
      }

      const query = `UPDATE projects SET ${updates.join(", ")}, updated_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING *`;
      const { rows: [updated] } = await db.query(query, values);

      if (!updated) return res.status(404).json({ success: false, error: "Project not found." });

      return res.status(200).json({ success: true, data: updated });
    } catch (error) {
      console.error("[ProjectController] update error:", error.message);
      return res.status(500).json({ success: false, error: "Update failed." });
    }
  },

  /**
   * Delete a project
   * DELETE /api/projects/:id
   */
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.uid;

      const { rows } = await db.query(
        `DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING id`,
        [id, userId]
      );

      if (rows.length === 0) return res.status(404).json({ success: false, error: "Project not found." });

      return res.status(200).json({ success: true, message: "Project deleted." });
    } catch (error) {
      console.error("[ProjectController] delete error:", error.message);
      return res.status(500).json({ success: false, error: "Delete failed." });
    }
  }
};

module.exports = projectController;
