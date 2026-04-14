const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
let client = null;
let secretCache = null;

function normalizeSecretPayload(payload = '') {
  let normalized = payload.toString().trim();
  if (normalized.startsWith('"') && normalized.endsWith('"')) {
    normalized = normalized.slice(1, -1).trim();
  }
  return normalized;
}

/**
 * Fetch and cache secrets from Google Secret Manager.
 * Returns an object with key-value pairs of secrets.
 */
async function initializeProductionConfig() {
  if (secretCache) return secretCache;
  if (!client) client = new SecretManagerServiceClient();

  const projectId = process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
  if (!projectId) {
    console.warn('[Secrets] Missing GCP_PROJECT_ID. Skipping Secret Manager.');
    return {};
  }

  console.log(`[Secrets] Attempting to load secrets for project: ${projectId}...`);

  const secretsToLoad = [
    'DB_USER',
    'DB_PASSWORD',
    'DB_NAME',
    'INSTANCE_CONNECTION_NAME',
    'GCS_BUCKET_NAME',
    'DATABASE_URL',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'GENAI_API_KEY',
    'GOOGLE_CLOUD_PRIVATE_KEY_ID',
    'GOOGLE_CLOUD_PRIVATE_KEY',
    'GOOGLE_CLOUD_CLIENT_EMAIL',
    'GOOGLE_CLOUD_CLIENT_ID'
  ];

  const secrets = {};
  let loadedCount = 0;

  for (const secretName of secretsToLoad) {
    if (process.env[secretName]) {
      secrets[secretName] = normalizeSecretPayload(process.env[secretName]);
      continue;
    }

    try {
      const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;
      const [version] = await client.accessSecretVersion({ name });
      const payload = normalizeSecretPayload(version.payload.data.toString());
      secrets[secretName] = payload;
      process.env[secretName] = payload;
      console.log(`[Secrets] Loaded: ${secretName}`);
      loadedCount++;
    } catch (err) {
      console.warn(`[Secrets] Missing: ${secretName}`);
    }
  }

  if (loadedCount > 0) {
    console.log(`[Secrets] Successfully loaded ${loadedCount} secrets.`);
  } else {
    console.warn('[Secrets] No secrets were loaded from Secret Manager.');
  }

  secretCache = secrets;
  return secrets;
}

/**
 * Access a specific secret version payload.
 */
async function accessSecret(secretName) {
  if (!client) client = new SecretManagerServiceClient();
  const projectId = process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
  
  try {
    const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;
    const [version] = await client.accessSecretVersion({ name });
    return version.payload.data.toString().trim();
  } catch (error) {
    console.error(`[Secrets] Failed to access secret "${secretName}":`, error.message);
    throw error;
  }
}

module.exports = { initializeProductionConfig, accessSecret };

