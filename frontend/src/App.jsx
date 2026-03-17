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
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js");
    });
  }

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
  );
}
