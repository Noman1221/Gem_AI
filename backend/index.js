import cors from "cors";
import "dotenv/config";
import express from "express";
import { dbConnect } from "./DB/db.js";
const app = express();

dbConnect()
    .then(() => {
        console.log("connected to DATABASE");
    })
    .catch((error) => {
        console.log('DB connection error :', error);
    })

// Import routes
import authRoutes from "./routes/auth.route.js";
import chatRoutes from "./routes/chat.route.js";

// Middleware to parse JSON bodies.
app.use(express.json());
// let frontend_origin = process.env.FRONTEND_URL;
// app.use(cors({
//   origin: frontend_origin,
//   credentials: true,
//   optionsSuccessStatus: 200
// }));
app.use(cors({ origin: 'http://localhost:5173' }));


// Routes
app.use('/api/auth', authRoutes);
app.use("/api", chatRoutes);



const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`server is listening on port:${PORT}`);
})

























// import {GoogleGenAI} from '@google/genai';
// const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// const ai = new GoogleGenAI({apiKey: GEMINI_API_KEY});

// async function main() {
//   const response = await ai.models.generateContent({
//     model: 'gemini-2.0-flash-001',
//     contents: 'tell me a joke',
//   });
//   console.log(response.text);
// }

// main();

