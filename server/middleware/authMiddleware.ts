// authMiddleware.ts

import { Request, Response, NextFunction } from "express";

export const authenticateUser = (req: Request, res: Response, next: NextFunction): void => {
  // Check if Authorization header is present
  const token = req.headers.authorization;

  if (!token) {
    res.status(401).json({ message: "Authorization header missing" });
  } else {
    // In a real-world application, validate the token and authenticate the user
    // For simplicity, we're assuming all requests with token are authenticated
    next();
  }
};
