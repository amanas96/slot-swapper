import mongoose, { Document, Schema, model, models } from "mongoose";
import { UserDocument } from "./userModel";
import { EventDocument } from "./eventModel";

export type SwapStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export interface ISwapRequest {
  status: SwapStatus;
  requester: mongoose.Types.ObjectId | UserDocument;
  requesterSlot: mongoose.Types.ObjectId | EventDocument;
  recipient: mongoose.Types.ObjectId | UserDocument;
  recipientSlot: mongoose.Types.ObjectId | EventDocument;
}

export interface SwapRequestDocument extends ISwapRequest, Document {
  createdAt: Date;
  updatedAt: Date;
}

const swapRequestSchema = new Schema<SwapRequestDocument>(
  {
    status: {
      type: String,
      required: true,
      enum: ["PENDING", "ACCEPTED", "REJECTED"],
      default: "PENDING",
    },
    requester: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requesterSlot: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipientSlot: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
  },
  { timestamps: true }
);

const SwapRequest =
  models.SwapRequest ||
  model<SwapRequestDocument>("SwapRequest", swapRequestSchema);
export default SwapRequest;
