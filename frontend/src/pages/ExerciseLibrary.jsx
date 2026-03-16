import { useState } from "react";
import { Link } from "react-router-dom";

const EXERCISES = [
  {
    id: 1,
    name: "Barbell Squat",
    muscle: "Legs",
    equipment: "Barbell",
    level: "Intermediate",
    type: "Strength",
    animation: "vertical",
    demoUrl: "https://static.exercisedb.dev/media/qXTaZnJ.gif",
    demoName: "Barbell full squat",
    demoFit: "contain",
    howItWorks: ["Brace core", "Sit down", "Drive up"],
    benefits: ["Builds lower-body strength", "Improves hip and ankle mobility", "Increases total-body power"],
  },
  {
    id: 2,
    name: "Push-Up",
    muscle: "Chest",
    equipment: "Bodyweight",
    level: "Beginner",
    type: "Strength",
    animation: "vertical",
    demoUrl: "https://static.exercisedb.dev/media/JmMVpR3.gif",
    demoName: "Wide hand push up",
    howItWorks: ["Straight line body", "Lower chest", "Press up"],
    benefits: ["Strengthens chest, triceps, and shoulders", "Improves core stability", "Needs no equipment"],
  },
  {
    id: 3,
    name: "Romanian Deadlift",
    muscle: "Posterior Chain",
    equipment: "Barbell",
    level: "Intermediate",
    type: "Strength",
    animation: "diagonal",
    demoUrl: "https://static.exercisedb.dev/media/wQ2c4XD.gif",
    demoName: "Barbell romanian deadlift",
    demoFit: "contain",
    howItWorks: ["Soft knees", "Hinge at hips", "Squeeze glutes up"],
    benefits: ["Targets hamstrings and glutes", "Improves hip hinge mechanics", "Protects lower back through better form"],
  },
  {
    id: 4,
    name: "Plank Hold",
    muscle: "Core",
    equipment: "Bodyweight",
    level: "Beginner",
    type: "Core",
    animation: "pulse",
    demoUrl: "https://static.exercisedb.dev/media/VBAWRPG.gif",
    demoName: "Weighted front plank",
    howItWorks: ["Elbows under shoulders", "Glutes and core tight", "Hold neutral spine"],
    benefits: ["Builds deep core endurance", "Supports posture", "Improves trunk stability"],
  },
  {
    id: 5,
    name: "Lat Pulldown",
    muscle: "Back",
    equipment: "Machine",
    level: "Beginner",
    type: "Strength",
    animation: "vertical",
    demoUrl: "https://static.exercisedb.dev/media/LEprlgG.gif",
    demoName: "Cable lat pulldown full range of motion",
    demoFit: "contain",
    howItWorks: ["Set shoulder blades", "Pull bar to upper chest", "Control the return"],
    benefits: ["Builds upper-back width", "Improves pull-up strength", "Supports shoulder health"],
  },
  {
    id: 6,
    name: "Dumbbell Shoulder Press",
    muscle: "Shoulders",
    equipment: "Dumbbell",
    level: "Beginner",
    type: "Strength",
    animation: "vertical",
    demoUrl: "https://static.exercisedb.dev/media/znQUdHY.gif",
    demoName: "Dumbbell seated shoulder press",
    demoFit: "contain",
    howItWorks: ["Dumbbells at shoulder line", "Press overhead", "Lower with control"],
    benefits: ["Builds shoulder and triceps strength", "Improves overhead control", "Enhances upper-body stability"],
  },
  {
    id: 7,
    name: "Walking Lunge",
    muscle: "Legs",
    equipment: "Bodyweight",
    level: "Beginner",
    type: "Strength",
    animation: "horizontal",
    demoUrl: "https://static.exercisedb.dev/media/IZVHb27.gif",
    demoName: "Walking lunge",
    demoFit: "contain",
    howItWorks: ["Step forward", "Lower both knees", "Push into next step"],
    benefits: ["Builds unilateral leg strength", "Improves balance and coordination", "Challenges hip stability"],
  },
  {
    id: 8,
    name: "Treadmill Intervals",
    muscle: "Cardio",
    equipment: "Machine",
    level: "Intermediate",
    type: "Conditioning",
    animation: "run",
    demoUrl: "https://static.exercisedb.dev/media/rjiM4L3.gif",
    demoName: "Walking on incline treadmill",
    demoFit: "contain",
    howItWorks: ["Warm-up walk", "Alternate sprint and recovery", "Cool down"],
    benefits: ["Improves cardiovascular fitness", "Burns more calories in less time", "Builds running speed"],
  },
  {
    id: 9,
    name: "Face Pull",
    muscle: "Shoulders",
    equipment: "Cable",
    level: "Intermediate",
    type: "Mobility",
    animation: "horizontal",
    demoUrl: "https://static.exercisedb.dev/media/ZfyAGhK.gif",
    demoName: "Cable standing rear delt row (with rope)",
    demoFit: "contain",
    howItWorks: ["Cable at face height", "Pull toward nose/eyes", "Rotate thumbs back"],
    benefits: ["Strengthens rear delts and upper back", "Improves shoulder posture", "Reduces desk-related shoulder strain"],
  },
  {
    id: 10,
    name: "Glute Bridge",
    muscle: "Glutes",
    equipment: "Bodyweight",
    level: "Beginner",
    type: "Strength",
    animation: "vertical",
    demoUrl: "https://static.exercisedb.dev/media/u0cNiij.gif",
    demoName: "Low glute bridge on floor",
    howItWorks: ["Feet planted", "Lift hips", "Pause and lower"],
    benefits: ["Activates glutes effectively", "Supports lower-back health", "Improves hip extension power"],
  },
  {
    id: 11,
    name: "Leg Press",
    muscle: "Legs",
    equipment: "Machine",
    level: "Beginner",
    type: "Strength",
    animation: "vertical",
    demoUrl: "https://static.exercisedb.dev/media/10Z2DXU.gif",
    demoName: "Sled 45° leg press",
    demoFit: "contain",
    howItWorks: ["Feet shoulder-width on platform", "Lower under control", "Press without locking knees"],
    benefits: ["Builds quad strength", "Lower joint stress than free squats", "Easy progressive overload"],
  },
  {
    id: 12,
    name: "Goblet Squat",
    muscle: "Legs",
    equipment: "Dumbbell",
    level: "Beginner",
    type: "Strength",
    animation: "vertical",
    demoUrl: "https://static.exercisedb.dev/media/yn8yg1r.gif",
    demoName: "Dumbbell goblet squat",
    demoFit: "contain",
    howItWorks: ["Hold dumbbell at chest", "Sit between hips", "Stand tall and brace"],
    benefits: ["Improves squat mechanics", "Strengthens quads and glutes", "Improves core bracing"],
  },
  {
    id: 13,
    name: "Incline Dumbbell Press",
    muscle: "Chest",
    equipment: "Dumbbell",
    level: "Intermediate",
    type: "Strength",
    animation: "vertical",
    demoUrl: "https://static.exercisedb.dev/media/ns0SIbU.gif",
    demoName: "Dumbbell incline bench press",
    demoFit: "contain",
    howItWorks: ["Set bench to slight incline", "Lower dumbbells to upper chest", "Press up and in"],
    benefits: ["Targets upper chest", "Builds pressing strength", "Improves shoulder stability"],
  },
  {
    id: 14,
    name: "Chest Fly",
    muscle: "Chest",
    equipment: "Dumbbell",
    level: "Beginner",
    type: "Strength",
    animation: "horizontal",
    demoUrl: "https://static.exercisedb.dev/media/yz9nUhF.gif",
    demoName: "Dumbbell fly",
    howItWorks: ["Soft elbow bend", "Open arms wide", "Bring dumbbells together"],
    benefits: ["Improves chest isolation", "Builds mind-muscle connection", "Enhances pressing control"],
  },
  {
    id: 15,
    name: "Good Morning",
    muscle: "Posterior Chain",
    equipment: "Barbell",
    level: "Intermediate",
    type: "Strength",
    animation: "diagonal",
    demoUrl: "https://static.exercisedb.dev/media/XlZ4lAC.gif",
    demoName: "Barbell good morning",
    demoFit: "contain",
    howItWorks: ["Bar on upper back", "Hinge from hips", "Return by driving hips forward"],
    benefits: ["Strengthens hamstrings and lower back", "Improves hip hinge pattern", "Builds posterior chain endurance"],
  },
  {
    id: 16,
    name: "Kettlebell Swing",
    muscle: "Posterior Chain",
    equipment: "Kettlebell",
    level: "Intermediate",
    type: "Conditioning",
    animation: "run",
    demoUrl: "https://static.exercisedb.dev/media/UHJlbu3.gif",
    demoName: "Kettlebell swing",
    demoFit: "contain",
    howItWorks: ["Hike bell between legs", "Explode hips forward", "Let bell float to chest height"],
    benefits: ["Builds explosive hip power", "Improves conditioning", "Trains glutes and hamstrings"],
  },
  {
    id: 17,
    name: "Dead Bug",
    muscle: "Core",
    equipment: "Bodyweight",
    level: "Beginner",
    type: "Core",
    animation: "horizontal",
    demoUrl: "https://static.exercisedb.dev/media/iny3m5y.gif",
    demoName: "Dead bug",
    howItWorks: ["Lower back pressed to floor", "Extend opposite arm and leg", "Return and alternate"],
    benefits: ["Improves core control", "Protects lower back", "Builds anti-extension strength"],
  },
  {
    id: 18,
    name: "Hanging Knee Raise",
    muscle: "Core",
    equipment: "Bodyweight",
    level: "Intermediate",
    type: "Core",
    animation: "vertical",
    demoUrl: "https://static.exercisedb.dev/media/03lzqwk.gif",
    demoName: "Assisted hanging knee raise",
    demoFit: "contain",
    howItWorks: ["Hang from bar", "Raise knees toward chest", "Lower slowly"],
    benefits: ["Builds lower-ab strength", "Improves grip endurance", "Enhances trunk stability"],
  },
  {
    id: 19,
    name: "Seated Cable Row",
    muscle: "Back",
    equipment: "Cable",
    level: "Beginner",
    type: "Strength",
    animation: "horizontal",
    demoUrl: "https://static.exercisedb.dev/media/fUBheHs.gif",
    demoName: "Cable seated row",
    demoFit: "contain",
    howItWorks: ["Neutral spine", "Pull handle to torso", "Control return fully"],
    benefits: ["Builds mid-back thickness", "Improves posture", "Balances pressing volume"],
  },
  {
    id: 20,
    name: "Pull-Up",
    muscle: "Back",
    equipment: "Bodyweight",
    level: "Intermediate",
    type: "Strength",
    animation: "vertical",
    demoUrl: "https://static.exercisedb.dev/media/lBDjFxJ.gif",
    demoName: "Pull-up",
    demoFit: "contain",
    howItWorks: ["Start from dead hang", "Pull chest toward bar", "Lower under control"],
    benefits: ["Builds upper-body pulling strength", "Develops lats and biceps", "Improves relative strength"],
  },
  {
    id: 21,
    name: "Lateral Raise",
    muscle: "Shoulders",
    equipment: "Dumbbell",
    level: "Beginner",
    type: "Strength",
    animation: "horizontal",
    demoUrl: "https://static.exercisedb.dev/media/n5cWCsI.gif",
    demoName: "Dumbbell one arm lateral raise",
    demoFit: "contain",
    howItWorks: ["Lift dumbbells to shoulder level", "Lead with elbows", "Lower slowly"],
    benefits: ["Builds side delts", "Improves shoulder shape", "Supports overhead work"],
  },
  {
    id: 22,
    name: "Arnold Press",
    muscle: "Shoulders",
    equipment: "Dumbbell",
    level: "Intermediate",
    type: "Strength",
    animation: "vertical",
    demoUrl: "https://static.exercisedb.dev/media/Xy4jlWA.gif",
    demoName: "Dumbbell arnold press",
    demoFit: "contain",
    howItWorks: ["Start palms facing you", "Rotate while pressing overhead", "Reverse with control"],
    benefits: ["Trains full shoulder complex", "Improves pressing coordination", "Builds overhead strength"],
  },
  {
    id: 23,
    name: "Jump Rope",
    muscle: "Cardio",
    equipment: "Bodyweight",
    level: "Beginner",
    type: "Conditioning",
    animation: "run",
    demoUrl: "https://static.exercisedb.dev/media/e1e76I2.gif",
    demoName: "Jump rope",
    demoFit: "contain",
    howItWorks: ["Keep elbows close", "Small quick hops", "Maintain steady rhythm"],
    benefits: ["Improves aerobic capacity", "Enhances footwork", "Burns calories efficiently"],
  },
  {
    id: 24,
    name: "Burpees",
    muscle: "Cardio",
    equipment: "Bodyweight",
    level: "Intermediate",
    type: "Conditioning",
    animation: "run",
    demoUrl: "https://static.exercisedb.dev/media/dK9394r.gif",
    demoName: "Burpee",
    demoFit: "contain",
    howItWorks: ["Squat and place hands down", "Kick to plank", "Jump up explosively"],
    benefits: ["Full-body conditioning", "Increases work capacity", "Improves athletic explosiveness"],
  },
  {
    id: 25,
    name: "Hip Thrust",
    muscle: "Glutes",
    equipment: "Barbell",
    level: "Intermediate",
    type: "Strength",
    animation: "vertical",
    demoUrl: "https://static.exercisedb.dev/media/qKBpF7I.gif",
    demoName: "Barbell glute bridge",
    demoFit: "contain",
    howItWorks: ["Upper back on bench", "Drive hips up", "Pause and lower"],
    benefits: ["Maximizes glute activation", "Builds hip extension strength", "Supports sprint and jump power"],
  },
  {
    id: 26,
    name: "Cable Kickback",
    muscle: "Glutes",
    equipment: "Cable",
    level: "Beginner",
    type: "Strength",
    animation: "diagonal",
    demoUrl: "https://static.exercisedb.dev/media/HEJ6DIX.gif",
    demoName: "Cable kickback",
    demoFit: "contain",
    howItWorks: ["Brace with slight lean", "Kick leg back and up", "Return without losing tension"],
    benefits: ["Isolates glutes", "Improves hip control", "Adds low-impact glute volume"],
  },
];

const unique = (items, key) => ["All", ...new Set(items.map((x) => x[key]))];
const ANIMATION_CLASS = {
  vertical: "mm-motion-vertical",
  horizontal: "mm-motion-horizontal",
  diagonal: "mm-motion-diagonal",
  pulse: "mm-motion-pulse",
  run: "mm-motion-run",
};

function ExerciseDemo({ exercise }) {
  const [mediaFailed, setMediaFailed] = useState(false);
  const useFallback = mediaFailed || !exercise.demoUrl;

  if (useFallback) {
    return (
      <div className="relative mt-2 h-20 rounded-md bg-white border border-slate-200 overflow-hidden">
        <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 h-[2px] bg-slate-200" />
        <div className="absolute inset-y-2 left-1/2 -translate-x-1/2 w-[2px] bg-slate-200" />
        <div className={`mm-motion-dot ${ANIMATION_CLASS[exercise.animation] ?? "mm-motion-pulse"}`} />
      </div>
    );
  }

  return (
    <div className="mt-2 h-32 rounded-md bg-slate-100 border border-slate-200 overflow-hidden">
      <img
        src={exercise.demoUrl}
        alt={`${exercise.name} demo`}
        className={`w-full h-full ${exercise.demoFit === "contain" ? "object-contain" : "object-cover"}`}
        loading="lazy"
        onError={() => setMediaFailed(true)}
      />
    </div>
  );
}

export default function ExerciseLibrary() {
  const [query, setQuery] = useState("");
  const [muscle, setMuscle] = useState("All");
  const [equipment, setEquipment] = useState("All");
  const [level, setLevel] = useState("All");
  const q = query.trim().toLowerCase();
  const muscles = unique(
    EXERCISES.filter((exercise) => {
      const queryMatched = !q || exercise.name.toLowerCase().includes(q) || exercise.type.toLowerCase().includes(q);
      const matchesEquipment = equipment === "All" || exercise.equipment === equipment;
      const matchesLevel = level === "All" || exercise.level === level;
      return queryMatched && matchesEquipment && matchesLevel;
    }),
    "muscle",
  );
  const equipments = unique(
    EXERCISES.filter((exercise) => {
      const queryMatched = !q || exercise.name.toLowerCase().includes(q) || exercise.type.toLowerCase().includes(q);
      const matchesMuscle = muscle === "All" || exercise.muscle === muscle;
      const matchesLevel = level === "All" || exercise.level === level;
      return queryMatched && matchesMuscle && matchesLevel;
    }),
    "equipment",
  );
  const levels = unique(
    EXERCISES.filter((exercise) => {
      const queryMatched = !q || exercise.name.toLowerCase().includes(q) || exercise.type.toLowerCase().includes(q);
      const matchesMuscle = muscle === "All" || exercise.muscle === muscle;
      const matchesEquipment = equipment === "All" || exercise.equipment === equipment;
      return queryMatched && matchesMuscle && matchesEquipment;
    }),
    "level",
  );

  const effectiveMuscle = muscles.includes(muscle) ? muscle : "All";
  const effectiveEquipment = equipments.includes(equipment) ? equipment : "All";
  const effectiveLevel = levels.includes(level) ? level : "All";

  const filtered = EXERCISES.filter((e) => {
    const queryMatched = !q || e.name.toLowerCase().includes(q) || e.type.toLowerCase().includes(q);
    const matchesMuscle = effectiveMuscle === "All" || e.muscle === effectiveMuscle;
    const matchesEquipment = effectiveEquipment === "All" || e.equipment === effectiveEquipment;
    const matchesLevel = effectiveLevel === "All" || e.level === effectiveLevel;
    return queryMatched && matchesMuscle && matchesEquipment && matchesLevel;
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Exercise Library</h1>
            <p className="text-sm text-gray-500">Search and filter exercises by target muscle and equipment.</p>
          </div>
          <Link to="/dashboard" className="text-sm px-3 py-1 rounded border bg-white hover:bg-gray-50">
            Back to dashboard
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow p-4 grid grid-cols-1 md:grid-cols-4 gap-2">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search exercise..."
            className="border rounded px-3 py-2 text-sm"
          />
          <select value={effectiveMuscle} onChange={(e) => setMuscle(e.target.value)} className="border rounded px-3 py-2 text-sm">
            {muscles.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select value={effectiveEquipment} onChange={(e) => setEquipment(e.target.value)} className="border rounded px-3 py-2 text-sm">
            {equipments.map((eq) => (
              <option key={eq} value={eq}>{eq}</option>
            ))}
          </select>
          <select value={effectiveLevel} onChange={(e) => setLevel(e.target.value)} className="border rounded px-3 py-2 text-sm">
            {levels.map((lv) => (
              <option key={lv} value={lv}>{lv}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((e) => (
            <div key={e.id} className="bg-white rounded-xl border shadow-sm p-4">
              <h3 className="font-semibold text-gray-800">{e.name}</h3>
              <p className="text-xs text-gray-500 mt-1">Type: {e.type}</p>
              <p className="text-xs text-gray-500">Muscle: {e.muscle}</p>
              <p className="text-xs text-gray-500">Equipment: {e.equipment}</p>
              <p className="text-xs text-gray-500">Level: {e.level}</p>

              <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-2">
                <p className="text-[11px] uppercase tracking-wide text-slate-500">Movement demo</p>
                <ExerciseDemo exercise={e} />
                {e.demoName && <p className="mt-1 text-[10px] text-slate-500">Demo: {e.demoName}</p>}
                <div className="mt-2 flex flex-wrap gap-1">
                  {e.howItWorks.map((step, idx) => (
                    <span
                      key={`${e.id}-step-${idx}`}
                      className="text-[10px] px-2 py-1 rounded-full bg-sky-100 text-sky-700 animate-pulse"
                      style={{ animationDelay: `${idx * 220}ms` }}
                    >
                      {step}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-3">
                <p className="text-[11px] uppercase tracking-wide text-slate-500">Benefits</p>
                <ul className="mt-1 space-y-1">
                  {e.benefits.map((benefit, idx) => (
                    <li key={`${e.id}-benefit-${idx}`} className="text-xs text-slate-600 leading-5">
                      - {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="bg-white rounded-xl border p-6 text-sm text-gray-500">
            No exercises match your filters.
          </div>
        )}
      </div>
    </div>
  );
}
