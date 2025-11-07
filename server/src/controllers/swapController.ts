import { Request, Response } from "express";
import mongoose from "mongoose";
import Event, { EventDocument } from "../models/eventModel";
import SwapRequest, { SwapRequestDocument } from "../models/swapRequest";

// --- 1. GET ALL SWAPPABLE SLOTS (Marketplace) ---
export const getSwappableSlots = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    console.log("\n--- getSwappableSlots API CALLED ---");
    console.log("Logged in User (User B):", req.user._id);

    const EventModel = Event as mongoose.Model<EventDocument>;

    const swappableSlots = await EventModel.find({
      status: "SWAPPABLE",
      owner: { $ne: req.user._id },
    })
      .populate("owner", "name email")
      .sort({ startTime: "asc" });

    console.log("Slots being sent to frontend:", swappableSlots);
    console.log("--------------------------------------\n");

    res.status(200).json(swappableSlots);
  } catch (error: any) {
    res.status(500).json({
      message: "Server error fetching swappable slots",
      error: error.message,
    });
  }
};

// --- 2. CREATE A NEW SWAP REQUEST ---
export const createSwapRequest = async (req: Request, res: Response) => {
  const { mySlotId, theirSlotId } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user) throw new Error("Unauthorized");

    const EventModel = Event as mongoose.Model<EventDocument>;
    const SwapModel = SwapRequest as mongoose.Model<SwapRequestDocument>;

    const mySlot = await EventModel.findById(mySlotId).session(session);
    const theirSlot = await EventModel.findById(theirSlotId).session(session);

    console.log("\n--- createSwapRequest API CALLED ---");
    if (!mySlot || !theirSlot) throw new Error("One or both slots not found.");

    if (mySlot.owner.toString() !== req.user._id.toString())
      throw new Error("You are not the owner of the slot you are offering.");
    if (theirSlot.owner.toString() === req.user._id.toString())
      throw new Error("You cannot swap with yourself.");
    if (mySlot.status !== "SWAPPABLE" || theirSlot.status !== "SWAPPABLE")
      throw new Error("Both slots must be marked as SWAPPABLE.");

    // --- Create Swap Request ---
    const swapRequest = await SwapModel.create(
      [
        {
          requester: req.user._id,
          requesterSlot: mySlot._id,
          recipient: theirSlot.owner,
          recipientSlot: theirSlot._id,
          status: "PENDING",
        },
      ],
      { session }
    );

    // Update both slots to SWAP_PENDING
    mySlot.status = "SWAP_PENDING";
    theirSlot.status = "SWAP_PENDING";

    await mySlot.save({ session });
    await theirSlot.save({ session });

    await session.commitTransaction();
    console.log("✅ New swap request saved:", swapRequest[0]);
    res.status(201).json(swapRequest[0]);
  } catch (error: any) {
    await session.abortTransaction();
    console.error("--- createSwapRequest Error ---", error);
    res
      .status(400)
      .json({ message: "Swap request failed", error: error.message });
  } finally {
    session.endSession();
  }
};

// --- 3. RESPOND TO A SWAP REQUEST ---
export const respondToSwapRequest = async (req: Request, res: Response) => {
  const { requestId } = req.params;
  const { acceptance } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!req.user) throw new Error("Unauthorized");

    const SwapModel = SwapRequest as mongoose.Model<SwapRequestDocument>;
    const EventModel = Event as mongoose.Model<EventDocument>;

    const swapRequest = await SwapModel.findById(requestId).session(session);
    if (!swapRequest) throw new Error("Swap request not found.");
    if (swapRequest.recipient.toString() !== req.user._id.toString())
      throw new Error("You are not authorized to respond to this request.");
    if (swapRequest.status !== "PENDING")
      throw new Error("This swap request has already been handled.");

    const requesterSlot = await EventModel.findById(
      swapRequest.requesterSlot
    ).session(session);

    const recipientSlot = await EventModel.findById(
      swapRequest.recipientSlot
    ).session(session);

    if (!requesterSlot || !recipientSlot)
      throw new Error("One or both events no longer exist.");

    // --- ACCEPTED ---
    if (acceptance === true) {
      swapRequest.status = "ACCEPTED";

      const tempOwner = requesterSlot.owner;
      requesterSlot.owner = recipientSlot.owner;
      recipientSlot.owner = tempOwner;

      requesterSlot.status = "BUSY";
      recipientSlot.status = "BUSY";
    } else {
      // --- REJECTED ---
      swapRequest.status = "REJECTED";
      requesterSlot.status = "SWAPPABLE";
      recipientSlot.status = "SWAPPABLE";
    }

    await swapRequest.save({ session });
    await requesterSlot.save({ session });
    await recipientSlot.save({ session });

    await session.commitTransaction();
    res.status(200).json(swapRequest);
  } catch (error: any) {
    await session.abortTransaction();
    res
      .status(400)
      .json({ message: "Swap response failed", error: error.message });
  } finally {
    session.endSession();
  }
};

// --- 4. GET MY INCOMING & OUTGOING REQUESTS ---
export const getMyRequests = async (req: Request, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const userId = req.user._id;
    const SwapModel = SwapRequest as mongoose.Model<SwapRequestDocument>;

    const incomingRequests = await SwapModel.find({
      recipient: userId,
      status: "PENDING",
    })
      .populate("requester", "name email")
      .populate("requesterSlot")
      .populate("recipientSlot");

    const outgoingRequests = await SwapModel.find({
      requester: userId,
      status: "PENDING",
    })
      .populate("recipient", "name email")
      .populate("requesterSlot")
      .populate("recipientSlot");

    res.status(200).json({ incomingRequests, outgoingRequests });
  } catch (error: any) {
    res.status(500).json({
      message: "Server error fetching requests",
      error: error.message,
    });
  }
};
