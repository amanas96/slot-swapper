import mongoose from "mongoose";

const connectDB = async () => {
  try {
    // process.env.MONGO_URI is guaranteed to be a string
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("MongoDB Connected...");
  } catch (err: any) {
    console.error(err.message);
    // Exit process with failure
    process.exit(1);
  }
};

export default connectDB;
