import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    
    if(!token) return res.status(401).json({success: false, message: "Unauthorized: No token"})
    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        if (!decoded) return res.status(403).json({ success: false, message: "Invalid Token" });
        req.userId = decoded.userId;
        req.user = decoded;
        next();
    } catch (error) {
        // Malformed/expired token — tell the client to re-authenticate (not a 500).
        res.status(401).json({ success: false, message: "Unauthorized: Invalid or expired token" });
    }
}