import { useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { userService } from "../services/userService";

export default function ChangePasswordPage() {
  const { user } = useAuth();

  const sidebarItems =
    user?.role === "Administrator"
      ? [
          { to: "/admin", icon: "dashboard", label: "Overview" },
          { to: "/admin/create-user", icon: "person_add", label: "Create User" },
          { to: "/admin/create-quiz", icon: "quiz", label: "Create Quiz" },
        ]
      : user?.role === "Super user"
      ? [
          { to: "/super-user", icon: "dashboard", label: "Overview" },
          { to: "/super-user/assign", icon: "assignment_add", label: "Assign Quiz" },
          { to: "/super-user/create-user", icon: "person_add", label: "Create User" },
          { to: "/super-user/create-quiz", icon: "quiz", label: "Create Quiz" },
        ]
      : [{ to: "/user", icon: "dashboard", label: "Dashboard" }];

  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
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

      await userService.changePassword(user.id, {
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      });

      setMessage("Password updated successfully");
      setForm({ oldPassword: "", newPassword: "" });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Could not update password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout sidebarItems={sidebarItems} title="Change Password">
      <div>
        <h1 className="text-3xl font-bold text-[#000666]">Change Password</h1>
        <p className="text-[#454652] mt-2">
          Update your account password securely.
        </p>
      </div>

      {error ? <div className="p-4 rounded-xl bg-red-50 text-red-700">{error}</div> : null}
      {message ? <div className="p-4 rounded-xl bg-green-50 text-green-700">{message}</div> : null}

      <div className="bg-white rounded-3xl p-8 shadow-[0_20px_60px_rgba(26,35,126,0.08)] max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#454652] mb-2">
              Current Password
            </label>
            <input
              name="oldPassword"
              type="password"
              value={form.oldPassword}
              onChange={handleChange}
              className="w-full rounded-xl border border-[#ddd9f8] bg-[#fcf8ff] px-4 py-3 text-[#000666]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#454652] mb-2">
              New Password
            </label>
            <input
              name="newPassword"
              type="password"
              value={form.newPassword}
              onChange={handleChange}
              className="w-full rounded-xl border border-[#ddd9f8] bg-[#fcf8ff] px-4 py-3 text-[#000666]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 rounded-xl bg-[#000666] text-white font-semibold hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}