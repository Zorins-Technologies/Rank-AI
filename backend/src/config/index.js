const path = require("path");
const dotenv = require("dotenv");
const fs = require("fs");

// Load .env from the backend root directory (one level up from src)
dotenv.config({ path: path.join(__dirname, "../../.env") });

const config = {
  env: process.env.NODE_ENV || "development",
  gcpProjectId: process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT,
  gcsBucketName: process.env.GCS_BUCKET_NAME,
  vertexLocation: process.env.VERTEX_LOCATION || "us-central1",
  port: process.env.PORT || 8080,
  genaiApiKey: process.env.GENAI_API_KEY,
};

// Validation for required environment variables
const requiredEnvVars = [
  'GCP_PROJECT_ID',
  'GCS_BUCKET_NAME',
  'GOOGLE_CLOUD_PRIVATE_KEY',
  'GOOGLE_CLOUD_CLIENT_EMAIL'
];

const missingVars = requiredEnvVars.filter(v => !process.env[v] && !config[v]);

if (missingVars.length > 0) {
  console.warn("\x1b[33m%s\x1b[0m", `[CONFIG WARNING] Missing environment variables: ${missingVars.join(', ')}`);
  console.warn("\x1b[33m%s\x1b[0m", "Please check your .env file or production environment settings.");
}

// Set up Google Cloud credentials from environment variables
if (process.env.GOOGLE_CLOUD_PRIVATE_KEY && process.env.GOOGLE_CLOUD_CLIENT_EMAIL) {
  const credentials = {
    type: process.env.GOOGLE_CLOUD_TYPE || "service_account",
    project_id: config.gcpProjectId,
    private_key_id: process.env.GOOGLE_CLOUD_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLOUD_CLIENT_ID,
    auth_uri: process.env.GOOGLE_CLOUD_AUTH_URI || "https://accounts.google.com/o/oauth2/auth",
    token_uri: process.env.GOOGLE_CLOUD_TOKEN_URI || "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: process.env.GOOGLE_CLOUD_AUTH_PROVIDER_X509_CERT_URL || "https://www.googleapis.com/oauth2/v1/certs",
  };

  // Set the credentials for Google Cloud SDKs
  process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON = JSON.stringify(credentials);
  
  // Also create a temporary file as fallback (restrict permissions for security)
  const tempCredsPath = path.join(require('os').tmpdir(), 'rank-ai-credentials.json');
  fs.writeFileSync(tempCredsPath, JSON.stringify(credentials, null, 2), { mode: 0o600 });
  process.env.GOOGLE_APPLICATION_CREDENTIALS = tempCredsPath;
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  // Fallback to file-based credentials if specified
  process.env.GOOGLE_APPLICATION_CREDENTIALS = path.resolve(
    __dirname,
    "../../",
    process.env.GOOGLE_APPLICATION_CREDENTIALS
  );
}

module.exports = config;
