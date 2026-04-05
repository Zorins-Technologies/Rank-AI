const { VertexAI } = require("@google-cloud/vertexai");
const config = require("../config");

const vertexAI = new VertexAI({
  project: config.gcpProjectId,
  location: config.vertexLocation,
});

const generativeModel = vertexAI.getGenerativeModel({
  model: "gemini-2.0-flash-001",
  generationConfig: {
    temperature: 0.8,
    topP: 0.95,
    maxOutputTokens: 8192,
  },
});

/**
 * Generate a full SEO blog post from a keyword using Gemini.
 * Returns { title, metaDescription, content, faq }
 */
async function generateBlog(keyword) {
  const prompt = `You are an expert SEO content writer and digital marketing specialist. Generate a comprehensive, well-structured blog post optimized for the keyword: "${keyword}".

STRICT REQUIREMENTS:
1. The blog MUST be 800-1500 words
2. Use PROPER HTML formatting — do NOT use markdown
3. Structure with clear sections using <h2> and <h3> tags
4. Each section should have 2-3 well-written paragraphs
5. Include at least one <ul> or <ol> list with actionable tips
6. Use <strong> for emphasis on key points
7. Naturally incorporate the keyword 3-5 times throughout the content
8. Write in a professional yet conversational tone
9. Include an engaging introduction paragraph
10. Include a strong conclusion with a call to action

REQUIRED SECTIONS:
- Introduction (no heading, just an engaging opening <p>)
- At least 3 main sections with <h2> headings
- Sub-sections with <h3> where appropriate
- A "Frequently Asked Questions" <h2> section at the end with 3-4 Q&A pairs formatted as:
  <h3>Question here?</h3>
  <p>Answer here.</p>

Return your response as valid JSON with EXACTLY this structure (no markdown fences, no extra text):
{
  "title": "An engaging, SEO-optimized title (50-65 characters) that includes the keyword",
  "metaDescription": "A compelling meta description (130-155 characters) that includes the keyword and encourages clicks",
  "content": "The full HTML blog content including all sections and FAQ",
  "faq": [
    { "question": "First FAQ question?", "answer": "Detailed answer" },
    { "question": "Second FAQ question?", "answer": "Detailed answer" },
    { "question": "Third FAQ question?", "answer": "Detailed answer" }
  ]
}

CRITICAL: Return ONLY the valid JSON object. No text before or after. No markdown code fences.`;

  const result = await generativeModel.generateContent(prompt);
  const response = result.response;
  const text = response.candidates[0].content.parts[0].text;

  // Clean the response – strip markdown code fences if present
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, "").replace(/\n?```\s*$/, "");
  }

  const blogData = JSON.parse(cleaned);

  if (!blogData.title || !blogData.metaDescription || !blogData.content) {
    throw new Error("Gemini returned incomplete blog data");
  }

  // Ensure FAQ array exists
  if (!blogData.faq || !Array.isArray(blogData.faq)) {
    blogData.faq = [];
  }

  return blogData;
}

module.exports = { generateBlog };
