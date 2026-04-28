import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { quizService } from "../services/quizService";
import { speakText, stopSpeaking } from "../utils/speech";

export default function AttemptPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Load attempt
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

  // Safe derived state
  const isFinished = attempt ? !attempt.nextQuestion : false;

  // Timer
  useEffect(() => {
    if (loading || !attempt || isFinished) return;

    const timer = setInterval(() => {
      setElapsedTime((t) => t + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [loading, attempt, isFinished]);

  // Answer handler
  const handleAnswer = async (optionId) => {
    if (!attempt?.nextQuestion) return;

    try {
      setSubmitting(true);
      setFeedback(null);

      const result = await quizService.submitAnswer(attemptId, {
        questionId: attempt.nextQuestion.id,
        selectedOptionId: optionId,
      });

      setFeedback({
        message: result.message,
        isCorrect: result.isCorrect,
      });

      setTimeout(() => setFeedback(null), 1500);

      const updated = await quizService.getAttempt(attemptId);
      setAttempt(updated);
    } catch (error) {
      console.error(error);
      setFeedback(error.response?.data?.message || "Error submitting answer");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit attempt
  const handleSubmitAttempt = async () => {
    try {
      const result = await quizService.submitAttempt(attemptId, {
        timeTaken: elapsedTime,
      });

      navigate(`/attempts/${attemptId}/result`, {
        state: { result },
      });
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Could not submit attempt");
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading attempt...
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Attempt not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcf8ff] p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 shadow-[0_20px_60px_rgba(26,35,126,0.08)]">

        <h1 className="text-3xl font-bold text-[#000666] mb-4">
          Quiz Attempt
        </h1>

        {/* Timer */}
        <p className="mb-4 text-[#454652]">
          Time: {Math.floor(elapsedTime / 60)}:
          {String(elapsedTime % 60).padStart(2, "0")}
        </p>

        <div className="space-y-2 mb-8 text-[#454652]">
          <p>Status: {attempt.status}</p>
          <p>Score: {attempt.currentScore}</p>
          <p>
            Answered: {attempt.answeredCount} / {attempt.totalQuestions}
          </p>
        </div>

        {/* Question */}
        {!isFinished ? (
          <div>
            <div className="flex items-start gap-3 p-4 rounded-xl">
              <button
                type="button"
                onClick={() => speakText(attempt.nextQuestion.questionText, "en-US")}
                className="mt-1 shrink-0 rounded-full border border-gray-300 px-2.5 py-1 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition"
                title="Read question">
                  🔊
              </button>
              
              <h2 className="text-xl font-semibold text-gray-900">
                {attempt.nextQuestion.displayOrder}.{" "}
                {attempt.nextQuestion.questionText}
              </h2>
            </div>

            <div className="space-y-3">
              {attempt.nextQuestion.options.map((option) => (
                <div
                  key={option.id}
                  className="flex items-center gap-3 p-4 rounded-xl bg-[#f5f2ff] hover:bg-[#e8e5ff] transition-all"
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakText(option.optionText, "en-US");
                      }}
                      className="shrink-0 rounded-full border border-gray-300 px-2.5 py-1 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition"
                      title="Read answer"
                      >
                        🔊
                    </button>
                    
                    {/* ANSWERS */}
                    <button
                      onClick={() => handleAnswer(option.id)}
                      disabled={submitting}
                      className="flex-1 text-left disabled:opacity-60"
                      >
                        {option.optionText}
                    </button>
                </div>
              ))}
            </div>

            {feedback && (
              <div
                className={`p-4 rounded-xl font-medium ${
                  feedback.isCorrect
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                {feedback.message}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-lg text-[#454652]">
              You have completed all questions. You can now submit your quiz.
            </p>

            <button
              onClick={handleSubmitAttempt}
              className="px-6 py-3 rounded-xl bg-[#000666] text-white font-semibold hover:opacity-90"
            >
              Submit Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
}