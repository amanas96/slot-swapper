import mongoose, { Document, Schema, model, models, Model } from "mongoose";
import bcrypt from "bcryptjs";

// --- INTERFACES ---

export interface IUser {
  name: string;
  email: string;
  password?: string;
}

export interface UserDocument extends IUser, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

// --- SCHEMA DEFINITION ---

const userSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // Hide password by default
    },
  },
  { timestamps: true }
);

// --- PRE-SAVE HOOK ---
userSchema.pre<UserDocument>("save", async function (next) {
  if (!this.isModified("password")) return next();

  if (this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  next();
});

// --- SCHEMA METHOD ---
userSchema.methods.comparePassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

// --- MODEL EXPORT ---
export default (models.User as Model<UserDocument>) ||
  model<UserDocument>("User", userSchema);
