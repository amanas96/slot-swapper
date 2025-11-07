import { Router } from "express";
import {
  getSwappableSlots,
  createSwapRequest,
  respondToSwapRequest,
  getMyRequests,
} from "../controllers/swapController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

// ALL swap routes are protected
router.use(protect);

// GET /api/swap/swappable-slots
// Get all slots available for swapping
router.get("/swappable-slots", getSwappableSlots);

// POST /api/swap/request
// Create a new swap request
router.post("/request", createSwapRequest);

// POST /api/swap/response/:requestId
// Respond (accept/reject) to an incoming swap request
router.post("/response/:requestId", respondToSwapRequest);

router.get("/my-requests", getMyRequests);

export default router;
