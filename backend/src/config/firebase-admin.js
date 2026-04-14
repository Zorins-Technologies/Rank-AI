const admin = require("firebase-admin");
const { config } = require("./index");

if (!admin.apps.length) {
  try {
    // If we have full credentials JSON available
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
      const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
      admin.initializeApp({
        credential: admin.credential.cert(credentials),
        projectId: config.gcpProjectId,
      });
    } else {
      // Fallback to default application credentials (ADC)
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId: config.gcpProjectId,
      });
    }
    console.log("[Firebase Admin] Initialized successfully.");
  } catch (error) {
    console.error("[Firebase Admin] Initialization error:", error.message);
  }
}

module.exports = admin;
