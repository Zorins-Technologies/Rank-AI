const express = require("express");
const router = express.Router();

const { generateBlogPipeline } = require("../services/blog.orchestrator");
const { generateBlog } = require("../services/gemini.service");
const { generateImage } = require("../services/imagen.service");
const { uploadImage } = require("../services/storage.service");
const db = require("../services/sql.service"); // PostgreSQL service
const { calculateSeoScore } = require("../utils/seo");
const { generateUniqueSlug } = require("../utils/slug");
const { validateKeyword, validateTitle, validateId } = require("../middleware/validate");
const { generationLimiter } = require("../middleware/rateLimit");

const { verifyToken, optionalVerifyToken } = require("../middleware/auth.middleware");

router.post("/generate", verifyToken, generationLimiter, validateKeyword, async (req, res) => {
  console.log("REQUEST RECEIVED:", req.body);
  try {
    const { keyword } = req.body;
    const userId = req.user.uid;

    console.log(`[Route] POST /api/generate - Keyword: "${keyword}" - User: ${userId}`);
    
    // Safety Timeout (e.g. 50 seconds for Gemini/DB to prevent hangs)
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Generation timed out")), 50000)
    );

    // 1. Generate core content using Gemini (wrapped in timeout to prevent hanging connections)
    const generateProcess = generateBlog(keyword.trim());
    const blogData = await Promise.race([generateProcess, timeoutPromise]);

    // 2. Generate accurate SEO Analysis and Grade
    const analysis = calculateSeoScore({
      title: blogData.title,
      metaDescription: blogData.metaDescription,
      content: blogData.content,
      keyword: keyword.trim(),
    });

    // 3. Generate unique slug using SQL
    const { rows: slugRows } = await db.query(
      "SELECT slug FROM blogs WHERE user_id = $1",
      [userId]
    );
    const existingSlugs = slugRows.map(r => r.slug);
    const slug = generateUniqueSlug(blogData.title, existingSlugs);

    // 4. Save to PostgreSQL
    const insertQuery = `
      INSERT INTO blogs (
        user_id, title, content, meta_description, keyword, image_url, slug, analysis, faq
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const { rows: [savedBlog] } = await db.query(insertQuery, [
      userId,
      blogData.title,
      blogData.content,
      blogData.metaDescription,
      keyword.trim().toLowerCase(),
      blogData.imageUrl,
      slug,
      JSON.stringify(analysis),
      JSON.stringify(blogData.faq || [])
    ]);

    // Map snake_case to camelCase for frontend compatibility
    const responseData = {
      id: savedBlog.id,
      userId: savedBlog.user_id,
      title: savedBlog.title,
      content: savedBlog.content,
      metaDescription: savedBlog.meta_description,
      keyword: savedBlog.keyword,
      imageUrl: savedBlog.image_url,
      slug: savedBlog.slug,
      analysis: savedBlog.analysis,
      faq: savedBlog.faq,
      status: savedBlog.status,
      createdAt: savedBlog.created_at,
      updatedAt: savedBlog.updated_at
    };

    return res.status(201).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("[Route Error] generate:", error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to generate blog: " + error.message,
    });
  }
});

/**
 * POST /api/generate-blog
 * Optimized pipeline: Delegate orchestration to blog.orchestrator
 */
router.post("/generate-blog", verifyToken, generationLimiter, validateKeyword, async (req, res) => {
  try {
    const { keyword } = req.body;
    const userId = req.user.uid;

    console.log(`[Route] POST /api/generate-blog - Keyword: "${keyword}" - User: ${userId}`);
    
    // Delegate to orchestrator
    const result = await generateBlogPipeline(userId, keyword);

    return res.status(result.id ? 201 : 200).json({
      success: true,
      data: result,
      source: result.source || "Orchestrator"
    });
  } catch (error) {
    console.error("[Route Error] generate-blog:", error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to generate blog: " + error.message,
    });
  }
});

/**
 * POST /api/generate-image
 * Standalone image generation endpoint
 */
router.post("/generate-image", verifyToken, generationLimiter, validateTitle, async (req, res) => {
  try {
    const { title } = req.body;

    console.log(`[generate-image] Generating image for: "${title}" - User: ${req.user.uid}`);
    const imageBuffer = await generateImage(title);
    const imageUrl = await uploadImage(imageBuffer, title);

    return res.status(201).json({
      success: true,
      data: { imageUrl },
    });
  } catch (error) {
    console.error("[generate-image] Error:", error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to generate image. " + error.message,
    });
  }
});

router.get("/blogs", verifyToken, async (req, res) => {
  try {
    const { search } = req.query;
    const userId = req.user.uid;
    let query;
    let params;

    if (search) {
      console.log(`[Route] GET /api/blogs - Search: "${search}" - User: ${userId}`);
      query = `
        SELECT * FROM blogs 
        WHERE user_id = $1 
        AND (title ILIKE $2 OR keyword ILIKE $2 OR content ILIKE $2)
        ORDER BY created_at DESC
      `;
      params = [userId, `%${search}%` || ''];
    } else {
      console.log(`[Route] GET /api/blogs - Fetch All - User: ${userId}`);
      query = `
        SELECT * FROM blogs 
        WHERE user_id = $1 
        ORDER BY created_at DESC
      `;
      params = [userId];
    }

    const { rows } = await db.query(query, params);

    // Map to frontend expected format
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
    console.error("[blogs] Error:", error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch blogs. " + error.message,
    });
  }
});

router.get("/blogs/:id", optionalVerifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.uid; // May be undefined

    // Determine if identifier is a UUID (Dashboard/Private) or Slug (SEO/Public)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    let query;
    let params;

    if (isUuid) {
      // UUID access strictly requires ownership
      if (!userId) {
        return res.status(401).json({ success: false, error: "Authentication required for ID-based access." });
      }
      query = "SELECT * FROM blogs WHERE user_id = $1 AND id = $2 LIMIT 1";
      params = [userId, id];
    } else {
      // Slug access: Allowed if published OR if authenticated owner
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
      return res.status(404).json({
        success: false,
        error: "Blog not found or you don't have permission to view it.",
      });
    }

    const responseData = {
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
    };

    return res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("[blogs/:id] Error:", error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch blog. " + error.message,
    });
  }
});

module.exports = router;
