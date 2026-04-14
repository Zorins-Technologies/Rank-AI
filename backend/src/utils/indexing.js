/**
 * Indexing Utility
 * Handles pings to search engines for new content.
 */

/**
 * Triggers Google to re-crawl the sitemap or a specific slug.
 */
async function triggerIndexing(slug) {
  const sitemapUrl = "https://rankai.zorins.tech/sitemap.xml";
  const pingUrl = `https://www.google.com/ping?sitemap=${sitemapUrl}`;
  
  try {
    console.log(`[Indexing] Pinging Google for: /blogs/${slug}`);
    const response = await fetch(pingUrl);
    if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
    console.log(`[Indexing] Google Ping Successful.`);
  } catch (error) {
    console.warn(`[Indexing] Google Ping failed for ${slug}:`, error.message);
    // In production, consider using the Google Indexing API with a service account.
  }
}

module.exports = { triggerIndexing };
