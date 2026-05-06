// Admin page — form to create a new user (regular User or Super user) and assign them to a company
import { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { companyService } from "../services/companyService";
import { userService } from "../services/userService";

const sidebarItems = [
  { to: "/admin", icon: "dashboard", label: "Overview" },
  { to: "/admin/companies", icon: "business", label: "Companies" },
  { to: "/admin/users", icon: "group", label: "Users" },
  { to: "/admin/super-users", icon: "manage_accounts", label: "Super Users" },
  { to: "/admin/quizzes", icon: "quiz", label: "Quizzes" },
  { to: "/admin/create-user", icon: "person_add", label: "Create User" },
  { to: "/admin/create-quiz", icon: "quiz", label: "Create Quiz" },
];

export default function AdminCreateUserPage() {
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState({ companyId: "", email: "", password: "", role: "User" });
  const [loading, setLoading] = useState(true);     // waiting for the companies list
  const [submitting, setSubmitting] = useState(false); // form is being submitted
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Load companies so the admin can pick one from a dropdown
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
      const response = await userService.createUser({
        companyId: Number(form.companyId),
        email: form.email,
        password: form.password,
        role: form.role,
      });
      setMessage(`${response.user.role} created successfully: ${response.user.email}`);
      // Reset form so admin can create another user straight away
      setForm({ companyId: "", email: "", password: "", role: "User" });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Could not create user");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading companies...</div>;

  return (
    <DashboardLayout sidebarItems={sidebarItems} title="Create User">
      <div>
        <h1 className="text-3xl font-bold text-[#000666]">Create User</h1>
        <p className="text-[#454652] mt-2">Create a new user or super user for a company.</p>
      </div>

      {error ? <div className="p-4 rounded-xl bg-red-50 text-red-700">{error}</div> : null}
      {message ? <div className="p-4 rounded-xl bg-green-50 text-green-700">{message}</div> : null}

      <div className="bg-white rounded-3xl p-8 shadow-[0_20px_60px_rgba(26,35,126,0.08)] max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Company dropdown — populated from the API */}
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

          {/* Role selector — controls what the user can do in the system */}
          <div>
            <label className="block text-sm font-medium text-[#454652] mb-2">Role</label>
            <select name="role" value={form.role} onChange={handleChange}
              className="w-full rounded-xl border border-[#ddd9f8] bg-[#fcf8ff] px-4 py-3 text-[#000666]">
              <option value="User">User</option>
              <option value="Super user">Super user</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#454652] mb-2">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange}
              className="w-full rounded-xl border border-[#ddd9f8] bg-[#fcf8ff] px-4 py-3 text-[#000666]" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#454652] mb-2">Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange}
              className="w-full rounded-xl border border-[#ddd9f8] bg-[#fcf8ff] px-4 py-3 text-[#000666]" required />
          </div>

          <button type="submit" disabled={submitting}
            className="px-6 py-3 rounded-xl bg-[#000666] text-white font-semibold hover:opacity-90 disabled:opacity-60">
            {submitting ? "Creating..." : "Create User"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
