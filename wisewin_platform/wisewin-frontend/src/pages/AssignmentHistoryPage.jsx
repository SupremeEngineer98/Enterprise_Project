// Shows the full attempt history for a specific assignment so the user can review all their past tries
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AttemptHistoryList from "../components/user/AttemptHistoryList";
import { quizService } from "../services/quizService";

export default function AssignmentHistoryPage() {
  const { assignmentId } = useParams();  // comes from the URL: /assignments/:assignmentId/history
  const navigate = useNavigate();

  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all attempts for this assignment on page load
  useEffect(() => {
    async function loadHistory() {
      try {
        const data = await quizService.getAssignmentAttemptHistory(assignmentId);
        setAttempts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [assignmentId]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading attempt history...</div>;

  return (
    <div className="min-h-screen bg-[#fcf8ff] p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 shadow-[0_20px_60px_rgba(26,35,126,0.08)]">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#000666]">Attempt History</h1>
            <p className="text-[#454652] mt-2">Review all attempts for this assigned quiz.</p>
          </div>
          <button type="button" onClick={() => navigate("/user")}
            className="px-4 py-2 rounded-xl bg-[#e8e5ff] text-[#000666] font-semibold hover:bg-[#dcd7ff]">
            Back
          </button>
        </div>

        {/* Renders an expandable list — each row expands to show per-question answer details */}
        <AttemptHistoryList attempts={attempts} />
      </div>
    </div>
  );
}
