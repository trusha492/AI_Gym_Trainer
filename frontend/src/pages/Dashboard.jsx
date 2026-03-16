// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import Chatbot from "../components/chatbot/Chatbot";
import ProgressChart from "../components/charts/ProgressChart";
import WeeklyPlanGenerator from "../components/dashboard/WeeklyPlanGenerator";
import GoalForecast from "../components/dashboard/GoalForecast";
import { useDashboard } from "../context/DashboardContext";
import DailyCheckInCard from "../components/dashboard/DailyCheckInCard";
import { fetchRecentCheckins } from "../utils/dailyCheckin";
import { updateProfile } from "../api/user.api";

const ENERGY_SCORE = { low: 1, ok: 2, high: 3 };
const LANG_LABELS = { en: "English", hi: "Hindi", mr: "Marathi" };
const I18N = {
  en: {
    chatCoach: "Chat Coach",
    askTrainer: "Ask your AI trainer anything.",
    planHint: "Your plan is based on today's weight and goal; update them anytime.",
    noCheckins: "No daily check-ins yet.",
    daysLogged: "days logged",
    trainingDays: "training day(s)",
    energy: "energy",
    mixed: "mixed",
    high: "high",
    steady: "steady",
    low: "low",
    loadError: "Unable to load dashboard data. Please log in again.",
    goLogin: "Go to Login",
    loading: "Loading dashboard...",
    preferredLanguage: "Preferred Language",
    performanceHub: "MoveMentor Performance Hub",
    language: "Language",
    welcomeBack: "Welcome back",
    fallbackAthlete: "Athlete",
    heroSub: "Focus on one win today. Your metrics and coach are synced in real time.",
    todayWorkout: "Today's Workout",
    exerciseLibrary: "Exercise Library",
    inputHistory: "Input History",
    logout: "Logout",
    currentWeight: "Current weight",
    weeklyDeltaSuffix: "kg this week",
    trackWeekly: "Track daily to see weekly trend",
    caloriesToday: "Calories today",
    goal: "Goal",
    workoutsThisWeek: "Workouts this week",
    keepStreak: "Keep the streak going!",
    mealsTracker: "Meals Progress Tracker",
    calorieVsGoal: "Calorie intake vs daily goal",
    setGoal: "Set goal",
    underTarget: "Under target",
    onTrack: "On track",
    overTarget: "Over target",
    progress: "Progress",
    remaining: "Remaining",
    noGoal: "No goal",
    addGoalHint: "Add daily calorie goal to see remaining.",
    aboveTargetSuffix: "kcal above target today",
    remainingSuffix: "kcal remaining today",
    weightTracker: "Weight Progress Tracker",
    weightBmiRange: "Current weight and BMI ideal range",
    trend: "Trend",
    range: "Range",
    idealRange: "Ideal range (BMI 18.5-24.9):",
    unavailableRange: "Unavailable (need height/BMI data)",
    noWeightData: "No weight data yet. Log check-ins to see your trend.",
    weeklyMovement: "Weekly movement",
    noWeeklyChange: "No weekly change data yet",
    idealZone: "Ideal zone",
    current: "Current",
    bmi: "BMI",
  },
  hi: {
    chatCoach: "चैट कोच",
    askTrainer: "अपने AI ट्रेनर से कुछ भी पूछें।",
    planHint: "आपकी योजना आज के वजन और लक्ष्य पर आधारित है; कभी भी अपडेट करें।",
    noCheckins: "अभी तक कोई डेली चेक-इन नहीं।",
    daysLogged: "दिन लॉग किए",
    trainingDays: "ट्रेनिंग दिन",
    energy: "ऊर्जा",
    mixed: "मिश्रित",
    high: "उच्च",
    steady: "स्थिर",
    low: "कम",
    loadError: "डैशबोर्ड डेटा लोड नहीं हो सका। कृपया फिर से लॉग इन करें।",
    goLogin: "लॉगिन पर जाएं",
    loading: "डैशबोर्ड लोड हो रहा है...",
    preferredLanguage: "पसंदीदा भाषा",
    performanceHub: "मूवमेंटर परफॉर्मेंस हब",
    language: "भाषा",
    welcomeBack: "वापसी पर स्वागत है",
    fallbackAthlete: "एथलीट",
    heroSub: "आज एक जीत पर ध्यान दें। आपके मेट्रिक्स और कोच रियल टाइम में सिंक हैं।",
    todayWorkout: "आज का वर्कआउट",
    exerciseLibrary: "एक्सरसाइज लाइब्रेरी",
    inputHistory: "इनपुट हिस्ट्री",
    logout: "लॉगआउट",
    currentWeight: "वर्तमान वजन",
    weeklyDeltaSuffix: "किलो इस सप्ताह",
    trackWeekly: "साप्ताहिक ट्रेंड देखने के लिए रोज ट्रैक करें",
    caloriesToday: "आज की कैलोरी",
    goal: "लक्ष्य",
    workoutsThisWeek: "इस सप्ताह वर्कआउट",
    keepStreak: "अपनी स्ट्रीक जारी रखें!",
    mealsTracker: "मील प्रोग्रेस ट्रैकर",
    calorieVsGoal: "कैलोरी सेवन बनाम दैनिक लक्ष्य",
    setGoal: "लक्ष्य सेट करें",
    underTarget: "लक्ष्य से कम",
    onTrack: "सही ट्रैक पर",
    overTarget: "लक्ष्य से अधिक",
    progress: "प्रगति",
    remaining: "शेष",
    noGoal: "कोई लक्ष्य नहीं",
    addGoalHint: "शेष देखने के लिए दैनिक कैलोरी लक्ष्य जोड़ें।",
    aboveTargetSuffix: "कैलोरी लक्ष्य से अधिक",
    remainingSuffix: "कैलोरी आज शेष",
    weightTracker: "वजन प्रोग्रेस ट्रैकर",
    weightBmiRange: "वर्तमान वजन और BMI आदर्श रेंज",
    trend: "ट्रेंड",
    range: "रेंज",
    idealRange: "आदर्श रेंज (BMI 18.5-24.9):",
    unavailableRange: "उपलब्ध नहीं (ऊंचाई/BMI डेटा चाहिए)",
    noWeightData: "अभी वजन डेटा नहीं है। ट्रेंड देखने के लिए चेक-इन लॉग करें।",
    weeklyMovement: "साप्ताहिक बदलाव",
    noWeeklyChange: "साप्ताहिक बदलाव डेटा उपलब्ध नहीं",
    idealZone: "आदर्श क्षेत्र",
    current: "वर्तमान",
    bmi: "BMI",
  },
  mr: {
    chatCoach: "चॅट कोच",
    askTrainer: "तुमच्या AI ट्रेनरला काहीही विचारा.",
    planHint: "तुमची योजना आजच्या वजन आणि ध्येयावर आधारित आहे; कधीही अपडेट करा.",
    noCheckins: "अजून कोणतेही दैनिक चेक-इन नाहीत.",
    daysLogged: "दिवस नोंदवले",
    trainingDays: "प्रशिक्षण दिवस",
    energy: "ऊर्जा",
    mixed: "मिश्र",
    high: "उच्च",
    steady: "स्थिर",
    low: "कमी",
    loadError: "डॅशबोर्ड डेटा लोड झाला नाही. कृपया पुन्हा लॉगिन करा.",
    goLogin: "लॉगिनकडे जा",
    loading: "डॅशबोर्ड लोड होत आहे...",
    preferredLanguage: "प्राधान्य भाषा",
    performanceHub: "मूव्हमेंटर परफॉर्मन्स हब",
    language: "भाषा",
    welcomeBack: "पुन्हा स्वागत आहे",
    fallbackAthlete: "खेळाडू",
    heroSub: "आज एका विजयावर लक्ष द्या. तुमचे मेट्रिक्स आणि कोच रिअल टाइममध्ये सिंक आहेत.",
    todayWorkout: "आजचा वर्कआउट",
    exerciseLibrary: "व्यायाम लायब्ररी",
    inputHistory: "इनपुट इतिहास",
    logout: "लॉगआउट",
    currentWeight: "सध्याचे वजन",
    weeklyDeltaSuffix: "किलो या आठवड्यात",
    trackWeekly: "साप्ताहिक ट्रेंडसाठी रोज ट्रॅक करा",
    caloriesToday: "आजच्या कॅलरीज",
    goal: "ध्येय",
    workoutsThisWeek: "या आठवड्यातील वर्कआउट",
    keepStreak: "सातत्य टिकवा!",
    mealsTracker: "मील प्रगती ट्रॅकर",
    calorieVsGoal: "कॅलरी सेवन विरुद्ध दैनिक ध्येय",
    setGoal: "ध्येय सेट करा",
    underTarget: "ध्येयापेक्षा कमी",
    onTrack: "योग्य मार्गावर",
    overTarget: "ध्येयापेक्षा जास्त",
    progress: "प्रगती",
    remaining: "शिल्लक",
    noGoal: "ध्येय नाही",
    addGoalHint: "शिल्लक पाहण्यासाठी दैनिक कॅलरी ध्येय जोडा.",
    aboveTargetSuffix: "कॅलरी आज ध्येयापेक्षा जास्त",
    remainingSuffix: "कॅलरी आज शिल्लक",
    weightTracker: "वजन प्रगती ट्रॅकर",
    weightBmiRange: "सध्याचे वजन आणि BMI आदर्श श्रेणी",
    trend: "ट्रेंड",
    range: "श्रेणी",
    idealRange: "आदर्श श्रेणी (BMI 18.5-24.9):",
    unavailableRange: "उपलब्ध नाही (उंची/BMI डेटा आवश्यक)",
    noWeightData: "अजून वजन डेटा नाही. ट्रेंड पाहण्यासाठी चेक-इन नोंदवा.",
    weeklyMovement: "साप्ताहिक बदल",
    noWeeklyChange: "साप्ताहिक बदल डेटा उपलब्ध नाही",
    idealZone: "आदर्श विभाग",
    current: "सध्याचे",
    bmi: "BMI",
  },
};

function buildCheckInInsight(recent, t) {
  if (!recent.length) {
    return { text: t.noCheckins };
  }

  const trainedDays = recent.filter((item) => item.trained === true).length;
  const energyScores = recent
    .map((item) => ENERGY_SCORE[item.energy])
    .filter((score) => Number.isFinite(score));

  let energyLabel = t.mixed;
  if (energyScores.length > 0) {
    const avg = energyScores.reduce((sum, score) => sum + score, 0) / energyScores.length;
    if (avg >= 2.6) energyLabel = t.high;
    else if (avg >= 1.8) energyLabel = t.steady;
    else energyLabel = t.low;
  }

  return {
    text: `${recent.length}/7 ${t.daysLogged} | ${trainedDays} ${t.trainingDays} | ${t.energy} ${energyLabel}`,
  };
}

function ChatHeader({ language, onLanguageChange, t }) {
  return (
    <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-sky-50 to-emerald-50">
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[13px] font-bold bg-white text-sky-700 border border-sky-100">
          <img src="/movementor-favicon.svg" alt="MoveMentor logo" className="w-5 h-5 rounded-sm" />
          <span>Move Mentor AI Coach</span>
        </div>
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="text-xs px-2 py-1 rounded-md border border-slate-300 bg-white text-slate-700"
        >
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          <option value="mr">Marathi</option>
        </select>
      </div>
      <h3 className="font-bold text-slate-900 mt-2 text-lg">{t.chatCoach}</h3>
      <p className="text-xs text-slate-600">{t.askTrainer}</p>
      <p className="text-[11px] text-sky-700 mt-1 font-medium">
        {t.planHint}
      </p>
    </div>
  );
}

function MealsProgressTracker({ stats, t }) {
  const [mode, setMode] = useState("progress");
  const caloriesToday = Number(stats?.calories_today ?? 0);
  const caloriesTarget = Number(stats?.calories_target ?? 0);
  const hasTarget = Number.isFinite(caloriesTarget) && caloriesTarget > 0;
  const pct = hasTarget ? Math.max(0, Math.min(100, Math.round((caloriesToday / caloriesTarget) * 100))) : 0;
  const remaining = hasTarget ? Math.max(0, caloriesTarget - caloriesToday) : null;
  const overBy = hasTarget ? Math.max(0, caloriesToday - caloriesTarget) : 0;
  const status =
    !hasTarget ? t.setGoal : pct < 70 ? t.underTarget : pct <= 100 ? t.onTrack : t.overTarget;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 transition hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900">{t.mealsTracker}</h3>
          <p className="text-xs text-slate-500">{t.calorieVsGoal}</p>
        </div>
        <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-full">
          {status}
        </span>
      </div>

      <div className="mt-3 inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs">
        <button
          type="button"
          onClick={() => setMode("progress")}
          className={`px-2 py-1 rounded-md ${mode === "progress" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"}`}
        >
          {t.progress}
        </button>
        <button
          type="button"
          onClick={() => setMode("delta")}
          className={`px-2 py-1 rounded-md ${mode === "delta" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"}`}
        >
          {t.remaining}
        </button>
      </div>

      <div className="mt-3">
        <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        {mode === "progress" ? (
          <p className="mt-2 text-sm text-slate-700 font-medium">
            {stats?.calories_today != null ? `${stats.calories_today} kcal` : "-"} /{" "}
            {stats?.calories_target != null ? `${stats.calories_target} kcal` : "-"} ({hasTarget ? `${pct}%` : t.noGoal})
          </p>
        ) : (
          <p className="mt-2 text-sm text-slate-700 font-medium">
            {!hasTarget
              ? t.addGoalHint
              : overBy > 0
                ? `${overBy} ${t.aboveTargetSuffix}`
                : `${remaining} ${t.remainingSuffix}`}
          </p>
        )}
      </div>
    </div>
  );
}

function WeightProgressTracker({ stats, checkInInsightText, t }) {
  const [view, setView] = useState("trend");
  const currentWeight = Number(stats?.current_weight ?? NaN);
  const bmi = Number(stats?.bmi ?? NaN);
  let idealMin = null;
  let idealMax = null;

  if (Number.isFinite(currentWeight) && Number.isFinite(bmi) && bmi > 0) {
    const heightM = Math.sqrt(currentWeight / bmi);
    idealMin = 18.5 * heightM * heightM;
    idealMax = 24.9 * heightM * heightM;
  }

  const idealText =
    idealMin != null && idealMax != null
      ? `${idealMin.toFixed(1)} - ${idealMax.toFixed(1)} kg`
      : t.unavailableRange;
  const rangeSpan = idealMin != null && idealMax != null ? idealMax - idealMin : null;
  const marker =
    rangeSpan && Number.isFinite(currentWeight)
      ? Math.max(0, Math.min(100, ((currentWeight - idealMin) / rangeSpan) * 100))
      : null;
  const weeklyChange = Number(stats?.weight_change_week ?? NaN);
  const weeklyLabel = Number.isFinite(weeklyChange)
    ? weeklyChange > 0
      ? `+${weeklyChange.toFixed(1)} kg this week`
      : `${weeklyChange.toFixed(1)} kg this week`
    : t.noWeeklyChange;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 h-[320px] transition hover:shadow-md">
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-bold text-slate-900">{t.weightTracker}</h3>
          <p className="text-xs text-slate-500">{t.weightBmiRange}</p>
          <p className="text-xs text-sky-700 mt-1 font-medium">{checkInInsightText}</p>
        </div>
        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs">
          <button
            type="button"
            onClick={() => setView("trend")}
            className={`px-2 py-1 rounded-md ${view === "trend" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"}`}
          >
            {t.trend}
          </button>
          <button
            type="button"
            onClick={() => setView("range")}
            className={`px-2 py-1 rounded-md ${view === "range" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600"}`}
          >
            {t.range}
          </button>
        </div>
      </div>
      <p className="text-xs text-slate-600 mb-2">{t.idealRange} {idealText}</p>

      <div className="border border-dashed border-slate-300 rounded-xl h-[232px] bg-slate-50/40">
        {view === "trend" ? (
          stats.weekly_progress && stats.weekly_progress.length > 0 ? (
            <div className="h-full p-2">
              <ProgressChart data={stats.weekly_progress} />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm">
              {t.noWeightData}
            </div>
          )
        ) : (
          <div className="h-full p-4 flex flex-col justify-center">
            <p className="text-sm font-semibold text-slate-800">{t.weeklyMovement}</p>
            <p className="text-xs text-slate-600 mt-1">{weeklyLabel}</p>
            <div className="mt-4">
              <div className="h-3 rounded-full bg-gradient-to-r from-rose-200 via-emerald-200 to-sky-200 relative">
                {marker != null && (
                  <span
                    className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-slate-900 border-2 border-white shadow"
                    style={{ left: `calc(${marker}% - 6px)` }}
                  />
                )}
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-slate-500">
                <span>{idealMin != null ? `${idealMin.toFixed(1)} kg` : "-"}</span>
                <span>{t.idealZone}</span>
                <span>{idealMax != null ? `${idealMax.toFixed(1)} kg` : "-"}</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-600">
              {t.current}: <span className="font-semibold text-slate-900">{Number.isFinite(currentWeight) ? `${currentWeight} kg` : "-"}</span>
              {" | "}{t.bmi}: <span className="font-semibold text-slate-900">{Number.isFinite(bmi) ? bmi.toFixed(1) : "-"}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { stats, loading } = useDashboard();
  const [language, setLanguage] = useState("en");
  const [checkInRefreshKey, setCheckInRefreshKey] = useState(0);
  const [checkInInsight, setCheckInInsight] = useState({ text: "No daily check-ins yet." });
  const t = I18N[language] || I18N.en;

  const handleLogout = () => {
    navigate("/logout");
  };

  useEffect(() => {
    const fromProfile = user?.profile?.preferred_language;
    const fromLocal = localStorage.getItem("preferredLanguage");
    setLanguage(fromProfile || fromLocal || "en");
  }, [user?.id, user?.profile?.preferred_language]);

  const handleLanguageChange = async (nextLang) => {
    setLanguage(nextLang);
    localStorage.setItem("preferredLanguage", nextLang);
    try {
      await updateProfile({ preferred_language: nextLang });
    } catch (err) {
      console.error("Failed saving preferred language", err);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      const recent = await fetchRecentCheckins(7, user?.id);
      if (!mounted) return;
      setCheckInInsight(buildCheckInInsight(recent, t));
    })();
    return () => {
      mounted = false;
    };
  }, [checkInRefreshKey, user?.id, language]);

  useEffect(() => {
    if (!loading && !stats) {
      const token = localStorage.getItem("accessToken");
      if (!token) navigate("/login", { replace: true });
    }
  }, [loading, stats, navigate]);

  if (!stats && !loading) {
    return (
      <div className="min-h-screen lg:h-screen flex flex-col lg:flex-row bg-slate-50">
        <div className="flex-1 p-4">
          <p className="text-red-500">{t.loadError}</p>
          <button
            type="button"
            onClick={() => navigate("/login", { replace: true })}
            className="mt-3 text-sm px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            {t.goLogin}
          </button>
        </div>
        <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l bg-white flex flex-col min-h-0">
          <ChatHeader language={language} onLanguageChange={handleLanguageChange} t={t} />
          <div className="flex-1 p-4 min-h-0">
            <div className="h-full border border-gray-200 rounded-lg overflow-hidden">
              <Chatbot language={language} onLanguageChange={handleLanguageChange} showLanguageSelector={false} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats && loading) {
    return (
      <div className="min-h-screen lg:h-screen flex flex-col lg:flex-row bg-slate-50">
        <div className="flex-1 p-4 text-gray-500">{t.loading}</div>
        <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l bg-white flex flex-col min-h-0">
          <ChatHeader language={language} onLanguageChange={handleLanguageChange} t={t} />
          <div className="flex-1 p-4 min-h-0">
            <div className="h-full border border-gray-200 rounded-lg overflow-hidden">
              <Chatbot language={language} onLanguageChange={handleLanguageChange} showLanguageSelector={false} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:h-screen flex flex-col lg:flex-row bg-gradient-to-br from-sky-50 via-white to-emerald-50">
      <div className="flex-1 flex flex-col gap-4 p-4 overflow-y-auto min-h-0">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-3 flex items-center justify-between mm-reveal" style={{ animationDelay: "20ms" }}>
          <p className="text-sm font-semibold text-slate-700">{t.preferredLanguage}</p>
          <div className="flex items-center gap-2">
            {[
              { code: "en", label: "English" },
              { code: "hi", label: "Hindi" },
              { code: "mr", label: "Marathi" },
            ].map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleLanguageChange(lang.code)}
                className={`text-xs px-3 py-1.5 rounded-full border ${
                  language === lang.code
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        <div
          className="rounded-2xl bg-gradient-to-r from-slate-900 via-blue-900 to-sky-800 text-white p-6 shadow-lg border border-slate-700/40 flex flex-col gap-4 shrink-0 mm-reveal"
          style={{ animationDelay: "40ms" }}
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[13px] font-bold bg-white/15 border border-white/25">
              <img src="/movementor-favicon.svg" alt="MoveMentor logo" className="w-5 h-5 rounded-sm" />
              <span>{t.performanceHub}</span>
            </div>
            <p className="text-xs text-sky-100 mt-2">{t.language}: {LANG_LABELS[language] || "English"}</p>
            <h2 className="text-2xl sm:text-3xl font-bold mt-3 leading-tight">
              {t.welcomeBack}, {user?.first_name || user?.name || t.fallbackAthlete}
            </h2>
            <p className="text-sm text-sky-100 mt-2 font-medium">
              {t.heroSub}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
            <button
              onClick={() => navigate("/today-workout")}
              className="text-xs px-3 py-2.5 rounded-xl bg-white text-slate-900 font-semibold hover:bg-slate-100 transition"
            >
              {t.todayWorkout}
            </button>
            <button
              onClick={() => navigate("/exercises")}
              className="text-xs px-3 py-2.5 rounded-xl border border-white/40 bg-white/10 text-white hover:bg-white/20 transition"
            >
              {t.exerciseLibrary}
            </button>
            <button
              onClick={() => navigate("/nutrition")}
              className="text-xs px-3 py-2.5 rounded-xl border border-white/40 bg-white/10 text-white hover:bg-white/20 transition"
            >
              {t.inputHistory}
            </button>
            <button
              onClick={handleLogout}
              className="text-xs px-3 py-2.5 rounded-xl bg-rose-500 text-white hover:bg-rose-600 font-semibold transition"
            >
              {t.logout}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 min-h-[124px] mm-reveal" style={{ animationDelay: "90ms" }}>
            <p className="text-xs uppercase tracking-wide text-slate-500">{t.currentWeight}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {stats.current_weight != null ? `${stats.current_weight} kg` : "-"}
            </p>
            <p className="mt-2 text-xs text-emerald-700 font-semibold">
              {stats.weight_change_week != null
                ? `${stats.weight_change_week.toFixed(1)} ${t.weeklyDeltaSuffix}`
                : t.trackWeekly}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 min-h-[124px] mm-reveal" style={{ animationDelay: "140ms" }}>
            <p className="text-xs uppercase tracking-wide text-slate-500">{t.caloriesToday}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {stats.calories_today != null ? stats.calories_today : "-"}
            </p>
            <p className="mt-2 text-xs text-slate-600 font-medium">
              {t.goal}: {stats.calories_target != null ? `${stats.calories_target} kcal` : "-"}
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 min-h-[124px] mm-reveal" style={{ animationDelay: "190ms" }}>
            <p className="text-xs uppercase tracking-wide text-slate-500">{t.workoutsThisWeek}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {stats.workouts_this_week != null ? stats.workouts_this_week : "-"}
            </p>
            <p className="mt-2 text-xs text-sky-700 font-semibold">{t.keepStreak}</p>
          </div>
        </div>

        <div className="bg-white/90 rounded-2xl border border-slate-200 shadow-sm p-1 mm-reveal" style={{ animationDelay: "240ms" }}>
          <DailyCheckInCard language={language} userId={user?.id} onChange={() => setCheckInRefreshKey((v) => v + 1)} />
        </div>

        <div className="bg-white/90 rounded-2xl border border-slate-200 shadow-sm p-1 mm-reveal" style={{ animationDelay: "300ms" }}>
          <WeeklyPlanGenerator stats={stats} language={language} />
        </div>

        <div className="bg-white/90 rounded-2xl border border-slate-200 shadow-sm p-1 mm-reveal" style={{ animationDelay: "360ms" }}>
          <GoalForecast stats={stats} language={language} />
        </div>

        <div className="mm-reveal" style={{ animationDelay: "420ms" }}>
          <MealsProgressTracker stats={stats} t={t} />
        </div>

        <div className="mm-reveal" style={{ animationDelay: "480ms" }}>
          <WeightProgressTracker stats={stats} checkInInsightText={checkInInsight.text} t={t} />
        </div>
      </div>

      <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-slate-200 bg-white/85 backdrop-blur-sm flex flex-col min-h-0 h-[70vh] lg:h-auto">
        <ChatHeader language={language} onLanguageChange={handleLanguageChange} t={t} />
        <div className="flex-1 p-4 min-h-0">
          <div className="h-full border border-slate-200 rounded-xl overflow-hidden bg-white">
            <Chatbot language={language} onLanguageChange={handleLanguageChange} showLanguageSelector={false} />
          </div>
        </div>
      </div>
    </div>
  );
}
