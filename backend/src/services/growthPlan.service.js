const { VertexAI } = require("@google-cloud/vertexai");
const { config } = require("../config");
const db = require("./sql.service");

const vertexAI = new VertexAI({
  project: config.gcpProjectId,
  location: config.vertexLocation,
});

/**
 * Growth Plan Service
 * Generates strategic content roadmaps using AI
 */
const growthPlanService = {
  /**
   * Generates a 30-day growth plan for a project
   */
  createPlan: async (projectId, userId, websiteUrl, niche, context = {}) => {
    console.log(`[GrowthPlanService] Generating 30-day roadmap for: ${websiteUrl}`);

    const modelId = config.vertexAiModelId || "gemini-1.5-pro";
    const generativeModel = vertexAI.getGenerativeModel({ model: modelId });

    const prompt = `Act as an elite SEO & AEO Growth Strategist. 
      Create a 30-day "AI Search Growth Roadmap" for: ${websiteUrl} in niche: "${niche}".
      
      Context:
      Brand: ${context.brand_name || 'N/A'}
      Goal: ${context.primary_goals || 'General growth'}
      Voice: ${context.brand_voice || 'Professional'}
      Style: ${context.content_style || 'Blog Posts and Guides'}
      Target: ${context.target_country || 'Global'} / ${context.audience_type || 'General'}
      Offerings: ${(context.key_offerings || []).join(', ')}
      
      Requirements:
      - EXACTLY 30 unique content topics.
      - Topics must reflect the brand voice ("${context.brand_voice || 'Professional'}") and follow the style ("${context.content_style || 'General Blog'}").
      - Each topic must have: topic, keyword, intent, priority (1-100), strategy_reason, publish_day (1-30), traffic_potential (Low/Med/High), ranking_difficulty (Easy/Med/Hard), ai_visibility_score (0-100).

      Response Format: Return ONLY a raw JSON array of 30 objects.`;

    try {
      const result = await generativeModel.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      const response = await result.response;
      const text = response.candidates[0].content.parts[0].text;
      const cleanJson = text.replace(/```json|```/gi, "").trim();
      const plan = JSON.parse(cleanJson);

      // Bulk Insert
      for (const item of plan) {
        await db.query(
          `INSERT INTO growth_plans (project_id, user_id, topic, keyword, intent, priority, publish_day, strategy_reason, status, traffic_potential, ranking_difficulty, ai_visibility_score)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending', $9, $10, $11)`,
          [projectId, userId, item.topic, item.keyword, item.intent, item.priority, item.publish_day, item.strategy_reason, item.traffic_potential, item.ranking_difficulty, item.ai_visibility_score]
        );
      }

      return { success: true, count: plan.length };
    } catch (error) {
      console.error("[GrowthPlanService] Error:", error.message);
      throw error;
    }
  },

  /**
   * Generates a quick 5-item preview for landing page guests
   */
  generatePreview: async (websiteUrl, context = {}) => {
    const generativeModel = vertexAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `Generate a 5-topic SEO priority preview for website: ${websiteUrl}.
      Context: ${JSON.stringify(context)}
      Format: Raw JSON array of 5 objects (topic, keyword, intent, priority, explanation, traffic_potential).`;

    try {
      const result = await generativeModel.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      const response = await result.response;
      const text = response.candidates[0].content.parts[0].text;
      const topics = JSON.parse(text.replace(/```json|```/gi, "").trim());

      return { preview_topics: topics };
    } catch (error) {
      console.warn("[GrowthPlanService] Preview failed, using fallback:", error.message);
      return growthPlanService.getMockPreview();
    }
  },

  getMockPreview: () => ({
    preview_topics: [
      { topic: "Industry Trends 2026", keyword: "market trends", intent: "informational", priority: 95, explanation: "High interest topic", traffic_potential: "High" },
      { topic: "Efficiency Guide", keyword: "productivity hacks", intent: "informational", priority: 88, explanation: "Core audience need", traffic_potential: "Medium" }
    ],
    used_fallback: true
  })
};

module.exports = {
  ...growthPlanService,
  createGrowthPlan: growthPlanService.createPlan,
  generateGuestPreview: growthPlanService.generatePreview
};
