import { getAuth } from "@clerk/express";
import type { NextFunction, Request, Response } from "express";

/** JSON 401 for API routes — avoids Clerk requireAuth() redirecting browsers to `/`. */
export function requireApiAuth(req: Request, res: Response, next: NextFunction) {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}
