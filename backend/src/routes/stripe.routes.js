const express = require("express");
const router = express.Router();
const stripeController = require("../controllers/stripe.controller");
const { verifyToken } = require("../middleware/auth.middleware");
const { syncUser } = require("../middleware/subscription.middleware");

router.post("/create-checkout-session", verifyToken, syncUser, stripeController.createCheckoutSession);

router.get("/usage", verifyToken, syncUser, stripeController.getUsage);

/**
 * Webhook route - needs raw body for signature verification
 */
router.post(
  "/webhook", 
  express.raw({ type: "application/json" }), 
  stripeController.handleWebhook
);

module.exports = router;
