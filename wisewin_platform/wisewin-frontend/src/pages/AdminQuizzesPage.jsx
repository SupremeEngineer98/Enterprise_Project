// Admin page — lists all quizzes with the ability to view questions, edit, or delete each one
import { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { quizService } from "../services/quizService";

const sidebarItems = [
  { to: "/admin", icon: "dashboard", label: "Overview" },
  { to: "/admin/companies", icon: "business", label: "Companies" },
  { to: "/admin/users", icon: "group", label: "Users" },
  { to: "/admin/super-users", icon: "manage_accounts", label: "Super Users" },
  { to: "/admin/quizzes", icon: "quiz", label: "Quizzes" },
    { to: "/admin/create-user", icon: "person_add", label: "Create User" },
];

export default function AdminQuizzesPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  // Tracks which quiz row is expanded to show its questions
  const [openQuizId, setOpenQuizId] = useState(null);
  const [questions, setQuestions] = useState({});
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Edit quiz modal state
  const [editQuiz, setEditQuiz] = useState(null);
  const [editQuizForm, setEditQuizForm] = useState({});
  const [editQuizLoading, setEditQuizLoading] = useState(false);
  const [editQuizError, setEditQuizError] = useState("");
  const [editQuizQuestions, setEditQuizQuestions] = useState([]);
  const [loadingEditQuestions, setLoadingEditQuestions] = useState(false);

  // Delete quiz confirm modal
  const [deleteQuizTarget, setDeleteQuizTarget] = useState(null);
  const [deleteQuizLoading, setDeleteQuizLoading] = useState(false);

  // Edit question modal — nested inside the quiz row
  const [editQuestion, setEditQuestion] = useState(null);
  const [editQuestionForm, setEditQuestionForm] = useState({});
  const [editQuestionLoading, setEditQuestionLoading] = useState(false);
  const [editQuestionError, setEditQuestionError] = useState("");

  const [deleteQuestionTarget, setDeleteQuestionTarget] = useState(null);
  const [deleteQuestionLoading, setDeleteQuestionLoading] = useState(false);

  useEffect(() => { loadQuizzes(); }, []);

  async function loadQuizzes() {
    try {
      const data = await quizService.getVisibleQuizzes();
      setQuizzes(data);
    } finally {
      setLoading(false);
    }
  }

  // Expands/collapses a quiz row; fetches questions on first open
  const handleToggle = async (quizId) => {
    if (openQuizId === quizId) { setOpenQuizId(null); return; }
    setOpenQuizId(quizId);
    if (questions[quizId]) return;
    try {
      setLoadingQuestions(true);
      const data = await quizService.getQuizQuestions(quizId);
      setQuestions((prev) => ({ ...prev, [quizId]: data }));
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Opens the edit quiz modal and loads its questions for the inline editor
  const openEditQuiz = async (quiz, e) => {
    e.stopPropagation();
    setEditQuiz(quiz);
    setEditQuizForm({ title: quiz.title, description: quiz.description ?? "", maxWrongAnswers: quiz.maxWrongAnswers, isActive: quiz.isActive });
    setEditQuizError("");
    setEditQuizQuestions([]);
    try {
      setLoadingEditQuestions(true);
      const data = await quizService.getQuizQuestions(quiz.id);
      setEditQuizQuestions(data);
    } finally {
      setLoadingEditQuestions(false);
    }
  };

  // Saves quiz changes and refreshes the list
  const handleEditQuiz = async () => {
    setEditQuizError("");
    if (!editQuizForm.title?.trim()) { setEditQuizError("Title is required."); return; }
    try {
      setEditQuizLoading(true);
      await quizService.updateQuiz(editQuiz.id, editQuizForm);
      setEditQuiz(null);
      await loadQuizzes();
    } catch (err) {
      setEditQuizError(err.response?.data?.message || "Failed to update quiz.");
    } finally {
      setEditQuizLoading(false);
    }
  };

  // Deletes the quiz and removes it from local state
  const handleDeleteQuiz = async () => {
    try {
      setDeleteQuizLoading(true);
      await quizService.deleteQuiz(deleteQuizTarget.id);
      setDeleteQuizTarget(null);
      setOpenQuizId(null);
      setQuestions((prev) => { const n = { ...prev }; delete n[deleteQuizTarget.id]; return n; });
      await loadQuizzes();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete quiz.");
    } finally {
      setDeleteQuizLoading(false);
    }
  };

  // Opens the edit question modal pre-filled with the question's current text and options
  const openEditQuestion = (question, quizId) => {
    setEditQuestion({ ...question, quizId });
    setEditQuestionForm({ questionText: question.questionText, options: question.options.map((o) => ({ ...o })) });
    setEditQuestionError("");
  };

  // Updates one option's text without touching the others
  const handleOptionChange = (index, value) => {
    setEditQuestionForm((f) => {
      const options = [...f.options];
      options[index] = { ...options[index], optionText: value };
      return { ...f, options };
    });
  };

  // Marks exactly one option as correct (resets all others)
  const handleCorrectChange = (index) => {
    setEditQuestionForm((f) => ({
      ...f,
      options: f.options.map((o, i) => ({ ...o, isCorrect: i === index })),
    }));
  };

  // Saves the edited question, then refreshes both the list view and the edit modal
  const handleEditQuestion = async () => {
    setEditQuestionError("");
    if (!editQuestionForm.questionText?.trim()) { setEditQuestionError("Question text is required."); return; }
    if (editQuestionForm.options.filter((o) => o.isCorrect).length !== 1) {
      setEditQuestionError("Exactly one correct answer is required."); return;
    }
    try {
      setEditQuestionLoading(true);
      await quizService.updateQuestion(editQuestion.quizId, editQuestion.id, editQuestionForm);
      // Refresh questions in both the list and the edit modal
      const updated = await quizService.getQuizQuestions(editQuestion.quizId);
      setQuestions((prev) => ({ ...prev, [editQuestion.quizId]: updated }));
      setEditQuizQuestions(updated);
      setEditQuestion(null);
    } catch (err) {
      setEditQuestionError(err.response?.data?.message || "Failed to update question.");
    } finally {
      setEditQuestionLoading(false);
    }
  };

  // Deletes the question and refreshes the question lists
  const handleDeleteQuestion = async () => {
    try {
      setDeleteQuestionLoading(true);
      await quizService.deleteQuestion(deleteQuestionTarget.quizId, deleteQuestionTarget.id);
      const updated = await quizService.getQuizQuestions(deleteQuestionTarget.quizId);
      setQuestions((prev) => ({ ...prev, [deleteQuestionTarget.quizId]: updated }));
      setEditQuizQuestions(updated);
      setDeleteQuestionTarget(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete question.");
    } finally {
      setDeleteQuestionLoading(false);
    }
  };

  return (
    <DashboardLayout sidebarItems={sidebarItems} title="Quizzes">

      <section className="relative overflow-hidden bg-[#1A237E] rounded-3xl p-10 text-white shadow-[0_30px_60px_rgba(26,35,126,0.3)]">
        <h1 className="text-4xl font-black mb-2">Quizzes</h1>
        <p className="opacity-90">Manage all training quizzes.</p>
      </section>

      <section className="mt-2 space-y-3">
        {loading ? (
          <div className="rounded-2xl bg-white p-6 text-[#454652]">Loading...</div>
        ) : quizzes.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-[#454652]">No quizzes found.</div>
        ) : quizzes.map((quiz) => {
          const isOpen = openQuizId === quiz.id;
          const qs = questions[quiz.id];

          return (
            <div key={quiz.id} className="rounded-xl bg-white shadow-sm overflow-hidden">
              <div onClick={() => handleToggle(quiz.id)} className="flex justify-between items-center p-4 cursor-pointer hover:bg-[#f3f1ff] transition-all">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#e8e5ff] flex items-center justify-center text-[#1A237E] font-bold text-sm flex-shrink-0">
                    {quiz.title[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-[#000666] truncate">{quiz.title}</p>
                    <p className="text-sm text-[#454652] truncate">{quiz.description ?? "No description"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${quiz.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {quiz.isActive ? "Active" : "Inactive"}
                  </span>
                  <button onClick={(e) => openEditQuiz(quiz, e)} className="px-3 py-1.5 rounded-lg bg-[#e8e5ff] text-[#000666] text-sm font-semibold hover:bg-[#dcd7ff] transition">Edit</button>
                  <button onClick={(e) => { e.stopPropagation(); setDeleteQuizTarget(quiz); }} className="px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-sm font-semibold hover:bg-red-100 transition">Delete</button>
                  <span className="text-sm text-[#454652] ml-1 select-none">{isOpen ? "▲" : "▼"}</span>
                </div>
              </div>

              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-[3000px] opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="px-4 pb-4 pt-2 border-t border-[#f0eeff]">
                  {loadingQuestions && isOpen && !qs ? (
                    <p className="text-sm text-[#454652]">Loading questions...</p>
                  ) : qs && qs.length === 0 ? (
                    <p className="text-sm text-[#454652]">No questions yet.</p>
                  ) : qs ? (
                    <div className="space-y-3">
                      {qs.map((q, qi) => (
                        <div key={q.id} className="p-3 rounded-xl bg-[#f8f7ff] border border-[#e8e5ff]">
                          <div className="flex justify-between items-start gap-2">
                            <p className="font-medium text-[#000666] text-sm flex-1">
                              <span className="text-[#7c6ff7] mr-1">Q{qi + 1}.</span>{q.questionText}
                            </p>
                            <div className="flex gap-1 flex-shrink-0">
                              <button onClick={() => openEditQuestion(q, quiz.id)} className="px-2 py-1 rounded-lg bg-[#e8e5ff] text-[#000666] text-xs font-semibold hover:bg-[#dcd7ff] transition">Edit</button>
                              <button onClick={() => setDeleteQuestionTarget({ ...q, quizId: quiz.id })} className="px-2 py-1 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100 transition">Delete</button>
                            </div>
                          </div>
                          <div className="mt-2 space-y-1">
                            {q.options.map((opt) => (
                              <div key={opt.id} className={`flex items-center gap-2 text-xs px-2 py-1 rounded-lg ${opt.isCorrect ? "bg-green-50 text-green-700 font-semibold" : "text-[#454652]"}`}>
                                <span>{opt.isCorrect ? "✓" : "○"}</span>{opt.optionText}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* EDIT QUIZ — now includes questions */}
      {editQuiz && (
        <Modal title="Edit Quiz" onClose={() => setEditQuiz(null)}>
          <FormField label="Title">
            <input type="text" value={editQuizForm.title} onChange={(e) => setEditQuizForm((f) => ({ ...f, title: e.target.value }))}
              className="w-full px-4 py-2 rounded-xl border border-[#e0ddf5] focus:outline-none focus:ring-2 focus:ring-[#1A237E]" />
          </FormField>
          <FormField label="Description">
            <textarea value={editQuizForm.description} onChange={(e) => setEditQuizForm((f) => ({ ...f, description: e.target.value }))}
              rows={3} className="w-full px-4 py-2 rounded-xl border border-[#e0ddf5] focus:outline-none focus:ring-2 focus:ring-[#1A237E] resize-none" />
          </FormField>
          <FormField label="Max Wrong Answers">
            <input type="number" min={0} value={editQuizForm.maxWrongAnswers} onChange={(e) => setEditQuizForm((f) => ({ ...f, maxWrongAnswers: Number(e.target.value) }))}
              className="w-full px-4 py-2 rounded-xl border border-[#e0ddf5] focus:outline-none focus:ring-2 focus:ring-[#1A237E]" />
          </FormField>
          <FormField label="Status">
            <select value={editQuizForm.isActive ? "1" : "0"} onChange={(e) => setEditQuizForm((f) => ({ ...f, isActive: e.target.value === "1" }))}
              className="w-full px-4 py-2 rounded-xl border border-[#e0ddf5] focus:outline-none focus:ring-2 focus:ring-[#1A237E]">
              <option value="1">Active</option>
              <option value="0">Inactive</option>
            </select>
          </FormField>

          {/* QUESTIONS SECTION */}
          <div className="border-t border-[#f0eeff] pt-4">
            <p className="text-sm font-semibold text-[#000666] mb-3">
              Questions ({editQuizQuestions.length})
            </p>
            {loadingEditQuestions ? (
              <p className="text-sm text-[#454652]">Loading questions...</p>
            ) : editQuizQuestions.length === 0 ? (
              <p className="text-sm text-[#454652]">No questions yet.</p>
            ) : (
              <div className="space-y-3 max-h-[40vh] overflow-y-auto">
                {editQuizQuestions.map((q, qi) => (
                  <div key={q.id} className="p-3 rounded-xl bg-[#f8f7ff] border border-[#e8e5ff]">
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <p className="font-medium text-[#000666] text-sm flex-1">
                        <span className="text-[#7c6ff7] mr-1">Q{qi + 1}.</span>{q.questionText}
                      </p>
                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => openEditQuestion(q, editQuiz.id)}
                          className="px-2 py-1 rounded-lg bg-[#e8e5ff] text-[#000666] text-xs font-semibold hover:bg-[#dcd7ff]"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteQuestionTarget({ ...q, quizId: editQuiz.id })}
                          className="px-2 py-1 rounded-lg bg-red-50 text-red-600 text-xs font-semibold hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      {q.options.map((opt) => (
                        <div key={opt.id} className={`flex items-center gap-2 text-xs px-2 py-1 rounded-lg ${opt.isCorrect ? "bg-green-50 text-green-700 font-semibold" : "text-[#454652]"}`}>
                          <span>{opt.isCorrect ? "✓" : "○"}</span>{opt.optionText}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {editQuizError && <p className="text-red-600 text-sm">{editQuizError}</p>}
          <ModalActions onCancel={() => setEditQuiz(null)} onConfirm={handleEditQuiz} confirmLabel="Save Changes" loading={editQuizLoading} />
        </Modal>
      )}

      {/* DELETE QUIZ */}
      {deleteQuizTarget && (
        <Modal title="Delete Quiz" onClose={() => setDeleteQuizTarget(null)}>
          <p className="text-[#454652]">Delete <strong>{deleteQuizTarget.title}</strong>? All questions will be removed too.</p>
          <ModalActions onCancel={() => setDeleteQuizTarget(null)} onConfirm={handleDeleteQuiz} confirmLabel="Delete" confirmDanger loading={deleteQuizLoading} />
        </Modal>
      )}

      {/* EDIT QUESTION */}
      {editQuestion && (
        <Modal title="Edit Question" onClose={() => setEditQuestion(null)}>
          <FormField label="Question Text">
            <textarea value={editQuestionForm.questionText} onChange={(e) => setEditQuestionForm((f) => ({ ...f, questionText: e.target.value }))}
              rows={3} className="w-full px-4 py-2 rounded-xl border border-[#e0ddf5] focus:outline-none focus:ring-2 focus:ring-[#1A237E] resize-none" />
          </FormField>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-[#000666]">Options <span className="text-xs font-normal text-[#454652]">(click radio to mark correct)</span></label>
            {editQuestionForm.options.map((opt, i) => (
              <div key={i} className={`flex items-center gap-2 p-2 rounded-xl border ${opt.isCorrect ? "border-green-400 bg-green-50" : "border-[#e0ddf5]"}`}>
                <input type="radio" name="correct" checked={opt.isCorrect} onChange={() => handleCorrectChange(i)} className="accent-green-600 flex-shrink-0" />
                <input type="text" value={opt.optionText} onChange={(e) => handleOptionChange(i, e.target.value)}
                  className="flex-1 px-2 py-1 rounded-lg border border-[#e0ddf5] bg-white text-sm text-[#000666] focus:outline-none focus:ring-2 focus:ring-[#1A237E]" />
              </div>
            ))}
          </div>
          {editQuestionError && <p className="text-red-600 text-sm">{editQuestionError}</p>}
          <ModalActions onCancel={() => setEditQuestion(null)} onConfirm={handleEditQuestion} confirmLabel="Save Changes" loading={editQuestionLoading} />
        </Modal>
      )}

      {/* DELETE QUESTION */}
      {deleteQuestionTarget && (
        <Modal title="Delete Question" onClose={() => setDeleteQuestionTarget(null)}>
          <p className="text-[#454652]">Delete this question?</p>
          <p className="text-sm font-medium text-[#000666] bg-[#f8f7ff] p-3 rounded-xl">{deleteQuestionTarget.questionText}</p>
          <ModalActions onCancel={() => setDeleteQuestionTarget(null)} onConfirm={handleDeleteQuestion} confirmLabel="Delete" confirmDanger loading={deleteQuestionLoading} />
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