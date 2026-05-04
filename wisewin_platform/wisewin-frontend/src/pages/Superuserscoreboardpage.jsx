// Super user view of the company scoreboard — ranks all regular users by quiz performance
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/layout/DashboardLayout";
import { userService } from "../services/userService";
import { useAuth } from "../context/AuthContext";

const sidebarItems = [
  { to: "/super-user", icon: "dashboard", label: "Overview" },
  { to: "/super-user/assign", icon: "assignment_add", label: "Assign Quiz" },
  { to: "/super-user/create-user", icon: "person_add", label: "Create User" },
  { to: "/super-user/create-quiz", icon: "quiz", label: "Create Quiz" },
  { to: "/super-user/scoreboard", icon: "leaderboard", label: "Scoreboard" },
];

const medals = ["🥇", "🥈", "🥉"];

export default function SuperUserScoreboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState([]);  // ranked list of users sorted by avg score
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load the leaderboard for this super user's company
  useEffect(() => {
    async function load() {
      try {
        const result = await userService.getUserComparison(user.companyId);
        setData(result); // API already returns this sorted by score descending
      } catch (err) {
        console.error(err);
        setError("Could not load scoreboard.");
      } finally {
        setLoading(false);
      }
    }
    if (user?.companyId) load();
  }, [user]);

  return (
    <DashboardLayout sidebarItems={sidebarItems} title="Scoreboard">
      <div className="flex items-center gap-4 mb-2">
        <button type="button" onClick={() => navigate("/super-user", { replace: true })}
          className="px-4 py-2 rounded-xl bg-[#e8e5ff] text-[#000666] font-semibold hover:bg-[#dcd7ff]">
          ← Back
        </button>
        <div>
          <h1 className="text-3xl font-bold text-[#000666]">Scoreboard</h1>
          <p className="text-[#454652] mt-1">Company employee rankings based on quiz performance.</p>
        </div>
      </div>

      {error && <div className="p-4 rounded-xl bg-red-50 text-red-700">{error}</div>}

      {loading ? (
        <div className="rounded-2xl bg-white p-6 text-[#454652]">Loading...</div>
      ) : data.length === 0 ? (
        <div className="rounded-2xl bg-white p-6 text-[#454652]">No data available yet.</div>
      ) : (
        <div className="bg-white rounded-2xl shadow-[0_10px_30px_rgba(26,35,126,0.08)] overflow-hidden">

          {/* Podium — top 3 users as a bar chart (1st in the middle and tallest) */}
          <div className="bg-[#f5f2ff] p-6 flex justify-center items-end gap-6">
            {data.slice(0, 3).map((u, i) => (
              <div key={u.userId}
                className={`flex flex-col items-center gap-2 ${i === 0 ? "order-2" : i === 1 ? "order-1" : "order-3"}`}>
                <span className="text-3xl">{medals[i]}</span>
                <div className={`w-16 rounded-t-xl flex items-end justify-center pb-2 font-bold text-white text-sm ${
                  i === 0 ? "h-24 bg-[#6c5ce7]" : i === 1 ? "h-16 bg-[#a29bfe]" : "h-12 bg-[#d3cffe]"
                }`}>
                  {u.avgScore}%
                </div>
                <p className="text-xs font-semibold text-[#000666] text-center max-w-[80px] truncate">{u.name}</p>
                <p className="text-xs text-[#454652] text-center max-w-[80px] truncate">{u.email}</p>
              </div>
            ))}
          </div>

          {/* Full ranked list — all users with rank number, score, and completion stats */}
          <div className="divide-y divide-[#f0ecff]">
            {data.map((u, index) => (
              <div key={u.userId} className="px-6 py-4 flex items-center gap-4 hover:bg-[#faf9ff] transition-all">
                {/* Rank badge — gold/silver/bronze for top 3 */}
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  index === 0 ? "bg-yellow-100 text-yellow-700" :
                  index === 1 ? "bg-gray-100 text-gray-600" :
                  index === 2 ? "bg-orange-100 text-orange-600" :
                  "bg-[#f5f2ff] text-[#6c5ce7]"
                }`}>
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#000666] truncate">{u.name}</p>
                  <p className="text-xs text-[#454652] truncate">{u.email}</p>
                  <p className="text-xs text-[#454652]">{u.totalCompleted} completed · {u.totalPending} pending</p>
                </div>
                {/* Score colour: green ≥80%, yellow ≥50%, red below */}
                <span className={`text-lg font-bold flex-shrink-0 ${
                  u.avgScore >= 80 ? "text-green-600" :
                  u.avgScore >= 50 ? "text-yellow-600" : "text-red-500"
                }`}>
                  {u.avgScore}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
