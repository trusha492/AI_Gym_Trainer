import { useEffect, useState } from "react";
import {
  fetchAdminOverview,
  fetchAdminUsers,
  fetchAdminAnalytics,
} from "../api/admin.api";

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [users, setUsers] = useState(null);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [ov, us, an] = await Promise.all([
          fetchAdminOverview(),
          fetchAdminUsers(),
          fetchAdminAnalytics(),
        ]);
        setOverview(ov);
        setUsers(us);
        setAnalytics(an);
      } catch (err) {
        console.error("Failed to load admin data", err);
      }
    })();
  }, []);

  if (!overview || !users || !analytics) return <p className="p-6">Loading admin data...</p>;

  const totalUsers = Array.isArray(users)
    ? users.length
    : users.total_users ?? users.total ?? 0;
  const activeUsers = Array.isArray(users)
    ? users.filter((user) => user.is_active).length
    : users.active_users ?? 0;
  const workoutsLogged = overview.workouts_logged ?? analytics.workouts_logged ?? 0;
  const newUsers = Array.isArray(analytics.newUsers)
    ? analytics.newUsers.reduce((sum, value) => sum + value, 0)
    : analytics.new_users ?? 0;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="text-2xl font-semibold">{totalUsers}</p>
        </div>
        <div className="rounded border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Active Users</p>
          <p className="text-2xl font-semibold">{activeUsers}</p>
        </div>
        <div className="rounded border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Workouts Logged</p>
          <p className="text-2xl font-semibold">{workoutsLogged}</p>
        </div>
        <div className="rounded border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">New Users</p>
          <p className="text-2xl font-semibold">{newUsers}</p>
        </div>
      </div>
    </div>
  );
}
