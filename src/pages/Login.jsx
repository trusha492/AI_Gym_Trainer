import { useState } from "react";
<<<<<<< HEAD
import { login, registerAdmin } from "../api/auth.api";

export default function AdminAuth() {
  const [mode, setMode] = useState("login"); // login | register
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminKey, setAdminKey] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const resetStatus = () => {
    setError("");
    setMessage("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    resetStatus();
    setLoading(true);
    try {
      await login(email, password);
      window.location.reload();
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Login failed. Use a valid admin account."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    resetStatus();
    setLoading(true);
    try {
      await registerAdmin({ name, email, password, adminKey });
      setMessage("Admin registered. You can log in now.");
      setMode("login");
      setPassword("");
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Admin registration failed."
      );
=======
import { login } from "../api/auth.api";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { reloadUser } = useUser();

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      await login(email, password);
      await reloadUser();
      navigate("/dashboard");
    } catch (err) {
      alert("Invalid credentials");
>>>>>>> 1a34ac605a79bfc4eed8211d1bc237ddfec690b8
    } finally {
      setLoading(false);
    }
  };

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <form
        onSubmit={mode === "login" ? handleLogin : handleRegister}
        className="w-full max-w-sm bg-white rounded-xl shadow p-5 space-y-3"
      >
        <h1 className="text-xl font-semibold text-gray-800">
          {mode === "login" ? "Admin Login" : "Admin Register"}
        </h1>

        {mode === "register" && (
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}

        <input
          className="w-full border rounded px-3 py-2 text-sm"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="w-full border rounded px-3 py-2 text-sm"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {mode === "register" && (
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="Admin Register Key (for additional admins)"
            value={adminKey}
            onChange={(e) => setAdminKey(e.target.value)}
          />
        )}

        {error && <p className="text-xs text-red-600">{error}</p>}
        {message && <p className="text-xs text-green-700">{message}</p>}

        <button
          className="w-full bg-blue-600 text-white rounded px-3 py-2 text-sm disabled:opacity-50"
          type="submit"
          disabled={loading}
        >
          {loading ? "Please wait..." : mode === "login" ? "Login" : "Register"}
        </button>

        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            resetStatus();
          }}
          className="w-full text-sm text-blue-600 hover:underline"
        >
          {mode === "login"
            ? "Create admin account"
            : "Already admin? Login"}
        </button>
      </form>
=======
    <div className="min-h-screen relative overflow-hidden bg-[radial-gradient(circle_at_10%_10%,#1e3a8a_0%,#0f172a_38%,#020617_100%)] px-4 py-8 sm:px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-20 h-80 w-80 rounded-full bg-emerald-400/20 blur-3xl animate-pulse" />
        <div className="absolute -bottom-28 left-1/4 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[90vh] w-full max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl lg:grid-cols-2">
          <div className="hidden lg:flex flex-col justify-between p-10 text-white bg-gradient-to-br from-sky-500/30 via-blue-500/20 to-emerald-500/20 border-r border-white/20">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 py-1.5 text-sm font-semibold">
                <img src="/movementor-favicon.svg" alt="MoveMentor logo" className="h-5 w-5 rounded-sm" />
                MoveMentor
              </div>
              <h1 className="mt-5 text-4xl font-bold leading-tight">Train smarter. Recover faster.</h1>
              <p className="mt-3 text-sm text-sky-100">
                Your AI-powered fitness dashboard with workouts, nutrition tracking, and coaching in one place.
              </p>
            </div>
            <div className="space-y-3 text-sm text-sky-50">
              <p className="rounded-xl bg-white/10 px-3 py-2 border border-white/20">Adaptive plans based on your daily check-ins</p>
              <p className="rounded-xl bg-white/10 px-3 py-2 border border-white/20">Real-time progress across weight, calories, and workouts</p>
              <p className="rounded-xl bg-white/10 px-3 py-2 border border-white/20">Multilingual AI coach built for Indian users</p>
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10 bg-white/95">
            <div className="mx-auto w-full max-w-sm">
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 lg:hidden">
                  <img src="/movementor-favicon.svg" alt="MoveMentor logo" className="h-4 w-4 rounded-sm" />
                  MoveMentor
                </div>
                <h2 className="mt-3 text-3xl font-bold text-slate-900">Welcome back</h2>
                <p className="mt-1 text-sm text-slate-600">Login to continue your fitness journey.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Email
                  </label>
                  <input
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Password
                  </label>
                  <input
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-100"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-sky-500 py-2.5 font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:from-blue-700 hover:to-sky-600 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Signing in..." : "Login"}
                </button>
              </form>

              <p className="mt-5 text-center text-sm text-slate-600">
                New here?{" "}
                <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline">
                  Create account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
>>>>>>> 1a34ac605a79bfc4eed8211d1bc237ddfec690b8
    </div>
  );
}
