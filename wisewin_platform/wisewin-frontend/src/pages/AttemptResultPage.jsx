// Shows the pass/fail result after submitting a quiz, with an option to retry if failed
import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { quizService } from "../services/quizService";

export default function AttemptResultPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // The result is passed via navigation state from AttemptPage after submission
  const result = location.state?.result;
  const assignmentId = location.state?.assignmentId;
  const [retrying, setRetrying] = useState(false);

  // Formats seconds into m:ss (e.g. 90 → "1:30")
  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${String(sec).padStart(2, "0")}`;
  };

  // Starts a new attempt for the same assignment and sends the user to the quiz screen
  const handleRetry = async () => {
    try {
      setRetrying(true);
      const attempt = await quizService.startAttempt(assignmentId);
      navigate(`/attempts/${attempt.attemptId}`);
    } catch (err) {
      alert(err.response?.data?.message || "Could not start retry.");
    } finally {
      setRetrying(false);
    }
  };

  // Guard: if the page was opened directly (no state), show a fallback message
  if (!result) {
    return (
      <div className="min-h-screen bg-[#fcf8ff] flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-10 shadow-[0_20px_60px_rgba(26,35,126,0.08)] max-w-xl w-full text-center">
          <h1 className="text-3xl font-black text-[#000666] mb-4">Result not available</h1>
          <p className="text-[#454652] mb-8">This result page was opened without submission data.</p>
          <button type="button" onClick={() => navigate("/user")}
            className="px-6 py-3 rounded-xl bg-[#000666] text-white font-semibold hover:opacity-90">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const scorePercentage = Math.round((result.finalScore / result.totalQuestions) * 100);

  return (
    <div className="min-h-screen bg-[#fcf8ff] p-8">
      <div className="max-w-2xl mx-auto">
        <div className="rounded-3xl p-10 shadow-[0_20px_60px_rgba(26,35,126,0.08)] bg-white">

          {/* Pass/fail icon and heading */}
          <div className="text-center mb-10">
            <div className={`mx-auto w-20 h-20 rounded-2xl flex items-center justify-center mb-6 ${
              result.passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}>
              <span className="material-symbols-outlined text-4xl">
                {result.passed ? "check_circle" : "cancel"}
              </span>
            </div>
            <h1 className="text-4xl font-black text-[#000666] mb-3">
              {result.passed ? "Quiz Passed" : "Quiz Failed"}
            </h1>
            <p className="text-[#454652] text-lg">{result.message}</p>
          </div>

          {/* Three stat boxes: attempt number, raw score, percentage */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <div className="rounded-2xl bg-[#f5f2ff] p-5 text-center">
              <p className="text-sm text-[#454652] mb-2">Attempt</p>
              <p className="text-2xl font-bold text-[#000666]">{result.attemptNumber}</p>
            </div>
            <div className="rounded-2xl bg-[#f5f2ff] p-5 text-center">
              <p className="text-sm text-[#454652] mb-2">Score</p>
              <p className="text-2xl font-bold text-[#000666]">{result.finalScore}/{result.totalQuestions}</p>
            </div>
            <div className="rounded-2xl bg-[#f5f2ff] p-5 text-center">
              <p className="text-sm text-[#454652] mb-2">Percentage</p>
              <p className="text-2xl font-bold text-[#000666]">{scorePercentage}%</p>
            </div>
          </div>

          {/* Detailed breakdown: allowed mistakes vs actual mistakes, and time taken */}
          <div className="rounded-2xl bg-[#e8e5ff] p-6 mb-8">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-[#454652]">Allowed wrong answers</span>
              <span className="font-semibold text-[#000666]">{result.maxWrongAnswers}</span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-[#454652]">Your wrong answers</span>
              <span className={`font-semibold ${result.passed ? "text-green-700" : "text-red-700"}`}>
                {result.wrongAnswers}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-[#454652]">Time</span>
              <span className="font-semibold text-[#000666]">{formatTime(result.timeTaken)}</span>
            </div>
          </div>

          {/* Navigation: go back to dashboard, or retry if failed */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button type="button" onClick={() => navigate("/user")}
              className="px-6 py-3 rounded-xl bg-[#000666] text-white font-semibold hover:opacity-90">
              Back to Dashboard
            </button>

            {/* Only show retry if the user failed and we have the assignmentId to restart from */}
            {!result.passed && assignmentId && (
              <button type="button" onClick={handleRetry} disabled={retrying}
                className="px-6 py-3 rounded-xl bg-[#e8e5ff] text-[#000666] font-semibold hover:bg-[#dcd7ff] disabled:opacity-50">
                {retrying ? "Starting..." : "Retry"}
              </button>
            )}
          </div>

          <p className="text-center text-xs text-[#767683] mt-8">Attempt ID: {attemptId}</p>
        </div>
      </div>
    </div>
  );
}
