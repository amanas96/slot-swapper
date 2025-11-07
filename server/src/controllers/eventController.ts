import { Request, Response } from "express";
import mongoose from "mongoose";
import Event, { EventDocument } from "../models/eventModel";
import { UserDocument } from "../models/userModel";

// --- CREATE EVENT ---
export const createEvent = async (req: Request, res: Response) => {
  try {
    const { title, startTime, endTime } = req.body;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const owner = req.user._id;

    const newEvent = await (Event as mongoose.Model<EventDocument>).create({
      title,
      startTime,
      endTime,
      owner,
      status: "BUSY",
    });

    res.status(201).json(newEvent);
  } catch (error: any) {
    console.error("❌ Error creating event:", error);
    res
      .status(500)
      .json({ message: "Server error creating event", error: error.message });
  }
};

// --- GET MY EVENTS ---
export const getMyEvents = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const events = await (Event as mongoose.Model<EventDocument>)
      .find({ owner: req.user._id })
      .sort({ startTime: "asc" });

    res.status(200).json(events);
  } catch (error: any) {
    console.error("❌ Error fetching events:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// --- UPDATE EVENT STATUS (e.g., BUSY → SWAPPABLE) ---
export const updateEvent = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user._id;

    console.log("\n--- updateEvent API CALLED ---");
    console.log("Event ID to update:", id);
    console.log("New status to set:", status);
    console.log("User trying to update:", userId);

    const updatedEvent = await (
      Event as mongoose.Model<EventDocument>
    ).findOneAndUpdate(
      { _id: id, owner: userId },
      { $set: { status } },
      { new: true }
    );

    if (!updatedEvent) {
      console.log("--- Event not found or unauthorized update attempt ---");
      return res
        .status(404)
        .json({ message: "Event not found or user not authorized" });
    }

    console.log("--- ✅ Event updated successfully ---");
    res.status(200).json(updatedEvent);
  } catch (error: any) {
    console.error("--- ❌ updateEvent Error ---", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// --- DELETE EVENT ---
export const deleteEvent = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const event = await (Event as mongoose.Model<EventDocument>).findById(
      req.params.id
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    if (event.owner.toString() !== req.user._id.toString()) {
      return res
        .status(401)
        .json({ message: "User not authorized to delete this event" });
    }

    await event.deleteOne();

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error: any) {
    console.error("❌ Error deleting event:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
