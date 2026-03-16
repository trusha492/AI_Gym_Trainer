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
  );
}
=======
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
  );
}
>>>>>>> e5dfb0c (Removed venv and updated gitignore)
