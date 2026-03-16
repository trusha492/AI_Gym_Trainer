// src/components/ProgressChart.tsx
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

type WeeklyPoint = {
  week_label: string;
  weight: number;
};

type Props = {
  data: WeeklyPoint[];
};

export default function ProgressChart({ data }: Props) {
  const labels = data.map((d) => d.week_label);
  const weights = data.map((d) => d.weight);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Weight (kg)",
        data: weights,
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59, 130, 246, 0.2)",
        tension: 0.3,
        pointRadius: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        grid: { display: false },
      },
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: "Weight (kg)",
          color: "#64748b",
          font: {
            size: 12,
            weight: "600",
          },
        },
      },
    },
  } as const;

  return <Line data={chartData} options={options} />;
}
