export default function AdminQuizzesPage() {
  return (
    <DashboardLayout title="Quizzes">

      <section className="relative overflow-hidden bg-[#1A237E] rounded-3xl p-10 text-white">
        <h1 className="text-4xl font-black">Quizzes</h1>
        <p className="opacity-90">Manage all training quizzes.</p>
      </section>

      <section className="mt-8 bg-white p-6 rounded-2xl">
        <p className="text-[#454652]">
          Quizzes list will appear here...
        </p>
      </section>

    </DashboardLayout>
  );
}