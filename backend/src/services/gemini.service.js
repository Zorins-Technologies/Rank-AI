const { VertexAI } = require("@google-cloud/vertexai");
const config = require("../config");

/**
 * Initialize Vertex AI with project and location.
 * Authentication is handled via Service Account / ADC.
 */
const vertexAI = new VertexAI({
  project: config.gcpProjectId,
  location: config.vertexLocation,
});

/**
 * Generate a complete, SEO-optimized blog using Google Vertex AI.
 * Uses gemini-2.0-flash as primary, falling back to gemini-1.5-flash.
 * @param {string} keyword - The topic for the blog post.
 * @param {number} attempt - Current retry attempt number.
 * @returns {Promise<Object>} - The structured blog data.
 */
async function generateBlog(keyword, attempt = 1) {
  const MAX_ATTEMPTS = 3;
  const RETRY_DELAY_MS = 3000;
  
  // Model selection: Try 2.0-flash first, then fallback to 1.5-flash
  const modelToUse = attempt === 1 ? "gemini-2.0-flash-001" : "gemini-1.5-flash-002";

  try {
    const generativeModel = vertexAI.getGenerativeModel({
      model: modelToUse,
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.7,
        topP: 0.95,
      },
    });

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
        "analysis": {
          "score": 95,
          "readability": "Excellent",
          "keywordDensity": "2.5%",
          "wordCount": 1200
        },
        "faq": [{ "question": "...", "answer": "..." }]
      }`;

    console.log(`[Vertex AI] Attempt ${attempt}/${MAX_ATTEMPTS}: Using ${modelToUse} for "${keyword}"...`);
    
    // Vertex AI SDK uses content-based request format
    const request = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    };

    const result = await generativeModel.generateContent(request);
    const response = await result.response;
    
    // Extract text from Vertex AI response structure
    const rawText = response.candidates[0].content.parts[0].text;

    // Clean and parse the response
    const cleanJson = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();

    try {
      const parsed = JSON.parse(cleanJson);
      
      return {
        success: true,
        title: parsed.title,
        content: parsed.content,
        metaDescription: parsed.metaDescription,
        analysis: {
          score: parsed.analysis?.score || 85,
          readability: parsed.analysis?.readability || "Normal",
          keywordDensity: parsed.analysis?.keywordDensity || "2.0%",
          wordCount: parsed.analysis?.wordCount || 1000
        },
        faq: parsed.faq || [],
        imageUrl: `https://picsum.photos/seed/${encodeURIComponent(keyword)}/1200/630`,
        keyword,
        generatedAt: new Date().toISOString(),
        source: `Vertex-AI-${modelToUse}`
      };
    } catch (parseError) {
      console.error("[Vertex AI] JSON Parsing failed. raw text snippet:", rawText.substring(0, 100));
      throw new Error(`Failed to parse Vertex AI response: ${parseError.message}`);
    }
  } catch (error) {
    console.error(`[Vertex AI Error] ${modelToUse}:`, error.message);

    // If 2.0-flash failed on first attempt (e.g. not available in region), fallback to 1.5-flash immediately
    if (attempt === 1 && (error.message.includes("not found") || error.message.includes("404") || error.message.includes("503"))) {
      console.warn(`[Vertex AI] ${modelToUse} unavailable, falling back to gemini-1.5-flash-002...`);
      return generateBlog(keyword, attempt + 1);
    }

    // Handle generic retries (Quota 429, etc.)
    if (attempt < MAX_ATTEMPTS) {
      console.warn(`[Vertex AI] Retrying attempt ${attempt + 1} in ${RETRY_DELAY_MS/1000}s...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      return generateBlog(keyword, attempt + 1);
    }
    
    // Final fallback to mock data to prevent SaaS downtime
    console.error("[Vertex AI] All AI attempts failed. Activating Mock-Fallback for stability.");
    return getMockBlog(keyword);
  }
}

/**
 * Return a high-quality pre-written blog post as a fallback for demo stability.
 */
function getMockBlog(keyword) {
  const title = `The Ultimate Guide to ${keyword} in 2026`;
  return {
    success: true,
    title,
    content: `
      <h2>Why ${keyword} is the most important trend this year</h2>
      <p>In the rapidly evolving landscape of 2026, <strong>${keyword}</strong> has emerged as a cornerstone of successful strategy. Understanding the nuances of this topic is critical for staying ahead of the curve.</p>
      <h3>Key Takeaways for ${keyword}</h3>
      <ul>
        <li>Strategic Alignment: How to position your efforts for maximum impact.</li>
        <li>Efficiency Gains: Leveraging new tools to streamline your process.</li>
        <li>Future-Proofing: Ensuring your approach remains relevant.</li>
      </ul>
      <p>This comprehensive guide dives deep into exactly why <strong>${keyword}</strong> matters and how you can implement it today for measurable results.</p>
    `,
    metaDescription: `Discover everything you need to know about ${keyword} in 2026. This comprehensive guide covers strategic alignment, efficiency, and future-proofing.`,
    analysis: {
      score: 88,
      readability: "Good",
      keywordDensity: "1.8%",
      wordCount: 850
    },
    faq: [
      { "question": `What is the significance of ${keyword}?`, "answer": `It represents the next stage of development in the industry, focusing on sustainable growth and efficiency.` },
      { "question": `How can I start with ${keyword}?`, "answer": `Begin by auditing your current strategy and identifying areas where modern tools can provide immediate value.` }
    ],
    imageUrl: `https://picsum.photos/seed/${encodeURIComponent(keyword)}/1200/630`,
    keyword,
    generatedAt: new Date().toISOString(),
    source: "Mock-Fallback (Vertex Error)"
  };
}

module.exports = { generateBlog };
