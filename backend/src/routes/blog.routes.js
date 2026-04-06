const express = require("express");
const router = express.Router();

const { generateBlog } = require("../services/gemini.service");
const { generateImage } = require("../services/imagen.service");
const { uploadImage } = require("../services/storage.service");
const { saveBlog, getAllBlogs, getBlogById, getBlogBySlug, checkRecentDuplicate, getAllSlugs } = require("../services/firestore.service");
const { calculateSeoScore } = require("../utils/seo");
const { generateUniqueSlug } = require("../utils/slug");
const { validateKeyword, validateTitle, validateId } = require("../middleware/validate");

/**
 * POST /api/generate-blog
 * Full pipeline: keyword → blog → image → upload → SEO score → save → respond
 */
router.post("/generate-blog", validateKeyword, async (req, res) => {
  try {
    const { keyword } = req.body;
    const trimmedKeyword = keyword.trim();

    console.log(`[generate-blog] Starting pipeline for keyword: "${trimmedKeyword}"`);

    // Step 1: Generate blog content with Gemini
    console.log("[generate-blog] Step 1: Generating blog with Gemini...");
    const blogData = await generateBlog(trimmedKeyword);
    console.log(`[generate-blog] Blog generated: "${blogData.title}"`);

    // Step 2: Generate image with Imagen
    let imageUrl = "";
    try {
      console.log("[generate-blog] Step 2: Generating image with Imagen...");
      const imageBuffer = await generateImage(blogData.title);
      console.log("[generate-blog] Image generated successfully");

      // Step 3: Upload image to Cloud Storage
      console.log("[generate-blog] Step 3: Uploading image to Cloud Storage...");
      imageUrl = await uploadImage(imageBuffer, blogData.title);
      console.log(`[generate-blog] Image uploaded: ${imageUrl}`);
    } catch (imgError) {
      console.warn("[generate-blog] Image generation/upload failed, using premium placeholder:", imgError.message);
      imageUrl = "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2070&auto=format&fit=crop";
    }

    // Step 4: Calculate SEO score
    console.log("[generate-blog] Step 4: Calculating SEO score...");
    const seoScore = calculateSeoScore({
      title: blogData.title,
      metaDescription: blogData.metaDescription,
      content: blogData.content,
      keyword: trimmedKeyword,
    });
    console.log(`[generate-blog] SEO Score: ${seoScore.score}/100 (${seoScore.grade})`);

    // Step 5: Generate unique slug
    const existingSlugs = await getAllSlugs();
    const slug = generateUniqueSlug(blogData.title, existingSlugs);

    // Step 6: Save blog to Firestore
    console.log("[generate-blog] Step 5: Saving blog to Firestore...");
    const savedBlog = await saveBlog({
      title: blogData.title,
      content: blogData.content,
      metaDescription: blogData.metaDescription,
      keyword: trimmedKeyword,
      imageUrl,
      slug,
      seoScore,
      faq: blogData.faq || [],
    });
    console.log(`[generate-blog] Blog saved with ID: ${savedBlog.id}, slug: ${slug}`);

    return res.status(201).json({
      success: true,
      data: savedBlog,
    });
  } catch (error) {
    console.error("[generate-blog] Error:", error.message);
    return res.status(500).json({
      success: false,
      error: "Failed to generate blog. " + error.message,
    });
  }
});

/**
 * POST /api/generate-image
 * Standalone image generation endpoint
 */
router.post("/generate-image", validateTitle, async (req, res) => {
  try {
    const { title } = req.body;

    console.log(`[generate-image] Generating image for: "${title}"`);
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

/**
 * GET /api/blogs
 * Fetch all blogs
 */
router.get("/blogs", async (req, res) => {
  try {
    const blogs = await getAllBlogs();
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

/**
 * GET /api/blogs/:id
 * Fetch a single blog by ID or slug
 */
router.get("/blogs/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Try slug first, then ID
    let blog = await getBlogBySlug(id);
    if (!blog) {
      blog = await getBlogById(id);
    }

    if (!blog) {
      return res.status(404).json({
        success: false,
        error: "Blog not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: blog,
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
