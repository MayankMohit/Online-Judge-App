import { User } from "../models/userModel.js";

export const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user || user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin access only" });
    }
    req.user = user; // optional: set for downstream use
    next();
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
