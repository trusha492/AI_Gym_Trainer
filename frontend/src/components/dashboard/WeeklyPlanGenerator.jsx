import { useEffect, useMemo, useState } from "react";
import { getWeeklyPlan, saveWeeklyPlan } from "../../api/user.api";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WORKOUT_FOCUS = [
  "Upper body strength",
  "Lower body strength",
  "Cardio + core",
  "Full body hypertrophy",
  "Mobility + recovery",
];
const I18N = {
  en: {
    title: "Weekly Plan Generator",
    subtitle: "Edit your week, then save it to your account.",
    loading: "Loading saved plan...",
    regenerate: "Regenerate",
    savePlan: "Save Plan",
    saving: "Saving...",
    saved: "Weekly plan saved.",
    failed: "Failed to save weekly plan.",
    targetWorkouts: "Target workouts this week:",
    workout: "Workout",
    recovery: "Recovery",
    calorieTarget: "Calorie target:",
    kcal: "kcal",
  },
  hi: {
    title: "साप्ताहिक योजना जनरेटर",
    subtitle: "अपना सप्ताह संपादित करें, फिर इसे अपने खाते में सेव करें।",
    loading: "सेव की गई योजना लोड हो रही है...",
    regenerate: "फिर बनाएं",
    savePlan: "योजना सेव करें",
    saving: "सेव हो रहा है...",
    saved: "साप्ताहिक योजना सेव हुई।",
    failed: "साप्ताहिक योजना सेव नहीं हो सकी।",
    targetWorkouts: "इस सप्ताह लक्ष्य वर्कआउट:",
    workout: "वर्कआउट",
    recovery: "रिकवरी",
    calorieTarget: "कैलोरी लक्ष्य:",
    kcal: "किलो कैलोरी",
  },
  mr: {
    title: "साप्ताहिक योजना जनरेटर",
    subtitle: "तुमचा आठवडा संपादित करा आणि खात्यात सेव्ह करा.",
    loading: "सेव्ह केलेली योजना लोड होत आहे...",
    regenerate: "पुन्हा तयार करा",
    savePlan: "योजना सेव्ह करा",
    saving: "सेव्ह होत आहे...",
    saved: "साप्ताहिक योजना सेव्ह झाली.",
    failed: "साप्ताहिक योजना सेव्ह करता आली नाही.",
    targetWorkouts: "या आठवड्यातील लक्ष्य वर्कआउट:",
    workout: "वर्कआउट",
    recovery: "रिकव्हरी",
    calorieTarget: "कॅलरी लक्ष्य:",
    kcal: "kcal",
  },
};

function buildPlan(stats, seed) {
  const workoutsDone = Number(stats?.workouts_this_week || 0);
  const baseTarget = workoutsDone >= 4 ? 5 : 4;
  const targetWorkouts = Math.max(3, Math.min(6, baseTarget));
  const calories = Number(stats?.calories_target || 2200);

  const plan = [];
  let workoutSlotsLeft = targetWorkouts;

  for (let i = 0; i < DAY_NAMES.length; i += 1) {
    const remainingDays = DAY_NAMES.length - i;
    const shouldWorkout =
      workoutSlotsLeft > 0 &&
      (workoutSlotsLeft >= remainingDays || ((i + seed) % 2 === 0 || i === 6));

    if (shouldWorkout) {
      const focusIdx = (i + seed) % WORKOUT_FOCUS.length;
      plan.push({
        day: DAY_NAMES[i],
        type: "Workout",
        details: WORKOUT_FOCUS[focusIdx],
        calories,
      });
      workoutSlotsLeft -= 1;
    } else {
      plan.push({
        day: DAY_NAMES[i],
        type: "Recovery",
        details: "Walk 30 min + stretch 10 min",
        calories: Math.max(1600, calories - 200),
      });
    }
  }

  return { targetWorkouts, plan };
}

function defaultDetailsFor(type, dayIndex, seed = 0) {
  if (String(type).toLowerCase() === "recovery") {
    return "Walk 30 min + stretch 10 min";
  }
  const focusIdx = (dayIndex + seed) % WORKOUT_FOCUS.length;
  return WORKOUT_FOCUS[focusIdx];
}

export default function WeeklyPlanGenerator({ stats, language = "en" }) {
  const t = I18N[language] || I18N.en;
  const [seed, setSeed] = useState(1);
  const generated = useMemo(() => buildPlan(stats, seed), [stats, seed]);
  const [planState, setPlanState] = useState(generated);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState({ type: "", text: "" });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const saved = await getWeeklyPlan();
        if (!mounted) return;
        if (saved?.plan && Array.isArray(saved.plan) && saved.plan.length > 0) {
          setPlanState({
            targetWorkouts: Number(saved.target_workouts || 4),
            plan: saved.plan,
          });
        } else {
          setPlanState(generated);
        }
      } catch (err) {
        console.error("Failed to load weekly plan", err);
        if (mounted) setPlanState(generated);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [generated]);

  useEffect(() => {
    if (!loading && (!planState?.plan || planState.plan.length === 0)) {
      setPlanState(generated);
    }
  }, [generated, loading, planState]);

  const handleRegenerate = () => {
    setSeed((s) => s + 1);
    setPlanState(buildPlan(stats, seed + 1));
    setNotice({ type: "", text: "" });
  };

  const updateDay = (idx, patch) => {
    setPlanState((prev) => {
      const next = { ...prev, plan: [...prev.plan] };
      const current = next.plan[idx];
      const merged = { ...current, ...patch };
      const changingType = Object.prototype.hasOwnProperty.call(patch, "type");
      if (changingType) {
        const toRecovery = String(merged.type).toLowerCase() === "recovery";
        merged.details = defaultDetailsFor(merged.type, idx, seed);
        merged.calories = toRecovery
          ? Math.max(1600, Number(stats?.calories_target || current.calories || 2200) - 200)
          : Number(stats?.calories_target || current.calories || 2200);
      }
      next.plan[idx] = merged;
      next.targetWorkouts = next.plan.filter((item) => String(item.type).toLowerCase() === "workout").length;
      return next;
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setNotice({ type: "", text: "" });
      await saveWeeklyPlan({
        target_workouts: Number(planState.targetWorkouts || 0),
        plan: planState.plan.map((p) => ({
          day: p.day,
          type: p.type,
          details: p.details,
          calories: Number(p.calories || 0),
        })),
      });
      setNotice({ type: "success", text: t.saved });
    } catch (err) {
      console.error("Failed to save weekly plan", err);
      setNotice({ type: "error", text: t.failed });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="font-semibold text-gray-800">{t.title}</h3>
        <p className="text-xs text-gray-500 mt-1">{t.loading}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-800">{t.title}</h3>
          <p className="text-xs text-gray-500">
            {t.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleRegenerate}
            className="text-xs px-2 py-1 rounded border border-gray-200 hover:bg-gray-50"
          >
            {t.regenerate}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="text-xs px-2 py-1 rounded bg-blue-600 text-white disabled:opacity-50"
          >
            {saving ? t.saving : t.savePlan}
          </button>
        </div>
      </div>

      <div className="mb-3 text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-md px-3 py-2">
        {t.targetWorkouts}{" "}
        <input
          type="number"
          min={0}
          max={14}
          value={planState.targetWorkouts}
          onChange={(e) =>
            setPlanState((prev) => ({
              ...prev,
              targetWorkouts: Number(e.target.value || 0),
            }))
          }
          className="ml-1 w-16 border rounded px-1 py-0.5 bg-white text-gray-800"
        />
      </div>

      {notice.text && (
        <p className={`mb-2 text-xs ${notice.type === "error" ? "text-red-600" : "text-green-700"}`}>
          {notice.text}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        {planState.plan.map((item, idx) => (
          <div key={item.day} className="border rounded-lg p-2 bg-gray-50">
            <p className="text-xs font-semibold text-gray-700">{item.day}</p>
            <select
              value={item.type}
              onChange={(e) => updateDay(idx, { type: e.target.value })}
              className="mt-1 w-full text-xs border rounded px-1 py-1 bg-white"
            >
              <option value="Workout">{t.workout}</option>
              <option value="Recovery">{t.recovery}</option>
            </select>
            <textarea
              value={item.details}
              onChange={(e) => updateDay(idx, { details: e.target.value })}
              className="mt-1 w-full text-xs border rounded px-1 py-1 bg-white resize-none"
              rows={2}
            />
            <div className="mt-1 text-xs text-gray-500">
              {t.calorieTarget}{" "}
              <input
                type="number"
                min={0}
                value={item.calories}
                onChange={(e) => updateDay(idx, { calories: Number(e.target.value || 0) })}
                className="w-20 border rounded px-1 py-0.5 bg-white text-gray-800"
              />{" "}
              {t.kcal}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
