import type { AdminRoleValue } from "../lib/jwt.js";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: AdminRoleValue;
      };
    }
  }
}

export {};
