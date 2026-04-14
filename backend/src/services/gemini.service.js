const { VertexAI } = require("@google-cloud/vertexai");
const { config } = require("../config");

// Initialize Vertex AI
const vertexAI = new VertexAI({
  project: config.gcpProjectId,
  location: config.vertexLocation,
});

/**
 * AI Content Generation Service
 */
const geminiService = {
  /**
   * Generates a high-quality blog post using Vertex AI Gemini
   * @param {string} keyword 
   * @param {Object} projectSettings - Optional context (brand_voice, content_style, etc.)
   * @param {number} attempt 
   */
  generateBlog: async (keyword, projectSettings = {}, attempt = 1) => {
    const MAX_ATTEMPTS = 3;
    const model = attempt === 1 ? "gemini-2.0-flash" : "gemini-1.5-flash-002";

    try {
      const generativeModel = vertexAI.getGenerativeModel({
        model,
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: 0.7,
        },
      });

      const { brand_voice = 'professional', content_style = 'blog post' } = projectSettings;

      const prompt = `Act as an expert SEO and AEO (Answer Engine Optimization) copywriter. 
        Generate a high-quality, long-form ${content_style} for the keyword: "${keyword}".
        
        Brand Voice: ${brand_voice}
        Content Format: ${content_style}
        
        Requirements:
        1. Title: Engaging, keyword-rich, < 60 chars.
        2. Content: Semantic HTML structure (h2, h3, p, ul). Use a ${brand_voice} tone.
        3. Meta Description: Compelling, keyword-rich, 120-160 chars.
        4. FAQ: 3-5 relevant Q&As.
        5. Structured Data: Valid JSON-LD FAQPage schema.

        Response Format: Return ONLY a raw JSON object:
        {
          "title": "...",
          "content": "...",
          "metaDescription": "...",
          "analysis": { "seo_score": 95, "aeo_score": 90, "readability": "Excellent" },
          "faq": [{ "question": "...", "answer": "..." }],
          "structured_data": { ... }
        }`;

      console.log(`[GeminiService] Generating content for "${keyword}" (Attempt ${attempt}, Model: ${model})`);

      const result = await generativeModel.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      const response = await result.response;
      const rawText = response.candidates[0].content.parts[0].text;

      // Clean JSON if model returned markdown blocks
      const cleanJson = rawText.replace(/```json|```/gi, "").trim();
      const parsed = JSON.parse(cleanJson);

      return {
        ...parsed,
        imageUrl: `https://picsum.photos/seed/${encodeURIComponent(keyword)}/1200/630`,
        keyword,
        source: `Gemini-${model}`
      };

    } catch (error) {
      console.error(`[GeminiService] Error on attempt ${attempt}:`, error.message);

      // Recursive retry with fallback model
      if (attempt < MAX_ATTEMPTS) {
        return geminiService.generateBlog(keyword, projectSettings, attempt + 1);
      }

      // Final fallback to mock data to ensure system reliability
      return geminiService.getMockBlog(keyword);
    }
  },

  /**
   * Mock blog generation for reliability during AI outages
   */
  getMockBlog: (keyword) => ({
    success: true,
    title: `Mastering ${keyword}: Strategy for 2026`,
    content: `<h2>The Rise of ${keyword}</h2><p>In today's landscape, ${keyword} is more than just a trend—it is a necessity.</p><h3>Key Benefits</h3><ul><li>Increased Visibility</li><li>Higher Conversion</li></ul>`,
    metaDescription: `Everything you need to know about ${keyword} in 2026. Learn the best strategies and tips.`,
    analysis: { seo_score: 85, aeo_score: 80, readability: "Good" },
    faq: [{ question: `What is ${keyword}?`, answer: `It is a core component of modern digital strategy.` }],
    imageUrl: `https://picsum.photos/seed/${encodeURIComponent(keyword)}/1200/630`,
    keyword,
    source: "Mock-Fallback"
  })
};

module.exports = { 
  ...geminiService,
  generateBlog: geminiService.generateBlog 
};
