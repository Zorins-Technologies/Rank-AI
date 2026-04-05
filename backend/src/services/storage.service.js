const { Storage } = require("@google-cloud/storage");
const { v4: uuidv4 } = require("uuid");
const config = require("../config");

const storage = new Storage({ projectId: config.gcpProjectId });
const bucket = storage.bucket(config.gcsBucketName);

/**
 * Upload an image buffer to Google Cloud Storage.
 * Returns the public URL of the uploaded image.
 */
async function uploadImage(imageBuffer, originalTitle) {
  const sanitized = originalTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 60);

  const filename = `blog-images/${sanitized}-${uuidv4().slice(0, 8)}.png`;
  const file = bucket.file(filename);

  await file.save(imageBuffer, {
    metadata: {
      contentType: "image/png",
      cacheControl: "public, max-age=31536000",
    },
    resumable: false,
  });

  // Make the file publicly accessible
  await file.makePublic();

  const publicUrl = `https://storage.googleapis.com/${config.gcsBucketName}/${filename}`;
  return publicUrl;
}

module.exports = { uploadImage };
