import { Navigate, Outlet, createBrowserRouter } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import AdminDashboardPage from "../pages/AdminDashboardPage";
import SuperUserDashboardPage from "../pages/SuperUserDashboardPage";
import UserDashboardPage from "../pages/UserDashboardPage";
import UnauthorizedPage from "../pages/UnauthorizedPage";
import AttemptPage from "../pages/AttemptPage";
import AttemptResultPage from "../pages/AttemptResultPage";
import AssignmentHistoryPage from "../pages/AssignmentHistoryPage";
import SuperUserAssignQuizPage from "../pages/SuperUserAssignQuizPage";
import AdminCreateUserPage from "../pages/AdminCreateUserPage";
import AdminCreateQuizPage from "../pages/AdminCreateQuizPage";
import ManageQuizQuestionsPage from "../pages/ManageQuizQuestionsPage";
import SuperUserCreateUserPage from "../pages/SuperUserCreateUserPage";
import SuperUserCreateQuizPage from "../pages/SuperUserCreateQuizPage";
import ChangePasswordPage from "../pages/ChangePasswordPage";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../utils/constants";

function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user, bootstrapping } = useAuth();

  if (bootstrapping) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

function HomeRedirect() {
  const { isAuthenticated, user, bootstrapping } = useAuth();

  if (bootstrapping) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

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
    children: [
      { path: "/admin", element: <AdminDashboardPage /> },
      { path: "/admin/create-user", element: <AdminCreateUserPage /> },
      { path: "/admin/create-quiz", element: <AdminCreateQuizPage /> },
      { path: "/admin/quizzes/:quizId/questions", element: <ManageQuizQuestionsPage /> },
      { path: "/admin/change-password", element: <ChangePasswordPage /> },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={[ROLES.SUPER_USER]} />,
    children: [
      { path: "/super-user", element: <SuperUserDashboardPage /> },
      { path: "/super-user/assign", element: <SuperUserAssignQuizPage /> },
      { path: "/super-user/create-user", element: <SuperUserCreateUserPage /> },
      { path: "/super-user/create-quiz", element: <SuperUserCreateQuizPage /> },
      { path: "/super-user/quizzes/:quizId/questions", element: <ManageQuizQuestionsPage /> },
      { path: "/super-user/change-password", element: <ChangePasswordPage /> },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={[ROLES.USER]} />,
    children: [
      { path: "/user", element: <UserDashboardPage /> },
      { path: "/attempts/:attemptId", element: <AttemptPage /> },
      { path: "/attempts/:attemptId/result", element: <AttemptResultPage /> },
      { path: "/assignments/:assignmentId/history", element: <AssignmentHistoryPage /> },
      { path: "/user/change-password", element: <ChangePasswordPage /> },
    ],
  },
]);