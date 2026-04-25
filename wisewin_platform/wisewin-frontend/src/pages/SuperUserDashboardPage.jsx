import { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import StatCard from "../components/dashboard/StatCard";
import SectionCard from "../components/dashboard/SectionCard";
import UserRow from "../components/dashboard/UserRow";
import { userService } from "../services/userService";
import { quizService } from "../services/quizService";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

const sidebarItems = [
  { to: "/super-user", icon: "dashboard", label: "Overview" },
  { to: "/super-user/assign", icon: "assignment_add", label: "Assign Quiz" },
  { to: "/super-user/create-user", icon: "person_add", label: "Create User" },
  { to: "/super-user/create-quiz", icon: "quiz", label: "Create Quiz" },
  { to: "/super-user/scoreboard", icon: "leaderboard", label: "Scoreboard" },
];

function generatePassword() {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function SuperUserDashboardPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [rawUsers, setRawUsers] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [stats, setStats] = useState({ totalAssignments: 0, pendingAssignments: 0, completedAssignments: 0 });
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);

  const [scoreboardData, setScoreboardData] = useState([]);
  const [loadingScoreboard, setLoadingScoreboard] = useState(false);

  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState("");
  const [resetError, setResetError] = useState("");
  const [deleteUserTarget, setDeleteUserTarget] = useState(null);
  const [deleteUserLoading, setDeleteUserLoading] = useState(false);

  const [pendingData, setPendingData] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [completedData, setCompletedData] = useState([]);
  const [loadingCompleted, setLoadingCompleted] = useState(false);

  const [openQuizId, setOpenQuizId] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState({});
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [deleteQuizTarget, setDeleteQuizTarget] = useState(null);
  const [deleteQuizLoading, setDeleteQuizLoading] = useState(false);
  const [editQuiz, setEditQuiz] = useState(null);
  const [editQuizForm, setEditQuizForm] = useState({});
  const [editQuizLoading, setEditQuizLoading] = useState(false);
  const [editQuizError, setEditQuizError] = useState("");

  const [editQuestion, setEditQuestion] = useState(null);
  const [editQuestionForm, setEditQuestionForm] = useState({});
  const [editQuestionLoading, setEditQuestionLoading] = useState(false);
  const [editQuestionError, setEditQuestionError] = useState("");
  const [deleteQuestionTarget, setDeleteQuestionTarget] = useState(null);
  const [deleteQuestionLoading, setDeleteQuestionLoading] = useState(false);

  useEffect(() => { if (user?.companyId) loadDashboard(); }, [user]);

  async function loadDashboard() {
    try {
      const [usersData, quizzesData, statsData] = await Promise.all([
        userService.getCompanyUsers(user.companyId),
        quizService.getVisibleQuizzes(),
        userService.getCompanyAssignmentStats(user.companyId),
      ]);
      const filtered = usersData.filter((u) => u.role === "User");
      setRawUsers(filtered);
      setUsers(filtered.map((u) => ({ ...u, name: u.email.split("@")[0], assignedQuizzes: u.assignedQuizzes ?? 0, completedQuizzes: u.completedQuizzes ?? 0 })));
      setQuizzes(quizzesData);
      setStats(statsData);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function reloadUsers() {
    const updated = await userService.getCompanyUsers(user.companyId);
    const filtered = updated.filter((u) => u.role === "User");
    setRawUsers(filtered);
    setUsers(filtered.map((u) => ({ ...u, name: u.email.split("@")[0], assignedQuizzes: u.assignedQuizzes ?? 0, completedQuizzes: u.completedQuizzes ?? 0 })));
  }

  const allVisibleQuizzes = quizzes.filter((q) => q.companyId === user.companyId || q.companyId === null);

  const openScoreboard = async () => {
    setActiveModal("scoreboard");
    if (scoreboardData.length > 0) return;
    try {
      setLoadingScoreboard(true);
      const data = await userService.getUserComparison(user.companyId);
      setScoreboardData(data);
    } finally { setLoadingScoreboard(false); }
  };

  const openPending = async () => {
    setActiveModal("pending");
    if (pendingData.length > 0) return;
    try {
      setLoadingPending(true);
      const data = await userService.getUserComparison(user.companyId);
      setPendingData(data.filter((u) => u.totalPending > 0));
    } finally { setLoadingPending(false); }
  };

  const openCompleted = async () => {
    setActiveModal("completed");
    if (completedData.length > 0) return;
    try {
      setLoadingCompleted(true);
      const { data } = await api.get(`/assignments/company/${user.companyId}/completed`);
      setCompletedData(data);
    } finally { setLoadingCompleted(false); }
  };

  const openEdit = (u) => {
    setEditUser(u);
    setEditForm({ email: u.email, isActive: u.isActive });
    setEditError(""); setNewPassword(""); setResetSuccess(""); setResetError(""); setShowPassword(false);
  };

  const handleEdit = async () => {
    setEditError("");
    if (!editForm.email?.trim()) { setEditError("Email is required."); return; }
    try {
      setEditLoading(true);
      await userService.updateUser(editUser.id, editForm);
      setEditUser(null);
      await reloadUsers();
    } catch (err) { setEditError(err.response?.data?.message || "Failed."); }
    finally { setEditLoading(false); }
  };

  const handleResetPassword = async () => {
    setResetError(""); setResetSuccess("");
    if (!newPassword.trim()) { setResetError("Enter or generate a password."); return; }
    try {
      setResetLoading(true);
      await userService.changePassword(editUser.id, { newPassword });
      setResetSuccess("Password updated!"); setNewPassword("");
    } catch (err) { setResetError(err.response?.data?.message || "Failed."); }
    finally { setResetLoading(false); }
  };

  const handleDeleteUser = async () => {
    try {
      setDeleteUserLoading(true);
      await userService.deleteUser(deleteUserTarget.id);
      setDeleteUserTarget(null);
      await reloadUsers();
    } catch (err) { alert(err.response?.data?.message || "Failed."); }
    finally { setDeleteUserLoading(false); }
  };

  const handleToggleQuiz = async (quizId) => {
    if (openQuizId === quizId) { setOpenQuizId(null); return; }
    setOpenQuizId(quizId);
    if (quizQuestions[quizId]) return;
    try {
      setLoadingQuestions(true);
      const data = await quizService.getQuizQuestions(quizId);
      setQuizQuestions((prev) => ({ ...prev, [quizId]: data }));
    } finally { setLoadingQuestions(false); }
  };

  const openEditQuiz = (quiz) => {
    setEditQuiz(quiz);
    setEditQuizForm({ title: quiz.title, description: quiz.description ?? "", maxWrongAnswers: quiz.maxWrongAnswers, isActive: quiz.isActive });
    setEditQuizError("");
  };

  const handleEditQuiz = async () => {
    setEditQuizError("");
    if (!editQuizForm.title?.trim()) { setEditQuizError("Title is required."); return; }
    try {
      setEditQuizLoading(true);
      await quizService.updateQuiz(editQuiz.id, editQuizForm);
      setEditQuiz(null);
      const updated = await quizService.getVisibleQuizzes();
      setQuizzes(updated);
    } catch (err) { setEditQuizError(err.response?.data?.message || "Failed."); }
    finally { setEditQuizLoading(false); }
  };

  const handleDeleteQuiz = async () => {
    try {
      setDeleteQuizLoading(true);
      await quizService.deleteQuiz(deleteQuizTarget.id);
      setDeleteQuizTarget(null);
      setOpenQuizId(null);
      setQuizQuestions((prev) => { const n = { ...prev }; delete n[deleteQuizTarget.id]; return n; });
      const updated = await quizService.getVisibleQuizzes();
      setQuizzes(updated);
    } catch (err) { alert(err.response?.data?.message || "Failed."); }
    finally { setDeleteQuizLoading(false); }
  };

  const openEditQuestion = (question, quizId) => {
    setEditQuestion({ ...question, quizId });
    setEditQuestionForm({ questionText: question.questionText, options: question.options.map((o) => ({ ...o })) });
    setEditQuestionError("");
  };

  const handleOptionChange = (index, value) => {
    setEditQuestionForm((f) => { const options = [...f.options]; options[index] = { ...options[index], optionText: value }; return { ...f, options }; });
  };

  const handleCorrectChange = (index) => {
    setEditQuestionForm((f) => ({ ...f, options: f.options.map((o, i) => ({ ...o, isCorrect: i === index })) }));
  };

  const handleEditQuestion = async () => {
    setEditQuestionError("");
    if (!editQuestionForm.questionText?.trim()) { setEditQuestionError("Question text is required."); return; }
    if (editQuestionForm.options.filter((o) => o.isCorrect).length !== 1) { setEditQuestionError("Exactly one correct answer required."); return; }
    try {
      setEditQuestionLoading(true);
      await quizService.updateQuestion(editQuestion.quizId, editQuestion.id, editQuestionForm);
      const updated = await quizService.getQuizQuestions(editQuestion.quizId);
      setQuizQuestions((prev) => ({ ...prev, [editQuestion.quizId]: updated }));
      setEditQuestion(null);
    } catch (err) { setEditQuestionError(err.response?.data?.message || "Failed."); }
    finally { setEditQuestionLoading(false); }
  };

  const handleDeleteQuestion = async () => {
    try {
      setDeleteQuestionLoading(true);
      await quizService.deleteQuestion(deleteQuestionTarget.quizId, deleteQuestionTarget.id);
      const updated = await quizService.getQuizQuestions(deleteQuestionTarget.quizId);
      setQuizQuestions((prev) => ({ ...prev, [deleteQuestionTarget.quizId]: updated }));
      setDeleteQuestionTarget(null);
    } catch (err) { alert(err.response?.data?.message || "Failed."); }
    finally { setDeleteQuestionLoading(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <DashboardLayout sidebarItems={sidebarItems} title="Super User Dashboard">
      <div>
        <h1 className="text-3xl font-bold text-[#000666]">Workforce Intelligence</h1>
        <p className="text-[#454652] mt-2">Monitor employee training progress and manage quiz assignments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="cursor-pointer hover:scale-[1.02] transition" onClick={() => setActiveModal("users")}>
          <StatCard title="Users" value={users.length} icon="group" />
        </div>
        <div className="cursor-pointer hover:scale-[1.02] transition" onClick={openPending}>
          <StatCard title="Pending Assignments" value={stats.pendingAssignments} icon="schedule" />
        </div>
        <div className="cursor-pointer hover:scale-[1.02] transition" onClick={openCompleted}>
          <StatCard title="Completed Assignments" value={stats.completedAssignments} icon="check_circle" />
        </div>
        <div className="cursor-pointer hover:scale-[1.02] transition" onClick={() => setActiveModal("quizzes")}>
          <StatCard title="Visible Quizzes" value={allVisibleQuizzes.length} icon="quiz" />
        </div>
      </div>

      <SectionCard title="User Intelligence">
        <div className="space-y-2">
          {users.map((u) => <UserRow key={u.email} user={u} />)}
        </div>
      </SectionCard>

      {activeModal === "users" && (
        <Modal title={`Company Users (${rawUsers.length})`} onClose={() => setActiveModal(null)}>
          <div className="space-y-2 max-h-[55vh] overflow-y-auto">
            {rawUsers.map((u) => (
              <div key={u.id} className="flex justify-between items-center p-3 rounded-xl bg-[#f8f7ff]">
                <div>
                  <p className="font-medium text-[#000666] text-sm">{u.email}</p>
                  <span className={`text-xs font-bold ${u.isActive ? "text-green-600" : "text-red-500"}`}>{u.isActive ? "Active" : "Inactive"}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(u)} className="px-3 py-1.5 rounded-lg bg-[#e8e5ff] text-[#000666] text-xs font-semibold hover:bg-[#dcd7ff]">Edit</button>
                  <button onClick={() => setDeleteUserTarget(u)} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {activeModal === "pending" && (
        <Modal title="Pending Assignments" onClose={() => setActiveModal(null)}>
          {loadingPending ? <p className="text-sm text-[#454652]">Loading...</p>
          : pendingData.length === 0 ? <p className="text-sm text-[#454652]">No pending assignments.</p>
          : (
            <div className="space-y-2 max-h-[55vh] overflow-y-auto">
              {pendingData.map((u) => (
                <div key={u.userId} className="flex justify-between items-center p-3 rounded-xl bg-[#f8f7ff]">
                  <p className="font-medium text-[#000666] text-sm">{u.email}</p>
                  <span className="inline-flex px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">{u.totalPending} pending</span>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {activeModal === "completed" && (
        <Modal title="Completed Assignments" onClose={() => setActiveModal(null)}>
          {loadingCompleted ? <p className="text-sm text-[#454652]">Loading...</p>
          : completedData.length === 0 ? <p className="text-sm text-[#454652]">No completed assignments yet.</p>
          : (
            <div className="space-y-2 max-h-[55vh] overflow-y-auto">
              {completedData.map((item, i) => (
                <div key={i} className="p-3 rounded-xl bg-[#f8f7ff] space-y-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-[#000666] text-sm">{item.email}</p>
                      <p className="text-xs text-[#454652]">{item.quizTitle}</p>
                    </div>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${item.passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {item.passed ? "Passed" : "Failed"}
                    </span>
                  </div>
                  <div className="flex gap-3 text-xs text-[#454652]">
                    <span>Score: {item.score}/{item.totalQuestions}</span>
                    <span>Attempt #{item.attemptNumber}</span>
                    {item.timeTaken && <span>⏱ {item.timeTaken}</span>}
                    {item.completedAt && <span>{new Date(item.completedAt).toLocaleDateString()}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {activeModal === "quizzes" && (
        <Modal title="Quizzes" onClose={() => setActiveModal(null)}>
          <div className="space-y-2 max-h-[65vh] overflow-y-auto">
            {allVisibleQuizzes.length === 0 ? <p className="text-sm text-[#454652]">No quizzes.</p>
            : allVisibleQuizzes.map((q) => {
              const isOpen = openQuizId === q.id;
              const qs = quizQuestions[q.id];
              const isCompanyQuiz = q.companyId === user.companyId;
              return (
                <div key={q.id} className="rounded-xl bg-[#f8f7ff] overflow-hidden">
                  <div className="flex justify-between items-center p-3 cursor-pointer" onClick={() => handleToggleQuiz(q.id)}>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#000666] text-sm truncate">{q.title}</p>
                      <p className="text-xs text-[#454652]">{isCompanyQuiz ? "Company quiz" : "Platform quiz"}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-2" onClick={(e) => e.stopPropagation()}>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${q.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {q.isActive ? "Active" : "Inactive"}
                      </span>
                      {isCompanyQuiz && (
                        <>
                          <button onClick={() => openEditQuiz(q)} className="px-2 py-1 rounded-lg bg-[#e8e5ff] text-[#000666] text-xs font-semibold hover:bg-[#dcd7ff]">Edit</button>
                          <button onClick={() => setDeleteQuizTarget(q)} className="px-2 py-1 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100">Delete</button>
                        </>
                      )}
                      <span className="text-xs text-[#454652]">{isOpen ? "▲" : "▼"}</span>
                    </div>
                  </div>
                  {isOpen && (
                    <div className="px-3 pb-3 border-t border-[#e8e5ff] pt-2 space-y-2">
                      {loadingQuestions && !qs ? <p className="text-xs text-[#454652]">Loading...</p>
                      : qs && qs.length === 0 ? <p className="text-xs text-[#454652]">No questions.</p>
                      : qs ? qs.map((question, qi) => (
                        <div key={question.id} className="p-2 rounded-lg bg-white border border-[#e8e5ff]">
                          <div className="flex justify-between items-start gap-2">
                            <p className="text-xs font-medium text-[#000666] flex-1">
                              <span className="text-[#7c6ff7]">Q{qi + 1}. </span>{question.questionText}
                            </p>
                            {isCompanyQuiz && (
                              <div className="flex gap-1 flex-shrink-0">
                                <button onClick={() => openEditQuestion(question, q.id)} className="px-2 py-0.5 rounded bg-[#e8e5ff] text-[#000666] text-xs font-semibold">Edit</button>
                                <button onClick={() => setDeleteQuestionTarget({ ...question, quizId: q.id })} className="px-2 py-0.5 rounded bg-red-50 text-red-600 text-xs font-semibold">Del</button>
                              </div>
                            )}
                          </div>
                          <div className="mt-1 space-y-0.5">
                            {question.options.map((opt) => (
                              <div key={opt.id} className={`text-xs px-2 py-0.5 rounded flex items-center gap-1 ${opt.isCorrect ? "bg-green-50 text-green-700 font-semibold" : "text-[#454652]"}`}>
                                <span>{opt.isCorrect ? "✓" : "○"}</span>{opt.optionText}
                              </div>
                            ))}
                          </div>
                        </div>
                      )) : null}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Modal>
      )}

      {editUser && (
        <Modal title="Edit User" onClose={() => setEditUser(null)}>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-[#000666]">Email</label>
            <input type="email" value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))}
              className="w-full px-4 py-2 rounded-xl border border-[#e0ddf5] focus:outline-none focus:ring-2 focus:ring-[#1A237E]" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-[#000666]">Status</label>
            <select value={editForm.isActive ? "1" : "0"} onChange={(e) => setEditForm((f) => ({ ...f, isActive: e.target.value === "1" }))}
              className="w-full px-4 py-2 rounded-xl border border-[#e0ddf5] focus:outline-none focus:ring-2 focus:ring-[#1A237E]">
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>
          {editError && <p className="text-red-600 text-sm">{editError}</p>}
          <div className="flex justify-end gap-3">
            <button onClick={() => setEditUser(null)} className="px-4 py-2 rounded-xl bg-[#f3f1ff] text-[#000666] font-semibold">Cancel</button>
            <button onClick={handleEdit} disabled={editLoading} className="px-4 py-2 rounded-xl bg-[#1A237E] text-white font-semibold disabled:opacity-50">{editLoading ? "..." : "Save"}</button>
          </div>
          <div className="border-t border-[#f0eeff] pt-4 space-y-3">
            <p className="text-sm font-semibold text-[#000666]">Reset Password</p>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password"
                  className="w-full px-4 py-2 rounded-xl border border-[#e0ddf5] focus:outline-none text-sm pr-16" />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#454652] text-xs">
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <button onClick={() => setNewPassword(generatePassword())} className="px-3 py-2 rounded-xl bg-[#e8e5ff] text-[#000666] text-sm font-semibold whitespace-nowrap">Generate</button>
            </div>
            {resetSuccess && <p className="text-green-600 text-sm">{resetSuccess}</p>}
            {resetError && <p className="text-red-600 text-sm">{resetError}</p>}
            <button onClick={handleResetPassword} disabled={resetLoading} className="w-full py-2 rounded-xl bg-[#1A237E] text-white font-semibold disabled:opacity-50 text-sm">
              {resetLoading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </Modal>
      )}

      {deleteUserTarget && (
        <Modal title="Delete User" onClose={() => setDeleteUserTarget(null)}>
          <p className="text-[#454652]">Delete <strong>{deleteUserTarget.email}</strong>? This cannot be undone.</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setDeleteUserTarget(null)} className="px-4 py-2 rounded-xl bg-[#f3f1ff] text-[#000666] font-semibold">Cancel</button>
            <button onClick={handleDeleteUser} disabled={deleteUserLoading} className="px-4 py-2 rounded-xl bg-red-500 text-white font-semibold disabled:opacity-50">{deleteUserLoading ? "..." : "Delete"}</button>
          </div>
        </Modal>
      )}

      {editQuiz && (
        <Modal title="Edit Quiz" onClose={() => setEditQuiz(null)}>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-[#000666]">Title</label>
            <input type="text" value={editQuizForm.title} onChange={(e) => setEditQuizForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full px-4 py-2 rounded-xl border border-[#e0ddf5] focus:outline-none focus:ring-2 focus:ring-[#1A237E]" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-[#000666]">Description</label>
            <textarea value={editQuizForm.description} onChange={(e) => setEditQuizForm((f) => ({ ...f, description: e.target.value }))}
              rows={2} className="w-full px-4 py-2 rounded-xl border border-[#e0ddf5] focus:outline-none resize-none" />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-[#000666]">Status</label>
            <select value={editQuizForm.isActive ? "1" : "0"} onChange={(e) => setEditQuizForm((f) => ({ ...f, isActive: e.target.value === "1" }))}
              className="w-full px-4 py-2 rounded-xl border border-[#e0ddf5] focus:outline-none">
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </div>
          {editQuizError && <p className="text-red-600 text-sm">{editQuizError}</p>}
          <div className="flex justify-end gap-3">
            <button onClick={() => setEditQuiz(null)} className="px-4 py-2 rounded-xl bg-[#f3f1ff] text-[#000666] font-semibold">Cancel</button>
            <button onClick={handleEditQuiz} disabled={editQuizLoading} className="px-4 py-2 rounded-xl bg-[#1A237E] text-white font-semibold disabled:opacity-50">{editQuizLoading ? "..." : "Save"}</button>
          </div>
        </Modal>
      )}

      {deleteQuizTarget && (
        <Modal title="Delete Quiz" onClose={() => setDeleteQuizTarget(null)}>
          <p className="text-[#454652]">Delete <strong>{deleteQuizTarget.title}</strong>? All questions will be removed.</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setDeleteQuizTarget(null)} className="px-4 py-2 rounded-xl bg-[#f3f1ff] text-[#000666] font-semibold">Cancel</button>
            <button onClick={handleDeleteQuiz} disabled={deleteQuizLoading} className="px-4 py-2 rounded-xl bg-red-500 text-white font-semibold disabled:opacity-50">{deleteQuizLoading ? "..." : "Delete"}</button>
          </div>
        </Modal>
      )}

      {editQuestion && (
        <Modal title="Edit Question" onClose={() => setEditQuestion(null)}>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-[#000666]">Question Text</label>
            <textarea value={editQuestionForm.questionText} onChange={(e) => setEditQuestionForm((f) => ({ ...f, questionText: e.target.value }))}
              rows={3} className="w-full px-4 py-2 rounded-xl border border-[#e0ddf5] focus:outline-none resize-none" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#000666]">Options <span className="text-xs font-normal text-[#454652]">(select correct)</span></label>
            {editQuestionForm.options.map((opt, i) => (
              <div key={i} className={`flex items-center gap-2 p-2 rounded-xl border ${opt.isCorrect ? "border-green-400 bg-green-50" : "border-[#e0ddf5]"}`}>
                <input type="radio" name="correct" checked={opt.isCorrect} onChange={() => handleCorrectChange(i)} className="accent-green-600 flex-shrink-0" />
                <input type="text" value={opt.optionText} onChange={(e) => handleOptionChange(i, e.target.value)}
                  className="flex-1 px-2 py-1 rounded-lg border border-[#e0ddf5] bg-white text-sm text-[#000666] focus:outline-none" />
              </div>
            ))}
          </div>
          {editQuestionError && <p className="text-red-600 text-sm">{editQuestionError}</p>}
          <div className="flex justify-end gap-3">
            <button onClick={() => setEditQuestion(null)} className="px-4 py-2 rounded-xl bg-[#f3f1ff] text-[#000666] font-semibold">Cancel</button>
            <button onClick={handleEditQuestion} disabled={editQuestionLoading} className="px-4 py-2 rounded-xl bg-[#1A237E] text-white font-semibold disabled:opacity-50">{editQuestionLoading ? "..." : "Save"}</button>
          </div>
        </Modal>
      )}

      {deleteQuestionTarget && (
        <Modal title="Delete Question" onClose={() => setDeleteQuestionTarget(null)}>
          <p className="text-sm font-medium text-[#000666] bg-[#f8f7ff] p-3 rounded-xl">{deleteQuestionTarget.questionText}</p>
          <div className="flex justify-end gap-3">
            <button onClick={() => setDeleteQuestionTarget(null)} className="px-4 py-2 rounded-xl bg-[#f3f1ff] text-[#000666] font-semibold">Cancel</button>
            <button onClick={handleDeleteQuestion} disabled={deleteQuestionLoading} className="px-4 py-2 rounded-xl bg-red-500 text-white font-semibold disabled:opacity-50">{deleteQuestionLoading ? "..." : "Delete"}</button>
          </div>
        </Modal>
      )}

 

    </DashboardLayout>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4 mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-[#000666]">{title}</h3>
          <button onClick={onClose} className="text-[#454652] hover:text-[#000666] text-xl font-bold">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}