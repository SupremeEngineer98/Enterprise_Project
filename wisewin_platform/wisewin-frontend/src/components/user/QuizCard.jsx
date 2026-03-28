import StatusBadge from "./StatusBadge";

export default function QuizCard({ quiz, onAction }) {
  const ctaLabel = quiz.status === "IN_PROGRESS" ? "Resume Quiz" : "Start Quiz";

  return (
    <div className="bg-[#ffffff] rounded-2xl p-6 flex flex-col border-l-4 border-[#83439E] shadow-[0_6px_20px_rgba(26,35,126,0.05)] hover:scale-[1.02] transition-all">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="w-12 h-12 rounded-xl bg-[#83439E]/10 text-[#83439E] flex items-center justify-center">
          <span className="material-symbols-outlined">quiz</span>
        </div>
        <StatusBadge status={quiz.status} />
      </div>

      <h3 className="font-bold text-lg text-[#000666] mb-2">{quiz.title}</h3>
      <p className="text-sm text-[#454652] flex-1 mb-6">{quiz.description}</p>

      <div className="space-y-2 mb-4 text-sm text-[#454652]">
        <p>Due: {quiz.dueDate}</p>
        <p>Estimated duration: {quiz.duration} mins</p>
      </div>

      <button
        type="button"
        onClick={() => onAction?.(quiz)}
        className="w-full py-3 rounded-xl font-bold transition-all bg-[#e8e5ff] text-[#000666] hover:bg-[#000666] hover:text-white"
      >
        {ctaLabel}
      </button>
    </div>
  );
}