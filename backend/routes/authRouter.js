import express from "express";
const router = express.Router();


router.get("/signup", (req, res) => {
    res.send("Sign up successful");
});

router.get("/login", (req, res) => {
    res.send("Login successful");
});

export default router;