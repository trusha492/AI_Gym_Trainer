// src/components/chatbot/Chatbot.jsx
import { useEffect, useRef, useState } from "react";
import { getChatHistory, sendChatMessage, sendImageMessage } from "../../api/chat.api";
import { updateProfile } from "../../api/user.api";
import { useDashboard } from "../../context/DashboardContext";

const stripLogJson = (text) => {
  const safe = typeof text === "string" ? text : "";
  const idx = safe.indexOf("LOG_JSON:");
  return idx === -1 ? safe : safe.slice(0, idx).trimEnd();
};

const buildInlineActions = (content = "") => {
  const text = content.toLowerCase();
  const actions = [];

  if (text.includes("workout")) actions.push("log_workout");

  return [...new Set(actions)];
};

const extractPotentialLogs = (text = "", hasImage = false) => {
  const found = [];
  const lowered = text.toLowerCase();
  const weightMatch = lowered.match(/weight(?:\s*today)?\D{0,20}(\d+(?:\.\d+)?)/);
  const caloriesMatch = lowered.match(
    /(?:burn(?:ed)?|ate|consum(?:e|ed)|calories(?:\s*today)?)\D{0,20}(\d+(?:\.\d+)?)/,
  );

  if (weightMatch) {
    found.push(`weight ${weightMatch[1]} kg`);
  }
  if (caloriesMatch) {
    found.push(`calories ${caloriesMatch[1]} kcal`);
  }
  if (hasImage) {
    found.push("meal calories/macros from the attached image");
  }

  return found;
};

const LANGUAGE_TEXT = {
  en: {
    tryAsking: "Try asking:",
    addImage: "Add image",
    send: "Send",
    placeholder: "Ask MoveMentor anything...",
    imageAttached: 'Image attached. Ask "Is this healthy?" or "How many calories are in this?".',
    remove: "Remove",
    logWorkouts: "Log workouts",
    you: "You",
    starterPrompts: [
      "Build me a workout plan for this week",
      "Suggest a high-protein meal today",
      "How can I improve sleep and recovery?",
    ],
  },
  hi: {
    tryAsking: "यह पूछकर देखें:",
    addImage: "इमेज जोड़ें",
    send: "भेजें",
    placeholder: "MoveMentor से कुछ भी पूछें...",
    imageAttached: 'इमेज जुड़ी है। पूछें "क्या यह हेल्दी है?" या "इसमें कितनी कैलोरी है?".',
    remove: "हटाएं",
    logWorkouts: "वर्कआउट लॉग करें",
    you: "आप",
    starterPrompts: [
      "इस हफ्ते का वर्कआउट प्लान बनाओ",
      "आज के लिए हाई-प्रोटीन मील सुझाओ",
      "नींद और रिकवरी कैसे बेहतर करूं?",
    ],
  },
  mr: {
    tryAsking: "हे विचारून बघा:",
    addImage: "इमेज जोडा",
    send: "पाठवा",
    placeholder: "MoveMentor ला काहीही विचारा...",
    imageAttached: 'इमेज जोडली आहे. विचारा "हे हेल्दी आहे का?" किंवा "यात किती कॅलरीज आहेत?".',
    remove: "काढा",
    logWorkouts: "वर्कआउट लॉग करा",
    you: "तुम्ही",
    starterPrompts: [
      "या आठवड्यासाठी वर्कआउट प्लॅन बनवा",
      "आजसाठी हाय-प्रोटीन मील सुचवा",
      "झोप आणि रिकव्हरी कशी सुधारू?",
    ],
  },
};

export default function Chatbot({ language: externalLanguage, onLanguageChange, showLanguageSelector = true }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [localLanguage, setLocalLanguage] = useState(() => localStorage.getItem("preferredLanguage") || "en");

  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const { reloadDashboard } = useDashboard();
  const language = externalLanguage || localLanguage;
  const t = LANGUAGE_TEXT[language] || LANGUAGE_TEXT.en;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const history = await getChatHistory();
        if (!mounted) return;
        const flat = [];
        history.forEach((row) => {
          flat.push({ role: "user", content: row.user_message });
          flat.push({ role: "assistant", content: stripLogJson(row.ai_reply) });
        });
        setMessages(flat);
      } catch (err) {
        console.error("Failed to load chat history", err);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const scrollToBottom = (behavior = "auto") => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
  };

  const isNearBottom = () => {
    const el = messagesContainerRef.current;
    if (!el) return true;
    const threshold = 80;
    return el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  };

  useEffect(() => {
    scrollToBottom("auto");
  }, []);

  useEffect(() => {
    if (isNearBottom()) scrollToBottom("smooth");
  }, [messages, loading, error]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const sendPayload = async ({ text, file }) => {
    if (loading) return;
    const cleanText = (text || "").trim();
    if (!cleanText && !file) return;

    const displayContent = file ? `${cleanText || "Image uploaded"} (with image)` : cleanText;
    setMessages((prev) => [...prev, { role: "user", content: displayContent }]);
    setError("");
    setLoading(true);

    try {
      let data;
      if (file) {
        const prompt =
          cleanText ||
          "Identify the food item, tell if it is healthy, and estimate calories/macros.";
        data = await sendImageMessage(file, prompt, language);
        clearImage();
      } else {
        data = await sendChatMessage(cleanText, language);
      }

      const replyText = data?.reply ?? data?.ai_reply ?? data?.message;
      if (!replyText) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "I could not generate a reply. Please try again." },
        ]);
        return;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: stripLogJson(replyText) }]);
      await reloadDashboard();
    } catch (err) {
      console.error("Chat error", err);
      setError("Chat request failed. Please check backend server and try again.");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I could not process that right now. Please retry in a few seconds." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    const text = input;
    const file = imageFile;
    const potentialLogs = extractPotentialLogs(text, Boolean(file));
    if (potentialLogs.length > 0) {
      const ok = window.confirm(
        `This message may log: ${potentialLogs.join(", ")}. Continue?`,
      );
      if (!ok) return;
    }
    setInput("");
    await sendPayload({ text, file });
  };

  const handleQuickAction = async (action) => {
    if (loading) return;

    if (action === "log_workout") {
      const count = window.prompt("How many workouts did you complete this week?");
      if (!count) return;
      await sendPayload({ text: `This week I completed ${count} workouts.` });
    }
  };

  const handleLanguageChange = async (nextLang) => {
    localStorage.setItem("preferredLanguage", nextLang);
    if (!externalLanguage) setLocalLanguage(nextLang);
    onLanguageChange?.(nextLang);
    try {
      await updateProfile({ preferred_language: nextLang });
    } catch (err) {
      console.error("Failed to save preferred language", err);
    }
  };

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden bg-gradient-to-b from-sky-50/40 via-white to-emerald-50/30">
      {showLanguageSelector && (
        <div className="px-3 py-2 border-b border-slate-200 bg-white flex items-center justify-end">
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="text-xs px-2 py-1 rounded-md border border-slate-300 bg-white text-slate-700"
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="mr">Marathi</option>
          </select>
        </div>
      )}
      <div
        ref={messagesContainerRef}
        className="flex-1 min-h-0 p-3 space-y-3 overflow-y-auto text-sm"
      >
        {messages.length === 0 && !loading && (
          <div className="rounded-xl border border-sky-100 bg-white/90 p-3 shadow-sm">
            <p className="text-xs font-semibold text-slate-700 mb-2">{t.tryAsking}</p>
            <div className="flex flex-wrap gap-2">
              {t.starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setInput(prompt)}
                  className="text-xs px-2.5 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
        {error && (
          <div className="text-red-700 text-xs bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </div>
        )}
        {messages.map((m, idx) => {
          const isUser = m.role === "user";
          return (
            <div key={idx} className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
              {!isUser && (
                <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-700 text-[11px] font-bold grid place-items-center shrink-0">
                  AI
                </div>
              )}
              <div className={`max-w-[86%] ${isUser ? "items-end" : "items-start"} flex flex-col`}>
                <p className={`text-[11px] mb-1 ${isUser ? "text-slate-500" : "text-sky-700 font-semibold"}`}>
                  {isUser ? t.you : "MoveMentor"}
                </p>
                <div
                  className={
                    isUser
                      ? "inline-block bg-gradient-to-r from-blue-600 to-sky-600 text-white px-3 py-2.5 rounded-2xl rounded-br-md break-words shadow-sm"
                      : "inline-block bg-white text-slate-900 px-3 py-2.5 rounded-2xl rounded-bl-md break-words border border-slate-200 shadow-sm"
                  }
                >
                  {m.content}
                </div>
              </div>
              {isUser && (
                <div className="w-7 h-7 rounded-full bg-slate-800 text-white text-[11px] font-bold grid place-items-center shrink-0">
                  You
                </div>
              )}
            </div>
          );
        })}
        {messages.map((m, idx) => {
          const actions = m.role === "assistant" ? buildInlineActions(m.content) : [];
          if (actions.length === 0) return null;
          return (
            <div key={`a-${idx}`} className="mt-1 flex flex-wrap gap-1">
              {actions.includes("log_workout") && (
                <button
                  type="button"
                  onClick={() => handleQuickAction("log_workout")}
                  className="text-[11px] px-2.5 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold"
                >
                  {t.logWorkouts}
                </button>
              )}
            </div>
          );
        })}
        {loading && (
          <div className="flex items-end gap-2">
            <div className="w-7 h-7 rounded-full bg-sky-100 text-sky-700 text-[11px] font-bold grid place-items-center shrink-0">
              AI
            </div>
            <div className="inline-flex items-center gap-1 bg-white border border-slate-200 rounded-2xl rounded-bl-md px-3 py-2 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse [animation-delay:120ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse [animation-delay:240ms]" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {imagePreview && (
        <div className="border-t border-slate-200 px-3 py-2 flex items-center gap-2 text-xs bg-slate-50 shrink-0">
          <img
            src={imagePreview}
            alt="preview"
            className="w-12 h-12 object-cover rounded-lg border border-slate-200"
          />
          <span className="flex-1 text-slate-600">
            {t.imageAttached}
          </span>
          <button
            type="button"
            onClick={clearImage}
            className="text-rose-600 text-xs font-semibold px-2 py-1 rounded-md hover:bg-rose-50"
          >
            {t.remove}
          </button>
        </div>
      )}

      <form
        onSubmit={handleSend}
        className="border-t border-slate-200 p-2.5 flex flex-wrap sm:flex-nowrap gap-2 items-center shrink-0 bg-white"
      >
        <div className="flex items-center gap-2 shrink-0">
          <label
            htmlFor="chat-image"
            className="text-xs px-3 py-1.5 border border-slate-300 rounded-lg cursor-pointer bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium"
          >
            {t.addImage}
          </label>
          <input
            ref={fileInputRef}
            id="chat-image"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
            disabled={loading}
          />
        </div>

        <input
          type="text"
          className="flex-1 min-w-0 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-400"
          placeholder={t.placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />

        <button
          type="submit"
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50 w-full sm:w-auto"
          disabled={loading || (!input.trim() && !imageFile)}
        >
          {t.send}
        </button>
      </form>
    </div>
  );
}
