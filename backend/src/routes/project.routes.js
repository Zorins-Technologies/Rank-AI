const express = require("express");
const router = express.Router();
const projectController = require("../controllers/project.controller");
const { verifyToken, optionalVerifyToken } = require("../middleware/auth.middleware");
const { syncUser, checkSubscription, checkProjectLimit } = require("../middleware/subscription.middleware");
const { body } = require("express-validator");

/**
 * URL Validation Helper
 */
const isValidUrl = (string) => {
  try {
    let url = string;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
};

// --- PUBLIC / GUEST ROUTES ---
router.post("/guest-preview", projectController.getGuestPreview);

// --- PROTECTED ROUTES ---
router.post(
  "/",
  optionalVerifyToken,
  (req, res, next) => {
    // If authenticated, apply subscription/limit checks
    if (req.user) {
      return syncUser(req, res, () => checkSubscription(req, res, () => checkProjectLimit(req, res, next)));
    }
    next();
  },
  [
    body("website_url").custom(isValidUrl).withMessage("A valid website URL is required"),
  ],
  projectController.create
);

router.get("/", verifyToken, syncUser, projectController.getAll);

router.get("/:id", verifyToken, syncUser, projectController.getById);

router.patch("/:id", verifyToken, syncUser, projectController.update);

router.delete("/:id", verifyToken, syncUser, projectController.delete);

module.exports = router;
