import request from "supertest";

let app;
let createTestUser;
let createTestQuizWithAssignment;

beforeAll(async () => {
  const importedApp = await import("../src/app.js");
  app = importedApp.default;

  const testData = await import("./helpers/testData.js");
  createTestUser = testData.createTestUser;
  createTestQuizWithAssignment = testData.createTestQuizWithAssignment;
});

async function login(testUser) {
  const response = await request(app)
    .post("/api/auth/login")
    .send({
      email: testUser.email,
      password: testUser.password,
    });

  expect(response.status).toBe(200);
  expect(response.body.token).toBeDefined();

  return response.body.token;
}

describe("Attempts API", () => {
  test("POST /api/attempts/assignments/:assignmentId/start should start an attempt", async () => {
    const testUser = createTestUser();
    const testQuiz = createTestQuizWithAssignment({
      userId: testUser.id,
    });

    const token = await login(testUser);

    const response = await request(app)
      .post(`/api/attempts/assignments/${testQuiz.assignmentId}/start`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.attemptId).toBeDefined();
    expect(response.body.assignmentId).toBe(testQuiz.assignmentId);
    expect(response.body.status).toBe("IN_PROGRESS");
  });

  test("GET /api/attempts/:attemptId should return next question with options", async () => {
    const testUser = createTestUser();
    const testQuiz = createTestQuizWithAssignment({
      userId: testUser.id,
    });

    const token = await login(testUser);

    const startResponse = await request(app)
      .post(`/api/attempts/assignments/${testQuiz.assignmentId}/start`)
      .set("Authorization", `Bearer ${token}`);

    const attemptId = startResponse.body.attemptId;

    const response = await request(app)
      .get(`/api/attempts/${attemptId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.attemptId).toBe(attemptId);
    expect(response.body.nextQuestion).toBeDefined();
    expect(response.body.nextQuestion.id).toBe(testQuiz.questionId);
    expect(response.body.nextQuestion.questionText).toBeDefined();

    expect(Array.isArray(response.body.nextQuestion.options)).toBe(true);
    expect(response.body.nextQuestion.options.length).toBe(2);

    expect(response.body.nextQuestion.options[0].id).toBeDefined();
    expect(response.body.nextQuestion.options[0].optionText).toBeDefined();
  });

  test("POST /api/attempts/:attemptId/answers should submit a correct answer", async () => {
    const testUser = createTestUser();
    const testQuiz = createTestQuizWithAssignment({
      userId: testUser.id,
    });

    const token = await login(testUser);

    const startResponse = await request(app)
      .post(`/api/attempts/assignments/${testQuiz.assignmentId}/start`)
      .set("Authorization", `Bearer ${token}`);

    const attemptId = startResponse.body.attemptId;

    const response = await request(app)
      .post(`/api/attempts/${attemptId}/answers`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        questionId: testQuiz.questionId,
        selectedOptionId: testQuiz.correctOptionId,
      });

    expect(response.status).toBe(200);
    expect(response.body.attemptId).toBe(attemptId);
    expect(response.body.currentScore).toBe(1);
    expect(response.body.answeredCount).toBe(1);
    expect(response.body.isCorrect).toBe(true);
  });

  test("POST /api/attempts/:attemptId/answers should submit a wrong answer", async () => {
    const testUser = createTestUser();
    const testQuiz = createTestQuizWithAssignment({
      userId: testUser.id,
    });

    const token = await login(testUser);

    const startResponse = await request(app)
      .post(`/api/attempts/assignments/${testQuiz.assignmentId}/start`)
      .set("Authorization", `Bearer ${token}`);

    const attemptId = startResponse.body.attemptId;

    const response = await request(app)
      .post(`/api/attempts/${attemptId}/answers`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        questionId: testQuiz.questionId,
        selectedOptionId: testQuiz.wrongOptionId,
      });

    expect(response.status).toBe(200);
    expect(response.body.attemptId).toBe(attemptId);
    expect(response.body.currentScore).toBe(0);
    expect(response.body.answeredCount).toBe(1);
    expect(response.body.isCorrect).toBe(false);
  });

  test("POST /api/attempts/:attemptId/answers should prevent duplicate answers", async () => {
    const testUser = createTestUser();
    const testQuiz = createTestQuizWithAssignment({
      userId: testUser.id,
    });

    const token = await login(testUser);

    const startResponse = await request(app)
      .post(`/api/attempts/assignments/${testQuiz.assignmentId}/start`)
      .set("Authorization", `Bearer ${token}`);

    const attemptId = startResponse.body.attemptId;

    const payload = {
      questionId: testQuiz.questionId,
      selectedOptionId: testQuiz.correctOptionId,
    };

    await request(app)
      .post(`/api/attempts/${attemptId}/answers`)
      .set("Authorization", `Bearer ${token}`)
      .send(payload);

    const duplicateResponse = await request(app)
      .post(`/api/attempts/${attemptId}/answers`)
      .set("Authorization", `Bearer ${token}`)
      .send(payload);

    expect(duplicateResponse.status).toBe(409);
    expect(duplicateResponse.body).toBeDefined();
  });

  test("POST /api/attempts/:attemptId/submit should complete attempt after all questions are answered", async () => {
    const testUser = createTestUser();
    const testQuiz = createTestQuizWithAssignment({
      userId: testUser.id,
    });

    const token = await login(testUser);

    const startResponse = await request(app)
      .post(`/api/attempts/assignments/${testQuiz.assignmentId}/start`)
      .set("Authorization", `Bearer ${token}`);

    const attemptId = startResponse.body.attemptId;

    await request(app)
      .post(`/api/attempts/${attemptId}/answers`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        questionId: testQuiz.questionId,
        selectedOptionId: testQuiz.correctOptionId,
      });

    const response = await request(app)
      .post(`/api/attempts/${attemptId}/submit`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        timeTaken: 30,
      });

    expect(response.status).toBe(200);
    expect(response.body.status).toBe("COMPLETED");
    expect(response.body.finalScore).toBe(1);
    expect(response.body.totalQuestions).toBe(1);
    expect(response.body.wrongAnswers).toBe(0);
    expect(response.body.passed).toBe(true);
  });

  test("GET /api/attempts/assignments/:assignmentId/history should return attempt history", async () => {
    const testUser = createTestUser();
    const testQuiz = createTestQuizWithAssignment({
      userId: testUser.id,
    });

    const token = await login(testUser);

    const startResponse = await request(app)
      .post(`/api/attempts/assignments/${testQuiz.assignmentId}/start`)
      .set("Authorization", `Bearer ${token}`);

    const attemptId = startResponse.body.attemptId;

    const response = await request(app)
      .get(`/api/attempts/assignments/${testQuiz.assignmentId}/history`)
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].attemptId).toBe(attemptId);
    expect(response.body[0].status).toBe("IN_PROGRESS");
    expect(response.body[0].totalQuestions).toBe(1);
  });
});