// routes/auth.ts

import express, { Router } from "express";
import { login } from "../controllers/auth";

export const authRouter: Router = express.Router();

// Login route
authRouter.post("/login", login);
