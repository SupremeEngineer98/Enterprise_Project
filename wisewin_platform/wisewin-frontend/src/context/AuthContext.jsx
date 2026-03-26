import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "../services/authService";
import { storage } from "../utils/storage";
import { ROLES } from "../utils/constants";

const AuthContext = createContext(null);

function inferRoleFromEmail(email) {
  if (!email) return ROLES.USER;
  if (email.startsWith("admin")) return ROLES.ADMIN;
  if (email.startsWith("super")) return ROLES.SUPER_USER;
  return ROLES.USER;
}

function buildUserFromLoginResponse(response, email) {
  if (response.user) return response.user;

  return {
    id: response.userId ?? 1,
    email,
    role: response.role ?? inferRoleFromEmail(email),
    companyId: response.companyId ?? 1,
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(storage.getUser());
  const [token, setToken] = useState(storage.getToken());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) storage.setToken(token);
    else storage.removeToken();
  }, [token]);

  useEffect(() => {
    if (user) storage.setUser(user);
    else storage.removeUser();
  }, [user]);

  const login = async ({ email, password }) => {
    setLoading(true);
    try {
      const response = await authService.login({ email, password });
      const resolvedUser = buildUserFromLoginResponse(response, email);

      setToken(response.token);
      setUser(resolvedUser);
      return resolvedUser;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    storage.clear();
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
    }),
    [user, token, loading]
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