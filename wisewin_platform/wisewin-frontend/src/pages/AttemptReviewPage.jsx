// Read-only review of all answers from a completed attempt — shows which ones were right or wrong
import { useLocation, useNavigate, useParams } from "react-router-dom";

export default function AttemptReviewPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Result data is passed via navigation state — no API call needed, we already have it
  const result = location.state?.result;
  const assignmentId = location.state?.assignmentId;

  // Guard: if someone navigates here directly without data, show a fallback
  if (!result) {
    return <div className="min-h-screen flex items-center justify-center">No data found.</div>;
  }

  return (
    <div className="min-h-screen bg-[#fcf8ff] p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 shadow-[0_20px_60px_rgba(26,35,126,0.08)]">
        <h1 className="text-3xl font-bold text-[#000666] mb-6">Review Your Answers</h1>

        {/* List of all questions with colour-coded correct/incorrect answers */}
        <div className="space-y-4 mb-8">
          {result.answers.map((answer, index) => (
            <div key={index}
              className={`p-4 rounded-xl border-2 ${
                answer.isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
              }`}>
              <p className="font-semibold text-[#000666] mb-1">
                {index + 1}. {answer.questionText}
              </p>
              {/* Shows ✅ or ❌ next to what the user picked */}
              <p className={`text-sm ${answer.isCorrect ? "text-green-700" : "text-red-700"}`}>
                {answer.isCorrect ? "✅ Correct" : "❌ Incorrect"} — Your answer: {answer.selectedOption}
              </p>
            </div>
          ))}
        </div>

        {/* Go back to the result page, passing the same state so the result page still works */}
        <button onClick={() => navigate(`/attempts/${attemptId}/result`, { state: { result, assignmentId } })}
          className="px-6 py-3 rounded-xl bg-[#000666] text-white font-semibold hover:opacity-90">
          See Results
        </button>
      </div>
    </div>
  );
}
