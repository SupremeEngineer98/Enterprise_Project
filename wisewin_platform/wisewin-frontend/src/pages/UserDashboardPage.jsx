import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import QuizCard from "../components/user/QuizCard";
import CompletedQuizRow from "../components/user/CompletedQuizRow";

const sidebarItems = [
  { to: "/user", icon: "dashboard", label: "Dashboard" },
  { to: "/user/assigned", icon: "quiz", label: "Assigned Quizzes" },
  { to: "/user/completed", icon: "editor_choice", label: "Completed Assignments" },
];

const assignedQuizzes = [
  {
    assignmentId: 1,
    title: "Manual Handling",
    description: "Master correct lifting techniques to prevent workplace injuries.",
    duration: 15,
    dueDate: "2026-05-30",
    status: "NEW",
  },
  {
    assignmentId: 2,
    attemptId: 45,
    title: "Working at Height",
    description: "Essential safety protocols for platform and ladder operations.",
    duration: 25,
    dueDate: "2026-05-30",
    status: "IN_PROGRESS",
  },
];

const completedQuizzes = [
  { title: "Warehouse Safety Fundamentals", completedAt: "2025-10-24", score: 96 },
  { title: "Forklift Pre-Op Checklist", completedAt: "2025-10-20", score: 82 },
];

export default function UserDashboardPage() {
  const navigate = useNavigate();

  const handleQuizAction = (quiz) => {
    if (quiz.status === "IN_PROGRESS" && quiz.attemptId) {
      navigate(`/attempts/${quiz.attemptId}`);
      return;
    }

    navigate(`/assignments/${quiz.assignmentId}/start`);
  };

  return (
    <DashboardLayout sidebarItems={sidebarItems} title="User Dashboard">
      <section className="relative overflow-hidden bg-[#1A237E] rounded-3xl p-10 text-white shadow-[0_30px_60px_rgba(26,35,126,0.3)]">
        <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Welcome back</h1>
            <p className="text-lg opacity-90 max-w-md">
              Your operational readiness and training certifications are currently active.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <p className="text-xs uppercase tracking-widest font-bold mb-1">Training Compliance</p>
            <p className="text-4xl font-black">84%</p>
            <div className="w-full bg-white/20 h-3 rounded-full overflow-hidden mt-4">
              <div className="bg-[#EEC209] h-full" style={{ width: "84%" }} />
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-extrabold text-[#000666] tracking-tight">Training Missions</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {assignedQuizzes.map((quiz) => (
            <QuizCard key={quiz.assignmentId} quiz={quiz} onAction={handleQuizAction} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-extrabold text-[#000666] tracking-tight mb-6">Recently Completed</h2>
        <div className="space-y-2">
          {completedQuizzes.map((quiz) => (
            <CompletedQuizRow key={quiz.title} quiz={quiz} />
          ))}
        </div>
      </section>
    </DashboardLayout>
  );
}