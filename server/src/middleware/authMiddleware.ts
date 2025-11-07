import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User, { UserDocument } from "../models/userModel";

// Extend the Express Request interface to include a 'user' property
declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
    }
  }
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token: string | undefined;

  // 1. Check for token in Authorization header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
    };

    // 3. Find user by ID and attach to request
    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
      return res.status(401).json({ message: "User not found" });
    }

    // 4. Grant access
    req.user = currentUser;
    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};
