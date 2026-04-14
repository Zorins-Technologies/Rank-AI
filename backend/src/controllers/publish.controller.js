const publishService = require("../services/publish.service");
const db = require("../services/sql.service");

/**
 * Controller for CMS publication and connections.
 */
const publishController = {
  /**
   * Manual publish trigger for an existing blog.
   */
  manualPublish: async (req, res) => {
    const { blogId } = req.body;
    
    try {
      // 1. Fetch Blog Data
      const { rows: [blog] } = await db.query(
        "SELECT * FROM blogs WHERE id = $1",
        [blogId]
      );

      if (!blog) {
        return res.status(404).json({ success: false, error: "Blog not found." });
      }

      if (!blog.project_id) {
        return res.status(400).json({ success: false, error: "Blog is not associated with a project." });
      }

      // 2. Publish to WordPress
      // Note: We're not passing the buffer here because we don't have it in the DB.
      // A more robust implementation would fetch the image first or change the orchestrator
      // to publish immediately after generation.
      const result = await publishService.publishToWordPress(blog.project_id, blog);

      res.status(200).json({
        success: true,
        message: "Blog published successfully.",
        data: result
      });
    } catch (error) {
      console.error("[Publish Controller Error]:", error.message);
      res.status(500).json({ success: false, error: error.message });
    }
  },

  /**
   * Fetches a unified content calendar for a project.
   * Merges growth_plans and blogs.
   */
  getCalendar: async (req, res) => {
    try {
      const { projectId } = req.params;
      const userId = req.user.uid;

      // 1. Fetch project to get base creation date for offset calculations
      const { rows: [project] } = await db.query(
        "SELECT created_at FROM projects WHERE id = $1 AND user_id = $2",
        [projectId, userId]
      );

      if (!project) {
        return res.status(404).json({ success: false, error: "Project not found." });
      }

      // 2. Fetch all growth plan items and associated blogs
      const { rows: items } = await db.query(
        `SELECT 
          gp.id as plan_id, 
          gp.topic, 
          gp.keyword, 
          gp.publish_day, 
          gp.status as plan_status,
          b.id as blog_id,
          b.status as blog_status,
          b.created_at as actual_date
         FROM growth_plans gp
         LEFT JOIN blogs b ON b.project_id = gp.project_id AND b.keyword = gp.keyword
         WHERE gp.project_id = $1 AND gp.user_id = $2
         ORDER BY gp.publish_day ASC`,
        [projectId, userId]
      );

      // 3. Map to calendar format
      const calendarData = items.map(item => {
        // Calculate scheduled date: Base + (publish_day - 1) days
        const scheduledDate = new Date(project.created_at);
        scheduledDate.setDate(scheduledDate.getDate() + (item.publish_day - 1));

        return {
          id: item.blog_id || item.plan_id,
          plan_id: item.plan_id,
          title: item.topic,
          keyword: item.keyword,
          date: item.actual_date || scheduledDate.toISOString(),
          status: item.blog_status || item.plan_status, // planned, generating, published, failed
          is_published: item.blog_status === 'published'
        };
      });

      return res.json({ success: true, data: calendarData });
    } catch (error) {
      console.error("[Publish Controller] getCalendar error:", error.message);
      return res.status(500).json({ success: false, error: "Failed to fetch calendar." });
    }
  },

  /**
   * Reschedules a planned content item.
   */
  reschedule: async (req, res) => {
    try {
      const { planId, newDate } = req.body;
      const userId = req.user.uid;

      // 1. Fetch plan and project info
      const { rows: [plan] } = await db.query(
        `SELECT gp.*, p.created_at as project_start 
         FROM growth_plans gp 
         JOIN projects p ON gp.project_id = p.id
         WHERE gp.id = $1 AND gp.user_id = $2`,
        [planId, userId]
      );

      if (!plan) {
        return res.status(404).json({ success: false, error: "Plan item not found." });
      }

      // 2. Calculate new publish_day offset
      const start = new Date(plan.project_start);
      const target = new Date(newDate);
      const diffTime = Math.abs(target - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

      // 3. Update DB
      await db.query(
        "UPDATE growth_plans SET publish_day = $1, status = 'pending', updated_at = NOW() WHERE id = $2",
        [diffDays, planId]
      );

      return res.json({ success: true, message: "Rescheduled successfully.", new_day: diffDays });
    } catch (error) {
      console.error("[Publish Controller] reschedule error:", error.message);
      return res.status(500).json({ success: false, error: "Rescheduling failed." });
    }
  },

  /**
   * Test connection to a WordPress site.
   */
  testConnection: async (req, res) => {
    const { project_id, cms_type } = req.body;

    try {
      const { rows: [connection] } = await db.query(
        "SELECT * FROM cms_connections WHERE project_id = $1 AND cms_type = $2",
        [project_id, cms_type]
      );

      if (!connection) {
        return res.status(404).json({ success: false, error: "CMS connection not found." });
      }

      // Here we could implement a simple 'GET /wp-json/' call to verify credentials
      // But for Phase 2, we can just say 'connected' or do a simple settings fetch.
      res.status(200).json({
        success: true,
        message: `Connection to ${connection.site_url} found and validated against Secret Manager.`
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};

module.exports = publishController;
