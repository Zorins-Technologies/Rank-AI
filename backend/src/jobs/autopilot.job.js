const cron = require("node-cron");
const db = require("../services/sql.service");
const blogOrchestrator = require("../services/blog.orchestrator");
const publishService = require("../services/publish.service");

let IS_AUTOPILOT_RUNNING = false;

/**
 * The Autopilot Engine - Orchestrates daily content generation and publishing.
 */
async function runAutopilotCycle() {
  if (IS_AUTOPILOT_RUNNING) {
    console.log("[Autopilot] Cycle already in progress. Skipping duplicate run.");
    return;
  }

  IS_AUTOPILOT_RUNNING = true;
  console.log("[Autopilot] STARTING Daily Cycle...");

  try {
    // 1. Fetch eligible projects
    const { rows: projects } = await db.query(
      `SELECT id, user_id, website_url FROM projects 
       WHERE status = 'active' AND autopilot_enabled = true`
    );

    console.log(`[Autopilot] Identified ${projects.length} project(s) for automation.`);

    for (const project of projects) {
      try {
        // 2. Duplication Protection: Check if already published today
        const { rows: todayBlogs } = await db.query(
          `SELECT id FROM blogs 
           WHERE project_id = $1 AND created_at >= NOW() - INTERVAL '24 hours'`,
          [project.id]
        );

        if (todayBlogs.length > 0) {
          console.log(`[Autopilot] [Proj: ${project.id}] Already generated content today. Skipping.`);
          continue;
        }

        // 3. Fetch next pending growth plan item
        const { rows: [planItem] } = await db.query(
          `SELECT * FROM growth_plans 
           WHERE project_id = $1 AND status = 'pending' 
           ORDER BY publish_day ASC, created_at ASC LIMIT 1`,
          [project.id]
        );

        if (!planItem) {
          console.log(`[Autopilot] [Proj: ${project.id}] No pending growth roadmap items.`);
          continue;
        }

        console.log(`[Autopilot] [Proj: ${project.id}] Processing plan item: "${planItem.topic}"`);

        // 4. STEP: GENERATING
        await db.query("UPDATE growth_plans SET status = 'generating' WHERE id = $1", [planItem.id]);
        
        // Use the orchestrator to generate content
        const blogRecord = await blogOrchestrator.generate(project.user_id, planItem.keyword || planItem.topic, project.id);
        
        // Update blog status to indicate it was AI-generated
        await db.query("UPDATE blogs SET status = 'generated' WHERE id = $1", [blogRecord.id]);
        console.log(`[Autopilot] [Proj: ${project.id}] Content generated: ${blogRecord.id}`);

        // 5. STEP: PUBLISHING
        console.log(`[Autopilot] [Proj: ${project.id}] Attempting WordPress publish...`);
        await db.query("UPDATE blogs SET status = 'publishing' WHERE id = $1", [blogRecord.id]);

        try {
          const publishResult = await publishService.publishToWordPress(project.id, blogRecord);
          
          // 6. SUCCESS
          await db.query("UPDATE blogs SET status = 'published', pipeline_status = 'published' WHERE id = $1", [blogRecord.id]);
          await db.query("UPDATE growth_plans SET status = 'completed' WHERE id = $1", [planItem.id]);
          
          console.log(`[Autopilot] [Proj: ${project.id}] SUCCESS: Post live at ${publishResult.link}`);
        } catch (publishErr) {
          console.error(`[Autopilot] [Proj: ${project.id}] Publish Failed:`, publishErr.message);
          await db.query("UPDATE blogs SET status = 'failed' WHERE id = $1", [blogRecord.id]);
          await db.query("UPDATE growth_plans SET status = 'failed' WHERE id = $1", [planItem.id]);
        }

        // 7. DELAY (Stability)
        console.log("[Autopilot] Sleeping for 5 seconds between projects...");
        await new Promise(r => setTimeout(r, 5000));

      } catch (projectErr) {
        console.error(`[Autopilot] Error processing project ${project.id}:`, projectErr.message);
      }
    }

    console.log("[Autopilot] CYCLE COMPLETE.");
  } catch (err) {
    console.error("[Autopilot FATAL ERROR]:", err.message);
  } finally {
    IS_AUTOPILOT_RUNNING = false;
  }
}

/**
 * Initialize the Autopilot Job
 */
function startAutopilotJob() {
  console.log("[Autopilot] Engine Initialized.");
  
  // Standard Daily Cron: 00:00 (Midnight) server time
  // Using 0 0 * * * for production
  cron.schedule("0 0 * * *", () => {
    console.log("[Autopilot] Cron Trigger: Starting daily cycle...");
    runAutopilotCycle();
  });

  // Optional: Run once 1 minute after server boot to catch up if missed
  /*
  setTimeout(() => {
    console.log("[Autopilot] Boot Trigger: Checking for pending work...");
    runAutopilotCycle();
  }, 60000);
  */
}

module.exports = { startAutopilotJob, runAutopilotCycle };
