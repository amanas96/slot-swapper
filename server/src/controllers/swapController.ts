import { Request, Response } from "express";
import Event from "../models/eventModel";
import SwapRequest from "../models/swapRequest";
import mongoose from "mongoose";

// --- 1. GET ALL SWAPPABLE SLOTS (Marketplace) ---
export const getSwappableSlots = async (req: Request, res: Response) => {
  try {
    console.log("\n--- getSwappableSlots API CALLED ---");
    console.log("Logged in User (User B):", req.user!._id);
    const allSwappable = await Event.find({ status: "SWAPPABLE" });
    console.log("All swappable slots found in DB:", allSwappable);

    const swappableSlots = await Event.find({
      status: "SWAPPABLE",
      owner: { $ne: req.user!._id }, // $ne = Not Equal
    })
      .populate("owner", "name email") // Populate owner's name and email
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

  // Start a Mongoose session for a transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Find both events within the transaction
    const mySlot = await Event.findById(mySlotId).session(session);
    const theirSlot = await Event.findById(theirSlotId).session(session);

    ///////////////////////////////
    console.log("\n--- 1. createSwapRequest API CALLED ---");
    if (!mySlot) console.log("!!! ERROR: Your slot (mySlot) was not found!");
    if (!theirSlot)
      console.log("!!! ERROR: Their slot (theirSlot) was not found!");

    console.log("Your Slot Owner:", mySlot.owner.toString());
    console.log("Logged in User:", req.user!._id.toString());
    console.log("Their Slot Owner:", theirSlot.owner.toString());

    // 2. --- VALIDATION ---
    if (!mySlot || !theirSlot) {
      throw new Error("One or both slots not found.");
    }
    if (mySlot.owner.toString() !== req.user!._id.toString()) {
      throw new Error("You are not the owner of the slot you are offering.");
    }
    if (theirSlot.owner.toString() === req.user!._id.toString()) {
      throw new Error("You cannot swap with yourself.");
    }
    if (mySlot.status !== "SWAPPABLE" || theirSlot.status !== "SWAPPABLE") {
      throw new Error(
        "Both slots must be marked as SWAPPABLE to request a swap."
      );
    }

    // 3. --- EXECUTION ---
    // Create the SwapRequest
    const swapRequest = new SwapRequest({
      requester: req.user!._id,
      requesterSlot: mySlot._id,
      recipient: theirSlot.owner,
      recipientSlot: theirSlot._id,
      status: "PENDING",
    });

    await swapRequest.save({ session });

    // Update both slots to 'SWAP_PENDING'
    mySlot.status = "SWAP_PENDING";
    theirSlot.status = "SWAP_PENDING";

    await mySlot.save({ session });
    await theirSlot.save({ session });

    // 4. Commit the transaction
    await session.commitTransaction();
    console.log("Saving this new request:", swapRequest);
    res.status(201).json(swapRequest);
  } catch (error: any) {
    console.log("--- 2. ERROR: createSwapRequest CRASHED! ---", error);
    // If anything fails, abort the transaction
    await session.abortTransaction();
    res
      .status(400)
      .json({ message: "Swap request failed.", error: error.message });
  } finally {
    // End the session
    session.endSession();
  }
};

// --- 3. RESPOND TO A SWAP REQUEST ---
export const respondToSwapRequest = async (req: Request, res: Response) => {
  const { requestId } = req.params;
  const { acceptance } = req.body; // true or false

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Find the SwapRequest
    const swapRequest = await SwapRequest.findById(requestId).session(session);

    // 2. --- VALIDATION ---
    if (!swapRequest) {
      throw new Error("Swap request not found.");
    }
    if (swapRequest.recipient.toString() !== req.user!._id.toString()) {
      throw new Error("You are not authorized to respond to this request.");
    }
    if (swapRequest.status !== "PENDING") {
      throw new Error("This swap request has already been responded to.");
    }

    // 3. Find the two slots involved
    const requesterSlot = await Event.findById(
      swapRequest.requesterSlot
    ).session(session);
    const recipientSlot = await Event.findById(
      swapRequest.recipientSlot
    ).session(session); // This is "my" slot

    if (!requesterSlot || !recipientSlot) {
      throw new Error(
        "One or both events involved in the swap no longer exist."
      );
    }

    // 4. --- EXECUTION ---
    if (acceptance === true) {
      // --- IF ACCEPTED ---
      // 4a. Update SwapRequest status
      swapRequest.status = "ACCEPTED";

      // 4b. **THE SWAP**: Exchange the owners
      const originalRequesterOwner = requesterSlot.owner;
      requesterSlot.owner = recipientSlot.owner;
      recipientSlot.owner = originalRequesterOwner;

      requesterSlot.status = "BUSY";
      recipientSlot.status = "BUSY";
    } else {
      // --- IF REJECTED ---
      // 4a. Update SwapRequest status
      swapRequest.status = "REJECTED";

      // 4b. Set both slots' status back to 'SWAPPABLE'
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
      .json({ message: "Swap response failed.", error: error.message });
  } finally {
    session.endSession();
  }
};

// --- 4. GET MY INCOMING & OUTGOING REQUESTS ---
export const getMyRequests = async (req: Request, res: Response) => {
  try {
    const userId = req.user!._id;
    console.log("\n--- getMyRequests API CALLED ---");
    console.log("User asking for requests:", userId);

    // Find requests sent TO me that are still pending
    const incomingRequests = await SwapRequest.find({
      recipient: userId,
      status: "PENDING",
    })
      .populate("requester", "name email") // Show who sent it
      .populate("requesterSlot") // Show what slot they are offering
      .populate("recipientSlot"); // Show which of my slots they want

    // Find requests sent BY me that are still pending
    const outgoingRequests = await SwapRequest.find({
      requester: userId,
      status: "PENDING",
    })
      .populate("recipient", "name email") // Show who I sent it to
      .populate("requesterSlot")
      .populate("recipientSlot");
    console.log("Found outgoing requests:", outgoingRequests);
    console.log("--------------------------------------\n");

    res.status(200).json({ incomingRequests, outgoingRequests });
  } catch (error: any) {
    res.status(500).json({
      message: "Server error fetching requests",
      error: error.message,
    });
  }
};
