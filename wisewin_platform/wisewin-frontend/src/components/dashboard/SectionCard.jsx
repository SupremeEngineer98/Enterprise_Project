export default function SectionCard({ title, action, children }) {
  return (
    <section className="rounded-2xl p-6 bg-[#e8e5ff]">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-[#000666]">{title}</h2>
        {action}
      </div>
      <div className="bg-white rounded-xl p-4">{children}</div>
    </section>
  );
}