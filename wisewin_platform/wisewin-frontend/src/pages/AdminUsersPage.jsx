import { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { userService } from "../services/userService";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await userService.getAllUsers();
        setUsers(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading users...</div>;
  }

  return (
    <DashboardLayout title="Users Management">

      <section className="relative overflow-hidden bg-[#1A237E] rounded-3xl p-10 text-white shadow-[0_30px_60px_rgba(26,35,126,0.3)]">
        <h1 className="text-4xl font-black">Users</h1>
        <p className="opacity-90">Manage all system users.</p>
      </section>

      <section className="mt-8 space-y-3">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex justify-between items-center p-4 rounded-xl bg-white hover:bg-[#f3f1ff] transition-all"
          >
            <div>
              <p className="font-medium text-[#000666]">
                {user.name}
              </p>
              <p className="text-sm text-[#454652]">
                {user.role}
              </p>
            </div>

            <button className="px-4 py-2 rounded-xl bg-[#e8e5ff] text-[#000666] font-semibold">
              Edit
            </button>
          </div>
        ))}
      </section>

    </DashboardLayout>
  );
}