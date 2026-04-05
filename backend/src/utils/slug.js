/**
 * Slug Generation Utility
 * Creates clean, SEO-friendly URL slugs from blog titles.
 */

/**
 * Generate a URL-friendly slug from a title.
 * Example: "Best Project Management Tools 2025" → "best-project-management-tools-2025"
 */
function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")   // Remove special characters
    .replace(/\s+/g, "-")        // Replace spaces with hyphens
    .replace(/-+/g, "-")         // Replace multiple hyphens with single
    .replace(/^-|-$/g, "")       // Remove leading/trailing hyphens
    .substring(0, 80);           // Limit length
}

/**
 * Generate a unique slug by appending a short suffix if needed.
 */
function generateUniqueSlug(title, existingSlugs = []) {
  let baseSlug = generateSlug(title);
  let slug = baseSlug;
  let counter = 1;

  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

module.exports = { generateSlug, generateUniqueSlug };
