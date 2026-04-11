const express = require("express");
const router = express.Router();
const config = require("../config");
const stripe = require("stripe")(config.stripeSecretKey);
const db = require("../services/sql.service");
const { verifyToken } = require("../middleware/auth.middleware");
const { syncUser } = require("../middleware/subscription.middleware");

// ─── POST /api/stripe/create-checkout-session ───────────────────────────────
router.post("/create-checkout-session", verifyToken, syncUser, async (req, res) => {
  try {
    const { plan } = req.body;
    const user = req.user.subscription; // From syncUser middleware

    // Map plan to price ID
    const priceMap = {
      starter: config.stripePriceStarter,
      growth: config.stripePriceGrowth,
      agency: config.stripePriceAgency,
    };

    const priceId = priceMap[plan.toLowerCase()];
    if (!priceId) {
      return res.status(400).json({ success: false, error: "Invalid plan selected." });
    }

    console.log(`[Stripe] Creating checkout session for ${user.email} - Plan: ${plan}`);

    const session = await stripe.checkout.sessions.create({
      customer: user.stripe_customer_id,
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      success_url: `${config.frontendUrl}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.frontendUrl}/pricing`,
      metadata: { firebase_uid: req.user.uid, plan: plan.toLowerCase() },
    });

    return res.json({ success: true, url: session.url });
  } catch (error) {
    console.error("[Stripe] Checkout Session Error:", error.message);
    return res.status(500).json({ success: false, error: "Stripe error: " + error.message });
  }
});

// ─── GET /api/stripe/usage ──────────────────────────────────────────────────
router.get("/usage", verifyToken, syncUser, async (req, res) => {
  try {
    const userId = req.user.uid;
    const user = req.user.subscription; // From syncUser

    // 1. Get project count
    const projectRes = await db.query(
      "SELECT COUNT(*) as count FROM projects WHERE user_id = $1",
      [userId]
    );

    // 2. Get blog count (last 30 days)
    const blogRes = await db.query(
      `SELECT COUNT(*) as count FROM blogs 
       WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '30 days'`,
      [userId]
    );

    return res.json({
      success: true,
      plan: user.plan,
      trial_ends_at: user.trial_ends_at,
      subscription_status: user.subscription_status,
      usage: {
        projects: parseInt(projectRes[0].count),
        blogs: parseInt(blogRes[0].count),
      },
      limits: {
        starter: { projects: 1, blogs: 10 },
        growth: { projects: 3, blogs: 30 },
        agency: { projects: 9999, blogs: 9999 },
      }[user.plan] || { projects: 1, blogs: 10 }, // Default to starter limits if unknown
    });
  } catch (error) {
    console.error("[Stripe] Usage Tracking Error:", error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ─── POST /api/stripe/webhook ────────────────────────────────────────────────
// IMPORTANT: This route MUST use express.raw middleware for signature verification
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, config.stripeWebhookSecret);
  } catch (err) {
    console.error(`[Webhook Error] Signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log(`[Stripe Webhook] Received event: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata.firebase_uid;
        const plan = session.metadata.plan;

        console.log(`[Stripe Webhook] Session completed for user ${userId}. Plan: ${plan}`);

        await db.query(
          `UPDATE users 
           SET subscription_status = 'active', plan = $1, updated_at = NOW() 
           WHERE id = $2`,
          [plan, userId]
        );
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        console.log(`[Stripe Webhook] Subscription deleted for customer ${customerId}`);

        await db.query(
          `UPDATE users SET subscription_status = 'canceled', updated_at = NOW() WHERE stripe_customer_id = $1`,
          [customerId]
        );
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        if (invoice.subscription) {
           await db.query(
             `UPDATE users SET subscription_status = 'active', updated_at = NOW() WHERE stripe_customer_id = $1`,
             [invoice.customer]
           );
        }
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error(`[Stripe Webhook] DB Update Error:`, err.message);
    res.status(500).json({ error: "Webhook handler failed" });
  }
});

module.exports = router;
