import ProgressBadge from "./ProgressBadge";

export default function UserRow({ user }) {
  const total = Number(user.assignedQuizzes ?? 0);
  const completed = Number(user.completedQuizzes ?? 0);
  
  return (
    <div className="flex justify-between items-center p-4 rounded-xl bg-white hover:bg-[#f3f1ff] transition-all">
      <div>
        <p className="font-medium text-[#000666]">{user.name}</p>
        <p className="text-sm text-[#454652]">{user.email}</p>
      </div>


      <ProgressBadge completed={completed} total={total} />

      <div className="text-sm text-[#454652]">
        {user.assignedQuizzes ? `${completed}/${total}` : "No assignments"}
      </div>
    </div>
  );
}