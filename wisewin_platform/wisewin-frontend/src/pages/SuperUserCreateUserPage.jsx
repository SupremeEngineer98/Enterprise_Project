import { useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { userService } from "../services/userService";

const sidebarItems = [
  { to: "/super-user", icon: "dashboard", label: "Overview" },
  { to: "/super-user/assign", icon: "assignment_add", label: "Assign Quiz" },
  { to: "/super-user/create-user", icon: "person_add", label: "Create User" },
  { to: "/super-user/create-quiz", icon: "quiz", label: "Create Quiz" },
   { to: "/super-user/scoreboard", icon: "leaderboard", label: "Scoreboard" },
];

export default function SuperUserCreateUserPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      setSubmitting(true);

      const payload = {
        email: form.email,
        password: form.password,
        role: "User",
      };

      const response = await userService.createUser(payload);

      setMessage(`User created successfully: ${response.user.email}`);
      setForm({ email: "", password: "" });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Could not create user");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout sidebarItems={sidebarItems} title="Create User">
      <div>
        <h1 className="text-3xl font-bold text-[#000666]">Create User</h1>
        <p className="text-[#454652] mt-2">
          Create a new employee account for your company.
        </p>
      </div>

      {error ? <div className="p-4 rounded-xl bg-red-50 text-red-700">{error}</div> : null}
      {message ? <div className="p-4 rounded-xl bg-green-50 text-green-700">{message}</div> : null}

      <div className="bg-white rounded-3xl p-8 shadow-[0_20px_60px_rgba(26,35,126,0.08)] max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#454652] mb-2">
              Email
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-[#ddd9f8] bg-[#fcf8ff] px-4 py-3 text-[#000666] focus:outline-none focus:ring-2 focus:ring-[#83439E]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#454652] mb-2">
              Password
            </label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-xl border border-[#ddd9f8] bg-[#fcf8ff] px-4 py-3 text-[#000666] focus:outline-none focus:ring-2 focus:ring-[#83439E]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 rounded-xl bg-[#000666] text-white font-semibold hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "Creating..." : "Create User"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}