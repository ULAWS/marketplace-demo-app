import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { pool } from "./product";

// Dummy user data for demonstration purposes
const users = [
  { id: 1, email: "user1@example.com", password: "linkby1" },
  { id: 2, email: "user2@example.com", password: "linkby2" },
  { id: 3, email: "user3@example.com", password: "linkby3" },
  { id: 4, email: "user4@example.com", password: "linkby4" },
];

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Check if user exists with the provided email
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (rows.length === 0) {
      res.status(401).json({ message: "Invalid email or password" });
    }

    const user = rows[0];

    const isPasswordValid = users.filter((us) => us.email === email)[0].password === password;
    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid email or password" });
    }
    // const token = jwt.sign({ id: user.id }, "your_secret_key", { expiresIn: "1h" });

    res.status(200).json({ id: user.id, email: user.email, username: user.username });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
