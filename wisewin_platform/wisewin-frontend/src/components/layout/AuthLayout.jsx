// Centered full-screen wrapper used for the login page
export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-900 to-indigo-950">
      <div className="w-full max-w-lg">{children}</div>
    </div>
  );
}
