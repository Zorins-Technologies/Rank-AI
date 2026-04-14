const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blog.controller");
const { generationLimiter } = require("../middleware/rateLimit");
const { syncUser, checkSubscription, checkBlogLimit } = require("../middleware/subscription.middleware");
const { verifyToken, optionalVerifyToken } = require("../middleware/auth.middleware");
const { validateKeyword, validateId } = require("../middleware/validate");

// --- PUBLIC ROUTES ---
router.get("/", optionalVerifyToken, blogController.getAll);
router.get("/:id", optionalVerifyToken, blogController.getById);

// --- PROTECTED ROUTES ---
router.post(
  "/generate", 
  verifyToken, 
  syncUser, 
  checkSubscription, 
  checkBlogLimit, 
  generationLimiter, 
  validateKeyword, 
  blogController.generate
);

// Backward compatibility (if needed) or preferred naming
router.post(
  "/generate-blog",
  verifyToken, 
  syncUser, 
  checkSubscription, 
  checkBlogLimit, 
  generationLimiter, 
  validateKeyword, 
  blogController.generate
);

router.put(
  "/:id", 
  verifyToken, 
  syncUser, 
  blogController.update
);

router.delete(
  "/:id", 
  verifyToken, 
  syncUser, 
  blogController.delete
);

router.patch(
  "/:id/status",
  verifyToken,
  syncUser,
  // We can add a specific method in controller later if status logic differs
  blogController.update 
);

/**
 * ADMIN: Manually Trigger System Blog Generation
 */
router.post("/admin/trigger-system-blog", async (req, res) => {
  try {
     const adminToken = req.headers['x-admin-token'] || req.body.admin_token;
     const expectedToken = process.env.ADMIN_SECRET_TOKEN;
     
     if (!expectedToken || adminToken !== expectedToken) {
       return res.status(403).json({ success: false, error: "Forbidden: Invalid admin token." });
     }

     const { runDailySystemBlog } = require("../jobs/systemBlog.job");
     runDailySystemBlog();

     return res.json({ success: true, message: "Autonomous job triggered in background." });
  } catch (error) {
     return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
