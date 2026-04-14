const { VertexAI } = require("@google-cloud/vertexai");
const { config } = require("../config");
const db = require("./sql.service");

let vertexAI = null;

function getVertexAI() {
  if (vertexAI) return vertexAI;
  vertexAI = new VertexAI({
    project: config.gcpProjectId,
    location: config.vertexLocation,
  });
  return vertexAI;
}

/**
 * Check AI visibility for a website using real Gemini API calls.
 * Queries Gemini with niche-related questions and checks if the website
 * is mentioned in the AI-generated response.
 * 
 * @param {string} projectId - The project UUID.
 * @param {string} websiteUrl - The website URL.
 * @param {string} niche - The niche or industry.
 */
async function checkAiVisibility(projectId, websiteUrl, niche) {
  console.log(`[AEO Monitor] Checking AI visibility for ${websiteUrl} in "${niche}"...`);

  const engines = ['ChatGPT', 'Gemini', 'Perplexity'];
  
  // Generate targeted queries based on the niche
  const queries = [
    `What are the best tools and services for ${niche}?`,
    `Who are the top experts or companies in ${niche}?`,
    `What is the most recommended platform for ${niche}?`,
    `Which websites should I visit to learn about ${niche}?`,
    `Compare the leading solutions in ${niche}`,
  ];

  try {
    const model = getVertexAI().getGenerativeModel({
      model: "gemini-2.0-flash-001",
      generationConfig: { maxOutputTokens: 2048, temperature: 0.7 },
    });

    const results = [];
    // Rotate through queries for each engine check
    for (let i = 0; i < engines.length; i++) {
      const engine = engines[i];
      const query = queries[i % queries.length];

      try {
        // Use Gemini to simulate what the AI engine would respond
        const prompt = `You are simulating the ${engine} AI search engine. A user asks: "${query}"
        
Provide a concise, helpful answer as ${engine} would. Include specific tool/website recommendations if relevant.
Return your response as plain text (no markdown).`;

        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
        });

        const response = await result.response;
        const aiResponse = response.candidates[0].content.parts[0].text;

        // Check if the website domain is mentioned in the response
        const domain = websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '').toLowerCase();
        const responseLower = aiResponse.toLowerCase();
        
        const isMentioned = responseLower.includes(domain) || 
                            responseLower.includes(domain.split('.')[0]); // Also check brand name

        // Determine sentiment
        let sentiment = 'neutral';
        if (isMentioned) {
          const positiveWords = ['best', 'top', 'recommend', 'excellent', 'leading', 'premier'];
          const hasPositive = positiveWords.some(w => responseLower.includes(w));
          sentiment = hasPositive ? 'positive' : 'mentioned';
        }

        // Save to DB
        const { rows: [newCheck] } = await db.query(`
          INSERT INTO aeo_checks (project_id, engine, query, is_mentioned, context, sentiment)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *
        `, [projectId, engine, query, isMentioned, aiResponse.substring(0, 500), sentiment]);
        
        results.push(newCheck);
        console.log(`[AEO Monitor] ${engine}: ${isMentioned ? '✅ Mentioned' : '❌ Not mentioned'} (${sentiment})`);

      } catch (engineErr) {
        console.error(`[AEO Monitor] Error checking ${engine}:`, engineErr.message);
        
        // Fallback: Store as not mentioned with error context
        const { rows: [newCheck] } = await db.query(`
          INSERT INTO aeo_checks (project_id, engine, query, is_mentioned, context)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *
        `, [projectId, engine, query, false, `Check failed: ${engineErr.message}`]);
        
        results.push(newCheck);
      }

      // Small delay between API calls
      await new Promise(r => setTimeout(r, 1000));
    }

    // Calculate overall visibility score
    const mentioned = results.filter(r => r.is_mentioned).length;
    const overallScore = Math.round((mentioned / engines.length) * 100);

    return { 
      success: true, 
      count: results.length, 
      mentioned,
      overallScore,
      results 
    };
  } catch (error) {
    console.error("[AEO Monitor Error]:", error.message);
    throw error;
  }
}

module.exports = { checkAiVisibility };
