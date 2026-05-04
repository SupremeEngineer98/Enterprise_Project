// Reusable submit button with the WiseWin purple gradient style
export default function Button({ children, className = "", ...props }) {
  return (
    <button
      {...props}
      className={`w-full bg-gradient-to-r from-[#83439E] to-[#1A237E] hover:opacity-90 text-white font-bold py-4 rounded-xl shadow-[0_10px_30px_rgba(131,67,158,0.4)] transition-all active:scale-[0.98] text-lg ${className}`}
    >
      {children}
    </button>
  );
}
