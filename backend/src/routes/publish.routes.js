const express = require("express");
const router = express.Router();
const publishController = require("../controllers/publish.controller");

const { verifyToken } = require("../middleware/auth.middleware");

// CMS Publication Routes
router.post("/manual", verifyToken, publishController.manualPublish);
router.post("/test", verifyToken, publishController.testConnection);
router.get("/calendar/:projectId", verifyToken, publishController.getCalendar);
router.put("/reschedule", verifyToken, publishController.reschedule);

module.exports = router;
