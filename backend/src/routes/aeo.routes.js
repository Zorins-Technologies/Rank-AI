const express = require("express");
const router = express.Router();
const aeoController = require("../controllers/aeo.controller");
const { verifyToken } = require("../middleware/auth.middleware");

router.post("/check", verifyToken, aeoController.checkVisibility);

router.get("/:projectId", verifyToken, aeoController.getByProject);

router.get("/:projectId/summary", verifyToken, aeoController.getSummary);

module.exports = router;
