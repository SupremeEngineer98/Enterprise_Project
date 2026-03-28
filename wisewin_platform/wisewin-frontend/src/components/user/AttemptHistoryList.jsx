export default function AttemptHistoryList({ attempts }) {
  if (!attempts?.length) {
    return (
      <div className="rounded-2xl bg-[#f5f2ff] p-4 text-sm text-[#454652]">
        No attempts yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {attempts.map((attempt) => (
        <div
          key={attempt.attemptId}
          className="flex justify-between items-center p-4 rounded-xl bg-white hover:bg-[#f3f1ff] transition-all"
        >
          <div>
            <p className="font-medium text-[#000666]">
              Attempt {attempt.attemptNumber}
            </p>
            <p className="text-sm text-[#454652]">
              Score: {attempt.score}/{attempt.totalQuestions}
            </p>
          </div>

          <div className="text-right">
            <span
              className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                attempt.passed === true
                  ? "bg-green-100 text-green-700"
                  : attempt.passed === false
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {attempt.passed === true
                ? "Passed"
                : attempt.passed === false
                ? "Failed"
                : "In Progress"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}