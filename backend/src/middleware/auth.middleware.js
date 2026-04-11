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

/**
 * Middleware that attempts to verify the token but does not fail if it's missing.
 * Useful for public routes that have extra features for logged-in users.
 */
async function optionalVerifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(); // Proceed without req.user
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
    console.warn("[Auth Middleware] Optional token verification failed:", error.message);
    // Even if token is invalid, we proceed as unauthenticated for optional routes
    next();
  }
}

module.exports = { verifyToken, optionalVerifyToken };
