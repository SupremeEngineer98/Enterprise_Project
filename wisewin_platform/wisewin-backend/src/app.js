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

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: false,
  })
);

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "WiseWin backend is running" });
});

app.use("/api/auth", authRoutes);

app.use(errorHandler);

app.use("/api/companies", companyRoutes);
app.use("/api/users", userRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/attempts", attemptRoutes);
app.use("/api/questions", questionRoutes);

export default app;