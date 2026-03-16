import { useEffect, useMemo, useState } from "react";
import { readDailyCheckins } from "../../utils/dailyCheckin";

const STORAGE_KEY = "habit_tracker_data_v1";

const HABITS = [
  { key: "water", label: "Water goal", hint: "2L+" },
  { key: "steps", label: "Steps goal", hint: "8k+" },
  { key: "workout", label: "Workout done", hint: "From check-in or manual" },
  { key: "protein", label: "Protein goal", hint: "Target met" },
];

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const readStore = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const writeStore = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const getHabitStreak = (store, habitKey) => {
  let streak = 0;
  const cursor = new Date();
  while (true) {
    const dayKey = cursor.toISOString().slice(0, 10);
    if (store?.[dayKey]?.[habitKey]) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }
    break;
  }
  return streak;
};

export default function HabitTracker({ refreshKey = 0 }) {
  const [store, setStore] = useState({});
  const [checkins, setCheckins] = useState({});
  const todayKey = getTodayKey();

  useEffect(() => {
    setStore(readStore());
  }, []);

  useEffect(() => {
    setCheckins(readDailyCheckins());
  }, [refreshKey]);

  const todayCheckin = checkins[todayKey] || {};
  const syncedDefaults = useMemo(
    () => ({
      steps: todayCheckin.steps_band === "8k+",
      workout: todayCheckin.trained === true,
    }),
    [todayCheckin.steps_band, todayCheckin.trained]
  );

  const today = store[todayKey] || {};
  const completedToday = HABITS.filter((h) => {
    if (Object.prototype.hasOwnProperty.call(today, h.key)) return Boolean(today[h.key]);
    return Boolean(syncedDefaults[h.key]);
  }).length;
  const completionPct = Math.round((completedToday / HABITS.length) * 100);

  const allHabitsStreak = useMemo(() => {
    let streak = 0;
    const cursor = new Date();
    while (true) {
      const dayKey = cursor.toISOString().slice(0, 10);
      const day = store[dayKey];
      if (day && HABITS.every((h) => Boolean(day[h.key]))) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
        continue;
      }
      break;
    }
    return streak;
  }, [store]);

  const toggleHabit = (habitKey) => {
    setStore((prev) => {
      const next = { ...prev };
      const day = { ...(next[todayKey] || {}) };
      const defaultValue = Boolean(syncedDefaults[habitKey]);
      const currentValue = Object.prototype.hasOwnProperty.call(day, habitKey)
        ? Boolean(day[habitKey])
        : defaultValue;
      day[habitKey] = !currentValue;
      next[todayKey] = day;
      writeStore(next);
      return next;
    });
  };

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-800">Habit tracker</h3>
          <p className="text-xs text-gray-500">Daily consistency compounds progress.</p>
        </div>
        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
          {completionPct}% today
        </span>
      </div>

      <div className="space-y-2">
        {HABITS.map((habit) => {
          const hasManual = Object.prototype.hasOwnProperty.call(today, habit.key);
          const synced = !hasManual && Boolean(syncedDefaults[habit.key]);
          const checked = hasManual ? Boolean(today[habit.key]) : synced;
          const streak = getHabitStreak(store, habit.key);
          return (
            <button
              key={habit.key}
              type="button"
              onClick={() => toggleHabit(habit.key)}
              className={`w-full flex items-center justify-between border rounded-lg px-3 py-2 text-left ${
                checked ? "border-green-300 bg-green-50" : "border-gray-200 bg-white"
              }`}
            >
              <div>
                <p className="text-sm font-medium text-gray-800">{habit.label}</p>
                <p className="text-xs text-gray-500">{habit.hint}</p>
              </div>
              <div className="text-right">
                <p className={`text-xs ${checked ? "text-green-700" : "text-gray-400"}`}>
                  {checked ? (synced ? "Synced" : "Done") : "Pending"}
                </p>
                <p className="text-xs text-gray-500">{streak} day streak</p>
              </div>
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-gray-500">All habits streak: {allHabitsStreak} days</p>
    </div>
  );
}
