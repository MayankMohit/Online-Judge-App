import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import runRouter from './src/routes/runRoute.js';
import { startJanitor } from './src/utils/janitor.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

try {
    app.use(cors());
    // Internal service: larger cap than the public API since a judge request
    // carries code + all test cases, but still bounded to prevent memory abuse.
    app.use(bodyParser.json({ limit: "5mb" }));

    // Liveness probe for the compose healthcheck (gates the backend's startup).
    app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

    app.use("/compiler", runRouter);

    // Periodically sweep leaked temp files and trim the compile cache.
    startJanitor();

    app.listen(PORT, '0.0.0.0', () => {
    console.log(`Compiler service is running on port ${PORT}`);
    });
} catch (error) {
    console.error('Error starting compiler service:', error);
    process.exit(1);
}