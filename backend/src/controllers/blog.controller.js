const { generateBlogPipeline } = require("../services/blog.orchestrator");
const db = require("../services/sql.service");
const { calculateSeoScore } = require("../utils/seo");
const { generateUniqueSlug } = require("../utils/slug");

/**
 * Controller for blog-related operations
 */
const blogController = {
  /**
   * Generates a new blog using the orchestrated pipeline
   * POST /api/blogs/generate
   */
  generate: async (req, res) => {
    try {
      const { keyword, project_id } = req.body;
      const userId = req.user.uid;

      console.log(`[BlogController] Generating blog for keyword: "${keyword}" - User: ${userId}`);

      // Delegate to orchestrator for the full pipeline
      const result = await generateBlogPipeline(userId, keyword, project_id);

      // Trigger Indexing if published (optional/async)
      if (result.status === 'published') {
        // We'll import triggerIndexing here or move it to a service
        const { triggerIndexing } = require("../utils/indexing"); 
        triggerIndexing(result.slug).catch(err => console.error("Indexing error:", err));
      }

      return res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error("[BlogController] generate error:", error.message);
      return res.status(500).json({
        success: false,
        error: "Failed to generate blog: " + error.message,
      });
    }
  },

  /**
   * Retrieves all blogs for the authenticated user, optionally filtered by project or search
   * GET /api/blogs
   */
  getAll: async (req, res) => {
    try {
      const { search, status, project_id } = req.query;
      const userId = req.user?.uid;
      let query;
      let params;

      // 1. PUBLIC SITEMAP / LIBRARY ACCESS
      if (status === 'published' && !userId) {
        query = `SELECT * FROM blogs WHERE status = 'published' ORDER BY created_at DESC`;
        params = [];
      } 
      // 2. AUTHENTICATED DASHBOARD ACCESS
      else if (userId) {
        if (project_id) {
          query = `
            SELECT b.* FROM blogs b
            JOIN projects p ON b.project_id = p.id
            WHERE p.user_id = $1 AND b.project_id = $2
          `;
          params = [userId, project_id];

          if (search) {
            query += ` AND (b.title ILIKE $3 OR b.keyword ILIKE $3)`;
            params.push(`%${search}%`);
          }
          query += ` ORDER BY b.created_at DESC`;
        } else {
          query = `SELECT * FROM blogs WHERE user_id = $1`;
          params = [userId];

          if (search) {
            query += ` AND (title ILIKE $2 OR keyword ILIKE $2)`;
            params.push(`%${search}%`);
          }
          query += ` ORDER BY created_at DESC`;
        }
      } else {
        return res.status(401).json({ success: false, error: "Authentication required." });
      }

      const { rows } = await db.query(query, params);

      // Clean response data
      const blogs = rows.map(blog => ({
        id: blog.id,
        userId: blog.user_id,
        title: blog.title,
        content: blog.content,
        metaDescription: blog.meta_description,
        keyword: blog.keyword,
        imageUrl: blog.image_url,
        slug: blog.slug,
        analysis: blog.analysis,
        faq: blog.faq,
        status: blog.status,
        createdAt: blog.created_at,
        updatedAt: blog.updated_at
      }));

      return res.status(200).json({
        success: true,
        data: blogs,
        count: blogs.length,
      });
    } catch (error) {
      console.error("[BlogController] getAll error:", error.message);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch blogs.",
      });
    }
  },

  /**
   * Get specific blog by ID (UUID) or Slug
   * GET /api/blogs/:id
   */
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user?.uid;

      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      
      let query;
      let params;

      if (isUuid) {
        if (!userId) return res.status(401).json({ success: false, error: "Auth required for ID access." });
        query = "SELECT * FROM blogs WHERE user_id = $1 AND id = $2 LIMIT 1";
        params = [userId, id];
      } else {
        if (userId) {
          query = "SELECT * FROM blogs WHERE slug = $1 AND (status = 'published' OR user_id = $2) LIMIT 1";
          params = [id, userId];
        } else {
          query = "SELECT * FROM blogs WHERE slug = $1 AND status = 'published' LIMIT 1";
          params = [id];
        }
      }

      const { rows: [blog] } = await db.query(query, params);

      if (!blog) {
        return res.status(404).json({ success: false, error: "Blog not found." });
      }

      return res.status(200).json({
        success: true,
        data: {
          id: blog.id,
          userId: blog.user_id,
          title: blog.title,
          content: blog.content,
          metaDescription: blog.meta_description,
          keyword: blog.keyword,
          imageUrl: blog.image_url,
          slug: blog.slug,
          analysis: blog.analysis,
          faq: blog.faq,
          status: blog.status,
          createdAt: blog.created_at,
          updatedAt: blog.updated_at
        },
      });
    } catch (error) {
      console.error("[BlogController] getById error:", error.message);
      return res.status(500).json({ success: false, error: "Failed to fetch blog." });
    }
  },

  /**
   * Update an existing blog
   * PUT /api/blogs/:id
   */
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.uid;
      const { title, content, metaDescription, keyword, status } = req.body;

      const { rows: [existing] } = await db.query(
        "SELECT id FROM blogs WHERE id = $1 AND user_id = $2",
        [id, userId]
      );
      if (!existing) return res.status(404).json({ success: false, error: "Blog not found." });

      const updates = [];
      const values = [id, userId];

      if (title) { values.push(title); updates.push(`title = $${values.length}`); }
      if (content) { values.push(content); updates.push(`content = $${values.length}`); }
      if (metaDescription) { values.push(metaDescription); updates.push(`meta_description = $${values.length}`); }
      if (keyword) { values.push(keyword); updates.push(`keyword = $${values.length}`); }
      if (status) { values.push(status); updates.push(`status = $${values.length}`); }

      if (updates.length === 0) return res.status(400).json({ success: false, error: "No updates provided." });

      // Recalculate SEO if needed
      if (content || title || metaDescription) {
        const analysis = calculateSeoScore({
          title: title || (await db.query("SELECT title FROM blogs WHERE id = $1", [id])).rows[0].title,
          metaDescription: metaDescription || '',
          content: content || '',
          keyword: keyword || '',
        });
        values.push(JSON.stringify(analysis));
        updates.push(`analysis = $${values.length}`);
      }

      const query = `UPDATE blogs SET ${updates.join(", ")}, updated_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING *`;
      const { rows: [updated] } = await db.query(query, values);

      return res.status(200).json({ success: true, data: updated });
    } catch (error) {
      console.error("[BlogController] update error:", error.message);
      return res.status(500).json({ success: false, error: "Update failed." });
    }
  },

  /**
   * Delete a blog
   * DELETE /api/blogs/:id
   */
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.uid;

      const { rows } = await db.query(
        "DELETE FROM blogs WHERE id = $1 AND user_id = $2 RETURNING id",
        [id, userId]
      );

      if (rows.length === 0) return res.status(404).json({ success: false, error: "Not found." });

      return res.status(200).json({ success: true, message: "Deleted successfully." });
    } catch (error) {
      console.error("[BlogController] delete error:", error.message);
      return res.status(500).json({ success: false, error: "Delete failed." });
    }
  }
};

module.exports = blogController;
