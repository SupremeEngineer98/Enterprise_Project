import { useLocation, useNavigate, useParams } from "react-router-dom";

export default function AttemptReviewPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const result = location.state?.result;

  if (!result) {
    return <div className="min-h-screen flex items-center justify-center">No data found.</div>;
  }

  return (
    <div className="min-h-screen bg-[#fcf8ff] p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 shadow-[0_20px_60px_rgba(26,35,126,0.08)]">
        <h1 className="text-3xl font-bold text-[#000666] mb-6">Review Your Answers</h1>

        <div className="space-y-4 mb-8">
          {result.answers.map((answer, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border-2 ${
                answer.isCorrect
                  ? "border-green-200 bg-green-50"
                  : "border-red-200 bg-red-50"
              }`}
            >
              <p className="font-semibold text-[#000666] mb-1">
                {index + 1}. {answer.questionText}
              </p>
              <p className={`text-sm ${answer.isCorrect ? "text-green-700" : "text-red-700"}`}>
                {answer.isCorrect ? "✅ Correct" : "❌ Incorrect"} — Your answer: {answer.selectedOption}
              </p>
            </div>
          ))}
        </div>

        <button
          onClick={() => navigate(`/attempts/${attemptId}/result`, { state: { result } })}
          className="px-6 py-3 rounded-xl bg-[#000666] text-white font-semibold hover:opacity-90"
        >
          See Results
        </button>
      </div>
    </div>
  );
}