export default function Input({ icon, className = "", ...props }) {
  return (
    <div className="relative">
      {icon ? (
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
          {icon}
        </span>
      ) : null}
      <input
        {...props}
        className={`w-full bg-slate-800/50 border border-slate-700 text-white rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all placeholder:text-slate-500 ${className}`}
      />
    </div>
  );
}