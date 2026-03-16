import { useEffect, useState } from "react";
import { fetchAdminAnalytics } from "../api/admin.api";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export default function Analytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchAdminAnalytics();
        setData(res);
      } catch (err) {
        console.error("Failed to load analytics", err);
      }
    })();
  }, []);

  if (!data) return <p>Loading analytics...</p>;

  const labels = data.dates ?? data.labels ?? [];
  const points = data.newUsers ?? data.new_users ?? [];
  const chartData = {
    labels,
    datasets: [
      {
        label: "New Users",
        data: points,
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Platform Analytics</h1>

      <div className="bg-white p-6 shadow rounded">
        <Line data={chartData} />
      </div>
    </div>
  );
}
