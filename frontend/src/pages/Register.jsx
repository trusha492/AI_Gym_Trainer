import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../api/auth.api";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.password) {
      setError("All fields are required");
      return;
    }

    setLoading(true);
    try {
      await register(form);
      navigate("/login");
    } catch (err) {
      setError("Registration failed. Email may already exist.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[radial-gradient(circle_at_10%_10%,#1e3a8a_0%,#0f172a_38%,#020617_100%)] px-4 py-8 sm:px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-28 left-1/4 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[90vh] w-full max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl lg:grid-cols-2">
          <div className="hidden lg:flex flex-col justify-between p-10 text-white bg-gradient-to-br from-emerald-500/30 via-sky-500/20 to-blue-500/20 border-r border-white/20">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 py-1.5 text-sm font-semibold">
                <img src="/icon-152.png" alt="MoveMentor logo" className="h-5 w-5 rounded-full object-cover" />
                MoveMentor
              </div>
              <h1 className="mt-5 text-4xl font-bold leading-tight">Build your strongest routine.</h1>
              <p className="mt-3 text-sm text-sky-100">
                Create your account and unlock AI-guided workouts, nutrition plans, and progress forecasting.
              </p>
            </div>
            <div className="space-y-3 text-sm text-sky-50">
              <p className="rounded-xl bg-white/10 px-3 py-2 border border-white/20">Personalized dashboard from day one</p>
              <p className="rounded-xl bg-white/10 px-3 py-2 border border-white/20">Smart coaching based on your profile and goals</p>
              <p className="rounded-xl bg-white/10 px-3 py-2 border border-white/20">Daily check-ins to keep your plan adaptive</p>
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10 bg-white/95">
            <div className="mx-auto w-full max-w-sm">
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 lg:hidden">
                  <img src="/icon-152.png" alt="MoveMentor logo" className="h-4 w-4 rounded-full object-cover" />
                  MoveMentor
                </div>
                <h2 className="mt-3 text-3xl font-bold text-slate-900">Create account</h2>
                <p className="mt-1 text-sm text-slate-600">Start your AI-powered fitness journey.</p>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                {error && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                    {error}
                  </div>
                )}

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Full name
                  </label>
                  <input
                    name="name"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Email
                  </label>
                  <input
                    name="email"
                    type="email"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Password
                  </label>
                  <input
                    name="password"
                    type="password"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                    placeholder="Create password"
                    value={form.password}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-sky-500 py-2.5 font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:from-emerald-700 hover:to-sky-600 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Creating account..." : "Register"}
                </button>
              </form>

              <p className="mt-5 text-center text-sm text-slate-600">
                Already have an account?{" "}
                <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
