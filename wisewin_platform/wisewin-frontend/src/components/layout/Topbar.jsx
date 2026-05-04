// Top navigation bar — shows the page title, the logged-in user's email/role, and logout/change-password buttons
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Topbar({ title }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Sends the user to the right change-password page based on their role
  const handleChangePassword = () => {
    if (user?.role === "Administrator") navigate("/admin/change-password");
    else if (user?.role === "Super user") navigate("/super-user/change-password");
    else navigate("/user/change-password");
  };

  return (
    <div className="h-16 flex items-center justify-between px-8 bg-white/70 backdrop-blur-xl">
      <div>
        <p className="text-sm text-[#454652]">{title}</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-semibold text-[#000666]">{user?.email}</p>
          <p className="text-xs text-[#454652]">{user?.role}</p>
        </div>

        <button type="button" onClick={handleChangePassword}
          className="px-4 py-2 rounded-xl bg-[#f5f2ff] text-[#000666] font-semibold hover:bg-[#e8e5ff]">
          Change Password
        </button>

        <button type="button" onClick={handleLogout}
          className="px-4 py-2 rounded-xl bg-[#e8e5ff] text-[#000666] font-semibold hover:bg-[#dcd7ff]">
          Logout
        </button>
      </div>
    </div>
  );
}
