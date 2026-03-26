export default function StatCard({ title, value, icon }) {
  return (
    <div className="p-6 rounded-2xl bg-white shadow-[0_10px_30px_rgba(26,35,126,0.08)]">
      <div className="flex justify-between mb-6">
        <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
          <span className="material-symbols-outlined">{icon}</span>
        </div>
      </div>
      <p className="text-sm text-[#454652]">{title}</p>
      <h3 className="text-3xl font-bold text-[#000666] mt-1">{value}</h3>
    </div>
  );
}