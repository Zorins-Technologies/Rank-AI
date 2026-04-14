const { config } = require("../config");
const db = require("../services/sql.service");

let stripe;
const getStripe = () => {
  if (stripe) return stripe;
  if (!config.stripeSecretKey) {
    return { 
      checkout: { sessions: { create: async () => { throw new Error("Stripe not configured"); } } },
      webhooks: { constructEvent: () => { throw new Error("Stripe not configured"); } }
    };
  }
  stripe = require("stripe")(config.stripeSecretKey);
  return stripe;
};

/**
 * Controller for Stripe payments and subscriptions
 */
const stripeController = {
  /**
   * Creates a checkout session for a subscription plan
   * POST /api/stripe/create-checkout-session
   */
  createCheckoutSession: async (req, res) => {
    try {
      const { plan } = req.body;
      const user = req.user.subscription;

      const priceMap = {
        starter: config.stripePriceStarter,
        growth: config.stripePriceGrowth,
        agency: config.stripePriceAgency,
      };

      const priceId = priceMap[plan.toLowerCase()];
      if (!priceId) return res.status(400).json({ success: false, error: "Invalid plan." });

      console.log(`[StripeController] Creating session for ${user.email} - ${plan}`);

      const session = await getStripe().checkout.sessions.create({
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
      console.error("[StripeController] createCheckoutSession error:", error.message);
      return res.status(500).json({ success: false, error: "Payment setup failed." });
    }
  },

  /**
   * Fetches usage stats for the current user
   * GET /api/stripe/usage
   */
  getUsage: async (req, res) => {
    try {
      const userId = req.user.uid;
      const user = req.user.subscription;

      const { rows: projectRows } = await db.query(
        "SELECT COUNT(*) as count FROM projects WHERE user_id = $1", [userId]
      );

      const { rows: blogRows } = await db.query(
        `SELECT COUNT(*) as count FROM blogs 
         WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '30 days'`, [userId]
      );

      const limits = {
        starter: { projects: 1, blogs: 10 },
        growth: { projects: 3, blogs: 30 },
        agency: { projects: 9999, blogs: 9999 },
      }[user.plan] || { projects: 1, blogs: 10 };

      return res.json({
        success: true,
        data: {
          plan: user.plan,
          trialEndsAt: user.trial_ends_at,
          status: user.subscription_status,
          usage: {
            projects: parseInt(projectRows[0].count),
            blogs: parseInt(blogRows[0].count),
          },
          limits
        }
      });
    } catch (error) {
      console.error("[StripeController] getUsage error:", error.message);
      return res.status(500).json({ success: false, error: "Usage fetch failed." });
    }
  },

  /**
   * Handles Stripe webhooks
   * POST /api/stripe/webhook
   */
  handleWebhook: async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = getStripe().webhooks.constructEvent(req.body, sig, config.stripeWebhookSecret);
    } catch (err) {
      console.error(`[Webhook Error]`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log(`[Stripe Webhook] ${event.type}`);

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object;
          const userId = session.metadata.firebase_uid;
          const plan = session.metadata.plan;

          await db.query(
            `UPDATE users SET subscription_status = 'active', plan = $1, updated_at = NOW() WHERE id = $2`,
            [plan, userId]
          );
          break;
        }

        case "customer.subscription.deleted": {
          const customerId = event.data.object.customer;
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
      }
      return res.json({ received: true });
    } catch (err) {
      console.error(`[Webhook Handler Error]`, err.message);
      return res.status(500).json({ error: "Handler failed" });
    }
  }
};

module.exports = stripeController;
