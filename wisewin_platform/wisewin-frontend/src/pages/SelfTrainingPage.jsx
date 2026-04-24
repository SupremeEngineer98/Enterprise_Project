import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import { quizService } from "../services/quizService";

const sidebarItems = [
  { to: "/user", icon: "dashboard", label: "Dashboard" },
  { to: "/user/self-training", icon: "school", label: "Self Training" },
];

export default function SelfTrainingPage() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(null); // quizId being assigned
  const [successId, setSuccessId] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const [quizzesData, assignmentsData] = await Promise.all([
          quizService.getVisibleQuizzes(),
          quizService.getMyAssignments(),
        ]);
        setQuizzes(quizzesData.filter((q) => q.isActive));
        setAssignments(assignmentsData);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // quizIds that user already has active assignment for
  const activeQuizIds = new Set(
    assignments
      .filter((a) => a.status === "ASSIGNED" || a.status === "IN_PROGRESS")
      .map((a) => a.quizId)
  );

  const handleSelfAssign = async (quiz) => {
    setError("");
    setSuccessId(null);
    try {
      setAssigning(quiz.id);
      const result = await quizService.selfAssign(quiz.id);
      setSuccessId(quiz.id);
      // Refresh assignments then navigate to attempt
      const updated = await quizService.getMyAssignments();
      setAssignments(updated);
      // Auto-start the quiz
      const attempt = await quizService.startAttempt(result.assignment.id);
      navigate(`/attempts/${attempt.attemptId}`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not assign quiz.");
    } finally {
      setAssigning(null);
    }
  };

  const filtered = quizzes.filter((q) =>
    q.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout sidebarItems={sidebarItems} title="Self Training">

      <section className="relative overflow-hidden bg-[#1A237E] rounded-3xl p-10 text-white shadow-[0_30px_60px_rgba(26,35,126,0.3)]">
        <h1 className="text-4xl font-black mb-2">Self Training</h1>
        <p className="opacity-90 max-w-md">
          Browse available quizzes and start training on your own.
        </p>
      </section>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search quizzes..."
          className="w-full px-5 py-3 rounded-xl border border-[#e0ddf5] focus:outline-none focus:ring-2 focus:ring-[#1A237E] bg-white text-[#000666]"
        />
      </div>

      <section className="space-y-3">
        {loading ? (
          <div className="rounded-2xl bg-white p-6 text-[#454652]">Loading quizzes...</div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-[#454652]">No quizzes found.</div>
        ) : filtered.map((quiz) => {
          const alreadyAssigned = activeQuizIds.has(quiz.id);
          const isAssigning = assigning === quiz.id;

          return (
            <div key={quiz.id} className="flex justify-between items-center p-4 rounded-xl bg-white hover:bg-[#f3f1ff] transition-all shadow-sm">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 rounded-full bg-[#e8e5ff] flex items-center justify-center text-[#1A237E] font-bold text-sm flex-shrink-0">
                  {quiz.title[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-[#000666] truncate">{quiz.title}</p>
                  <p className="text-sm text-[#454652] truncate">
                    {quiz.description ?? "No description"}
                  </p>
                </div>
              </div>

              <div className="ml-4 flex-shrink-0">
                {alreadyAssigned ? (
                  <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-[#e8e5ff] text-[#000666]">
                    Already assigned
                  </span>
                ) : (
                  <button
                    onClick={() => handleSelfAssign(quiz)}
                    disabled={isAssigning}
                    className="px-4 py-2 rounded-xl bg-[#1A237E] text-white font-semibold text-sm hover:bg-[#000666] transition disabled:opacity-50"
                  >
                    {isAssigning ? "Starting..." : "Start Training"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </section>

    </DashboardLayout>
  );
}