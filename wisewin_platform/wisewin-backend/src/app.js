/**
 * @api {config} /app Application Configuration
 * @apiName AppSetup
 * @apiGroup App
 * @apiVersion 1.0.0
 *
 * @apiDescription
 * Main Express application setup for the WiseWin backend.
 * Configures middleware (CORS, JSON parsing),
 * registers all route modules, and applies global error handling.
 */
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";
import companyRoutes from "./routes/company.routes.js";
import userRoutes from "./routes/user.routes.js";
import quizRoutes from "./routes/quiz.routes.js";
import assignmentRoutes from "./routes/assignment.routes.js";
import attemptRoutes from "./routes/attempt.routes.js";
import questionRoutes from "./routes/question.routes.js";

const app = express();
/**
 * @api {middleware} /cors CORS Configuration
 * @apiName CORSSetup
 * @apiGroup Middleware
 * @apiVersion 1.0.0
 *
 * @apiDescription
 * Allows cross-origin requests only from the frontend
 * development server at http://localhost:5173.
 *
 * @apiParam {String} origin Allowed origin: `http://localhost:5173`
 * @apiParam {Boolean} credentials Credentials not included (`false`).
 */

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: false,
  })
);

/**
 * @api {middleware} /json JSON Body Parser
 * @apiName JSONParser
 * @apiGroup Middleware
 * @apiVersion 1.0.0
 *
 * @apiDescription
 * Parses incoming requests with JSON payloads,
 * making data available on `req.body`.
 */
app.use(express.json());

/**
 * @api {get} /api/health Health Check
 * @apiName HealthCheck
 * @apiGroup Server
 * @apiVersion 1.0.0
 *
 * @apiDescription
 * Simple endpoint to verify the backend server is running.
 *
 * @apiSuccess {String} message Confirmation that the backend is running.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "message": "WiseWin backend is running"
 *     }
 */
app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "WiseWin backend is running" });
});

/**
 * @api {use} /api/auth Authentication Routes
 * @apiName AuthRoutes
 * @apiGroup Routes
 * @apiVersion 1.0.0
 * @apiDescription Handles login, registration, and token management.
 */
app.use("/api/auth", authRoutes);


/**
 * @api {middleware} /errorHandler Global Error Handler
 * @apiName ErrorHandler
 * @apiGroup Middleware
 * @apiVersion 1.0.0
 * @apiDescription Centralized error handling middleware for the application.
 */
app.use(errorHandler);

/**
 * @api {use} /api/companies Company Routes
 * @apiName CompanyRoutes
 * @apiGroup Routes
 * @apiVersion 1.0.0
 * @apiDescription Handles company management operations.
 */
app.use("/api/companies", companyRoutes);
/**
 * @api {use} /api/users User Routes
 * @apiName UserRoutes
 * @apiGroup Routes
 * @apiVersion 1.0.0
 * @apiDescription Handles user management operations.
 */
app.use("/api/users", userRoutes);
/**
 * @api {use} /api/quizzes Quiz Routes
 * @apiName QuizRoutes
 * @apiGroup Routes
 * @apiVersion 1.0.0
 * @apiDescription Handles quiz creation and retrieval.
 */
app.use("/api/quizzes", quizRoutes);
/**
 * @api {use} /api/assignments Assignment Routes
 * @apiName AssignmentRoutes
 * @apiGroup Routes
 * @apiVersion 1.0.0
 * @apiDescription Handles quiz assignment to users.
 */
app.use("/api/assignments", assignmentRoutes);
/**
 * @api {use} /api/attempts Attempt Routes
 * @apiName AttemptRoutes
 * @apiGroup Routes
 * @apiVersion 1.0.0
 * @apiDescription Handles quiz attempt tracking and submission.
 */
app.use("/api/attempts", attemptRoutes);
/**
 * @api {use} /api/questions Question Routes
 * @apiName QuestionRoutes
 * @apiGroup Routes
 * @apiVersion 1.0.0
 * @apiDescription Handles question management for quizzes.
 */
app.use("/api/questions", questionRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});

export default app;