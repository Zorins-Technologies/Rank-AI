const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth.middleware");
const { syncUser, checkSubscription, checkProjectLimit } = require("../middleware/subscription.middleware");
const db = require("../services/sql.service");
const { body, validationResult } = require("express-validator");

/**
 * Helper to validate URL
 */
const isValidUrl = (string) => {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// ─── POST /projects ───────────────────────────────────────────────────────────
// Create a new project for the authenticated user.
router.post(
  "/",
  verifyToken,
  syncUser,
  checkSubscription,
  checkProjectLimit,
  [
    body("website_url").custom(isValidUrl).withMessage("valid website_url is required"),
    body("niche_type").isIn(["preset", "custom"]).withMessage("niche_type must be preset or custom"),
    body("niche_value").notEmpty().withMessage("niche_value is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { website_url, niche_type, niche_value } = req.body;
      const userId = req.user.uid;

      const { rows: [newProject] } = await db.query(
        `INSERT INTO projects (user_id, website_url, niche_type, niche_value)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [userId, website_url, niche_type, niche_value]
      );

      return res.status(201).json({ success: true, data: newProject });
    } catch (error) {
      console.error("[Projects /] POST Error:", error.message);
      return res.status(500).json({ success: false, error: "Failed to create project." });
    }
  }
);

// ─── GET /projects ────────────────────────────────────────────────────────────
// Fetch all projects for the authenticated user with blog counts.
router.get("/", verifyToken, syncUser, async (req, res) => {
  try {
    const userId = req.user.uid;

    const { rows } = await db.query(
      `SELECT p.*, COUNT(b.id) as blog_count
       FROM projects p
       LEFT JOIN blogs b ON p.id = b.project_id
       WHERE p.user_id = $1
       GROUP BY p.id
       ORDER BY p.created_at DESC`,
      [userId]
    );

    return res.status(200).json({ success: true, data: rows });
  } catch (error) {
    console.error("[Projects /] GET Error:", error.message);
    return res.status(500).json({ success: false, error: "Failed to fetch projects." });
  }
});

// ─── GET /projects/:id ──────────────────────────────────────────────────────
// Fetch a single project detail.
router.get("/:id", verifyToken, syncUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const { rows: [project] } = await db.query(
      `SELECT * FROM projects WHERE id = $1 AND user_id = $2 LIMIT 1`,
      [id, userId]
    );

    if (!project) {
      return res.status(404).json({ success: false, error: "Project not found." });
    }

    return res.status(200).json({ success: true, data: project });
  } catch (error) {
    console.error("[Projects /:id] GET Error:", error.message);
    return res.status(500).json({ success: false, error: "Failed to fetch project detail." });
  }
});

// ─── PATCH /projects/:id ─────────────────────────────────────────────────────
// Update niche_value or status.
router.patch("/:id", verifyToken, syncUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;
    const { niche_value, status } = req.body;

    // Check ownership
    const { rows: [existing] } = await db.query(
      `SELECT id FROM projects WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (!existing) {
      return res.status(404).json({ success: false, error: "Project not found." });
    }

    const updates = [];
    const values = [id, userId];

    if (niche_value) {
      values.push(niche_value);
      updates.push(`niche_value = $${values.length}`);
    }
    if (status && ["active", "paused"].includes(status)) {
      values.push(status);
      updates.push(`status = $${values.length}`);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: "No valid updates provided." });
    }

    const query = `UPDATE projects SET ${updates.join(", ")}, updated_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING *`;
    const { rows: [updated] } = await db.query(query, values);

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error("[Projects /:id] PATCH Error:", error.message);
    return res.status(500).json({ success: false, error: "Failed to update project." });
  }
});

// ─── DELETE /projects/:id ───────────────────────────────────────────────────
// Delete project.
router.delete("/:id", verifyToken, syncUser, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    const { rows } = await db.query(
      `DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: "Project not found." });
    }

    return res.status(200).json({ success: true, message: "Project deleted successfully." });
  } catch (error) {
    console.error("[Projects /:id] DELETE Error:", error.message);
    return res.status(500).json({ success: false, error: "Failed to delete project." });
  }
});

module.exports = router;
