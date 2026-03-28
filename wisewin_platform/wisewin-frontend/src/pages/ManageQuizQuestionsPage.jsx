import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import { questionService } from "../services/questionService";
import { useAuth } from "../context/AuthContext";

export default function ManageQuizQuestionsPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const sidebarItems =
    user?.role === "Administrator"
      ? [
          { to: "/admin", icon: "dashboard", label: "Overview" },
          { to: "/admin/create-user", icon: "person_add", label: "Create User" },
          { to: "/admin/create-quiz", icon: "quiz", label: "Create Quiz" },
        ]
      : [
          { to: "/super-user", icon: "dashboard", label: "Overview" },
          { to: "/super-user/assign", icon: "assignment_add", label: "Assign Quiz" },
          { to: "/super-user/create-user", icon: "person_add", label: "Create User" },
          { to: "/super-user/create-quiz", icon: "quiz", label: "Create Quiz" },
        ];

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    questionText: "",
    options: [
      { optionText: "", isCorrect: true },
      { optionText: "", isCorrect: false },
      { optionText: "", isCorrect: false },
      { optionText: "", isCorrect: false },
    ],
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadQuestions() {
    try {
      const data = await questionService.getQuizQuestions(quizId);
      setQuestions(data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load questions");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadQuestions();
  }, [quizId]);

  const handleQuestionTextChange = (e) => {
    setForm((prev) => ({ ...prev, questionText: e.target.value }));
  };

  const handleOptionChange = (index, value) => {
    setForm((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) =>
        i === index ? { ...opt, optionText: value } : opt
      ),
    }));
  };

  const handleCorrectOption = (index) => {
    setForm((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) => ({
        ...opt,
        isCorrect: i === index,
      })),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      setSubmitting(true);

      const filteredOptions = form.options
        .map((opt, index) => ({
          optionText: opt.optionText.trim(),
          isCorrect: opt.isCorrect,
          displayOrder: index + 1,
        }))
        .filter((opt) => opt.optionText.length > 0);

      await questionService.createQuestion(quizId, {
        questionText: form.questionText.trim(),
        options: filteredOptions,
      });

      setMessage("Question added successfully");

      setForm({
        questionText: "",
        options: [
          { optionText: "", isCorrect: true },
          { optionText: "", isCorrect: false },
          { optionText: "", isCorrect: false },
          { optionText: "", isCorrect: false },
        ],
      });

      await loadQuestions();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Could not add question");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading questions...</div>;
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems} title="Manage Quiz Questions">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#000666]">Manage Questions</h1>
          <p className="text-[#454652] mt-2">
            Add questions and correct answers for quiz #{quizId}.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-xl bg-[#e8e5ff] text-[#000666] font-semibold hover:bg-[#dcd7ff]"
        >
          Back
        </button>
      </div>

      {error ? <div className="p-4 rounded-xl bg-red-50 text-red-700">{error}</div> : null}
      {message ? <div className="p-4 rounded-xl bg-green-50 text-green-700">{message}</div> : null}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-8 shadow-[0_20px_60px_rgba(26,35,126,0.08)]">
          <h2 className="text-xl font-bold text-[#000666] mb-6">Add Question</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#454652] mb-2">
                Question Text
              </label>
              <textarea
                value={form.questionText}
                onChange={handleQuestionTextChange}
                rows={3}
                className="w-full rounded-xl border border-[#ddd9f8] bg-[#fcf8ff] px-4 py-3 text-[#000666]"
                required
              />
            </div>

            <div className="space-y-4">
              {form.options.map((option, index) => (
                <div
                  key={index}
                  className="rounded-2xl bg-[#f5f2ff] p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-[#454652]">
                      Option {index + 1}
                    </label>

                    <label className="flex items-center gap-2 text-sm text-[#000666]">
                      <input
                        type="radio"
                        name="correctOption"
                        checked={option.isCorrect}
                        onChange={() => handleCorrectOption(index)}
                      />
                      Correct
                    </label>
                  </div>

                  <input
                    type="text"
                    value={option.optionText}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    className="w-full rounded-xl border border-[#ddd9f8] bg-white px-4 py-3 text-[#000666]"
                    placeholder={`Enter option ${index + 1}`}
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-xl bg-[#000666] text-white font-semibold hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? "Adding..." : "Add Question"}
            </button>
          </form>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-[0_20px_60px_rgba(26,35,126,0.08)]">
          <h2 className="text-xl font-bold text-[#000666] mb-6">
            Existing Questions
          </h2>

          {questions.length === 0 ? (
            <div className="rounded-2xl bg-[#f5f2ff] p-4 text-[#454652]">
              No questions added yet.
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((question) => (
                <div key={question.id} className="rounded-2xl bg-[#f5f2ff] p-4">
                  <p className="font-semibold text-[#000666] mb-3">
                    {question.displayOrder}. {question.questionText}
                  </p>

                  <div className="space-y-2">
                    {question.options.map((option) => (
                      <div
                        key={option.id}
                        className={`p-3 rounded-xl text-sm ${
                          option.isCorrect
                            ? "bg-green-100 text-green-700"
                            : "bg-white text-[#454652]"
                        }`}
                      >
                        {option.optionText}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}