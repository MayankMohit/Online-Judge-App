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

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const startServer = async () => {
  try {
    await connectDB(); 

    // Sync indexes after DB is connected
    // await Problem.syncIndexes();
    // console.log("Problem indexes synced");

    // Middleware
    app.use(cors({
      origin: process.env.CLIENT_URL,
      credentials: true,
    }));
    app.use(cookieParser());
    app.use(express.json());

    // Routes
    app.use("/api/auth", authRoute);
    app.use("/api/problems", problemRoute);
    app.use("/api/users", userRoute);
    app.use("/api/submissions", submissionRoute);   
    app.use("/api/run", runRoute);

    // Static files
    app.use('/static', express.static(path.join(__dirname, "/frontend/public")));

    if (process.env.NODE_ENV === "production") {
      app.use(express.static(path.join(__dirname, "/frontend/dist")));
      app.get("/*", (req, res) => {
        res.sendFile(path.join(__dirname, "/frontend/dist/index.html"));
      });
    }

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
