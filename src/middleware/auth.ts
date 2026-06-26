/**
 * Auth middleware - validates session token from Authorization header.
 * Attaches user info to req for downstream handlers.
 */

import { Request, Response, NextFunction } from "express";
import { validateSession } from "../services/auth";

// Extend Express Request to include user info
declare module "express-serve-static-core" {
  interface Request {
    userId?: string;
    userPhone?: string;
  }
}

/**
 * Requires a valid session token.
 * Token format: Bearer <token>
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const token = authHeader.substring(7);
  const session = await validateSession(token);

  if (!session) {
    res.status(401).json({ error: "Invalid or expired session" });
    return;
  }

  req.userId = session.userId;
  req.userPhone = session.phone;
  next();
}

/**
 * Optional auth - attaches user info if token present, but doesn't require it.
 */
export async function optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const session = await validateSession(token);
    if (session) {
      req.userId = session.userId;
      req.userPhone = session.phone;
    }
  }
  next();
}
