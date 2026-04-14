const express = require("express");
const router = express.Router();
const keywordController = require("../controllers/keyword.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { syncUser, checkSubscription, checkBlogLimit } = require("../middleware/subscription.middleware");
const { generationLimiter } = require("../middleware/rateLimit");

router.get("/", verifyToken, syncUser, keywordController.getAll);

router.post(
  "/research", 
  verifyToken, 
  syncUser, 
  checkSubscription, 
  generationLimiter, 
  keywordController.research
);

router.post(
  "/:id/generate", 
  verifyToken, 
  syncUser, 
  checkSubscription, 
  checkBlogLimit, 
  generationLimiter, 
  keywordController.generateForKeyword
);

module.exports = router;
