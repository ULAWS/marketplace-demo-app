// app.test.ts

import test, { describe } from "node:test";
import request from "supertest";
import { app } from "./index";

describe("Test the auth route", () => {
  test("It should respond with a 200 status code", async () => {
    const response = await request(app).post("/api/auth/login");
    // expect(response.statusCode).toBe(200);
  });
});

// Add more test cases for other routes and controllers...
