import express, { Express, Request, Response } from "express";
import cors from "cors";
import connectDB from "./config/db";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import eventRoutes from "./routes/eventRoutes";
import swapRoutes from "./routes/swapRoutes";

dotenv.config();

// Connect to database
connectDB();

const app: Express = express();

// Middleware
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse JSON bodies

//Api
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/swap", swapRoutes);
// Simple test route
app.get("/", (req: Request, res: Response) => {
  res.send("SlotSwapper API Running...");
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () =>
  console.log(`Server started on http://localhost:${PORT}`)
);
