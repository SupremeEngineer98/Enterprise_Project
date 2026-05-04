// The active quiz-taking screen — shows one question at a time and handles answer submission
import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { quizService } from "../services/quizService";
import { speakText, stopSpeaking } from "../utils/speech";

export default function AttemptPage() {
  const { attemptId } = useParams();   // comes from the URL: /attempts/:attemptId
  const navigate = useNavigate();
  const location = useLocation();

  // attempt holds the full state returned by the API: current score, next question, answered count, etc.
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);   // true while an answer is being sent
  const [elapsedTime, setElapsedTime] = useState(0);    // seconds since the attempt started (used for the timer)

  // Fetch the current attempt state when the page loads
  useEffect(() => {
    async function loadAttempt() {
      try {
        const data = await quizService.getAttempt(attemptId);
        setAttempt(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadAttempt();
  }, [attemptId]);

  // When there's no nextQuestion left, all questions have been answered
  const isFinished = attempt ? !attempt.nextQuestion : false;

  // Run a 1-second timer while the quiz is active — stops when finished or still loading
  useEffect(() => {
    if (loading || !attempt || isFinished) return;
    const timer = setInterval(() => setElapsedTime((t) => t + 1), 1000);
    return () => clearInterval(timer); // cleanup prevents memory leaks
  }, [loading, attempt, isFinished]);

  // Called when the user clicks an answer option
  // Sends the answer to the API, then fetches the updated attempt (which includes the next question)
  const handleAnswer = async (optionId) => {
    if (!attempt?.nextQuestion) return;
    try {
      setSubmitting(true);
      await quizService.submitAnswer(attemptId, {
        questionId: attempt.nextQuestion.id,
        selectedOptionId: optionId,
      });
      const updated = await quizService.getAttempt(attemptId);
      setAttempt(updated);
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  // Called when the user clicks "Submit Quiz" after answering all questions
  // Sends the final submission and navigates to the review page with the result
  const handleSubmitAttempt = async () => {
    try {
      const result = await quizService.submitAttempt(attemptId, { timeTaken: elapsedTime });
      navigate(`/attempts/${attemptId}/review`, {
        state: {
          result,
          assignmentId: attempt.assignmentId ?? location.state?.assignmentId,
        },
      });
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Could not submit attempt");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading attempt...</div>;
  if (!attempt) return <div className="min-h-screen flex items-center justify-center">Attempt not found</div>;

  return (
    <div className="min-h-screen bg-[#fcf8ff] p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 shadow-[0_20px_60px_rgba(26,35,126,0.08)]">

        <button type="button" onClick={() => navigate("/user")}
          className="mb-6 px-4 py-2 rounded-xl bg-[#e8e5ff] text-[#000666] font-semibold hover:bg-[#dcd7ff] transition">
          ← Back to Dashboard
        </button>

        <h1 className="text-3xl font-bold text-[#000666] mb-4">Quiz Attempt</h1>

        {/* Score summary + live timer */}
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-1 text-[#454652]">
            <p>Status: {attempt.status}</p>
            <p>Score: {attempt.currentScore}</p>
            <p>Answered: {attempt.answeredCount} / {attempt.totalQuestions}</p>
          </div>
          <div className="bg-[#000666] text-white rounded-2xl px-6 py-4 text-center">
            <p className="text-xs uppercase tracking-widest mb-1 opacity-70">Time</p>
            <p className="text-3xl font-bold">
              {Math.floor(elapsedTime / 60)}:{String(elapsedTime % 60).padStart(2, "0")}
            </p>
          </div>
        </div>

        {/* Show the current question, or the submit button if all questions are done */}
        {!isFinished ? (
          <div>
            {/* Question text with a text-to-speech button */}
            <div className="flex items-start gap-3 mb-4">
              <button type="button" onClick={() => speakText(attempt.nextQuestion.questionText, "en-US")}
                className="mt-1 shrink-0 rounded-full border border-gray-300 px-2.5 py-1 text-sm text-gray-600 hover:bg-gray-100 transition"
                title="Read question">
                🔊
              </button>
              <h2 className="text-xl font-semibold text-[#000666]">
                {attempt.answeredCount + 1}. {attempt.nextQuestion.questionText}
              </h2>
            </div>

            {/* Answer options — each has a speak button and a click-to-select button */}
            <div className="space-y-3">
              {attempt.nextQuestion.options.map((option) => (
                <div key={option.id}
                  className="flex items-center gap-3 p-4 rounded-xl bg-[#f5f2ff] hover:bg-[#e8e5ff] transition-all">
                  <button type="button"
                    onClick={(e) => { e.stopPropagation(); speakText(option.optionText, "en-US"); }}
                    className="shrink-0 rounded-full border border-gray-300 px-2.5 py-1 text-sm text-gray-600 hover:bg-gray-100 transition"
                    title="Read answer">
                    🔊
                  </button>
                  <button onClick={() => handleAnswer(option.id)} disabled={submitting}
                    className="flex-1 text-left disabled:opacity-60">
                    {option.optionText}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          // All questions answered — show the final submit button
          <div className="space-y-6">
            <p className="text-lg text-[#454652]">
              You have completed all questions. You can now submit your quiz.
            </p>
            <button onClick={handleSubmitAttempt}
              className="px-6 py-3 rounded-xl bg-[#000666] text-white font-semibold hover:opacity-90">
              Submit Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
