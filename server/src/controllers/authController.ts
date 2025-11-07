import { Request, Response } from "express";
import User, { UserDocument } from "../models/userModel";
import jwt from "jsonwebtoken";
import { IUser } from "../models/userModel"; // Import the base interface

// Helper function to sign JWT
const signToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: "90d", // 90-day expiry
  });
};

// --- SIGNUP CONTROLLER ---
export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body as IUser;

    // 1. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User already exists with this email." });
    }

    // 2. Create new user (password will be hashed by pre-save hook)
    const newUser = await User.create({
      name,
      email,
      password,
    });

    // 3. Generate token
    const token = signToken(newUser._id);

    // 4. Send response (don't send password back)
    res.status(201).json({
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Server error during sign up.", error: error.message });
  }
};

// --- LOGIN CONTROLLER ---
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 1. Check if email and password are provided
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password." });
    }

    // 2. Find user and explicitly select password (since it's hidden by default)
    const user = await User.findOne({ email }).select("+password");

    // 3. Check if user exists and password is correct
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Incorrect email or password." });
    }

    // 4. Generate token
    const token = signToken(user._id);

    // 5. Send response
    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Server error during login.", error: error.message });
  }
};
