// User service — API calls for managing users and fetching company statistics
import { api } from "./api";

export const userService = {
  async getAllUsers() {
    const { data } = await api.get("/users");
    return data;
  },

  // Fetch all users that belong to a specific company
  async getCompanyUsers(companyId) {
    const { data } = await api.get(`/users/company/${companyId}`);
    return data;
  },

  async createUser(payload) {
    const { data } = await api.post("/users", payload);
    return data;
  },

  async updateUser(userId, payload) {
    const { data } = await api.put(`/users/${userId}`, payload);
    return data;
  },

  async deleteUser(userId) {
    const { data } = await api.delete(`/users/${userId}`);
    return data;
  },

  async changePassword(userId, payload) {
    const { data } = await api.put(`/users/${userId}/password`, payload);
    return data;
  },

  // Returns total, pending, and completed assignment counts for a company's dashboard
  async getCompanyAssignmentStats(companyId) {
    const { data } = await api.get(`/users/company/${companyId}/stats`);
    return data;
  },

  // Returns per-user completion and score data — used for the company leaderboard
  async getUserComparison(companyId) {
    const { data } = await api.get(`/users/company/${companyId}/comparison`);
    return data;
  },
};
