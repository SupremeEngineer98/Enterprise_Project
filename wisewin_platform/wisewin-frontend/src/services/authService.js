import { api } from "./api";

export const authService = {
  async login(payload) {
    const { data } = await api.post("/auth/login", payload);
    return data;
  },

  async getMe() {
    const { data } = await api.get("/auth/me");
    return data;
  },
};