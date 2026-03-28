import { api } from "./api";

export const questionService = {
  async getQuizQuestions(quizId) {
    const { data } = await api.get(`/questions/quizzes/${quizId}`);
    return data;
  },

  async createQuestion(quizId, payload) {
    const { data } = await api.post(`/questions/quizzes/${quizId}`, payload);
    return data;
  },
};