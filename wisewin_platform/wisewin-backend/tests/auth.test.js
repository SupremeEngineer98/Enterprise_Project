import request from "supertest";

let app;
let createTestUser;

describe("Auth API", () => {
  beforeAll(async () => {
    const importedApp = await import("../src/app.js");
    app = importedApp.default;

    const testData = await import("./helpers/testData.js");
    createTestUser = testData.createTestUser;
  });

  test("POST /api/auth/login should fail when email or password is missing", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: "test@test.com" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Email and password are required");
  });

  test("POST /api/auth/login should fail with invalid credentials", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: "notfound@test.com",
        password: "wrong",
      });

    expect(response.status).toBe(401);
  });

  test("POST /api/auth/login should return token and user with valid credentials", async () => {
    const testUser = createTestUser();

    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
    expect(response.body.user.email).toBe(testUser.email);
  });

  test("GET /api/auth/me should return current user when token is valid", async () => {
    const testUser = createTestUser();

    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    const token = loginResponse.body.token;

    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.email).toBe(testUser.email);
  });

  test("GET /api/auth/me should fail without token", async () => {
    const response = await request(app).get("/api/auth/me");

    expect(response.status).toBe(401);
  });
});