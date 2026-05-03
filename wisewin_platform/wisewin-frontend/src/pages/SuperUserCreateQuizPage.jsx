import { useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { quizService } from "../services/quizService";
import { useNavigate } from "react-router-dom";

const sidebarItems = [
  { to: "/super-user", icon: "dashboard", label: "Overview" },
  { to: "/super-user/assign", icon: "assignment_add", label: "Assign Quiz" },
  { to: "/super-user/create-user", icon: "person_add", label: "Create User" },
  { to: "/super-user/create-quiz", icon: "quiz", label: "Create Quiz" },
   { to: "/super-user/scoreboard", icon: "leaderboard", label: "Scoreboard" },
];

export default function SuperUserCreateQuizPage() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    maxWrongAnswers: 2,
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!form.description.trim()) {
      setError("Please enter a description.");
      return;
    }

    if (form.maxWrongAnswers === "" || form.maxWrongAnswers === null) {
      setError("Please enter the maximum number of wrong answers allowed.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await quizService.createQuiz({
        title: form.title,
        description: form.description,
        sourceType: "COMPANY",
        maxWrongAnswers: Number(form.maxWrongAnswers),
      });

      setMessage(`Quiz created successfully: ${response.quiz.title}`);
      navigate(`/super-user/quizzes/${response.quiz.id}/questions`);

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Could not create quiz");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout sidebarItems={sidebarItems} title="Create Quiz">
      <div>
        <h1 className="text-3xl font-bold text-[#000666]">Create Quiz</h1>
        <p className="text-[#454652] mt-2">
          Create a new company quiz for your employees.
        </p>
      </div>

      {error ? <div className="p-4 rounded-xl bg-red-50 text-red-700">{error}</div> : null}
      {message ? <div className="p-4 rounded-xl bg-green-50 text-green-700">{message}</div> : null}

      <div className="bg-white rounded-3xl p-8 shadow-[0_20px_60px_rgba(26,35,126,0.08)] max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#454652] mb-2">
              Quiz Title
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full rounded-xl border border-[#ddd9f8] bg-[#fcf8ff] px-4 py-3 text-[#000666] focus:outline-none focus:ring-2 focus:ring-[#83439E]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#454652] mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              required
              className="w-full rounded-xl border border-[#ddd9f8] bg-[#fcf8ff] px-4 py-3 text-[#000666] focus:outline-none focus:ring-2 focus:ring-[#83439E]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#454652] mb-2">
              Max Wrong Answers Allowed
            </label>
            <input
              type="number"
              name="maxWrongAnswers"
              min="0"
              value={form.maxWrongAnswers}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-[#ddd9f8] bg-[#fcf8ff] px-4 py-3 text-[#000666] focus:outline-none focus:ring-2 focus:ring-[#83439E]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 rounded-xl bg-[#000666] text-white font-semibold hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Create Quiz"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}