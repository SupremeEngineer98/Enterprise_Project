import { api } from "./api";

export const companyService = {
  async getAllCompanies() {
    const { data } = await api.get("/companies");
    return data;
  },
};