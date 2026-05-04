// Auth context — manages the logged-in user and token across the entire app.
// Wrap your app in <AuthProvider> and then call useAuth() in any component to access user data.
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "../services/authService";
import { storage } from "../utils/storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(storage.getUser());
  const [token, setToken] = useState(storage.getToken());
  const [loading, setLoading] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true); // true while we check if a saved session is still valid

  // Keep localStorage in sync whenever the token or user changes
  useEffect(() => {
    if (token) storage.setToken(token);
    else storage.removeToken();
  }, [token]);

  useEffect(() => {
    if (user) storage.setUser(user);
    else storage.removeUser();
  }, [user]);

  // On first load, check if there's a saved token and verify it's still valid with the server
  useEffect(() => {
    async function bootstrapAuth() {
      const savedToken = storage.getToken();

      if (!savedToken) {
        setBootstrapping(false);
        return;
      }

      try {
        const me = await authService.getMe();
        setUser(me);
        setToken(savedToken);
      } catch {
        // Token is expired or invalid — clear everything and force a new login
        storage.clear();
        setUser(null);
        setToken(null);
      } finally {
        setBootstrapping(false);
      }
    }

    bootstrapAuth();
  }, []);

  // Logs the user in, saves the token, and fetches their full profile
  const login = async ({ email, password }) => {
    setLoading(true);
    try {
      const loginResponse = await authService.login({ email, password });
      setToken(loginResponse.token);
      storage.setToken(loginResponse.token);
      const me = await authService.getMe();
      setUser(me);
      return me;
    } finally {
      setLoading(false);
    }
  };

  // Clears all session data — the router will redirect to /login automatically
  const logout = () => {
    storage.clear();
    setUser(null);
    setToken(null);
  };

  // useMemo prevents unnecessary re-renders — context value only changes when state actually changes
  const value = useMemo(
    () => ({ user, token, loading, bootstrapping, isAuthenticated: Boolean(token && user), login, logout }),
    [user, token, loading, bootstrapping]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook — use this instead of importing AuthContext directly
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
