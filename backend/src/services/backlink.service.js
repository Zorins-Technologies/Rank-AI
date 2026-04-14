const db = require("./sql.service");

/**
 * Generate backlink tasks for a given blog article.
 * Fetches platform data from the backlink_platforms table and creates
 * AI-assisted task descriptions for each platform.
 * @param {string} blogId - The blog article UUID.
 * @param {string} projectId - The project UUID.
 * @param {string} title - The blog title.
 * @param {string} keyword - The target keyword.
 */
async function generateBacklinkTasks(blogId, projectId, title, keyword) {
  console.log(`[Backlink] Generating tasks for "${title}"...`);

  try {
    // Fetch active platforms from DB
    const { rows: platforms } = await db.query(
      `SELECT * FROM backlink_platforms WHERE is_active = true ORDER BY domain_authority DESC`
    );

    if (platforms.length === 0) {
      console.warn("[Backlink] No active platforms found in DB. Using defaults.");
      // Fallback if table is empty
      return generateFallbackTasks(blogId, projectId, title, keyword);
    }

    const tasks = [];
    // Select top 5 platforms by DA for this article
    const selectedPlatforms = platforms.slice(0, 5);

    for (const platform of selectedPlatforms) {
      const taskDesc = generateTaskDescription(platform, title, keyword);
      
      const { rows: [newTask] } = await db.query(`
        INSERT INTO backlink_campaigns (blog_id, project_id, platform, task_description, status, domain_authority)
        VALUES ($1, $2, $3, $4, 'pending', $5)
        RETURNING *
      `, [blogId, projectId, platform.name, taskDesc, platform.domain_authority]);
      
      tasks.push(newTask);
    }

    console.log(`[Backlink] Created ${tasks.length} backlink tasks for blog "${title}"`);
    return { success: true, count: tasks.length, tasks };
  } catch (error) {
    console.error("[Backlink Error]:", error.message);
    throw error;
  }
}

/**
 * Generate a specific task description based on the platform type.
 */
function generateTaskDescription(platform, title, keyword) {
  const templates = {
    'blog': `Write a summary post on ${platform.name} about "${title}". Include 2-3 key takeaways and link back to the original article. Target keyword: "${keyword}".`,
    'social': `Share the article "${title}" on ${platform.name}. Write a compelling post highlighting the main value proposition. Include a direct link and use relevant hashtags for "${keyword}".`,
    'qa': `Find questions related to "${keyword}" on ${platform.name}. Write a detailed, helpful answer that naturally references and links to "${title}".`,
    'directory': `Create or update a listing on ${platform.name} that references "${title}" as a resource. Include relevant metadata and a backlink.`,
  };

  return templates[platform.platform_type] || templates['blog'];
}

/**
 * Fallback task generation if platform table is empty.
 */
async function generateFallbackTasks(blogId, projectId, title, keyword) {
  const fallback = [
    { name: 'Medium', desc: `Create a summary/intro of "${title}" and link to the full article.`, da: 95 },
    { name: 'LinkedIn', desc: `Share key insights from "${title}" with your professional network. Link to source.`, da: 99 },
    { name: 'Reddit', desc: `Find a relevant subreddit for "${keyword}" and share insights from "${title}".`, da: 91 },
    { name: 'Quora', desc: `Answer a question related to "${keyword}" and naturally reference "${title}".`, da: 93 },
    { name: 'Pinterest', desc: `Create a visual summary/infographic from "${title}" headers and link back.`, da: 94 },
  ];

  const tasks = [];
  for (const p of fallback) {
    const { rows: [newTask] } = await db.query(`
      INSERT INTO backlink_campaigns (blog_id, project_id, platform, task_description, status, domain_authority)
      VALUES ($1, $2, $3, $4, 'pending', $5)
      RETURNING *
    `, [blogId, projectId, p.name, p.desc, p.da]);
    tasks.push(newTask);
  }

  return { success: true, count: tasks.length, tasks };
}

module.exports = { generateBacklinkTasks };
