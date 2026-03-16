<<<<<<< HEAD
import { useState } from "react";
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
    } finally {
      setLoading(false);
    }
  };

  return (
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
    </div>
  );
}
=======
import { useState } from "react";
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
    } finally {
      setLoading(false);
    }
  };

  return (
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
    </div>
  );
}
>>>>>>> e5dfb0c (Removed venv and updated gitignore)
