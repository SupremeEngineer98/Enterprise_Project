import { api } from "./api";

export const quizService = {
  async getVisibleQuizzes() {
    const { data } = await api.get("/quizzes");
    return data;
  },

  async getMyAssignments() {
    const { data } = await api.get("/assignments/me");
    return data;
  },

  async assignQuiz(quizId, payload) {
    const { data } = await api.post(`/assignments/quizzes/${quizId}`, payload);
    return data;
  },

  async startAttempt(assignmentId) {
    const { data } = await api.post(`/attempts/assignments/${assignmentId}/start`);
    return data;
  },

  async getAttempt(attemptId) {
    const { data } = await api.get(`/attempts/${attemptId}`);
    return data;
  },

  async submitAnswer(attemptId, payload) {
    const { data } = await api.post(`/attempts/${attemptId}/answers`, payload);
    return data;
  },

  async submitAttempt(attemptId, payload) {
    const { data } = await api.post(`/attempts/${attemptId}/submit`, payload);
    return data;
  },

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
};