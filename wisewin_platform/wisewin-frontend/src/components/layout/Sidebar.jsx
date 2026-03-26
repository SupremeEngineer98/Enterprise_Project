import { NavLink } from "react-router-dom";

export default function Sidebar({ items }) {
  return (
    <div className="h-full flex flex-col p-6 bg-[#000666] text-white">
      <h1 className="text-2xl font-black mb-10">
        <span className="text-purple-300">Wise</span>
        <span className="text-yellow-300">Win</span>
      </h1>

      <nav className="space-y-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            <span className="material-symbols-outlined text-purple-300">
              {item.icon}
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}