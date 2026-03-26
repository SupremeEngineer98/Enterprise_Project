import ProgressBadge from "./ProgressBadge";

export default function UserRow({ user }) {
  return (
    <div className="flex justify-between items-center p-4 rounded-xl bg-white hover:bg-[#f3f1ff] transition-all">
      <div>
        <p className="font-medium text-[#000666]">{user.name}</p>
        <p className="text-sm text-[#454652]">{user.email}</p>
      </div>

      <ProgressBadge completed={user.completedQuizzes} total={user.assignedQuizzes} />

      <div className="text-sm text-[#454652]">
        {user.completedQuizzes}/{user.assignedQuizzes}
      </div>
    </div>
  );
}