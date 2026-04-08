const http = require("http");
const https = require("https");

function fetchBuffer(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https://") ? https : http;
    const request = client.get(url, (response) => {
      if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
        return resolve(fetchBuffer(response.headers.location));
      }

      if (response.statusCode !== 200) {
        return reject(new Error(`Image fetch failed with status ${response.statusCode}`));
      }

      const data = [];
      response.on("data", (chunk) => data.push(chunk));
      response.on("end", () => resolve(Buffer.concat(data)));
      response.on("error", reject);
    });

    request.on("error", reject);
  });
}

function getPublicImageUrl(blogTitle) {
  const seed = encodeURIComponent(blogTitle || "blog-header");
  return `https://picsum.photos/seed/${seed}/1600/900`;
}

/**
 * Generate an image using a publicly available image provider.
 * Returns a Buffer of the fetched image.
 */
async function generateImage(blogTitle) {
  const imageUrl = getPublicImageUrl(blogTitle);

  try {
    return await fetchBuffer(imageUrl);
  } catch (error) {
    console.error("[Imagen Service] Public image fetch failed:", error.message);
    throw new Error("Failed to fetch a public blog image");
  }
}

module.exports = { generateImage };
