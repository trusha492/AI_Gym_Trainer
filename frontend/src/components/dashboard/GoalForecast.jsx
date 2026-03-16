import { useEffect, useMemo, useState } from "react";
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
  Legend,
);

const TARGET_WEIGHT_KEY = "goal_forecast_target_weight_v2";
const TARGET_DATE_KEY = "goal_forecast_target_date_v2";
const I18N = {
  en: {
    title: "Goal Forecast",
    subtitle: "Compare your target timeline against your current weight trend.",
    currentWeight: "Current Weight",
    targetWeight: "Target Weight",
    targetBy: "Target Weight By",
    forecasted: "Forecasted by trend",
    trendNA: "Current trend: not enough data yet.",
    trendPrefix: "Current trend:",
    requiredPace: "Required pace to hit your date:",
    realistic: "(realistic)",
    aggressive: "(aggressive)",
    trendOn: "Trend: ON",
    trendOff: "Trend: OFF",
    targetPathOn: "Target path: ON",
    targetPathOff: "Target path: OFF",
    addTarget: "Add target weight to see projection graph.",
    projectedLegend: "Projected (current trend)",
    targetLegend: "Your target path",
    auto: "Auto",
    compareNow: "Now",
    weightAxis: "Weight (kg)",
    placeholderWeight: "e.g. 68",
  },
  hi: {
    title: "गोल फोरकास्ट",
    subtitle: "अपने लक्ष्य समय और वर्तमान वजन ट्रेंड की तुलना करें।",
    currentWeight: "वर्तमान वजन",
    targetWeight: "लक्ष्य वजन",
    targetBy: "लक्ष्य तारीख",
    forecasted: "ट्रेंड के अनुसार अनुमान",
    trendNA: "वर्तमान ट्रेंड: अभी पर्याप्त डेटा नहीं।",
    trendPrefix: "वर्तमान ट्रेंड:",
    requiredPace: "लक्ष्य तारीख तक पहुंचने के लिए आवश्यक गति:",
    realistic: "(व्यावहारिक)",
    aggressive: "(आक्रामक)",
    trendOn: "ट्रेंड: चालू",
    trendOff: "ट्रेंड: बंद",
    targetPathOn: "लक्ष्य पथ: चालू",
    targetPathOff: "लक्ष्य पथ: बंद",
    addTarget: "प्रोजेक्शन ग्राफ देखने के लिए लक्ष्य वजन जोड़ें।",
    projectedLegend: "अनुमानित (वर्तमान ट्रेंड)",
    targetLegend: "आपका लक्ष्य पथ",
    auto: "ऑटो",
    compareNow: "अब",
    weightAxis: "वजन (kg)",
    placeholderWeight: "जैसे 68",
  },
  mr: {
    title: "ध्येय अंदाज",
    subtitle: "तुमच्या ध्येय टाइमलाइनची सध्याच्या वजन ट्रेंडशी तुलना करा.",
    currentWeight: "सध्याचे वजन",
    targetWeight: "ध्येय वजन",
    targetBy: "ध्येय तारीख",
    forecasted: "ट्रेंडनुसार अंदाज",
    trendNA: "सध्याचा ट्रेंड: पुरेसा डेटा नाही.",
    trendPrefix: "सध्याचा ट्रेंड:",
    requiredPace: "तारीखेपर्यंत ध्येय गाठण्यासाठी आवश्यक गती:",
    realistic: "(वास्तववादी)",
    aggressive: "(आक्रमक)",
    trendOn: "ट्रेंड: सुरू",
    trendOff: "ट्रेंड: बंद",
    targetPathOn: "ध्येय मार्ग: सुरू",
    targetPathOff: "ध्येय मार्ग: बंद",
    addTarget: "प्रोजेक्शन ग्राफ पाहण्यासाठी ध्येय वजन भरा.",
    projectedLegend: "अंदाजित (सध्याचा ट्रेंड)",
    targetLegend: "तुमचा ध्येय मार्ग",
    auto: "ऑटो",
    compareNow: "आता",
    weightAxis: "वजन (kg)",
    placeholderWeight: "उदा. 68",
  },
};

const toDateLabel = (d) =>
  d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });

const clampWeeks = (value, fallback = 8) => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.max(1, Math.min(52, Math.ceil(n)));
};

function estimateTrendTargetDate(currentWeight, targetWeight, weeklyChange) {
  if (currentWeight == null || targetWeight == null || weeklyChange == null || weeklyChange === 0) {
    return null;
  }

  const diff = targetWeight - currentWeight;
  if ((diff > 0 && weeklyChange <= 0) || (diff < 0 && weeklyChange >= 0)) {
    return null;
  }

  const weeks = Math.ceil(Math.abs(diff / weeklyChange));
  if (!Number.isFinite(weeks) || weeks <= 0) return new Date();
  const date = new Date();
  date.setDate(date.getDate() + weeks * 7);
  return date;
}

export default function GoalForecast({ stats, language = "en" }) {
  const t = I18N[language] || I18N.en;
  const [targetWeight, setTargetWeight] = useState("");
  const [targetByDate, setTargetByDate] = useState("");
  const [horizonPreset, setHorizonPreset] = useState("auto");
  const [showTrend, setShowTrend] = useState(true);
  const [showTargetPath, setShowTargetPath] = useState(true);

  useEffect(() => {
    const savedWeight = localStorage.getItem(TARGET_WEIGHT_KEY);
    const savedDate = localStorage.getItem(TARGET_DATE_KEY);
    if (savedWeight) setTargetWeight(savedWeight);
    if (savedDate) setTargetByDate(savedDate);
  }, []);

  const current = stats?.current_weight ?? null;
  const weeklyChange = stats?.weight_change_week ?? null;
  const target = targetWeight === "" ? null : Number(targetWeight);

  const trendProjection = useMemo(() => {
    const date = estimateTrendTargetDate(current, target, weeklyChange);
    if (!date) return null;
    return { date, label: toDateLabel(date) };
  }, [current, target, weeklyChange]);

  const targetDate = targetByDate ? new Date(`${targetByDate}T00:00:00`) : null;
  const today = new Date();
  const daysToTarget = targetDate ? Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;
  const weeksToTarget = daysToTarget != null ? Math.max(0, daysToTarget / 7) : null;

  const requiredWeeklyChange =
    current != null && target != null && weeksToTarget != null && weeksToTarget > 0
      ? (target - current) / weeksToTarget
      : null;

  const realisticRange =
    current != null && target != null
      ? target < current
        ? { min: -1.0, max: -0.25 }
        : target > current
          ? { min: 0.25, max: 0.75 }
          : { min: 0, max: 0 }
      : null;

  const realistic =
    requiredWeeklyChange != null &&
    realisticRange != null &&
    requiredWeeklyChange >= realisticRange.min &&
    requiredWeeklyChange <= realisticRange.max;

  const chartData = useMemo(() => {
    if (current == null || target == null) return null;

    const presetWeeks = horizonPreset === "auto" ? null : Number(horizonPreset);
    const horizonWeeks = clampWeeks(
      presetWeeks ?? weeksToTarget ?? Math.abs((target - current) / (weeklyChange || 0.5)),
    );
    const labels = Array.from({ length: horizonWeeks + 1 }, (_, i) => (i === 0 ? t.compareNow : `+${i}w`));

    const projectedByTrend = labels.map((_, i) =>
      weeklyChange == null ? null : Number((current + weeklyChange * i).toFixed(2)),
    );

    const targetPath = labels.map((_, i) => {
      if (horizonWeeks <= 0) return current;
      const ratio = i / horizonWeeks;
      return Number((current + (target - current) * ratio).toFixed(2));
    });

    const datasets = [
      {
        key: "trend",
        label: t.projectedLegend,
        data: projectedByTrend,
        borderColor: "#2563eb",
        backgroundColor: "rgba(37,99,235,0.15)",
        tension: 0.25,
        pointRadius: 2,
        borderWidth: 2,
        spanGaps: true,
      },
      {
        key: "target",
        label: t.targetLegend,
        data: targetPath,
        borderColor: "#f59e0b",
        backgroundColor: "rgba(245,158,11,0.15)",
        borderDash: [6, 4],
        tension: 0.25,
        pointRadius: 2,
        borderWidth: 2,
      },
    ].filter((dataset) => {
      if (dataset.key === "trend") return showTrend;
      return showTargetPath;
    });

    return {
      labels,
      datasets,
    };
  }, [
    current,
    target,
    weeksToTarget,
    weeklyChange,
    horizonPreset,
    showTrend,
    showTargetPath,
    t.compareNow,
    t.projectedLegend,
    t.targetLegend,
  ]);

  const trendLabel =
    weeklyChange == null
      ? t.trendNA
      : weeklyChange > 0
        ? `${t.trendPrefix} +${weeklyChange.toFixed(2)} kg/week`
        : `${t.trendPrefix} ${weeklyChange.toFixed(2)} kg/week`;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 transition hover:shadow-md">
      <div className="mb-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-gray-800">{t.title}</h3>
          <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs">
            {[
              { label: t.auto, value: "auto" },
              { label: "8w", value: "8" },
              { label: "12w", value: "12" },
              { label: "24w", value: "24" },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setHorizonPreset(opt.value)}
                className={`px-2 py-1 rounded-md ${
                  horizonPreset === opt.value ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="border rounded-lg p-3 bg-gray-50">
          <p className="text-xs text-gray-500">{t.currentWeight}</p>
          <p className="text-2xl font-bold text-gray-900">{current != null ? `${current} kg` : "-"}</p>
        </div>
        <div className="border rounded-lg p-3 bg-gray-50">
          <p className="text-xs text-gray-500">{t.targetWeight}</p>
          <input
            type="number"
            min={1}
            step="0.1"
            value={targetWeight}
            onChange={(e) => {
              setTargetWeight(e.target.value);
              localStorage.setItem(TARGET_WEIGHT_KEY, e.target.value);
            }}
            placeholder={t.placeholderWeight}
            className="mt-1 w-full border rounded px-2 py-1 text-sm bg-white"
          />
        </div>
        <div className="border rounded-lg p-3 bg-gray-50">
          <p className="text-xs text-gray-500">{t.targetBy}</p>
          <input
            type="date"
            value={targetByDate}
            onChange={(e) => {
              setTargetByDate(e.target.value);
              localStorage.setItem(TARGET_DATE_KEY, e.target.value);
            }}
            className="mt-1 w-full border rounded px-2 py-1 text-sm bg-white"
          />
        </div>
        <div className="border rounded-lg p-3 bg-gray-50">
          <p className="text-xs text-gray-500">{t.forecasted}</p>
          <p className="text-base font-semibold text-blue-700">{trendProjection ? trendProjection.label : "-"}</p>
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-600 space-y-1">
        <p>{trendLabel}</p>
        {requiredWeeklyChange != null && (
          <p>
            {t.requiredPace}{" "}
            <span className="font-medium">
              {requiredWeeklyChange > 0 ? "+" : ""}
              {requiredWeeklyChange.toFixed(2)} kg/week
            </span>{" "}
            {realistic ? (
              <span className="text-green-700">{t.realistic}</span>
            ) : (
              <span className="text-amber-700">{t.aggressive}</span>
            )}
          </p>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <button
          type="button"
          onClick={() => setShowTrend((v) => !v)}
          className={`px-2 py-1 rounded-full border ${
            showTrend ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-gray-50 text-gray-500 border-gray-200"
          }`}
        >
          {showTrend ? t.trendOn : t.trendOff}
        </button>
        <button
          type="button"
          onClick={() => setShowTargetPath((v) => !v)}
          className={`px-2 py-1 rounded-full border ${
            showTargetPath ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-gray-50 text-gray-500 border-gray-200"
          }`}
        >
          {showTargetPath ? t.targetPathOn : t.targetPathOff}
        </button>
      </div>

      <div className="mt-3 h-52 border rounded-lg p-2">
        {chartData && chartData.datasets.length > 0 ? (
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { position: "bottom" } },
              scales: {
                x: { grid: { display: false } },
                y: { title: { display: true, text: t.weightAxis } },
              },
            }}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-sm text-gray-400">
            {t.addTarget}
          </div>
        )}
      </div>
    </div>
  );
}
