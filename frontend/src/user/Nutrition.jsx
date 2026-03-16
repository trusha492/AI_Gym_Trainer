import { useEffect, useMemo, useState } from "react";
import { getNutritionHistory } from "../api/nutrition.api";
import { Link } from "react-router-dom";

export default function Nutrition() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNutrition();
  }, []);

  const loadNutrition = async () => {
    try {
      const res = await getNutritionHistory();
      setMeals(res);
    } catch (err) {
      console.error("Failed to load nutrition data", err);
    } finally {
      setLoading(false);
    }
  };

  // Daily totals
  const totals = useMemo(() => {
    return meals.reduce(
      (acc, meal) => {
        acc.calories += meal.calories || 0;
        acc.protein += meal.protein || 0;
        return acc;
      },
      { calories: 0, protein: 0 }
    );
  }, [meals]);

  if (loading) {
    return <p className="p-6 text-gray-500">Loading nutrition data...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Header */}
      <header className="max-w-5xl mx-auto mb-6">
        <div className="bg-white rounded-2xl shadow-lg p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              🥗 Nutrition
            </h1>
            <p className="text-gray-500 text-sm">
              Track calories & protein from your meals
            </p>
          </div>

          <nav className="flex gap-4 text-sm font-medium">
            <Link to="/dashboard" className="text-blue-600 hover:underline">
              Dashboard
            </Link>
            <Link to="/chatbot" className="text-blue-600 hover:underline">
              Chatbot
            </Link>
            <Link to="/nutrition" className="text-blue-600 hover:underline">
              Nutrition
            </Link>
            <Link to="/profile" className="text-blue-600 hover:underline">
              Profile
            </Link>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SummaryCard
            title="Total Calories"
            value={`${totals.calories} kcal`}
            color="orange"
          />
          <SummaryCard
            title="Total Protein"
            value={`${totals.protein} g`}
            color="green"
          />
        </div>

        {/* Meal History */}
        <div className="bg-white rounded-2xl shadow-lg p-5">
          <h2 className="text-xl font-semibold mb-4">
            🍽️ Meal History
          </h2>

          {meals.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-4">
              {meals.map((meal, i) => (
                <MealCard key={i} meal={meal} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

/* ------------------ */
/* Components */
/* ------------------ */

function SummaryCard({ title, value, color }) {
  const colors = {
    orange: "bg-orange-50 text-orange-600",
    green: "bg-green-50 text-green-600"
  };

  return (
    <div className={`rounded-xl p-4 shadow-sm ${colors[color]}`}>
      <p className="text-xs text-gray-500">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}

function MealCard({ meal }) {
  return (
    <div className="border rounded-xl p-4 flex flex-col sm:flex-row sm:justify-between gap-4 bg-gray-50">
      <div>
        <p className="font-semibold text-gray-800">
          🍽️ {meal.food?.join(", ") || "Meal"}
        </p>
        <p className="text-xs text-gray-500">
          {new Date(meal.date).toLocaleString()}
        </p>
      </div>

      <div className="flex gap-6 text-sm">
        <NutritionStat label="Calories" value={`${meal.calories} kcal`} />
        <NutritionStat label="Protein" value={`${meal.protein || "—"} g`} />
      </div>
    </div>
  );
}

function NutritionStat({ label, value }) {
  return (
    <div className="text-center">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-bold text-gray-800">{value}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center text-gray-500 py-10">
      <p className="text-lg">No nutrition data yet 🥗</p>
      <p className="text-sm mt-1">
        Upload food images via the chatbot to track meals
      </p>
    </div>
  );
}
