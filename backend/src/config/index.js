const path = require("path");
const dotenv = require("dotenv");
const fs = require("fs");

// Load .env from the backend root directory (one level up from src)
const envPath = path.resolve(__dirname, "../../.env");
const dotenvResult = dotenv.config({ path: envPath });

if (dotenvResult.error) {
  console.warn(`[Config] Warning: Could not load .env file from ${envPath}. Continuing with system environment.`);
} else {
  console.log(`[Config] Successfully loaded .env from ${envPath}`);
}

function normalizeEnvValue(value = '') {
  let normalized = value.toString().trim();
  if (normalized.startsWith('"') && normalized.endsWith('"')) {
    normalized = normalized.slice(1, -1).trim();
  }
  return normalized;
}

function normalizePrivateKey(key = '') {
  let normalized = normalizeEnvValue(key);
  if (normalized.includes('\\n') && !normalized.includes('\n')) {
    normalized = normalized.replace(/\\n/g, '\n');
  }
  if (normalized && !normalized.endsWith('\n')) {
    normalized += '\n';
  }
  return normalized;
}

function ensureGoogleApplicationCredentialsFromEnv() {
  const clientEmail = normalizeEnvValue(process.env.GOOGLE_CLOUD_CLIENT_EMAIL);
  const privateKey = normalizePrivateKey(process.env.GOOGLE_CLOUD_PRIVATE_KEY);

  if (!clientEmail || !privateKey) return;

  const credentials = {
    type: normalizeEnvValue(process.env.GOOGLE_CLOUD_TYPE) || "service_account",
    project_id: normalizeEnvValue(process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT),
    private_key_id: normalizeEnvValue(process.env.GOOGLE_CLOUD_PRIVATE_KEY_ID),
    private_key: privateKey,
    client_email: clientEmail,
    client_id: normalizeEnvValue(process.env.GOOGLE_CLOUD_CLIENT_ID),
    auth_uri: normalizeEnvValue(process.env.GOOGLE_CLOUD_AUTH_URI) || "https://accounts.google.com/o/oauth2/auth",
    token_uri: normalizeEnvValue(process.env.GOOGLE_CLOUD_TOKEN_URI) || "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: normalizeEnvValue(process.env.GOOGLE_CLOUD_AUTH_PROVIDER_X509_CERT_URL) || "https://www.googleapis.com/oauth2/v1/certs",
  };

  process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON = JSON.stringify(credentials);
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
      const tempDir = require('os').tmpdir();
      if (tempDir && fs.existsSync(tempDir)) {
        const tempCredsPath = path.join(tempDir, 'rank-ai-credentials.json');
        fs.writeFileSync(tempCredsPath, JSON.stringify(credentials, null, 2), { mode: 0o600 });
        process.env.GOOGLE_APPLICATION_CREDENTIALS = tempCredsPath;
      }
    } catch (err) {
      console.warn('[Config] Could not write temporary Google credentials file:', err.message);
    }
  }
}

ensureGoogleApplicationCredentialsFromEnv();

const { initializeProductionConfig } = require("../services/secret.service");

// Initial config from environment
const rawConfig = {
  env: process.env.NODE_ENV || "development",
  gcpProjectId: process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT,
  gcsBucketName: process.env.GCS_BUCKET_NAME,
  vertexLocation: process.env.VERTEX_LOCATION || "us-central1",
  vertexAiModelId: process.env.VERTEX_AI_MODEL_ID || "gemini-1.5-flash",
  port: process.env.PORT || 8080,
  genaiApiKey: process.env.GENAI_API_KEY,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  stripePriceStarter: process.env.STRIPE_PRICE_STARTER,
  stripePriceGrowth: process.env.STRIPE_PRICE_GROWTH,
  stripePriceAgency: process.env.STRIPE_PRICE_AGENCY,
  frontendUrl: process.env.FRONTEND_URL,
  databaseUrl: process.env.DATABASE_URL
};


// This function will be called during app boot in server.js to hydrate secrets
async function hydrateConfigWithSecrets() {
  if (rawConfig.env !== 'production') {
    return;
  }

  const requiredRuntimeSecrets = [
    'GENAI_API_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'DATABASE_URL'
  ];

  const missingRuntimeSecrets = requiredRuntimeSecrets.filter((name) => !process.env[name]);
  const shouldUseSecretManager = process.env.USE_SECRET_MANAGER === 'true' || missingRuntimeSecrets.length > 0;

  if (!shouldUseSecretManager) {
    console.log('[Secrets] Production secrets already available from environment; skipping Secret Manager.');
    ensureGoogleApplicationCredentialsFromEnv();
    return;
  }

  console.log('[Secrets] Production environment detected. Finalizing configuration...');
  const secrets = await initializeProductionConfig();

  if (secrets.GENAI_API_KEY) rawConfig.genaiApiKey = secrets.GENAI_API_KEY;
  if (secrets.STRIPE_SECRET_KEY) rawConfig.stripeSecretKey = secrets.STRIPE_SECRET_KEY;
  if (secrets.STRIPE_WEBHOOK_SECRET) rawConfig.stripeWebhookSecret = secrets.STRIPE_WEBHOOK_SECRET;
  if (secrets.DATABASE_URL) rawConfig.databaseUrl = secrets.DATABASE_URL;

  ensureGoogleApplicationCredentialsFromEnv();
  // DB credentials and GCS keys are already mapped to process.env in initializeProductionConfig
}


const config = rawConfig;

// Validation for required environment variables
const requiredEnvVars = ['GCP_PROJECT_ID', 'GCS_BUCKET_NAME'];
const usingSecretManager = process.env.USE_SECRET_MANAGER === 'true';
const hasApplicationCredentialsJson = Boolean(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

if (!usingSecretManager && !hasApplicationCredentialsJson) {
  requiredEnvVars.push('GOOGLE_CLOUD_PRIVATE_KEY', 'GOOGLE_CLOUD_CLIENT_EMAIL');
}

const missingVars = requiredEnvVars.filter((v) => {
  if (v === 'GCP_PROJECT_ID') return !process.env.GCP_PROJECT_ID && !config.gcpProjectId;
  if (v === 'GCS_BUCKET_NAME') return !process.env.GCS_BUCKET_NAME && !config.gcsBucketName;
  return !process.env[v];
});

if (missingVars.length > 0) {
  console.warn("\x1b[33m%s\x1b[0m", `[CONFIG WARNING] Missing environment variables: ${missingVars.join(', ')}`);
  console.warn("\x1b[33m%s\x1b[0m", "Please check your .env file or production environment settings.");
}

ensureGoogleApplicationCredentialsFromEnv();

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON && process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  try {
    const credPath = path.resolve(__dirname, "../../", process.env.GOOGLE_APPLICATION_CREDENTIALS);
    if (fs.existsSync(credPath)) {
      process.env.GOOGLE_APPLICATION_CREDENTIALS = credPath;
    }
  } catch (err) {
    console.warn('[Config] Could not resolve GOOGLE_APPLICATION_CREDENTIALS path.');
  }
}

module.exports = { config, hydrateConfigWithSecrets };
