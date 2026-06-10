import jwt from "jsonwebtoken";

// Like verifyToken, but never rejects — guests pass through with req.userId = null.
export const optionalAuth = (req, res, next) => {
  const token = req.cookies.token;
  req.userId = null;
  req.user = null;

  if (!token) return next();
  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    if (decoded) {
      req.userId = decoded.userId;
      req.user = decoded;
    }
  } catch (error) {
    // invalid/expired token — treat as guest
  }
  next();
};
