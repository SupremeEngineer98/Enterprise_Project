// Smoke test — just checks that the server doesn't crash on an unknown route
import request from "supertest";
import app from "../src/app.js";

describe("WiseWin API smoke test", () => {
  test("should return 404 for unknown route", async () => {
    const response = await request(app).get("/api/unknown-route");
    expect(response.status).toBe(404);
  });
});
