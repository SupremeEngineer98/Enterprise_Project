// Quiz service — all quiz, question, assignment and attempt API calls in one place
import { api } from "./api";

export const quizService = {
  // Fetch the list of quizzes the logged-in user is allowed to see
  async getVisibleQuizzes() {
    const { data } = await api.get("/quizzes");
    return data;
  },

  // Get all assignments for the currently logged-in user
  async getMyAssignments() {
    const { data } = await api.get("/assignments/me");
    return data;
  },

  // User assigns themselves to a quiz
  async selfAssign(quizId) {
    const { data } = await api.post(`/assignments/quizzes/${quizId}/self`);
    return data;
  },

  // Admin/super user assigns a quiz to a specific user
  async assignQuiz(quizId, payload) {
    const { data } = await api.post(`/assignments/quizzes/${quizId}`, payload);
    return data;
  },

  // Start (or resume) an attempt for a given assignment
  async startAttempt(assignmentId) {
    const { data } = await api.post(`/attempts/assignments/${assignmentId}/start`);
    return data;
  },

  // Get the current state of an attempt (next question, score, etc.)
  async getAttempt(attemptId) {
    const { data } = await api.get(`/attempts/${attemptId}`);
    return data;
  },

  // Submit the user's answer to a single question
  async submitAnswer(attemptId, payload) {
    const { data } = await api.post(`/attempts/${attemptId}/answers`, payload);
    return data;
  },

  // Finalise the attempt once all questions are answered
  async submitAttempt(attemptId, payload) {
    const { data } = await api.post(`/attempts/${attemptId}/submit`, payload);
    return data;
  },

  // Fetch the full history of all attempts for a given assignment
  async getAssignmentAttemptHistory(assignmentId) {
    const { data } = await api.get(`/attempts/assignments/${assignmentId}/history`);
    return data;
  },

  async createQuiz(payload) {
    const { data } = await api.post("/quizzes", payload);
    return data;
  },

  async updateQuiz(quizId, payload) {
    const { data } = await api.put(`/quizzes/${quizId}`, payload);
    return data;
  },

  async deleteQuiz(quizId) {
    const { data } = await api.delete(`/quizzes/${quizId}`);
    return data;
  },

  async getQuizQuestions(quizId) {
    const { data } = await api.get(`/quizzes/${quizId}/questions`);
    return data;
  },

  async updateQuestion(quizId, questionId, payload) {
    const { data } = await api.put(`/quizzes/${quizId}/questions/${questionId}`, payload);
    return data;
  },

  async deleteQuestion(quizId, questionId) {
    const { data } = await api.delete(`/quizzes/${quizId}/questions/${questionId}`);
    return data;
  },

  // Get all assignments that are still pending for a given user (used by admins)
  async getUserPendingAssignments(userId) {
    const { data } = await api.get(`/assignments/user/${userId}/pending`);
    return data;
  },
};
