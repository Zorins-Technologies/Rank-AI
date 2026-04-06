const path = require("path");
const dotenv = require("dotenv");

// Load .env from the backend root directory (one level up from src)
// This ensures that GOOGLE_APPLICATION_CREDENTIALS is loaded before SDKs are initialized
dotenv.config({ path: path.join(__dirname, "../../.env") });

const config = {
  gcpProjectId: process.env.GCP_PROJECT_ID,
  gcsBucketName: process.env.GCS_BUCKET_NAME,
  vertexLocation: process.env.VERTEX_LOCATION || "us-central1",
  port: process.env.PORT || 8000,
  googleApplicationCredentials: process.env.GOOGLE_APPLICATION_CREDENTIALS,
};

// Also set it in process.env explicitly for Google Cloud SDKs to pick up
if (config.googleApplicationCredentials) {
  process.env.GOOGLE_APPLICATION_CREDENTIALS = path.resolve(
    __dirname,
    "../../",
    config.googleApplicationCredentials
  );
}

module.exports = config;
