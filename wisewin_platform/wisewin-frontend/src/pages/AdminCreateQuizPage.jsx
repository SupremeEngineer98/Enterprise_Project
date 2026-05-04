// Admin page — form to create a new quiz (platform-wide or company-specific)
import { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { companyService } from "../services/companyService";
import { quizService } from "../services/quizService";
import { useNavigate } from "react-router-dom";

const sidebarItems = [
  { to: "/admin", icon: "dashboard", label: "Overview" },
  { to: "/admin/create-user", icon: "person_add", label: "Create User" },
  { to: "/admin/create-quiz", icon: "quiz", label: "Create Quiz" },
];

export default function AdminCreateQuizPage() {
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    sourceType: "PLATFORM",  // PLATFORM = visible to all users; COMPANY = visible only to one company
    companyId: "",
    maxWrongAnswers: 2,       // how many wrong answers are allowed before failing
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Load companies so admin can pick one when creating a COMPANY quiz
  useEffect(() => {
    async function loadCompanies() {
      try {
        const data = await companyService.getAllCompanies();
        setCompanies(data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to load companies");
      } finally {
        setLoading(false);
      }
    }
    loadCompanies();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      setSubmitting(true);

      const payload = {
        title: form.title,
        description: form.description,
        sourceType: form.sourceType,
        maxWrongAnswers: Number(form.maxWrongAnswers),
      };

      // Only include companyId when it's a COMPANY quiz — platform quizzes don't belong to a company
      if (form.sourceType === "COMPANY") {
        payload.companyId = Number(form.companyId);
      }

      const response = await quizService.createQuiz(payload);
      setMessage(`Quiz created successfully: ${response.quiz.title}`);

      // Go straight to the questions page so admin can start adding questions immediately
      navigate(`/admin/quizzes/${response.quiz.id}/questions`);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Could not create quiz");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading companies...</div>;

  return (
    <DashboardLayout sidebarItems={sidebarItems} title="Create Quiz">
      <div>
        <h1 className="text-3xl font-bold text-[#000666]">Create Quiz</h1>
        <p className="text-[#454652] mt-2">Create a platform quiz or a company-specific quiz.</p>
      </div>

      {error ? <div className="p-4 rounded-xl bg-red-50 text-red-700">{error}</div> : null}
      {message ? <div className="p-4 rounded-xl bg-green-50 text-green-700">{message}</div> : null}

      <div className="bg-white rounded-3xl p-8 shadow-[0_20px_60px_rgba(26,35,126,0.08)] max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#454652] mb-2">Quiz Title</label>
            <input name="title" value={form.title} onChange={handleChange}
              className="w-full rounded-xl border border-[#ddd9f8] bg-[#fcf8ff] px-4 py-3 text-[#000666]" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#454652] mb-2">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={4}
              className="w-full rounded-xl border border-[#ddd9f8] bg-[#fcf8ff] px-4 py-3 text-[#000666]" />
          </div>

          {/* Quiz type: PLATFORM is global (no company), COMPANY is private to one company */}
          <div>
            <label className="block text-sm font-medium text-[#454652] mb-2">Quiz Type</label>
            <select name="sourceType" value={form.sourceType} onChange={handleChange}
              className="w-full rounded-xl border border-[#ddd9f8] bg-[#fcf8ff] px-4 py-3 text-[#000666]">
              <option value="PLATFORM">PLATFORM</option>
              <option value="COMPANY">COMPANY</option>
            </select>
          </div>

          {/* Company dropdown only appears when COMPANY type is selected */}
          {form.sourceType === "COMPANY" ? (
            <div>
              <label className="block text-sm font-medium text-[#454652] mb-2">Company</label>
              <select name="companyId" value={form.companyId} onChange={handleChange}
                className="w-full rounded-xl border border-[#ddd9f8] bg-[#fcf8ff] px-4 py-3 text-[#000666]" required>
                <option value="">Choose a company</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </select>
            </div>
          ) : null}

          <div>
            <label className="block text-sm font-medium text-[#454652] mb-2">Max Wrong Answers Allowed</label>
            <input type="number" name="maxWrongAnswers" min="0" value={form.maxWrongAnswers} onChange={handleChange}
              className="w-full rounded-xl border border-[#ddd9f8] bg-[#fcf8ff] px-4 py-3 text-[#000666]" />
          </div>

          <button type="submit" disabled={submitting}
            className="px-6 py-3 rounded-xl bg-[#000666] text-white font-semibold hover:opacity-90 disabled:opacity-60">
            {submitting ? "Creating..." : "Create Quiz"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
