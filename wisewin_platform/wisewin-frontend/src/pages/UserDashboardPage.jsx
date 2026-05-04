// Regular user dashboard — shows all assigned quizzes with start/resume buttons
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import QuizCard from "../components/user/QuizCard";
import { quizService } from "../services/quizService";

const sidebarItems = [
  { to: "/user", icon: "dashboard", label: "Dashboard" },
  { to: "/user/scoreboard", icon: "leaderboard", label: "Scoreboard" },
];

export default function UserDashboardPage() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load all assignments for this user on mount
  useEffect(() => {
    async function loadAssignments() {
      try {
        const data = await quizService.getMyAssignments();
        setAssignments(data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to load assignments");
      } finally {
        setLoading(false);
      }
    }
    loadAssignments();
  }, []);

  // Called when the user clicks Start or Resume on a quiz card
  // If the quiz is already in progress and has an attemptId, navigate directly to it
  // Otherwise, start a new attempt and then navigate to it
  const handleQuizAction = async (quiz) => {
    try {
      if (quiz.status === "IN_PROGRESS" && quiz.attemptId) {
        navigate(`/attempts/${quiz.attemptId}`);
        return;
      }
      const attempt = await quizService.startAttempt(quiz.assignmentId);
      navigate(`/attempts/${attempt.attemptId}`);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Could not start quiz");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading user dashboard...</div>;

  // Split assignments into two lists so they can be shown in separate sections
  const activeAssignments = assignments.filter((a) => a.status !== "COMPLETED");
  const completedAssignments = assignments.filter((a) => a.status === "COMPLETED");

  return (
    <DashboardLayout sidebarItems={sidebarItems} title="User Dashboard">

      {/* Hero banner with quick links to scoreboard and self-training */}
      <section className="relative overflow-hidden bg-[#1A237E] rounded-3xl p-10 text-white shadow-[0_30px_60px_rgba(26,35,126,0.3)]">
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Welcome back</h1>
          <p className="text-lg opacity-90 max-w-md">
            Track your assigned training, complete quizzes, and review your results.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <button type="button" onClick={() => navigate("/user/scoreboard")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#1A237E] font-semibold hover:bg-[#f3f1ff] transition-all">
              <span className="material-symbols-outlined text-base">leaderboard</span>
              View Scoreboard
            </button>
            <button type="button" onClick={() => navigate("/user/self-training")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#e8e5ff] text-[#1A237E] font-semibold hover:bg-[#dcd7ff] transition-all">
              <span className="material-symbols-outlined text-base">school</span>
              Self Training
            </button>
          </div>
        </div>
      </section>

      {error && <div className="p-4 rounded-xl bg-red-50 text-red-700 mt-4">{error}</div>}

      {/* Active assignments — quizzes still to be done */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-extrabold text-[#000666] tracking-tight">Training Missions</h2>
        </div>

        {activeAssignments.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-[#454652] shadow-[0_10px_30px_rgba(26,35,126,0.06)]">
            No training missions assigned yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {activeAssignments.map((assignment) => (
              <div key={assignment.assignmentId} className="flex flex-col gap-2">
                <QuizCard
                  quiz={{
                    assignmentId: assignment.assignmentId,
                    attemptId: assignment.attemptId,
                    title: assignment.quizTitle,
                    description: `${assignment.description || "Assigned quiz"} • Attempts used: ${assignment.attemptsUsed}`,
                    dueDate: assignment.dueDate || "No due date",
                    duration: assignment.totalQuestions || 0,
                    status: assignment.status,
                  }}
                  onAction={handleQuizAction}
                />

                {/* Only show attempt history button if at least one attempt has been made */}
                {assignment.attemptsUsed > 0 && (
                  <button type="button"
                    onClick={() => navigate(`/assignments/${assignment.assignmentId}/history`)}
                    className="w-full px-4 py-2 rounded-xl bg-[#e8e5ff] text-[#000666] font-semibold hover:bg-[#dcd7ff] text-sm">
                    View Attempt History ({assignment.attemptsUsed})
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Completed assignments — shown in a simpler list with pass/fail badge */}
      <section>
        <h2 className="text-2xl font-extrabold text-[#000666] tracking-tight mb-6">Completed Training</h2>

        {completedAssignments.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-[#454652] shadow-[0_10px_30px_rgba(26,35,126,0.06)]">
            No completed training yet.
          </div>
        ) : (
          <div className="space-y-3">
            {completedAssignments.map((assignment) => {
              const passed = assignment.latestPassed === true;

              // Build a human-readable summary depending on whether we have result data
              const summaryText =
                assignment.latestPassed === null
                  ? "Completed attempt"
                  : passed
                  ? `Passed on attempt ${assignment.latestAttemptNumber} • Score ${assignment.latestScore}/${assignment.totalQuestions}`
                  : `Failed on attempt ${assignment.latestAttemptNumber} • Score ${assignment.latestScore}/${assignment.totalQuestions}`;

              return (
                <div key={assignment.assignmentId}
                  className="flex justify-between items-center p-4 rounded-xl bg-white hover:bg-[#f3f1ff] transition-all">
                  <div>
                    <p className="font-medium text-[#000666]">{assignment.quizTitle}</p>
                    <p className="text-sm text-[#454652]">
                      {summaryText} • Attempts used: {assignment.attemptsUsed}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                      passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {passed ? "Passed" : "Failed"}
                    </span>
                    <button type="button"
                      onClick={() => navigate(`/assignments/${assignment.assignmentId}/history`)}
                      className="px-4 py-2 rounded-xl bg-[#e8e5ff] text-[#000666] font-semibold hover:bg-[#dcd7ff]">
                      View History
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </DashboardLayout>
  );
}
