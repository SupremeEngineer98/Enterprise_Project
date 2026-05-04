// Company service — API calls for managing companies (admin only)
import { api } from "./api";

export const companyService = {
  async getAllCompanies() {
    const { data } = await api.get("/companies");
    return data;
  },

  // Returns the company details including its users and quizzes
  async getCompanyDetails(companyId) {
    const { data } = await api.get(`/companies/${companyId}`);
    return data;
  },

  async createCompany(payload) {
    const { data } = await api.post("/companies", payload);
    return data;
  },

  async updateCompany(companyId, payload) {
    const { data } = await api.put(`/companies/${companyId}`, payload);
    return data;
  },

  // Deletes a company and everything linked to it (users, quizzes, attempts)
  async deleteCompany(companyId) {
    const { data } = await api.delete(`/companies/${companyId}`);
    return data;
  },
};
