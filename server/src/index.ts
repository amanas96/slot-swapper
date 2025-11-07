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

const allowedOrigins = [
  "https://slot-swapper-amber.vercel.app",
  "http://localhost:5173",
];

// Middleware

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

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
