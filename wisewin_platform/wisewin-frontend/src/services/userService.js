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
  async getUserById(userId) {
    const { data } = await api.get(`/users/${userId}`);
    return data;
  },
  async getUserAttempts(userId) {
    const { data } = await api.get(`/users/${userId}/attempts`);
    return data;
  },
};