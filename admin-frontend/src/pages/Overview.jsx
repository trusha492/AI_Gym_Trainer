<<<<<<< HEAD
import { useState, useEffect } from "react";
import { getOverview } from "../api/admin.api";

export default function Overview() {
  const [overviewData, setOverviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOverview = async () => {
    try {
      setError("");
      setLoading(true);
      const data = await getOverview();
      setOverviewData(data);
    } catch (error) {
      console.error("Failed to fetch overview", error);
      setError(error?.response?.data?.detail || "Failed to load overview");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        📊 Admin Overview
      </h2>

      {loading ? (
        <div className="text-center text-gray-500">Loading overview...</div>
      ) : error ? (
        <div className="text-center text-red-600 text-sm">{error}</div>
      ) : overviewData ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-xl p-4 text-center shadow-sm">
            <p className="text-xs text-gray-500">Total Users</p>
            <p className="text-2xl font-bold text-blue-600">{overviewData.total_users ?? 0}</p>
          </div>

          <div className="bg-green-50 rounded-xl p-4 text-center shadow-sm">
            <p className="text-xs text-gray-500">Weight Logs</p>
            <p className="text-2xl font-bold text-green-600">{overviewData.total_weight_logs ?? 0}</p>
          </div>

          <div className="bg-purple-50 rounded-xl p-4 text-center shadow-sm">
            <p className="text-xs text-gray-500">Nutrition Entries</p>
            <p className="text-2xl font-bold text-purple-600">{overviewData.total_nutrition_entries ?? 0}</p>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500">No overview data</div>
      )}
    </div>
  );
}
=======
import { useState, useEffect } from "react";
import { getOverview } from "../api/admin.api";

export default function Overview() {
  const [overviewData, setOverviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOverview = async () => {
    try {
      setError("");
      setLoading(true);
      const data = await getOverview();
      setOverviewData(data);
    } catch (error) {
      console.error("Failed to fetch overview", error);
      setError(error?.response?.data?.detail || "Failed to load overview");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-5">
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        📊 Admin Overview
      </h2>

      {loading ? (
        <div className="text-center text-gray-500">Loading overview...</div>
      ) : error ? (
        <div className="text-center text-red-600 text-sm">{error}</div>
      ) : overviewData ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-xl p-4 text-center shadow-sm">
            <p className="text-xs text-gray-500">Total Users</p>
            <p className="text-2xl font-bold text-blue-600">{overviewData.total_users ?? 0}</p>
          </div>

          <div className="bg-green-50 rounded-xl p-4 text-center shadow-sm">
            <p className="text-xs text-gray-500">Weight Logs</p>
            <p className="text-2xl font-bold text-green-600">{overviewData.total_weight_logs ?? 0}</p>
          </div>

          <div className="bg-purple-50 rounded-xl p-4 text-center shadow-sm">
            <p className="text-xs text-gray-500">Nutrition Entries</p>
            <p className="text-2xl font-bold text-purple-600">{overviewData.total_nutrition_entries ?? 0}</p>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500">No overview data</div>
      )}
    </div>
  );
}
>>>>>>> e5dfb0c (Removed venv and updated gitignore)
