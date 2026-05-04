// Admin page — view, create, edit, and delete companies. Clicking a company expands its users and quizzes.
import { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { companyService } from "../services/companyService";

const sidebarItems = [
  { to: "/admin", icon: "dashboard", label: "Overview" },
  { to: "/admin/companies", icon: "business", label: "Companies" },
  { to: "/admin/users", icon: "group", label: "Users" },
  { to: "/admin/super-users", icon: "manage_accounts", label: "Super Users" },
  { to: "/admin/quizzes", icon: "quiz", label: "Quizzes" },
];

const EMPTY_FORM = { name: "", status: "ACTIVE" };

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tracks which company row is currently expanded to show users/quizzes
  const [openCompanyId, setOpenCompanyId] = useState(null);
  const [details, setDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState(false);

  // ── Modal state: create, edit, and delete each have their own fields ──
  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_FORM);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");

  // Edit modal — holds the company being edited and its form data
  const [editCompany, setEditCompany] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete confirm — holds the company to be deleted so the modal knows who to delete
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, []);

  async function loadCompanies() {
    try {
      const data = await companyService.getAllCompanies();
      setCompanies(data);
    } finally {
      setLoading(false);
    }
  }

  // Expands or collapses a company row; fetches full details on first open
  const handleToggle = async (companyId) => {
    if (openCompanyId === companyId) {
      setOpenCompanyId(null);
      return;
    }

    setOpenCompanyId(companyId);
    if (details[companyId]) return;

    try {
      setLoadingDetails(true);
      const data = await companyService.getCompanyDetails(companyId);
      setDetails((prev) => ({ ...prev, [companyId]: data }));
    } finally {
      setLoadingDetails(false);
    }
  };

  // Creates a new company and refreshes the list
  const handleCreate = async () => {
    setCreateError("");
    if (!createForm.name.trim()) {
      setCreateError("Company name is required.");
      return;
    }
    try {
      setCreateLoading(true);
      await companyService.createCompany(createForm);
      setShowCreate(false);
      setCreateForm(EMPTY_FORM);
      await loadCompanies();
    } catch (err) {
      setCreateError(err.response?.data?.message || "Failed to create company.");
    } finally {
      setCreateLoading(false);
    }
  };

  // Opens the edit modal pre-filled with the company's current values
  const openEdit = (company, e) => {
    e.stopPropagation();
    setEditCompany(company);
    setEditForm({ name: company.name, status: company.status });
    setEditError("");
  };

  const handleEdit = async () => {
    setEditError("");
    if (!editForm.name.trim()) {
      setEditError("Company name is required.");
      return;
    }
    try {
      setEditLoading(true);
      console.log("editCompany.id:", editCompany.id, "editForm:", editForm);
      await companyService.updateCompany(editCompany.id, editForm);
      setEditCompany(null);
      // Invalidate cached details for this company
      setDetails((prev) => {
        const next = { ...prev };
        delete next[editCompany.id];
        return next;
      });
      await loadCompanies();
    } catch (err) {
      setEditError(err.response?.data?.message || "Failed to update company.");
    } finally {
      setEditLoading(false);
    }
  };

  // Deletes the company and removes it from local state and the details cache
  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await companyService.deleteCompany(deleteTarget.id);
      setDeleteTarget(null);
      setOpenCompanyId(null);
      setDetails((prev) => {
        const next = { ...prev };
        delete next[deleteTarget.id];
        return next;
      });
      await loadCompanies();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete company.");
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading companies...
      </div>
    );
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems} title="Companies Management">

      {/* HEADER */}
      <section className="relative overflow-hidden bg-[#1A237E] rounded-3xl p-10 text-white shadow-[0_30px_60px_rgba(26,35,126,0.3)]">
        <h1 className="text-4xl font-black mb-2">Companies</h1>
        <p className="opacity-90">Manage all client companies in the system.</p>
      </section>

      {/* ADD BUTTON */}
      <div className="flex justify-end">
        <button
          onClick={() => { setShowCreate(true); setCreateError(""); setCreateForm(EMPTY_FORM); }}
          className="px-5 py-2.5 rounded-xl bg-[#1A237E] text-white font-semibold hover:bg-[#000666] transition"
        >
          + Add Company
        </button>
      </div>

      {/* LIST */}
      <section className="mt-2 space-y-3">
        {companies.length === 0 && (
          <div className="rounded-2xl bg-white p-6 text-[#454652]">No companies found.</div>
        )}

        {companies.map((company) => {
          const isOpen = openCompanyId === company.id;
          const data = details[company.id];

          return (
            <div key={company.id} className="rounded-xl bg-white shadow-sm overflow-hidden">

              {/* ROW HEADER */}
              <div
                onClick={() => handleToggle(company.id)}
                className="flex justify-between items-center p-4 cursor-pointer hover:bg-[#f3f1ff] transition-all"
              >
                <div>
                  <p className="font-medium text-[#000666]">{company.name}</p>
                  <p className="text-sm text-[#454652]">{company.status}</p>
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => openEdit(company, e)}
                    className="px-3 py-1.5 rounded-lg bg-[#e8e5ff] text-[#000666] text-sm font-semibold hover:bg-[#dcd7ff] transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(company); }}
                    className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition"
                  >
                    Delete
                  </button>
                  <span className="text-sm text-[#454652] ml-2 select-none">
                    {isOpen ? "▲" : "▼"}
                  </span>
                </div>
              </div>

              {/* DROPDOWN */}
              <div
                className={`px-4 overflow-hidden transition-all duration-300 ease-in-out ${
                  isOpen ? "max-h-[600px] py-4 opacity-100" : "max-h-0 py-0 opacity-0"
                }`}
              >
                {loadingDetails && isOpen && !data && (
                  <p className="text-sm text-[#454652]">Loading details...</p>
                )}

                {data && (
                  <div className="space-y-4">
                    {/* USERS */}
                    <div>
                      <p className="font-semibold text-[#000666] mb-2">
                        Users ({data.users?.length ?? 0})
                      </p>
                      {data.users?.length === 0 ? (
                        <p className="text-sm text-[#454652]">No users assigned.</p>
                      ) : (
                        <div className="space-y-1">
                          {data.users.map((u) => (
                            <div key={u.id} className="flex items-center gap-2 text-sm text-[#454652]">
                              <span className="material-icons text-base text-[#1A237E]">person</span>
                              {u.email}
                              <span className="ml-auto text-xs bg-[#e8e5ff] text-[#000666] px-2 py-0.5 rounded-full">
                                {u.role}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* QUIZZES */}
                    <div>
                      <p className="font-semibold text-[#000666] mb-2">
                        Quizzes ({data.quizzes?.length ?? 0})
                      </p>
                      {data.quizzes?.length === 0 ? (
                        <p className="text-sm text-[#454652]">No quizzes assigned.</p>
                      ) : (
                        <div className="space-y-1">
                          {data.quizzes.map((q) => (
                            <div key={q.id} className="flex items-center gap-2 text-sm text-[#454652]">
                              <span className="material-icons text-base text-[#1A237E]">quiz</span>
                              {q.title}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </section>

      {/* ── CREATE MODAL ─────────────────────────────── */}
      {showCreate && (
        <Modal title="Create Company" onClose={() => setShowCreate(false)}>
          <FormField label="Company Name">
            <input
              type="text"
              value={createForm.name}
              onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Acme Logistics"
              className="w-full px-4 py-2 rounded-xl border border-[#e0ddf5] focus:outline-none focus:ring-2 focus:ring-[#1A237E]"
            />
          </FormField>

          <FormField label="Status">
            <select
              value={createForm.status}
              onChange={(e) => setCreateForm((f) => ({ ...f, status: e.target.value }))}
              className="w-full px-4 py-2 rounded-xl border border-[#e0ddf5] focus:outline-none focus:ring-2 focus:ring-[#1A237E]"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
            </select>
          </FormField>

          {createError && <p className="text-red-600 text-sm">{createError}</p>}

          <ModalActions
            onCancel={() => setShowCreate(false)}
            onConfirm={handleCreate}
            confirmLabel="Create"
            loading={createLoading}
          />
        </Modal>
      )}

      {/* ── EDIT MODAL ───────────────────────────────── */}
      {editCompany && (
        <Modal title="Edit Company" onClose={() => setEditCompany(null)}>
          <FormField label="Company Name">
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-4 py-2 rounded-xl border border-[#e0ddf5] focus:outline-none focus:ring-2 focus:ring-[#1A237E]"
            />
          </FormField>

          <FormField label="Status">
            <select
              value={editForm.status}
              onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
              className="w-full px-4 py-2 rounded-xl border border-[#e0ddf5] focus:outline-none focus:ring-2 focus:ring-[#1A237E]"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
            </select>
          </FormField>

          {editError && <p className="text-red-600 text-sm">{editError}</p>}

          <ModalActions
            onCancel={() => setEditCompany(null)}
            onConfirm={handleEdit}
            confirmLabel="Save Changes"
            loading={editLoading}
          />
        </Modal>
      )}

      {/* ── DELETE CONFIRM ───────────────────────────── */}
      {deleteTarget && (
        <Modal title="Delete Company" onClose={() => setDeleteTarget(null)}>
          <p className="text-[#454652]">
            Are you sure you want to delete <strong>{deleteTarget.name}</strong>?
            This action cannot be undone.
          </p>
          <ModalActions
            onCancel={() => setDeleteTarget(null)}
            onConfirm={handleDelete}
            confirmLabel="Delete"
            confirmDanger
            loading={deleteLoading}
          />
        </Modal>
      )}

    </DashboardLayout>
  );
}

// ── Reusable mini-components shared across all modals on this page ──

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 mx-4">
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
      <button
        onClick={onCancel}
        className="px-4 py-2 rounded-xl bg-[#f3f1ff] text-[#000666] font-semibold hover:bg-[#e8e5ff] transition"
      >
        Cancel
      </button>
      <button
        onClick={onConfirm}
        disabled={loading}
        className={`px-4 py-2 rounded-xl font-semibold transition disabled:opacity-50 ${
          confirmDanger
            ? "bg-red-500 text-white hover:bg-red-600"
            : "bg-[#1A237E] text-white hover:bg-[#000666]"
        }`}
      >
        {loading ? "..." : confirmLabel}
      </button>
    </div>
  );
}