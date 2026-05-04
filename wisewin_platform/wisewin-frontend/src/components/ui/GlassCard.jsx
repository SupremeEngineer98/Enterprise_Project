// Frosted-glass card used on the login page
export default function GlassCard({ children }) {
  return (
    <div className="rounded-[2rem] p-10 bg-[rgba(30,41,59,0.7)] backdrop-blur-xl border border-white/10 shadow-[0_20px_60px_rgba(26,35,126,0.15)]">
      {children}
    </div>
  );
}
