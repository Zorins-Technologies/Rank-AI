const db = require("./sql.service");
const { accessSecret } = require("./secret.service");

/**
 * Service for publishing content to external CMS platforms (WordPress, Webflow).
 */
const publishService = {
  /**
   * Orchestrates the publication of a blog to WordPress.
   */
  async publishToWordPress(projectId, blogData) {
    console.log(`[Publish] Attempting to publish project ${projectId} to WordPress...`);

    // 1. Fetch CMS Connection
    const { rows: [connection] } = await db.query(
      "SELECT * FROM cms_connections WHERE project_id = $1 AND cms_type = 'wordpress'",
      [projectId]
    );

    if (!connection) {
      throw new Error(`WordPress connection not found for project ${projectId}`);
    }

    // 2. Fetch Credentials from Secret Manager
    const secretJson = await accessSecret(connection.secret_name);
    const { username, application_password } = JSON.parse(secretJson);

    if (!username || !application_password) {
      throw new Error("Incomplete WordPress credentials in Secret Manager.");
    }

    const authHeader = `Basic ${Buffer.from(`${username}:${application_password}`).toString("base64")}`;
    const baseUrl = connection.site_url.replace(/\/$/, "");

    // 3. Upload Media (Featured Image) if present
    let featuredMediaId = null;
    let imageBuffer = blogData.image_buffer;

    // If we only have a URL, fetch the image buffer first
    if (!imageBuffer && blogData.image_url) {
      try {
        console.log(`[Publish] Fetching image buffer from: ${blogData.image_url}`);
        const response = await fetch(blogData.image_url);
        if (!response.ok) throw new Error("Failed to fetch image from URL.");
        imageBuffer = Buffer.from(await response.arrayBuffer());
      } catch (fetchError) {
        console.warn("[Publish] Could not fetch image buffer:", fetchError.message);
      }
    }

    if (imageBuffer) {
      try {
        featuredMediaId = await this.uploadMediaToWordPress(
          baseUrl,
          authHeader,
          imageBuffer,
          `${blogData.slug || 'featured'}.jpg`
        );
      } catch (mediaError) {
        console.warn("[Publish] Media upload failed, proceeding without featured image:", mediaError.message);
      }
    }

    // 4. Create Post
    const postPayload = {
      title: blogData.title,
      content: blogData.content,
      status: connection.config?.default_status || "publish",
      slug: blogData.slug,
      featured_media: featuredMediaId,
      categories: [], // Could be expanded later
    };

    console.log(`[Publish] Creating post on ${baseUrl}/wp-json/wp/v2/posts...`);
    const response = await fetch(`${baseUrl}/wp-json/wp/v2/posts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": authHeader,
      },
      body: JSON.stringify(postPayload),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(`WordPress Post Creation Failed [${response.status}]: ${result.message || JSON.stringify(result)}`);
    }

    console.log(`[Publish] Successfully published to WordPress: ${result.link}`);

    // 5. Update Blog record with CMS info
    await db.query(
      "UPDATE blogs SET status = 'published', pipeline_status = 'published' WHERE id = $1",
      [blogData.id]
    );

    return {
      success: true,
      link: result.link,
      cms_id: result.id
    };
  },

  /**
   * Uploads an image buffer to the WordPress Media Library.
   */
  async uploadMediaToWordPress(baseUrl, authHeader, imageBuffer, fileName) {
    console.log(`[Publish] Uploading media: ${fileName}...`);
    
    const response = await fetch(`${baseUrl}/wp-json/wp/v2/media`, {
      method: "POST",
      headers: {
        "Authorization": authHeader,
        "Content-Type": "image/jpeg",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
      body: imageBuffer,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(`WordPress Media Upload Failed [${response.status}]: ${result.message || JSON.stringify(result)}`);
    }

    console.log(`[Publish] Media uploaded successfully, ID: ${result.id}`);
    return result.id;
  }
};

module.exports = publishService;
