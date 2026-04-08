const rateLimit = require("express-rate-limit");

/**
 * General API Rate Limiter
 * Limits overall traffic to a reasonable amount per IP.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    success: false,
    error: "Too many requests from this IP, please try again after 15 minutes.",
  },
});

/**
 * Generation Rate Limiter (Strict)
 * AI generation is expensive and slow. Limit these endpoints heavily.
 */
const generationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 generations per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "AI generation limit reached. Please try again in an hour.",
  },
});

module.exports = { apiLimiter, generationLimiter };
