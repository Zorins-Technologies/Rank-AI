const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

const config = {
  port: process.env.PORT || 8000,
  gcpProjectId: process.env.GCP_PROJECT_ID,
  gcsBucketName: process.env.GCS_BUCKET_NAME,
  vertexLocation: process.env.VERTEX_LOCATION || "us-central1",
};

// Validate required config
const required = ["gcpProjectId", "gcsBucketName", "vertexLocation"];
for (const key of required) {
  if (!config[key]) {
    console.error(`Missing required env variable for config.${key}`);
    process.exit(1);
  }
}

module.exports = config;
