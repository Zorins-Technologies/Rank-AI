const express = require("express");
const router = express.Router();
const backlinkController = require("../controllers/backlink.controller");
const { verifyToken } = require("../middleware/auth.middleware");

router.get("/platforms/list", verifyToken, backlinkController.getPlatforms);

router.get("/:projectId", verifyToken, backlinkController.getByProject);

router.post("/:projectId/generate", verifyToken, backlinkController.generateTasks);

router.patch("/:taskId", verifyToken, backlinkController.updateTask);

module.exports = router;
