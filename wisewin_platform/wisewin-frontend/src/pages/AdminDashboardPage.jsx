import DashboardLayout from "../components/layout/DashboardLayout";
import StatCard from "../components/dashboard/StatCard";
import SectionCard from "../components/dashboard/SectionCard";

const sidebarItems = [
  { to: "/admin", icon: "dashboard", label: "Overview" },
  { to: "/admin/companies", icon: "business", label: "Companies" },
  { to: "/admin/quizzes", icon: "quiz", label: "Quiz Builder" },
];

const companyRows = [
  { name: "TechFlow Systems", meta: "32 quizzes", date: "Oct 24, 2023" },
  { name: "Creative Nexus", meta: "13 quizzes", date: "Oct 22, 2023" },
];

export default function AdminDashboardPage() {
  return (
    <DashboardLayout sidebarItems={sidebarItems} title="Administrator Dashboard">
      <div>
        <h1 className="text-3xl font-bold text-[#000666]">System Intelligence Overview</h1>
        <p className="text-[#454652] mt-2">Real-time insights across all companies and assessments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard title="Companies" value="1,284" icon="business" />
        <StatCard title="Super Users" value="452" icon="manage_accounts" />
        <StatCard title="Users" value="5,236" icon="group" />
        <StatCard title="Quizzes" value="152" icon="quiz" />
      </div>

      <SectionCard title="Client Intelligence">
        <div className="space-y-2">
          {companyRows.map((row) => (
            <div key={row.name} className="p-4 rounded-xl bg-white hover:bg-[#f3f1ff] transition-all flex justify-between items-center">
              <div>
                <p className="font-medium text-[#000666]">{row.name}</p>
                <p className="text-sm text-[#454652]">{row.date}</p>
              </div>
              <p className="text-sm text-[#454652]">{row.meta}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </DashboardLayout>
  );
}