import { api } from "./api";

export const userService = {
  async getAllUsers() {
    const { data } = await api.get("/users");
    return data;
  },
  async getCompanyUsers(companyId) {
    const { data } = await api.get(`/users/company/${companyId}`);
    return data;
  },
  /* async getUserAttempts(userId) {
    const { data } = await api.get(`/users/${userId}/attempts`);
    return data;
  }, */
  async createUser(payload) {
    const { data } = await api.post("/users", payload);
    return data;
  },
  async changePassword(userId, payload) {
    const { data } = await api.put(`/users/${userId}/password`, payload);
    return data;
  },
  async getCompanyAssignmentStats(companyId) {
    const { data } = await api.get(`/users/company/${companyId}/stats`);
    return data;
  },
};