import { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import StatCard from "../components/dashboard/StatCard";
import SectionCard from "../components/dashboard/SectionCard";
import UserRow from "../components/dashboard/UserRow";
import { userService } from "../services/userService";
import { quizService } from "../services/quizService";
import { useAuth } from "../context/AuthContext";

const sidebarItems = [
  { to: "/super-user", icon: "dashboard", label: "Overview" },
  { to: "/super-user/assign", icon: "assignment_add", label: "Assign Quiz" },
  { to: "/super-user/create-user", icon: "person_add", label: "Create User" },
  { to: "/super-user/create-quiz", icon: "quiz", label: "Create Quiz" },
];

export default function SuperUserDashboardPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [usersData, quizzesData] = await Promise.all([
          userService.getCompanyUsers(user.companyId),
          quizService.getVisibleQuizzes(),
        ]);

        const mappedUsers = usersData
          .filter((u) => u.role === "User")
          .map((u) => ({
            name: u.email.split("@")[0],
            email: u.email,
            assignedQuizzes: 0,
            completedQuizzes: 0,
          }));

        setUsers(mappedUsers);
        setQuizzes(quizzesData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    if (user?.companyId) {
      loadDashboard();
    }
  }, [user]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading super user dashboard...</div>;
  }

  const companyQuizzes = quizzes.filter(
    (q) => q.companyId === user.companyId || q.companyId === null
  );

  return (
    <DashboardLayout sidebarItems={sidebarItems} title="Super User Dashboard">
      <div>
        <h1 className="text-3xl font-bold text-[#000666]">Workforce Intelligence</h1>
        <p className="text-[#454652] mt-2">
          Monitor employee training progress and manage quiz assignments.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="Users" value={users.length} icon="group" />
        <StatCard title="Pending Assignments" value={0} icon="schedule" />
        <StatCard title="Completed Assignments" value={0} icon="check_circle" />
        <StatCard title="Visible Quizzes" value={companyQuizzes.length} icon="quiz" />
      </div>

      <SectionCard title="User Intelligence">
        <div className="space-y-2">
          {users.map((companyUser) => (
            <UserRow key={companyUser.email} user={companyUser} />
          ))}
        </div>
      </SectionCard>
    </DashboardLayout>
  );
}