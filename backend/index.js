import express from "express";
const app = express();
const PORT = process.env.PORT || 5000;
import cors from "cors";

import { connectDB } from "./config/mongoose-connection.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
dotenv.config();
connectDB();

import authRoute from "./routes/authRouter.js";

import path from "path";
const __dirname = path.resolve();

app.use(cors({
    origin: process.env.CLIENT_URL,
}));
app.use(cookieParser());
app.use(express.json());

app.use("/api/auth", authRoute);

if(process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "/frontend/dist")));
    app.get("/*", (req, res) => {
        res.sendFile(path.join(__dirname, "/frontend/dist/index.html"));
    });
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});