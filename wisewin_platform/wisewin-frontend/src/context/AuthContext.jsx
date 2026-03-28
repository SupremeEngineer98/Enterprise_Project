import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "../services/authService";
import { storage } from "../utils/storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(storage.getUser());
  const [token, setToken] = useState(storage.getToken());
  const [loading, setLoading] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    if (token) storage.setToken(token);
    else storage.removeToken();
  }, [token]);

  useEffect(() => {
    if (user) storage.setUser(user);
    else storage.removeUser();
  }, [user]);

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
      } catch (error) {
        storage.clear();
        setUser(null);
        setToken(null);
      } finally {
        setBootstrapping(false);
      }
    }

    bootstrapAuth();
  }, []);

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

  const logout = () => {
    storage.clear();
    setUser(null);
    setToken(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      bootstrapping,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
    }),
    [user, token, loading, bootstrapping]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}