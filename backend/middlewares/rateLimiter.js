import rateLimit from "express-rate-limit";

// Generous global backstop applied to all /api traffic, keyed by IP. It is NOT the
// primary control (the expensive endpoints below each have their own tighter, mostly
// per-user limiters) — it just stops a single host from flooding the many read routes
// (problem search, leaderboard, dashboards) and DB writes (code/save) that have no
// per-route limit, which would strain the 1GB VM. Kept high so a shared NAT (a whole
// classroom/office taking a contest from one public IP) isn't locked out.
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  message: {
    success: false,
    message: "Too many requests. Please slow down.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Per-user throttle for the CPU-expensive endpoints that compile and RUN untrusted
// code (submit + custom run) on the small VM. Keyed by userId (verifyToken runs
// first) so it's fair for users sharing an IP and can't be bypassed by rotating IPs;
// falls back to IP for the (shouldn't-happen) unauthenticated case.
export const judgeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  keyGenerator: (req) => req.userId || req.ip,
  message: {
    success: false,
    message: "You're submitting too quickly. Please wait a moment.",
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