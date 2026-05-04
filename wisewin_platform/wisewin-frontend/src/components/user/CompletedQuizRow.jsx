// A single row in the completed quizzes list — shows title, completion date, and final score
export default function CompletedQuizRow({ quiz }) {
  return (
    <div className="flex justify-between items-center p-4 rounded-xl bg-white hover:bg-[#f3f1ff] transition-all">
      <div>
        <p className="font-medium text-[#000666]">{quiz.title}</p>
        <p className="text-sm text-[#454652]">Completed: {quiz.completedAt}</p>
      </div>
      <div className="text-right">
        <p className="font-bold text-[#000666]">{quiz.score}%</p>
        <p className="text-xs text-[#454652]">Final score</p>
      </div>
    </div>
  );
}
