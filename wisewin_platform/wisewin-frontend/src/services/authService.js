// Auth service — wraps the login and "get current user" API calls
import { api } from "./api";

export const authService = {
  // Sends email + password and gets back a token and user info
  async login(payload) {
    const { data } = await api.post("/auth/login", payload);
    return data;
  },

  // Fetches the logged-in user's profile using the stored token
  async getMe() {
    const { data } = await api.get("/auth/me");
    return data;
  },
};
