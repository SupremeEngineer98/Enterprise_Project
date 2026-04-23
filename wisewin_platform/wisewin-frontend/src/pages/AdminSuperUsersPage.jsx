export default function AdminSuperUsersPage() {
  return (
    <DashboardLayout title="Super Users">

      <section className="relative overflow-hidden bg-[#1A237E] rounded-3xl p-10 text-white">
        <h1 className="text-4xl font-black">Super Users</h1>
        <p className="opacity-90">High-level system administrators.</p>
      </section>

      <section className="mt-8 bg-white p-6 rounded-2xl">
        <p className="text-[#454652]">
          Super users list will appear here...
        </p>
      </section>

    </DashboardLayout>
  );
}