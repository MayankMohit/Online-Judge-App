import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

import { connectDB } from "./config/mongoose-connection.js";
// import { Problem } from "./models/problemModel.js";
import authRoute from "./routes/authRouter.js";
import problemRoute from "./routes/problemRouter.js";
import userRoute from "./routes/userRouter.js";
import submissionRoute from "./routes/submissionRouter.js";
import runRoute from "./routes/runRouter.js";
import codeRoute from "./routes/codeRouter.js";
import aiRoute from "./routes/aiRouter.js";
import contestRoute from "./routes/contestRouter.js";
import { startRenumberJob } from "./jobs/renumberJob.js";
import { startJudgeWorker } from "./workers/judgeWorker.js";
import { sanitizeBody } from "./middlewares/sanitize.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const startServer = async () => {
  try {
    await connectDB(); 

    // Sync indexes after DB is connected
    // await Problem.syncIndexes();
    // console.log("Problem indexes synced");

    // Behind the nginx reverse proxy: trust the first hop so req.ip reflects the
    // real client (required for per-IP rate limiting) and Secure cookies work.
    app.set("trust proxy", 1);

    // Middleware
    app.use(cors({
      origin: process.env.CLIENT_URL,
      credentials: true,
    }));
    app.use(cookieParser());
    app.use(express.json({ limit: "1mb" })); // cap request bodies (code + test cases)
    app.use(sanitizeBody); // strip NoSQL operator injection from request bodies

    // Routes
    app.use("/api/auth", authRoute);
    app.use("/api/problems", problemRoute);
    app.use("/api/users", userRoute);
    app.use("/api/submissions", submissionRoute);   
    app.use("/api/run", runRoute);
    app.use("/api/code", codeRoute);
    app.use("/api/ai", aiRoute);
    app.use("/api/contests", contestRoute);

    // Background jobs
    startRenumberJob();
    startJudgeWorker(); // no-op unless REDIS_URL is configured

    // Start listening
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });

  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
