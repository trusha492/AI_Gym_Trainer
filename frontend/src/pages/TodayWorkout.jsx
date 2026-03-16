import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getTodayWorkoutSession, getWeeklyPlan, upsertTodayWorkoutSession } from "../api/user.api";

const STORAGE_KEY = "today_workout_progress_v1";
const SHORT_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const LEGACY_TO_SHORT = {
  monday: "Mon",
  tuesday: "Tue",
  wednesday: "Wed",
  thursday: "Thu",
  friday: "Fri",
  saturday: "Sat",
  sunday: "Sun",
};

const TEMPLATES = {
  upper: [
    { name: "Bench Press", sets: 4, reps: "6-8", restSec: 120 },
    { name: "Seated Row", sets: 3, reps: "8-10", restSec: 90 },
    { name: "Overhead Press", sets: 3, reps: "8-10", restSec: 90 },
    { name: "Lat Pulldown", sets: 3, reps: "10-12", restSec: 75 },
  ],
  lower: [
    { name: "Back Squat", sets: 4, reps: "5-8", restSec: 120 },
    { name: "Romanian Deadlift", sets: 3, reps: "8-10", restSec: 90 },
    { name: "Walking Lunges", sets: 3, reps: "10/leg", restSec: 75 },
    { name: "Calf Raises", sets: 3, reps: "12-15", restSec: 60 },
  ],
  cardio: [
    { name: "Bike Intervals", sets: 6, reps: "45s hard / 75s easy", restSec: 75 },
    { name: "Plank", sets: 3, reps: "45-60s", restSec: 60 },
    { name: "Dead Bug", sets: 3, reps: "10/side", restSec: 45 },
    { name: "Mountain Climbers", sets: 3, reps: "30-40s", restSec: 45 },
  ],
  full: [
    { name: "Goblet Squat", sets: 4, reps: "8-10", restSec: 90 },
    { name: "Dumbbell Bench Press", sets: 4, reps: "8-10", restSec: 90 },
    { name: "Cable Row", sets: 3, reps: "10-12", restSec: 75 },
    { name: "Hip Thrust", sets: 3, reps: "10-12", restSec: 75 },
  ],
  recovery: [
    { name: "Zone 2 Walk", sets: 1, reps: "30 min", restSec: 0 },
    { name: "Mobility Flow", sets: 1, reps: "10 min", restSec: 0 },
  ],
};

const getTodayKey = () => new Date().toISOString().slice(0, 10);

const normalizeDay = (value = "") => {
  const raw = String(value).trim();
  if (!raw) return "";
  const short = raw.slice(0, 3);
  const titleShort = short.charAt(0).toUpperCase() + short.slice(1).toLowerCase();
  if (SHORT_DAYS.includes(titleShort)) return titleShort;
  return LEGACY_TO_SHORT[raw.toLowerCase()] || "";
};

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

const pickTemplate = (details = "", type = "Workout") => {
  const text = String(details).toLowerCase();
  if (String(type).toLowerCase() === "recovery") return TEMPLATES.recovery;
  if (text.includes("upper")) return TEMPLATES.upper;
  if (text.includes("lower")) return TEMPLATES.lower;
  if (text.includes("cardio") || text.includes("core")) return TEMPLATES.cardio;
  if (text.includes("full")) return TEMPLATES.full;
  return TEMPLATES.full;
};

const buildSetRows = (exerciseList) =>
  exerciseList.flatMap((exercise, eIdx) =>
    Array.from({ length: exercise.sets }, (_, sIdx) => ({
      id: `${eIdx}-${sIdx + 1}`,
      exercise: exercise.name,
      setNo: sIdx + 1,
      reps: exercise.reps,
      restSec: exercise.restSec,
    }))
  );

const toClock = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

export default function TodayWorkout() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [todayPlan, setTodayPlan] = useState(null);
  const [doneMap, setDoneMap] = useState({});
  const [timerSec, setTimerSec] = useState(0);
  const [timerLabel, setTimerLabel] = useState("");
  const todayKey = getTodayKey();
  const [dayName, setDayName] = useState(SHORT_DAYS[new Date().getDay()]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await getWeeklyPlan();
        if (!mounted) return;

        const currentDay = SHORT_DAYS[new Date().getDay()];
        setDayName(currentDay);
        const planItems = Array.isArray(res?.plan) ? res.plan : [];
        const match = planItems.find((item) => normalizeDay(item?.day) === currentDay) || null;
        setTodayPlan(match);

        let loadedDoneMap = null;
        try {
          const session = await getTodayWorkoutSession();
          if (session?.done_map && typeof session.done_map === "object") {
            loadedDoneMap = session.done_map;
            writeStore({
              ...readStore(),
              [todayKey]: {
                done: loadedDoneMap,
                updated_at: session.updated_at || new Date().toISOString(),
              },
            });
          }
        } catch {
          // fall back to local-only progress cache
        }

        const store = readStore();
        setDoneMap(loadedDoneMap || store[todayKey]?.done || {});
      } catch (err) {
        console.error("Failed to load today's workout", err);
        if (mounted) setError("Unable to load weekly plan.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [todayKey]);

  useEffect(() => {
    if (timerSec <= 0) return undefined;
    const id = window.setInterval(() => {
      setTimerSec((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerSec]);

  const exercises = useMemo(
    () => pickTemplate(todayPlan?.details, todayPlan?.type),
    [todayPlan?.details, todayPlan?.type]
  );
  const setRows = useMemo(() => buildSetRows(exercises), [exercises]);
  const completedCount = setRows.filter((setRow) => Boolean(doneMap[setRow.id])).length;
  const completionPct = setRows.length > 0 ? Math.round((completedCount / setRows.length) * 100) : 0;

  const persistWorkoutSession = async (nextDone) => {
    const totalSets = setRows.length;
    const completedSets = setRows.filter((setRow) => Boolean(nextDone[setRow.id])).length;
    const pct = totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;

    writeStore({
      ...readStore(),
      [todayKey]: {
        done: nextDone,
        updated_at: new Date().toISOString(),
      },
    });

    try {
      await upsertTodayWorkoutSession({
        plan_day: todayPlan?.day || dayName,
        plan_type: todayPlan?.type || null,
        plan_details: todayPlan?.details || null,
        total_sets: totalSets,
        completed_sets: completedSets,
        completion_pct: pct,
        done_map: nextDone,
      });
    } catch {
      // keep local state if API save fails
    }
  };

  const toggleSet = (setId) => {
    const nextDone = { ...doneMap, [setId]: !doneMap[setId] };
    setDoneMap(nextDone);
    persistWorkoutSession(nextDone);
  };

  const startTimer = (seconds, label) => {
    if (!seconds || seconds <= 0) return;
    setTimerSec(seconds);
    setTimerLabel(label);
  };

  if (loading) {
    return <div className="p-6 text-gray-500">Loading today&apos;s workout...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-gray-800">Today&apos;s workout</h1>
              <p className="text-xs text-gray-500">
                {todayPlan?.day || SHORT_DAYS[new Date().getDay()]}:{" "}
                {todayPlan?.details || "No plan saved yet"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="text-xs px-3 py-1 rounded border border-gray-200 hover:bg-gray-50"
              >
                Back to dashboard
              </button>
              <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700">
                {completionPct}% complete
              </span>
            </div>
          </div>
        </div>

        {timerSec > 0 && (
          <div className="bg-white rounded-xl shadow p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Rest timer</p>
              <p className="text-2xl font-semibold text-gray-800">{toClock(timerSec)}</p>
              {timerLabel ? <p className="text-xs text-gray-500">{timerLabel}</p> : null}
            </div>
            <button
              type="button"
              onClick={() => setTimerSec(0)}
              className="text-xs px-3 py-1 rounded border border-gray-200 hover:bg-gray-50"
            >
              Stop
            </button>
          </div>
        )}

        <div className="bg-white rounded-xl shadow p-4">
          {String(todayPlan?.type || "").toLowerCase() === "recovery" ? (
            <div className="text-sm text-gray-700">
              Today is marked as recovery. You can still complete the mobility checklist below.
            </div>
          ) : null}

          <div className="mt-3 space-y-2">
            {setRows.map((setRow) => {
              const isDone = Boolean(doneMap[setRow.id]);
              return (
                <div
                  key={setRow.id}
                  className={`border rounded-lg px-3 py-2 flex items-center justify-between ${
                    isDone ? "bg-green-50 border-green-200" : "bg-white border-gray-200"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleSet(setRow.id)}
                    className="text-left flex-1"
                  >
                    <p className="text-sm font-medium text-gray-800">
                      {setRow.exercise} - Set {setRow.setNo}
                    </p>
                    <p className="text-xs text-gray-500">{setRow.reps} reps</p>
                  </button>

                  <div className="flex items-center gap-2">
                    {setRow.restSec > 0 ? (
                      <button
                        type="button"
                        onClick={() =>
                          startTimer(setRow.restSec, `${setRow.exercise} rest after set ${setRow.setNo}`)
                        }
                        className="text-xs px-2 py-1 rounded border border-gray-200 hover:bg-gray-50"
                      >
                        Rest {setRow.restSec}s
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => toggleSet(setRow.id)}
                      className={`text-xs px-2 py-1 rounded ${
                        isDone ? "bg-green-600 text-white" : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {isDone ? "Done" : "Mark done"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
