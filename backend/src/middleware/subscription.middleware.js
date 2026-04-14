const db = require("../services/sql.service");
const { config } = require("../config");

// Initialize stripe lazily or check for key
let stripe;
const getStripe = () => {
  if (stripe) return stripe;
  if (!config.stripeSecretKey) {
    console.warn("[Stripe] Warning: stripeSecretKey is missing in config.");
    // Return a dummy object to avoid crash during boot, but handle errors during calls
    return { customers: { create: async () => { throw new Error("Stripe not configured"); } } };
  }
  stripe = require("stripe")(config.stripeSecretKey);
  return stripe;
};

const PLAN_LIMITS = {
  starter: { maxProjects: 1, maxBlogsPerMonth: 20 },
  growth: { maxProjects: 3, maxBlogsPerMonth: 30 },
  agency: { maxProjects: Infinity, maxBlogsPerMonth: Infinity },
};

/**
 * Middleware: syncUser
 * Ensures the Firebase user exists in our SQL DB.
 * If not, creates them, creates a Stripe customer, and starts the 14-day trial.
 */
async function syncUser(req, res, next) {
  if (!req.user) return next();

  try {
    const { uid, email } = req.user;

    // Check if user exists in DB
    const { rows: [existingUser] } = await db.query(
      "SELECT * FROM users WHERE id = $1",
      [uid]
    );

    if (existingUser) {
      req.user.subscription = existingUser;
      return next();
    }

    // New User Creation Logic
    console.log(`[Subscription Middleware] Syncing new user: ${email} (${uid})`);

    // 1. Create Stripe Customer
    let stripeCustomerId = null;
    if (config.stripeSecretKey) {
      try {
        const customer = await getStripe().customers.create({
          email,
          metadata: { firebase_uid: uid }
        });
        stripeCustomerId = customer.id;
      } catch (stripeErr) {
        console.error("[Subscription Middleware] Stripe Customer Creation Failed:", stripeErr.message);
      }
    }

    // 2. Insert into DB (Start 14-day trial automatically)
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    const { rows: [newUser] } = await db.query(
      `INSERT INTO users (id, email, stripe_customer_id, subscription_status, plan, trial_ends_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [uid, email, stripeCustomerId, 'trialing', 'starter', trialEndsAt]
    );

    req.user.subscription = newUser;
    next();
  } catch (error) {
    console.error("[Subscription Middleware] User Sync Error:", error.message);
    next();
  }
}

/**
 * Middleware: checkSubscription
 * Ensures user has an active/trialing subscription.
 */
function checkSubscription(req, res, next) {
  const sub = req.user?.subscription;

  if (!sub) {
    return res.status(401).json({ success: false, error: "Profile synchronization failed. Please refresh." });
  }

  const isTrialValid = sub.trial_ends_at && new Date(sub.trial_ends_at) > new Date();
  const isActive = sub.subscription_status === 'active' || (sub.subscription_status === 'trialing' && isTrialValid);

  if (!isActive) {
    return res.status(403).json({
      success: false,
      error: "Subscription required.",
      code: "SUBSCRIPTION_REQUIRED"
    });
  }

  next();
}

/**
 * Middleware: checkProjectLimit
 */
async function checkProjectLimit(req, res, next) {
  try {
    const sub = req.user.subscription;
    const limits = PLAN_LIMITS[sub.plan] || PLAN_LIMITS.starter;

    const { rows: [countResult] } = await db.query(
      "SELECT COUNT(*) as cnt FROM projects WHERE user_id = $1",
      [req.user.uid]
    );

    if (parseInt(countResult.cnt) >= limits.maxProjects) {
      return res.status(403).json({
        success: false,
        error: `Project limit reached for ${sub.plan} plan (${limits.maxProjects}). Please upgrade.`,
        code: "LIMIT_REACHED"
      });
    }

    next();
  } catch (err) {
    console.error("[checkProjectLimit] error:", err);
    next();
  }
}

/**
 * Middleware: checkBlogLimit
 */
async function checkBlogLimit(req, res, next) {
  try {
    const sub = req.user.subscription;
    const limits = PLAN_LIMITS[sub.plan] || PLAN_LIMITS.starter;

    const { rows: [countResult] } = await db.query(
      "SELECT COUNT(*) as cnt FROM blogs WHERE user_id = $1 AND created_at > NOW() - INTERVAL '30 days'",
      [req.user.uid]
    );

    if (parseInt(countResult.cnt) >= limits.maxBlogsPerMonth) {
      return res.status(403).json({
        success: false,
        error: `Blog generation limit reached for ${sub.plan} plan (${limits.maxBlogsPerMonth}/month). Please upgrade.`,
        code: "LIMIT_REACHED"
      });
    }

    next();
  } catch (err) {
    console.error("[checkBlogLimit] error:", err);
    next();
  }
}

module.exports = {
  syncUser,
  checkSubscription,
  checkProjectLimit,
  checkBlogLimit
};
