import { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import StatCard from "../components/dashboard/StatCard";
import SectionCard from "../components/dashboard/SectionCard";
import { companyService } from "../services/companyService";
import { userService } from "../services/userService";
import { quizService } from "../services/quizService";
import { useNavigate } from "react-router-dom";

const sidebarItems = [
  { to: "/admin", icon: "dashboard", label: "Overview" },
  { to: "/admin/companies", icon: "business", label: "Companies" },
  { to: "/admin/users", icon: "group", label: "Users" },
  { to: "/admin/super-users", icon: "manage_accounts", label: "Super Users" },
  { to: "/admin/quizzes", icon: "quiz", label: "Quizzes" },
];

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [users, setUsers] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [companiesData, usersData, quizzesData] = await Promise.all([
          companyService.getAllCompanies(),
          userService.getAllUsers(),
          quizService.getVisibleQuizzes(),
        ]);

        setCompanies(companiesData);
        setUsers(usersData);
        setQuizzes(quizzesData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading admin dashboard...</div>;
  }

  const superUsers = users.filter((u) => u.role === "Super user");
  const normalUsers = users.filter((u) => u.role === "User");

  return (
    <DashboardLayout sidebarItems={sidebarItems} title="Administrator Dashboard">
      <div>
        <h1 className="text-3xl font-bold text-[#000666]">System Intelligence Overview</h1>
        <p className="text-[#454652] mt-2">Real-time insights across all companies and assessments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="cursor-pointer hover:scale-[1.02] hover:shadow-md transition" onClick={() => navigate("/admin/companies")}>
        <StatCard title="Companies" value={companies.length} icon="business" />
        </div>
        <div className="cursor-pointer hover:scale-[1.02] hover:shadow-md transition" onClick={() => navigate("/admin/super-users")}>
        <StatCard title="Super Users" value={superUsers.length} icon="manage_accounts" />
        </div>
        <div className="cursor-pointer hover:scale-[1.02] hover:shadow-md transition" onClick={() => navigate("/admin/users")}>
        <StatCard title="Users" value={normalUsers.length} icon="group" />
        </div>
         <div className="cursor-pointer hover:scale-[1.02] hover:shadow-md transition" onClick={() => navigate("/admin/quizzes")}>
        <StatCard title="Quizzes" value={quizzes.length} icon="quiz" />
        </div>
      </div>

      <SectionCard title="Client Intelligence">
        <div className="space-y-2">
          {companies.map((company) => {
            const companyQuizCount = quizzes.filter((q) => q.companyId === company.id).length;

            return (
              <div
                key={company.id}
                className="p-4 rounded-xl bg-white hover:bg-[#f3f1ff] transition-all flex justify-between items-center"
              >
                <div>
                  <p className="font-medium text-[#000666]">{company.name}</p>
                  <p className="text-sm text-[#454652]">{company.status}</p>
                </div>
                <p className="text-sm text-[#454652]">{companyQuizCount} company quizzes</p>
              </div>
            );
          })}
        </div>
      </SectionCard>
    </DashboardLayout>
  );
}