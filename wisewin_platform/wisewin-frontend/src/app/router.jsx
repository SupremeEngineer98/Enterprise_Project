import {
  Navigate,
  Outlet,
  createBrowserRouter,
} from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import AdminDashboardPage from "../pages/AdminDashboardPage";
import SuperUserDashboardPage from "../pages/SuperUserDashboardPage";
import UserDashboardPage from "../pages/UserDashboardPage";
import UnauthorizedPage from "../pages/UnauthorizedPage";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../utils/constants";

function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

function HomeRedirect() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  switch (user.role) {
    case ROLES.ADMIN:
      return <Navigate to="/admin" replace />;
    case ROLES.SUPER_USER:
      return <Navigate to="/super-user" replace />;
    default:
      return <Navigate to="/user" replace />;
  }
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <HomeRedirect />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/unauthorized",
    element: <UnauthorizedPage />,
  },
  {
    element: <ProtectedRoute allowedRoles={[ROLES.ADMIN]} />,
    children: [{ path: "/admin", element: <AdminDashboardPage /> }],
  },
  {
    element: <ProtectedRoute allowedRoles={[ROLES.SUPER_USER]} />,
    children: [{ path: "/super-user", element: <SuperUserDashboardPage /> }],
  },
  {
    element: <ProtectedRoute allowedRoles={[ROLES.USER]} />,
    children: [{ path: "/user", element: <UserDashboardPage /> }],
  },
]);