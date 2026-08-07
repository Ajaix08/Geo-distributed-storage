import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(form.email, form.password);
      toast.success("Welcome back");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-4 h-4 rounded-full bg-accent mx-auto mb-5"></div>

          <h1 className="text-4xl font-bold text-white">
            Sign in to GeoVault
          </h1>

          <p className="text-slate-400 mt-2">
            Route your files to the nearest server
          </p>
        </div>

        {/* Card */}
        <div className="bg-panel border border-line rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-slate-400">
                Email
              </label>

              <input
                type="email"
                required
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                placeholder="you@example.com"
                className="mt-2 w-full rounded-lg border border-line bg-panel2 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs uppercase tracking-widest text-slate-400">
                Password
              </label>

              <input
                type="password"
                required
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                placeholder="••••••••"
                className="mt-2 w-full rounded-lg border border-line bg-panel2 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-accent py-3 text-lg font-medium text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>

            {/* Divider */}
            <div className="flex items-center">
              <div className="flex-1 border-t border-line"></div>
              <span className="mx-4 text-sm text-slate-400">OR</span>
              <div className="flex-1 border-t border-line"></div>
            </div>

            {/* Google Button */}
            <a
              href={`${
                import.meta.env.VITE_API_BASE_URL ||
                "http://localhost:5000/api"
              }/auth/google`}
              className="w-full flex items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 font-medium transition hover:bg-gray-100"
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="w-5 h-5"
              />

              <span>Continue with Google</span>
            </a>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-slate-400">
          No account?{" "}
          <Link
            to="/register"
            className="text-accent hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}