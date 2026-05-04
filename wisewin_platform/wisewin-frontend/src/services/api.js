// Central axios instance for all API calls in the frontend.
// Every service file imports from here so we only configure the base URL and headers once.
import axios from "axios";
import { storage } from "../utils/storage";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Before every request, attach the JWT token from localStorage if one exists
api.interceptors.request.use((config) => {
  const token = storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the server replies with 401 (token expired or invalid), clear the stored session
// so the user is effectively logged out
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      storage.clear();
    }
    return Promise.reject(error);
  }
);
