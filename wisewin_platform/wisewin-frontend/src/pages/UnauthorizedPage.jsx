// Shown when a user tries to access a page they do not have permission for
// The router redirects here automatically when a ProtectedRoute rejects access
import { Link } from "react-router-dom";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-[#fcf8ff] flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl p-10 shadow-[0_20px_60px_rgba(26,35,126,0.08)] max-w-lg w-full text-center">
        <h1 className="text-3xl font-black text-[#000666] mb-3">Unauthorized</h1>
        <p className="text-[#454652] mb-6">You do not have permission to access this page.</p>
        {/* Link to / so the HomeRedirect component will send them to the right dashboard */}
        <Link to="/" className="inline-flex px-5 py-3 rounded-xl bg-[#000666] text-white font-semibold">
          Go Home
        </Link>
      </div>
    </div>
  );
}
