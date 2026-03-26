import { api } from "./api";

export const quizService = {
  async getAssignedQuizzes(userId) {
    const { data } = await api.post(`/quiz/assigned/${userId}`);
    return data;
  },
  async assignQuiz(quizId, payload) {
    const { data } = await api.post(`/quiz/assign/${quizId}`, payload);
    return data;
  },
  async startAttempt(assignmentId) {
    const { data } = await api.post(`/assignments/${assignmentId}/attempts`);
    return data;
  },
  async getAttempt(attemptId) {
    const { data } = await api.get(`/attempts/${attemptId}`);
    return data;
  },
  async submitAttempt(attemptId) {
    const { data } = await api.post(`/attempts/${attemptId}/submit`);
    return data;
  },
  async submitAnswer(attemptId, payload) {
    const { data } = await api.post(`/attempts/${attemptId}/answers`, payload);
    return data;
  },
  async getAttemptAnswers(attemptId) {
    const { data } = await api.get(`/attempts/${attemptId}/answers`);
    return data;
  },
};