const db = require("../services/sql.service");
const { createGrowthPlan } = require("../services/growthPlan.service");

/**
 * Controller for Growth Plan (Roadmap) operations
 */
const growthPlanController = {
  /**
   * Generates a structural growth plan for a project
   * POST /api/growth-plan/generate
   */
  generate: async (req, res) => {
    try {
      const { project_id, website_url, niche } = req.body;
      const userId = req.user.uid;

      if (!project_id || !website_url || !niche) {
        return res.status(400).json({ success: false, error: "Missing required fields." });
      }

      console.log(`[GrowthPlanController] Generating growth plan for project: ${project_id}`);
      const result = await createGrowthPlan(project_id, userId, website_url, niche);
      
      return res.status(201).json(result);
    } catch (error) {
      console.error("[GrowthPlanController] generate error:", error.message);
      return res.status(500).json({ success: false, error: "Generation failed." });
    }
  },

  /**
   * Fetches the growth plan for a project
   * GET /api/growth-plan/:projectId
   */
  getByProject: async (req, res) => {
    try {
      const { projectId } = req.params;
      const userId = req.user.uid;

      const { rows } = await db.query(
        `SELECT * FROM growth_plans WHERE project_id = $1 AND user_id = $2 ORDER BY publish_day ASC`,
        [projectId, userId]
      );
      
      return res.json({ success: true, data: rows });
    } catch (error) {
      console.error("[GrowthPlanController] getByProject error:", error.message);
      return res.status(500).json({ success: false, error: "Fetch failed." });
    }
  }
};

module.exports = growthPlanController;
