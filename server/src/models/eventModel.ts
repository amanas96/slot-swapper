import mongoose, { Document, Schema, model, models } from "mongoose";
import { UserDocument } from "./userModel";

export type EventStatus = "BUSY" | "SWAPPABLE" | "SWAP_PENDING";

export interface IEvent {
  title: string;
  startTime: Date;
  endTime: Date;
  status: EventStatus;
  owner: mongoose.Types.ObjectId | UserDocument; // Can be populated
}

export interface EventDocument extends IEvent, Document {
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<EventDocument>(
  {
    title: {
      type: String,
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["BUSY", "SWAPPABLE", "SWAP_PENDING"],
      default: "BUSY",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Event = models.Event || model<EventDocument>("Event", eventSchema);
export default Event;
