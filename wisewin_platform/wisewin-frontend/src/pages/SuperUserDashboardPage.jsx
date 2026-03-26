import DashboardLayout from "../components/layout/DashboardLayout";
import StatCard from "../components/dashboard/StatCard";
import SectionCard from "../components/dashboard/SectionCard";
import UserRow from "../components/dashboard/UserRow";

const sidebarItems = [
  { to: "/super-user", icon: "dashboard", label: "Overview" },
  { to: "/super-user/users", icon: "group", label: "Users" },
  { to: "/super-user/quizzes", icon: "quiz", label: "Quizzes" },
  { to: "/super-user/assignments", icon: "assignment_ind", label: "Assignments" },
];

const users = [
  { name: "Dimitris", email: "dimitris@example.com", assignedQuizzes: 12, completedQuizzes: 10 },
  { name: "George", email: "george@example.com", assignedQuizzes: 13, completedQuizzes: 11 },
  { name: "Alice", email: "alice@example.com", assignedQuizzes: 15, completedQuizzes: 12 },
];

export default function SuperUserDashboardPage() {
  return (
    <DashboardLayout sidebarItems={sidebarItems} title="Super User Dashboard">
      <div>
        <h1 className="text-3xl font-bold text-[#000666]">Workforce Intelligence</h1>
        <p className="text-[#454652] mt-2">Monitor employee training progress and compliance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="Users" value="152" icon="group" />
        <StatCard title="Pending Assignments" value="5" icon="schedule" />
        <StatCard title="Completed Assignments" value="23" icon="check_circle" />
        <StatCard title="Total Quizzes" value="34" icon="quiz" />
      </div>

      <SectionCard title="User Intelligence">
        <div className="space-y-2">
          {users.map((user) => (
            <UserRow key={user.email} user={user} />
          ))}
        </div>
      </SectionCard>
    </DashboardLayout>
  );
}