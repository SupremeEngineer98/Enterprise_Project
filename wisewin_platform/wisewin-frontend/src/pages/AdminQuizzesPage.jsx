import { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { quizService } from "../services/quizService";

const sidebarItems = [
  { to: "/admin", icon: "dashboard", label: "Overview" },
  { to: "/admin/companies", icon: "business", label: "Companies" },
  { to: "/admin/super-users", icon: "manage_accounts", label: "Super Users" },
  { to: "/admin/quizzes", icon: "quiz", label: "Quizzes" },
];

export default function AdminQuizzesPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await quizService.getVisibleQuizzes();
        setQuizzes(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <DashboardLayout sidebarItems={sidebarItems} title="Quizzes">

      <section className="relative overflow-hidden bg-[#1A237E] rounded-3xl p-10 text-white shadow-[0_30px_60px_rgba(26,35,126,0.3)]">
        <h1 className="text-4xl font-black mb-2">Quizzes</h1>
        <p className="opacity-90">Manage all training quizzes.</p>
      </section>

      <section className="mt-2 space-y-3">
        {loading ? (
          <div className="rounded-2xl bg-white p-6 text-[#454652]">Loading...</div>
        ) : quizzes.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-[#454652]">No quizzes found.</div>
        ) : (
          quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="flex justify-between items-center p-4 rounded-xl bg-white hover:bg-[#f3f1ff] transition-all shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#e8e5ff] flex items-center justify-center">
                  <span className="material-icons text-[#1A237E] text-lg">quiz</span>
                </div>
                <div>
                  <p className="font-medium text-[#000666]">{quiz.title}</p>
                  <p className="text-sm text-[#454652]">{quiz.description ?? "No description"}</p>
                </div>
              </div>

              <span
                className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                  quiz.is_active
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {quiz.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          ))
        )}
      </section>

    </DashboardLayout>
  );
}