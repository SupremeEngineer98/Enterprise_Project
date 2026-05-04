// Login page — email and password form, redirects to the correct dashboard based on the user's role
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../components/layout/AuthLayout";
import GlassCard from "../components/ui/GlassCard";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { ROLES } from "../utils/constants";
import logo from "../assets/logo.svg";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  // Form state — tracks what the user is typing
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  // Generic handler — updates whichever field changed using the input's name attribute
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Submits credentials to the API and redirects based on the user's role
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const user = await login(form);

      // Each role has a different starting page
      if (user.role === ROLES.ADMIN) navigate("/admin");
      else if (user.role === ROLES.SUPER_USER) navigate("/super-user");
      else navigate("/user");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    }
  };

  return (
    <AuthLayout>
      <div className="flex justify-center mb-12">
        <img src={logo} alt="WiseWin Logo" className="h-14 w-auto" />
      </div>

      <GlassCard>
        <h2 className="text-3xl font-bold text-white mb-8 text-center">Welcome Back</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 ml-1" htmlFor="email">
              Email Address
            </label>
            <Input id="email" name="email" type="email" placeholder="name@example.com"
              icon="mail" value={form.email} onChange={handleChange} required />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2 ml-1" htmlFor="password">
              Password
            </label>
            <Input id="password" name="password" type="password" placeholder="••••••••"
              icon="lock" value={form.password} onChange={handleChange} required />
          </div>

          {/* Show error from the API (e.g. "Invalid credentials") */}
          {error ? <p className="text-sm text-red-300">{error}</p> : null}

          <Button type="submit" disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>
      </GlassCard>
    </AuthLayout>
  );
}
