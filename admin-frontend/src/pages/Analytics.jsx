import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { getAnalytics } from "../api/admin.api";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Analytics() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalytics = async () => {
    try {
      setError("");
      setLoading(true);
      const data = await getAnalytics();
      setAnalyticsData(data);
    } catch (err) {
      console.error("Failed to fetch analytics", err);
      setError(err?.response?.data?.detail || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const chartData = {
    labels: analyticsData?.labels ?? [],
    datasets: [
      {
        label: "Chat messages",
        data: analyticsData?.chat_messages_7d ?? [],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        tension: 0.25,
      },
      {
        label: "Workouts logged",
        data: analyticsData?.workouts_logged_7d ?? [],
        borderColor: "rgb(16, 185, 129)",
        backgroundColor: "rgba(16, 185, 129, 0.2)",
        tension: 0.25,
      },
      {
        label: "Nutrition entries",
        data: analyticsData?.nutrition_entries_7d_timeline ?? [],
        borderColor: "rgb(168, 85, 247)",
        backgroundColor: "rgba(168, 85, 247, 0.2)",
        tension: 0.25,
      },
    ],
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">Analytics</h2>

      {loading ? (
        <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">Loading analytics...</div>
      ) : error ? (
        <div className="bg-red-50 rounded-xl p-4 text-sm text-red-600">{error}</div>
      ) : analyticsData ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-500">Active Users (7d)</p>
              <p className="text-2xl font-bold text-blue-600">{analyticsData.active_users_7d ?? 0}</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-500">Retention (7d)</p>
              <p className="text-2xl font-bold text-amber-600">{analyticsData.retention_rate_7d ?? 0}%</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 text-center">
              <p className="text-sm text-gray-500">Inactive Users (7d)</p>
              <p className="text-2xl font-bold text-green-600">{analyticsData.inactive_users_7d ?? 0}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500">Total users</p>
              <p className="text-lg font-semibold text-gray-800">{analyticsData.total_users ?? 0}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500">Chat msgs (7d)</p>
              <p className="text-lg font-semibold text-gray-800">{analyticsData.total_chat_messages_7d ?? 0}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500">Nutrition entries (7d)</p>
              <p className="text-lg font-semibold text-gray-800">
                {analyticsData.total_nutrition_entries_7d ?? 0}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-500">Retained users (7d)</p>
              <p className="text-lg font-semibold text-gray-800">{analyticsData.retained_users_7d ?? 0}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Usage timeline (last 7 days)</p>
            <Line data={chartData} />
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">No analytics data</div>
      )}
    </div>
  );
}
