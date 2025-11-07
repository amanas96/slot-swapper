import { UserDocument } from "../../models/userModel";

declare global {
  namespace Express {
    export interface Request {
      user?: UserDocument;
    }
  }
}

export {}; // This makes it a module
