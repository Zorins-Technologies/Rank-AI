const db = require("../services/sql.service");
const { checkAiVisibility } = require("../services/aeo_monitor.service");

/**
 * Controller for AEO (Answer Engine Optimization) monitoring
 */
const aeoController = {
  /**
   * Triggers a manual visibility check across AI engines
   * POST /api/aeo/check
   */
  checkVisibility: async (req, res) => {
    try {
      const { project_id, website_url, niche } = req.body;
      
      if (!project_id || !website_url || !niche) {
        return res.status(400).json({ success: false, error: "Missing required fields." });
      }

      console.log(`[AEOController] Running visibility check for project: ${project_id}`);
      const result = await checkAiVisibility(project_id, website_url, niche);
      
      return res.status(200).json(result);
    } catch (error) {
      console.error("[AEOController] checkVisibility error:", error.message);
      return res.status(500).json({ success: false, error: "Visibility check failed." });
    }
  },

  /**
   * Fetches historical AEO checks for a project
   * GET /api/aeo/:projectId
   */
  getByProject: async (req, res) => {
    try {
      const { projectId } = req.params;

      const { rows } = await db.query(
        `SELECT * FROM aeo_checks WHERE project_id = $1 ORDER BY checked_at DESC LIMIT 50`,
        [projectId]
      );
      
      return res.json({ success: true, data: rows });
    } catch (error) {
      console.error("[AEOController] getByProject error:", error.message);
      return res.status(500).json({ success: false, error: "Failed to fetch data." });
    }
  },

  /**
   * Generates a visibility summary for the project
   * GET /api/aeo/:projectId/summary
   */
  getSummary: async (req, res) => {
    try {
      const { projectId } = req.params;

      // Latest status per engine
      const { rows: latestChecks } = await db.query(`
        SELECT DISTINCT ON (engine) engine, is_mentioned, sentiment, query, context, checked_at
        FROM aeo_checks 
        WHERE project_id = $1
        ORDER BY engine, checked_at DESC
      `, [projectId]);

      // Aggregate statistics
      const { rows: allTimeStats } = await db.query(`
        SELECT 
          COUNT(*) as total_checks,
          COUNT(*) FILTER (WHERE is_mentioned = true) as total_mentioned,
          COUNT(DISTINCT engine) as engines_checked
        FROM aeo_checks 
        WHERE project_id = $1
      `, [projectId]);

      // Historical performance per engine
      const { rows: engineStats } = await db.query(`
        SELECT 
          engine,
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE is_mentioned = true) as mentioned,
          ROUND(100.0 * COUNT(*) FILTER (WHERE is_mentioned = true) / GREATEST(COUNT(*), 1)) as mention_rate
        FROM aeo_checks 
        WHERE project_id = $1
        GROUP BY engine
      `, [projectId]);

      const stats = allTimeStats[0] || { total_checks: 0, total_mentioned: 0, engines_checked: 0 };
      const overallScore = stats.total_checks > 0 
        ? Math.round((stats.total_mentioned / stats.total_checks) * 100) 
        : 0;

      return res.json({ 
        success: true, 
        data: {
          overallScore,
          totalChecks: parseInt(stats.total_checks),
          totalMentioned: parseInt(stats.total_mentioned),
          enginesChecked: parseInt(stats.engines_checked),
          latestChecks,
          engineStats
        }
      });
    } catch (error) {
      console.error("[AEOController] getSummary error:", error.message);
      return res.status(500).json({ success: false, error: "Summary generation failed." });
    }
  }
};

module.exports = aeoController;
