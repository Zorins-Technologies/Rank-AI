const { GoogleGenerativeAI } = require("@google/generative-ai");
const config = require("../config");

// Initialize the Google Gen AI SDK
const genai = new GoogleGenerativeAI(config.genaiApiKey || "AIzaSyDCzLmU2FvzwEfWaUmz3BHjixuC6qGrE70");

/**
 * Generate a complete, SEO-optimized blog using the modern Gemini 2.0/1.5 Flash models.
 * Features automatic retries for quota (429) errors and a high-quality mock fallback.
 * @param {string} keyword - The topic for the blog post.
 * @param {number} attempt - Current retry attempt number.
 * @returns {Promise<Object>} - The structured blog data.
 */
async function generateBlog(keyword, attempt = 1) {
  const MAX_ATTEMPTS = 3;
  const RETRY_DELAY_MS = 5000; // 5 seconds wait for quota reset

  try {
    // Standard model for 2026: gemini-2.0-flash
    const model = genai.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Act as an expert SEO copywriter and marketing strategist. 
      Your task is to generate a high-quality, long-form blog post for the keyword: "${keyword}".
      
      SEO Requirements:
      - Title: Catchy, contains the keyword, under 60 characters.
      - Content: High-value, informative, using semantic HTML (<h2>, <h3>, <p>, <ul>, <li>).
      - Meta Description: Compelling, contains the keyword, between 120-160 characters.
      - SEO Score: Provide a suggested SEO score (0-100) based on typical keyword optimization.
      - FAQ: Include 3 relevant FAQs with answers.

      Format: Return ONLY a raw JSON object (no markdown code blocks) with this structure:
      {
        "title": "...",
        "content": "...",
        "metaDescription": "...",
        "seoScore": 95,
        "faq": [{ "question": "...", "answer": "..." }]
      }`;

    console.log(`[Gemini SDK] Attempt ${attempt}/${MAX_ATTEMPTS}: Generating for "${keyword}"...`);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();

    // Clean and parse the response
    const cleanJson = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    const parsed = JSON.parse(cleanJson);
    const imageUrl = `https://picsum.photos/seed/${encodeURIComponent(keyword)}/1200/630`;

    return {
      success: true,
      ...parsed,
      imageUrl,
      keyword,
      generatedAt: new Date().toISOString(),
      source: "AI-Generation"
    };
  } catch (error) {
    // Handle Quota/Wait Retry Logic
    if (error.message.includes("429") || error.message.toLowerCase().includes("quota")) {
      if (attempt < MAX_ATTEMPTS) {
        console.warn(`[Gemini SDK] Quota Limit Hit. Retrying attempt ${attempt + 1} in ${RETRY_DELAY_MS/1000}s...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
        return generateBlog(keyword, attempt + 1);
      }
      
      console.error("[Gemini SDK] Max attempts reached. Activating Mock-Fallback for demo stability.");
      return getMockBlog(keyword);
    }
    
    console.error(`[Gemini SDK Error]:`, error.message);
    throw new Error(`Failed to generate content: ${error.message}`);
  }
}

/**
 * Return a high-quality pre-written blog post as a fallback for demo stability.
 * Used when the external AI API is over-quota.
 */
function getMockBlog(keyword) {
  const title = `The Ultimate Guide to ${keyword} in 2026`;
  return {
    success: true,
    title,
    content: `
      <h2>Why ${keyword} is the most important trend this year</h2>
      <p>In the rapidly evolving landscape of 2026, <strong>${keyword}</strong> has emerged as a cornerstone of successful strategy. Whether you're a seasoned professional or just starting, understanding the nuances of this topic is critical for staying ahead of the curve.</p>
      <h3>Key Takeaways for ${keyword}</h3>
      <ul>
        <li>Strategic Alignment: How to position your efforts for maximum impact.</li>
        <li>Efficiency Gains: Leveraging new tools to streamline your process.</li>
        <li>Future-Proofing: Ensuring your approach remains relevant in the years to come.</li>
      </ul>
      <p>This comprehensive guide dives deep into exactly why <strong>${keyword}</strong> matters and how you can implement it today for measurable results.</p>
    `,
    metaDescription: `Discover everything you need to know about ${keyword} in 2026. This comprehensive guide covers strategic alignment, efficiency, and future-proofing.`,
    seoScore: 88,
    faq: [
      { "question": `What is the significance of ${keyword}?`, "answer": `It represents the next stage of development in the industry, focusing on sustainable growth and efficiency.` },
      { "question": `How can I start with ${keyword}?`, "answer": `Begin by auditing your current strategy and identifying areas where modern tools can provide immediate value.` }
    ],
    imageUrl: `https://picsum.photos/seed/${encodeURIComponent(keyword)}/1200/630`,
    keyword,
    generatedAt: new Date().toISOString(),
    source: "Mock-Fallback (Quota Limit)"
  };
}

module.exports = { generateBlog };
