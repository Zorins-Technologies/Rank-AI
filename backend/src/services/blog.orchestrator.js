const { generateBlog } = require("./gemini.service");
const { generateImage } = require("./imagen.service");
const { uploadImage } = require("./storage.service");
const db = require("./sql.service"); // PostgreSQL service
const { calculateSeoScore } = require("../utils/seo");
const { generateUniqueSlug } = require("../utils/slug");

/**
 * Orchestrates the full blog generation pipeline using PostgreSQL.
 */
async function generateBlogPipeline(userId, keyword) {
  const trimmedKeyword = keyword.trim();

  // Step 0: SMART CACHE (SQL)
  console.log(`[Orchestrator] Step 0: Checking Smart Cache for "${trimmedKeyword}" for user ${userId}...`);
  const cacheQuery = "SELECT * FROM blogs WHERE user_id = $1 AND keyword = $2 ORDER BY created_at DESC LIMIT 1";
  const { rows: [cachedBlog] } = await db.query(cacheQuery, [userId, trimmedKeyword.toLowerCase()]);

  if (cachedBlog) {
    console.log(`[Orchestrator] Smart Cache HIT: ${cachedBlog.id}`);
    return {
      id: cachedBlog.id,
      userId: cachedBlog.user_id,
      title: cachedBlog.title,
      content: cachedBlog.content,
      metaDescription: cachedBlog.meta_description,
      keyword: cachedBlog.keyword,
      imageUrl: cachedBlog.image_url,
      slug: cachedBlog.slug,
      analysis: cachedBlog.analysis,
      faq: cachedBlog.faq,
      status: cachedBlog.status,
      createdAt: cachedBlog.created_at,
      updatedAt: cachedBlog.updated_at,
      source: "Smart-Cache"
    };
  }

  // Step 1: BLOG CONTENT
  console.log("[Orchestrator] Step 1: Generating blog with Gemini...");
  const blogData = await generateBlog(trimmedKeyword);

  // Step 2 & 3: IMAGE GENERATION & UPLOADING
  let imageUrl = "";
  try {
    console.log("[Orchestrator] Step 2: Generating image...");
    const imageBuffer = await generateImage(blogData.title);
    
    console.log("[Orchestrator] Step 3: Uploading image to Storage...");
    imageUrl = await uploadImage(imageBuffer, blogData.title);
  } catch (imgError) {
    console.warn("[Orchestrator] Image pipeline failed, using placeholder:", imgError.message);
    imageUrl = "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2070&auto=format&fit=crop";
  }

  // Step 4: SEO SCORING
  console.log("[Orchestrator] Step 4: Calculating SEO score...");
  const analysis = calculateSeoScore({
    title: blogData.title,
    metaDescription: blogData.metaDescription,
    content: blogData.content,
    keyword: trimmedKeyword,
  });

  // Step 5: SLUG GENERATION
  console.log("[Orchestrator] Step 5: Generating unique slug...");
  const { rows: slugRows } = await db.query("SELECT slug FROM blogs WHERE user_id = $1", [userId]);
  const existingSlugs = slugRows.map(r => r.slug);
  const slug = generateUniqueSlug(blogData.title, existingSlugs);

  // Step 6: PERSISTENCE (SQL)
  console.log("[Orchestrator] Step 6: Saving to PostgreSQL...");
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
    trimmedKeyword.toLowerCase(),
    imageUrl,
    slug,
    JSON.stringify(analysis),
    JSON.stringify(blogData.faq || [])
  ]);

  return {
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
    updatedAt: savedBlog.updated_at,
    source: "Fresh-AI-Generation"
  };
}

module.exports = { generateBlogPipeline };
