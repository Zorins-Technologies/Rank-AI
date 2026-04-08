const admin = require("../config/firebase-admin");

/**
 * Middleware to verify the Firebase ID Token from the Authorization header.
 * Attaches the user object to the request.
 */
async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: "Authentication required. Please provide a valid Bearer token.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture,
    };
    next();
  } catch (error) {
    console.error("[Auth Middleware] Token verification failed:", error.message);
    return res.status(401).json({
      success: false,
      error: "Invalid or expired token.",
    });
  }
}

module.exports = { verifyToken };
