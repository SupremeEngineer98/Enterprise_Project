export default function StatusBadge({ status }) {
  const map = {
    COMPLETED: "bg-green-100 text-green-700",
    IN_PROGRESS: "bg-yellow-100 text-yellow-700",
    OVERDUE: "bg-red-100 text-red-700",
    NEW: "bg-purple-100 text-purple-700",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold ${map[status] || "bg-slate-100 text-slate-600"}`}>
      {status}
    </span>
  );
}