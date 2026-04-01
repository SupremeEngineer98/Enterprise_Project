export default function ProgressBadge({ completed, total }) {
  if (!total) {
    return <span className="text-sm text-[#454652]">No assignments</span>;
  }

  const percentage = Math.round((completed / total) * 100);

  return (
    <div className="flex items-center gap-3">
      <div className="w-24 h-2 bg-[#e8e5ff] rounded-full overflow-hidden">
        <div className="h-full bg-[#83439E]" style={{ width: `${percentage}%` }} />
      </div>
      <span className="text-sm text-[#454652]">{percentage}%</span>
    </div>
  );
}