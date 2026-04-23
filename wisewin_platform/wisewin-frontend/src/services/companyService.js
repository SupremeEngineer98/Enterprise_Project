import { api } from "./api";

export const companyService = {
  async getAllCompanies() {
    const { data } = await api.get("/companies");
    return data;
  },

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

  async deleteCompany(companyId) {
    const { data } = await api.delete(`/companies/${companyId}`);
    return data;
  },
};