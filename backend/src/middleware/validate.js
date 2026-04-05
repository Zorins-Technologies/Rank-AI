/**
 * Input validation middleware
 */

function validateKeyword(req, res, next) {
  const { keyword } = req.body;

  if (!keyword || typeof keyword !== "string") {
    return res.status(400).json({
      success: false,
      error: "A valid 'keyword' is required.",
    });
  }

  const trimmed = keyword.trim();

  if (trimmed.length === 0) {
    return res.status(400).json({
      success: false,
      error: "Keyword cannot be empty.",
    });
  }

  if (trimmed.length < 2 || trimmed.length > 200) {
    return res.status(400).json({
      success: false,
      error: "Keyword must be between 2 and 200 characters.",
    });
  }

  // Sanitize: remove any HTML/script tags
  req.body.keyword = trimmed.replace(/<[^>]*>/g, "");
  next();
}

function validateTitle(req, res, next) {
  const { title } = req.body;

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: "A valid 'title' is required.",
    });
  }

  req.body.title = title.trim().replace(/<[^>]*>/g, "");
  next();
}

function validateId(req, res, next) {
  const { id } = req.params;

  if (!id || typeof id !== "string" || id.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: "A valid blog ID is required.",
    });
  }

  next();
}

module.exports = { validateKeyword, validateTitle, validateId };
