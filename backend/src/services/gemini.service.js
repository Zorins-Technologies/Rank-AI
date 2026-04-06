const config = require("../config");

/**
 * Generate blog content using Google AI Studio (Free Tier)
 * This bypasses Vertex AI manager approvals and 404 errors.
 */
async function generateBlogContent(keyword) {
  // Use GENAI_API_KEY from .env (User's personal free key)
  // If not provided, it will fail gracefully.
  const apiKey = process.env.GENAI_API_KEY;
  if (!apiKey) {
    throw new Error("GENAI_API_KEY is missing in .env. Please get a free key from aistudio.google.com");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const prompt = `You are an expert SEO blog writer. Create a comprehensive, high-quality blog post for the keyword: "${keyword}".
    Return the response in a VALID JSON format with EXACTLY the following structure:
    {
      "title": "Compelling Blog Title",
      "metaDescription": "SEO-friendly meta description (150-160 characters)",
      "content": "Full blog content in HTML format. Use H2, H3 tags, paragraphs, and lists. Do NOT include <html> or <body> tags. High quality and 1000+ words.",
      "faq": [
        {"question": "FAQ Question 1", "answer": "FAQ Answer 1"},
        {"question": "FAQ Question 2", "answer": "FAQ Answer 2"},
        {"question": "FAQ Question 3", "answer": "FAQ Answer 3"}
      ],
      "tags": ["tag1", "tag2", "tag3"]
    }
    
    Make sure the content is engaging, informative and highly optimized for search engines. 
    Use a professional and authoritative tone. 
    The "content" field MUST be valid HTML. 
    Return ONLY the raw JSON object. No Markdown backticks.`;

  const body = {
    contents: [{
      parts: [{ text: prompt }]
    }]
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`Gemini API Error: ${data.error.message}`);
    }

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("No response from Gemini API");
    }

    let text = data.candidates[0].content.parts[0].text;
    
    // Clean up if the model includes JSON backticks
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse JSON from Gemini:", text);
      throw new Error("Gemini returned invalid JSON structure");
    }
  } catch (error) {
    console.error("AI Studio Generation failed:", error);
    throw error;
  }
}

module.exports = { generateBlogContent };
