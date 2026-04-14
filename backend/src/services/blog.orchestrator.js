const { generateBlog } = require("./gemini.service");
const { generateImage } = require("./imagen.service");
const { uploadImage } = require("./storage.service");
const db = require("./sql.service");
const { calculateSeoScore } = require("../utils/seo");
const { generateUniqueSlug } = require("../utils/slug");

/**
 * Orchestrates the full blog generation pipeline.
 * Handles caching, AI generation, SEO scoring, and persistence.
 */
const blogOrchestrator = {
  /**
   * Main pipeline for generating a blog
   */
  generate: async (userId, keyword, projectId = null) => {
    const trimmedKeyword = keyword.trim().toLowerCase();
    
    // 1. Resolve Project & Context
    let targetProjectId = projectId;
    let projectContext = {};
    
    if (!targetProjectId) {
      const { rows } = await db.query(
        "SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1",
        [userId]
      );
      if (rows[0]) {
        targetProjectId = rows[0].id;
        projectContext = rows[0];
      } else {
        throw new Error("No active project found.");
      }
    } else {
      const { rows } = await db.query(
        "SELECT * FROM projects WHERE id = $1 AND user_id = $2",
        [targetProjectId, userId]
      );
      projectContext = rows[0] || {};
    }

    // 2. Cache Check (Save costs/time)
    console.log(`[Orchestrator] Checking cache for: "${trimmedKeyword}"`);
    const { rows: [cached] } = await db.query(
      "SELECT * FROM blogs WHERE user_id = $1 AND keyword = $2 ORDER BY created_at DESC LIMIT 1",
      [userId, trimmedKeyword]
    );

    if (cached) {
      console.log(`[Orchestrator] Cache HIT: ${cached.id}`);
      return { ...cached, source: "Cache" };
    }

    // 3. Generate Content (Gemini)
    console.log("[Orchestrator] Generating content with project context...");
    const blogData = await generateBlog(trimmedKeyword, {
      brand_voice: projectContext.brand_voice,
      content_style: projectContext.content_style
    });

    // 4. Generate Image (Imagen)
    let imageUrl = "";
    try {
      console.log("[Orchestrator] Generating image...");
      const imageBuffer = await generateImage(blogData.title);
      imageUrl = await uploadImage(imageBuffer, blogData.title);
    } catch (imgError) {
      console.warn("[Orchestrator] Image generation failed, using placeholder.");
      imageUrl = "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2070&auto=format&fit=crop";
    }

    // 5. SEO Scoring & Slugs
    const analysis = calculateSeoScore({
      title: blogData.title,
      metaDescription: blogData.metaDescription,
      content: blogData.content,
      keyword: trimmedKeyword,
    });

    const { rows: slugRows } = await db.query("SELECT slug FROM blogs WHERE user_id = $1", [userId]);
    const slug = generateUniqueSlug(blogData.title, slugRows.map(r => r.slug));

    // 6. Persistence
    console.log("[Orchestrator] Persisting to database...");
    const insertQuery = `
      INSERT INTO blogs (user_id, project_id, title, content, meta_description, keyword, image_url, slug, analysis, faq)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    const { rows: [saved] } = await db.query(insertQuery, [
      userId, targetProjectId, blogData.title, blogData.content, blogData.metaDescription,
      trimmedKeyword, imageUrl, slug, JSON.stringify(analysis), JSON.stringify(blogData.faq || [])
    ]);

    return { ...saved, source: "AI-Generation" };
  }
};

module.exports = {
  ...blogOrchestrator,
  generateBlogPipeline: blogOrchestrator.generate
};
