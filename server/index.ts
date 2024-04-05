// server.ts

import express, { Application } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { authRouter } from "./routes/auth";
import { imagesRouter, productRouter } from "./routes/product";
import { authenticateUser } from "./middleware/authMiddleware";

export const app: Application = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.use("/api/auth", authRouter);
app.use("/api/products", authenticateUser, productRouter);
app.use("/api/images", imagesRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("here", err.stack);
  res.status(500).send({ error: err.message });
});

app.get("/", (req, res) => {
  res.send("OK");
});

// Start the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
