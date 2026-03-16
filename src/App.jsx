<<<<<<< HEAD
import Overview from "./pages/Overview";
import Users from "./pages/Users";
import Analytics from "./pages/Analytics";
import Login from "./pages/Login";

export default function App() {
  const token =
    localStorage.getItem("adminAccessToken") ||
    localStorage.getItem("accessToken");

  if (!token) {
    return <Login />;
  }

  const handleLogout = () => {
    localStorage.removeItem("adminAccessToken");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4">
      
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-6">
        <div className="bg-white rounded-2xl shadow-lg p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              🧑‍🏫 Admin Panel
            </h1>
            <p className="text-gray-500 text-sm">
              Gym performance & user management
            </p>
          </div>

          <nav className="flex gap-4 text-sm font-medium">
            <a href="#overview" className="text-blue-600 hover:underline">
              Overview
            </a>
            <a href="#users" className="text-blue-600 hover:underline">
              Users
            </a>
            <a href="#analytics" className="text-blue-600 hover:underline">
              Analytics
            </a>
            <button onClick={handleLogout} className="text-red-600 hover:underline">
              Logout
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto space-y-6">
        <section id="overview">
          <Overview />
        </section>

        <section id="users">
          <Users />
        </section>

        <section id="analytics">
          <Analytics />
        </section>
      </main>
    </div>
=======
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import AdminDashboard from "./admin/AdminDashboard";
import { useUser } from "./context/UserContext";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Chatbot from "./components/chatbot/Chatbot";
import Profile from "./pages/Profile";
import NutritionHistory from "./pages/NutritionHistory";
import Logout from "./pages/Logout";
import ExerciseLibrary from "./pages/ExerciseLibrary";
import TodayWorkout from "./pages/TodayWorkout";

function ProtectedRoute({ children }) {
  const { user, loading } = useUser();

  if (loading) {
    return <p className="p-6 text-gray-500">Loading...</p>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AdminRoute({ children }) {
  const { user, loading } = useUser();

  if (loading) return <p>Loading...</p>;
  if (!user || !user.is_admin) return <Navigate to="/login" replace />;

  return children;
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/chatbot"
            element={
              <ProtectedRoute>
                <Chatbot />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/nutrition"
            element={
              <ProtectedRoute>
                <NutritionHistory />
              </ProtectedRoute>
            }
          />

          <Route
            path="/exercises"
            element={
              <ProtectedRoute>
                <ExerciseLibrary />
              </ProtectedRoute>
            }
          />

          <Route
            path="/today-workout"
            element={
              <ProtectedRoute>
                <TodayWorkout />
              </ProtectedRoute>
            }
          />

          {/* NEW: Logout route (also protected) */}
          <Route
            path="/logout"
            element={
              <ProtectedRoute>
                <Logout />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          {/* Default: start at register */}
          <Route path="/" element={<Navigate to="/register" replace />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/register" replace />} />
        </Routes>
      </div>
    </Router>
>>>>>>> 1a34ac605a79bfc4eed8211d1bc237ddfec690b8
  );
}
