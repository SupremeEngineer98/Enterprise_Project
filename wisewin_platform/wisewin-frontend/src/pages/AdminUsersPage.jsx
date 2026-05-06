// Admin page — lists and manages regular users across all companies
import { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { userService } from "../services/userService";
import { companyService } from "../services/companyService";

const sidebarItems = [
  { to: "/admin", icon: "dashboard", label: "Overview" },
  { to: "/admin/companies", icon: "business", label: "Companies" },
  { to: "/admin/users", icon: "group", label: "Users" },
  { to: "/admin/super-users", icon: "manage_accounts", label: "Super Users" },
  { to: "/admin/quizzes", icon: "quiz", label: "Quizzes" },
    { to: "/admin/create-user", icon: "person_add", label: "Create User" },
];

// Generates a random 12-character password — used by the password reset section in the edit modal
function generatePassword() {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState("");
  const [resetError, setResetError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [usersData, companiesData] = await Promise.all([
        userService.getAllUsers(),
        companyService.getAllCompanies(),
      ]);
      setUsers(usersData);
      setCompanies(companiesData);
    } finally {
      setLoading(false);
    }
  }

  // Only show regular Users on this page — super users have their own page
  const normalUsers = users.filter((u) => u.role === "User");

  // Opens the edit modal and resets all password-related feedback state
  const openEdit = (user) => {
    setEditUser(user);
    setEditForm({ email: user.email, companyId: user.companyId, isActive: user.isActive });
    setEditError("");
    setNewPassword("");
    setResetSuccess("");
    setResetError("");
    setShowPassword(false);
  };

  // Saves user info changes (email, company, active status)
  const handleEdit = async () => {
    setEditError("");
    if (!editForm.email?.trim()) { setEditError("Email is required."); return; }
    try {
      setEditLoading(true);
      await userService.updateUser(editUser.id, editForm);
      setEditUser(null);
      await loadData();
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed to update user.");
    } finally {
      setEditLoading(false);
    }
  };

  // Resets the user's password — the admin doesn't need to provide the old one
  const handleResetPassword = async () => {
    setResetError("");
    setResetSuccess("");
    if (!newPassword.trim()) { setResetError("Please enter or generate a password."); return; }
    try {
      setResetLoading(true);
      await userService.changePassword(editUser.id, { newPassword });
      setResetSuccess("Password updated successfully!");
      setNewPassword("");
    } catch (err) {
      setResetError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setResetLoading(false);
    }
  };

  // Deletes the user permanently and refreshes the list
  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await userService.deleteUser(deleteTarget.id);
      setDeleteTarget(null);
      await loadData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user.");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <DashboardLayout sidebarItems={sidebarItems} title="Users Management">

      <section className="relative overflow-hidden bg-[#1A237E] rounded-3xl p-10 text-white shadow-[0_30px_60px_rgba(26,35,126,0.3)]">
        <h1 className="text-4xl font-black mb-2">Users</h1>
        <p className="opacity-90">Manage all system users.</p>
      </section>

      <section className="mt-2 space-y-3">
        {loading ? (
          <div className="rounded-2xl bg-white p-6 text-[#454652]">Loading...</div>
        ) : normalUsers.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-[#454652]">No users found.</div>
        ) : normalUsers.map((user) => (
          <div key={user.id} className="flex justify-between items-center p-4 rounded-xl bg-white hover:bg-[#f3f1ff] transition-all shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#e8e5ff] flex items-center justify-center text-[#1A237E] font-bold text-sm">
                {user.email[0].toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-[#000666]">{user.email}</p>
                <p className="text-sm text-[#454652]">{user.companyName ?? "No company"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {user.isActive ? "Active" : "Inactive"}
              </span>
              <button onClick={() => openEdit(user)} className="px-3 py-1.5 rounded-lg bg-[#e8e5ff] text-[#000666] text-sm font-semibold hover:bg-[#dcd7ff] transition">Edit</button>
              <button onClick={() => setDeleteTarget(user)} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition">Delete</button>
            </div>
          </div>
        ))}
      </section>

      {editUser && (
        <Modal title="Edit User" onClose={() => setEditUser(null)}>
          {/* ── Info ── */}
          <FormField label="Email">
            <input type="email" value={editForm.email}
              onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full px-4 py-2 rounded-xl border border-[#e0ddf5] focus:outline-none focus:ring-2 focus:ring-[#1A237E]" />
          </FormField>
          <FormField label="Company">
            <select value={editForm.companyId ?? ""}
              onChange={(e) => setEditForm((f) => ({ ...f, companyId: Number(e.target.value) }))}
              className="w-full px-4 py-2 rounded-xl border border-[#e0ddf5] focus:outline-none focus:ring-2 focus:ring-[#1A237E]">
              <option value="">No company</option>
              {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </FormField>
          <FormField label="Status">
            <select value={editForm.isActive ? "1" : "0"}
              onChange={(e) => setEditForm((f) => ({ ...f, isActive: e.target.value === "1" }))}
              className="w-full px-4 py-2 rounded-xl border border-[#e0ddf5] focus:outline-none focus:ring-2 focus:ring-[#1A237E]">
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </FormField>
          {editError && <p className="text-red-600 text-sm">{editError}</p>}
          <ModalActions onCancel={() => setEditUser(null)} onConfirm={handleEdit} confirmLabel="Save Changes" loading={editLoading} />

          {/* ── Reset Password ── */}
          <div className="border-t border-[#f0eeff] pt-4 space-y-3">
            <p className="text-sm font-semibold text-[#000666]">Reset Password</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password"
                  className="w-full px-4 py-2 rounded-xl border border-[#e0ddf5] focus:outline-none focus:ring-2 focus:ring-[#1A237E] text-sm pr-10"
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#454652] text-xs">
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <button onClick={() => setNewPassword(generatePassword())}
                className="px-3 py-2 rounded-xl bg-[#e8e5ff] text-[#000666] text-sm font-semibold hover:bg-[#dcd7ff] transition whitespace-nowrap">
                Generate
              </button>
            </div>
            {resetSuccess && <p className="text-green-600 text-sm">{resetSuccess}</p>}
            {resetError && <p className="text-red-600 text-sm">{resetError}</p>}
            <button onClick={handleResetPassword} disabled={resetLoading}
              className="w-full py-2 rounded-xl bg-[#1A237E] text-white font-semibold hover:bg-[#000666] transition disabled:opacity-50 text-sm">
              {resetLoading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Delete User" onClose={() => setDeleteTarget(null)}>
          <p className="text-[#454652]">Are you sure you want to delete <strong>{deleteTarget.email}</strong>? This cannot be undone.</p>
          <ModalActions onCancel={() => setDeleteTarget(null)} onConfirm={handleDelete} confirmLabel="Delete" confirmDanger loading={deleteLoading} />
        </Modal>
      )}

    </DashboardLayout>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-[#000666]">{title}</h3>
          <button onClick={onClose} className="text-[#454652] hover:text-[#000666] text-xl font-bold">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, children }) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-semibold text-[#000666]">{label}</label>
      {children}
    </div>
  );
}

function ModalActions({ onCancel, onConfirm, confirmLabel, confirmDanger, loading }) {
  return (
    <div className="flex justify-end gap-3 pt-2">
      <button onClick={onCancel} className="px-4 py-2 rounded-xl bg-[#f3f1ff] text-[#000666] font-semibold hover:bg-[#e8e5ff] transition">Cancel</button>
      <button onClick={onConfirm} disabled={loading}
        className={`px-4 py-2 rounded-xl font-semibold transition disabled:opacity-50 ${confirmDanger ? "bg-red-500 text-white hover:bg-red-600" : "bg-[#1A237E] text-white hover:bg-[#000666]"}`}>
        {loading ? "..." : confirmLabel}
      </button>
    </div>
  );
}