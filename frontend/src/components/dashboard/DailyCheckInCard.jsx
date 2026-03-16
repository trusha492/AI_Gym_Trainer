import { useEffect, useMemo, useState } from "react";
import { fetchTodayCheckin, getTodayCheckin, upsertTodayCheckin } from "../../utils/dailyCheckin";

const STEPS_OPTIONS = [
  { value: "<4k", label: "<4k" },
  { value: "4-8k", label: "4-8k" },
  { value: "8k+", label: "8k+" },
];

const ENERGY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "ok", label: "OK" },
  { value: "high", label: "High" },
];
const I18N = {
  en: {
    title: "Today check-in",
    subtitle: "2-minute log to keep your plan adaptive.",
    done: "Done",
    progress: "In progress",
    notStarted: "Not started",
    trained: "Did you train today?",
    yes: "Yes",
    no: "No",
    steps: "Steps roughly?",
    energy: "Energy today?",
    low: "Low",
    ok: "OK",
    high: "High",
  },
  hi: {
    title: "आज का चेक-इन",
    subtitle: "योजना को बेहतर रखने के लिए 2 मिनट का लॉग।",
    done: "पूरा",
    progress: "प्रगति में",
    notStarted: "शुरू नहीं",
    trained: "क्या आपने आज ट्रेनिंग की?",
    yes: "हाँ",
    no: "नहीं",
    steps: "लगभग कितने कदम?",
    energy: "आज ऊर्जा कैसी है?",
    low: "कम",
    ok: "ठीक",
    high: "उच्च",
  },
  mr: {
    title: "आजचा चेक-इन",
    subtitle: "योजना योग्य ठेवण्यासाठी 2 मिनिटांची नोंद.",
    done: "पूर्ण",
    progress: "प्रगतीत",
    notStarted: "सुरू नाही",
    trained: "आज तुम्ही प्रशिक्षण घेतले का?",
    yes: "हो",
    no: "नाही",
    steps: "अंदाजे पावले?",
    energy: "आजची ऊर्जा?",
    low: "कमी",
    ok: "ठीक",
    high: "उच्च",
  },
};

function PillButton({ active, children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1 rounded-full text-xs border ${
        active
          ? "bg-blue-600 text-white border-blue-600"
          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );
}

export default function DailyCheckInCard({ onChange, userId, language = "en" }) {
  const t = I18N[language] || I18N.en;
  const [checkIn, setCheckIn] = useState(() => getTodayCheckin(userId) || {});

  useEffect(() => {
    setCheckIn(getTodayCheckin(userId) || {});
    let mounted = true;
    (async () => {
      const row = await fetchTodayCheckin(userId);
      if (mounted && row) setCheckIn(row);
    })();
    return () => {
      mounted = false;
    };
  }, [userId]);

  const isComplete = Boolean(checkIn.trained != null && checkIn.steps_band && checkIn.energy);

  const statusLabel = useMemo(() => {
    if (isComplete) return t.done;
    if (checkIn.trained != null || checkIn.steps_band || checkIn.energy) return t.progress;
    return t.notStarted;
  }, [checkIn.energy, checkIn.steps_band, checkIn.trained, isComplete, t.done, t.notStarted, t.progress]);

  const patchCheckin = async (patch) => {
    const saved = await upsertTodayCheckin(patch, userId);
    setCheckIn(saved);
    onChange?.(saved);
  };

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-800">{t.title}</h3>
          <p className="text-xs text-gray-500">{t.subtitle}</p>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            isComplete ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
          }`}
        >
          {statusLabel}
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs text-gray-600 mb-1">{t.trained}</p>
          <div className="flex gap-2">
            <PillButton active={checkIn.trained === true} onClick={() => patchCheckin({ trained: true })}>
              {t.yes}
            </PillButton>
            <PillButton
              active={checkIn.trained === false}
              onClick={() => patchCheckin({ trained: false })}
            >
              {t.no}
            </PillButton>
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-600 mb-1">{t.steps}</p>
          <div className="flex gap-2 flex-wrap">
            {STEPS_OPTIONS.map((option) => (
              <PillButton
                key={option.value}
                active={checkIn.steps_band === option.value}
                onClick={() => patchCheckin({ steps_band: option.value })}
              >
                {option.label}
              </PillButton>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs text-gray-600 mb-1">{t.energy}</p>
          <div className="flex gap-2 flex-wrap">
            {ENERGY_OPTIONS.map((option) => {
              const label =
                option.value === "low" ? t.low : option.value === "ok" ? t.ok : t.high;
              return (
              <PillButton
                key={option.value}
                active={checkIn.energy === option.value}
                onClick={() => patchCheckin({ energy: option.value })}
              >
                {label}
              </PillButton>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
