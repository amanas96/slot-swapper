import { Request, Response } from "express";
import Event from "../models/eventModel";
import { UserDocument } from "../models/userModel";

// --- CREATE EVENT ---
export const createEvent = async (req: Request, res: Response) => {
  try {
    const { title, startTime, endTime } = req.body;

    // Use the '!' operator to assert that req.user is not null or undefined
    // TypeScript now knows req.user is of type UserDocument
    const owner = req.user!._id;

    // ... (rest of the function)

    const newEvent = await Event.create({
      title,
      startTime,
      endTime,
      owner,
      status: "BUSY",
    });

    res.status(201).json(newEvent);
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Server error creating event", error: error.message });
  }
};

// --- GET MY EVENTS ---
export const getMyEvents = async (req: Request, res: Response) => {
  try {
    // Also use '!' here
    const events = await Event.find({ owner: req.user!._id }).sort({
      startTime: "asc",
    });

    res.status(200).json(events);
  } catch (error: any) {
    // ...
  }
};

// --- UPDATE EVENT ---
// ... inside server/src/controllers/events.controller.ts

// --- UPDATE EVENT (e.g., set to SWAPPABLE) ---
export const updateEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user!._id;

    console.log("\n--- updateEvent API CALLED ---");
    console.log("Event ID to update:", id);
    console.log("New status to set:", status);
    console.log("User trying to update:", userId);

    // --- THIS IS THE NEW, ATOMIC UPDATE ---
    const updatedEvent = await Event.findOneAndUpdate(
      { _id: id, owner: userId }, // 1. Find document by its ID AND make sure the owner is correct
      { $set: { status: status } }, // 2. Set the new status
      { new: true } // 3. Return the NEW, updated document
    );
    // --- END OF NEW LOGIC ---

    if (!updatedEvent) {
      console.log(
        "--- 3. BACKEND ERROR: Event not found or user is not owner. ---"
      );
      // This will fail if the event ID doesn't exist OR if the owner ID doesn't match
      return res
        .status(404)
        .json({ message: "Event not found or user not authorized" });
    }

    console.log("--- 3. BACKEND SUCCESS: Event updated! ---");
    res.status(200).json(updatedEvent);
  } catch (error: any) {
    console.log("--- 3. BACKEND CRASH ---", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// --- DELETE EVENT ---
export const deleteEvent = async (req: Request, res: Response) => {
  try {
    // ...
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // And finally here
    if (event.owner.toString() !== req.user!._id.toString()) {
      return res
        .status(401)
        .json({ message: "User not authorized to delete this event" });
    }

    // ... (rest of the function)
  } catch (error: any) {
    // ...
  }
};
