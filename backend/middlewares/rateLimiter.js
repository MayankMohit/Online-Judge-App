import rateLimit from "express-rate-limit";

export const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: "Too many requests. Please try again later."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Tight limiter for auth mutations (login/signup/password reset/verify) to blunt
// password brute-force, verification-code guessing, and reset-email spam. Keyed by
// IP (these routes are unauthenticated); accurate now that `trust proxy` is set.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: {
    success: false,
    message: "Too many attempts. Please try again in a little while.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Per-user throttle for the (paid) AI endpoints so a single account can't run up
// Gemini cost. Keyed by userId (verifyToken runs before this), IP as fallback.
export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  keyGenerator: (req) => req.userId || req.ip,
  message: {
    success: false,
    message: "You're generating AI content too quickly. Please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});