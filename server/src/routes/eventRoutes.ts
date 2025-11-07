import { Router } from "express";
import {
  createEvent,
  getMyEvents,
  updateEvent,
  deleteEvent,
} from "../controllers/eventController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

// --- ALL EVENT ROUTES ARE PROTECTED ---
// This will apply the 'protect' middleware to all routes in this file
router.use(protect);

// POST /api/events
// Create a new event
router.post("/", createEvent);

// GET /api/events
// Get all events for the logged-in user
router.get("/", getMyEvents);

// PUT /api/events/:id
// Update a specific event (e.g., change status to SWAPPABLE)
router.put("/:id", updateEvent);

// DELETE /api/events/:id
// Delete a specific event
router.delete("/:id", deleteEvent);

export default router;
