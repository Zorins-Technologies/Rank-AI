const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');
const client = new SecretManagerServiceClient();

let secretCache = null;

/**
 * Fetch and cache secrets from Google Secret Manager.
 * Returns an object with key-value pairs of secrets.
 */
async function loadProductionSecrets() {
  if (secretCache) return secretCache;

  const projectId = process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
  if (!projectId) {
    console.warn('[Secrets] Missing GCP_PROJECT_ID. Skipping Secret Manager.');
    return {};
  }

  console.log(`[Secrets] Loading secrets for project: ${projectId}...`);

  try {
    // List of secrets we expect to find in Secret Manager
    const secretsToLoad = [
      'STRIPE_SECRET_KEY',
      'STRIPE_WEBHOOK_SECRET',
      'GENAI_API_KEY',
      'DATABASE_URL',
      'GOOGLE_CLOUD_PRIVATE_KEY',
      'GOOGLE_CLOUD_CLIENT_EMAIL'
    ];

    const secrets = {};

    for (const secretName of secretsToLoad) {
      try {
        const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;
        const [version] = await client.accessSecretVersion({ name });
        const payload = version.payload.data.toString();
        secrets[secretName] = payload;
      } catch (err) {
        console.warn(`[Secrets] Could not load secret "${secretName}": ${err.message}`);
      }
    }

    secretCache = secrets;
    return secrets;
  } catch (error) {
    console.error('[Secrets] Failed to load secrets:', error.message);
    return {};
  }
}

module.exports = { loadProductionSecrets };
