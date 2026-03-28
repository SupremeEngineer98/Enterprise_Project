import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { quizService } from "../services/quizService";
import { userService } from "../services/userService";

const sidebarItems = [
  { to: "/super-user", icon: "dashboard", label: "Overview" },
  { to: "/super-user/assign", icon: "assignment_add", label: "Assign Quiz" },
];

export default function SuperUserAssignQuizPage() {
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    userId: "",
    quizId: "",
    dueDate: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [usersData, quizzesData] = await Promise.all([
          userService.getCompanyUsers(user.companyId),
          quizService.getVisibleQuizzes(),
        ]);

        const companyUsers = usersData.filter((u) => u.role === "User");
        setUsers(companyUsers);

        // visible quizzes for company
        const availableQuizzes = quizzesData.filter(
          (q) => q.isActive && (q.companyId === null || q.companyId === user.companyId)
        );

        setQuizzes(availableQuizzes);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to load assignment data");
      } finally {
        setLoading(false);
      }
    }

    if (user?.companyId) {
      loadData();
    }
  }, [user]);

  const selectedUser = useMemo(
    () => users.find((u) => String(u.id) === String(form.userId)),
    [users, form.userId]
  );

  const selectedQuiz = useMemo(
    () => quizzes.find((q) => String(q.id) === String(form.quizId)),
    [quizzes, form.quizId]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!form.userId || !form.quizId) {
      setError("Please select both a user and a quiz.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        userId: Number(form.userId),
        dueDate: form.dueDate ? `${form.dueDate}T23:59:59Z` : null,
      };

      const response = await quizService.assignQuiz(form.quizId, payload);

      setMessage(
        `Quiz assigned successfully to ${selectedUser?.email || "user"}`
      );

      setForm({
        userId: "",
        quizId: "",
        dueDate: "",
      });

      console.log("Assignment created:", response);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Could not assign quiz");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading assignment page...</div>;
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems} title="Assign Quiz">
      <div>
        <h1 className="text-3xl font-bold text-[#000666]">Assign Training Quiz</h1>
        <p className="text-[#454652] mt-2">
          Select a user, choose a visible quiz, and assign a due date.
        </p>
      </div>

      {error ? (
        <div className="p-4 rounded-xl bg-red-50 text-red-700">{error}</div>
      ) : null}

      {message ? (
        <div className="p-4 rounded-xl bg-green-50 text-green-700">{message}</div>
      ) : null}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-3xl p-8 shadow-[0_20px_60px_rgba(26,35,126,0.08)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#454652] mb-2">
                Select User
              </label>
              <select
                name="userId"
                value={form.userId}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#ddd9f8] bg-[#fcf8ff] px-4 py-3 text-[#000666] focus:outline-none focus:ring-2 focus:ring-[#83439E]"
              >
                <option value="">Choose a user</option>
                {users.map((companyUser) => (
                  <option key={companyUser.id} value={companyUser.id}>
                    {companyUser.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#454652] mb-2">
                Select Quiz
              </label>
              <select
                name="quizId"
                value={form.quizId}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#ddd9f8] bg-[#fcf8ff] px-4 py-3 text-[#000666] focus:outline-none focus:ring-2 focus:ring-[#83439E]"
              >
                <option value="">Choose a quiz</option>
                {quizzes.map((quiz) => (
                  <option key={quiz.id} value={quiz.id}>
                    {quiz.title} ({quiz.sourceType})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#454652] mb-2">
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                className="w-full rounded-xl border border-[#ddd9f8] bg-[#fcf8ff] px-4 py-3 text-[#000666] focus:outline-none focus:ring-2 focus:ring-[#83439E]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-xl bg-[#000666] text-white font-semibold hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? "Assigning..." : "Assign Quiz"}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-[0_20px_60px_rgba(26,35,126,0.08)]">
          <h2 className="text-xl font-bold text-[#000666] mb-4">Assignment Summary</h2>

          <div className="space-y-4 text-sm">
            <div className="rounded-2xl bg-[#f5f2ff] p-4">
              <p className="text-[#454652] mb-1">Selected User</p>
              <p className="font-semibold text-[#000666]">
                {selectedUser?.email || "None selected"}
              </p>
            </div>

            <div className="rounded-2xl bg-[#f5f2ff] p-4">
              <p className="text-[#454652] mb-1">Selected Quiz</p>
              <p className="font-semibold text-[#000666]">
                {selectedQuiz?.title || "None selected"}
              </p>
              {selectedQuiz ? (
                <p className="text-xs text-[#767683] mt-1">
                  Type: {selectedQuiz.sourceType}
                </p>
              ) : null}
            </div>

            <div className="rounded-2xl bg-[#f5f2ff] p-4">
              <p className="text-[#454652] mb-1">Due Date</p>
              <p className="font-semibold text-[#000666]">
                {form.dueDate || "Not set"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}