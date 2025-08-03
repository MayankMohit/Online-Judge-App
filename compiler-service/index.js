import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import runRouter from './src/routes/runRoute.js'; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

try {
    app.use(cors());
    app.use(bodyParser.json());

    app.use("/compiler", runRouter);

    app.listen(PORT, '0.0.0.0', () => {
    console.log(`Compiler service is running on port ${PORT}`);
    });
} catch (error) {
    console.error('Error starting compiler service:', error);
    process.exit(1);
}