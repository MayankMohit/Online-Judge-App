import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    
    if(!token) return res.status(401).json({success: false, message: "Unauthorized: No token"})
    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        if(!decoded) return res.status(401).json({success: false, message: "Invalid Token"})
        req.userId = decoded.userId // Create this new field
        next();
    } catch (error) {
        res.status(500).json({ success: false, message: "Server Error" });
    }
}