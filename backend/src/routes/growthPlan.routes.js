const express = require("express");
const router = express.Router();
const growthPlanController = require("../controllers/growthPlan.controller");
const { verifyToken } = require("../middleware/auth.middleware");

router.post("/generate", verifyToken, growthPlanController.generate);

router.get("/:projectId", verifyToken, growthPlanController.getByProject);

module.exports = router;
