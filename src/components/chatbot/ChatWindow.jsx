import { useState } from "react";
import API from "../../api/axios";
import { useDashboard } from "../../context/DashboardContext";

export default function ChatWindow() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hi! I'm your AI gym trainer. Tell me your fitness goal and ask about workouts or nutrition.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const [mode, setMode] = useState("text");  // "text" | "diet"
  const [file, setFile] = useState(null);    // diet image file

  const { reloadDashboard } = useDashboard();

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    // Show user message
    setMessages((prev) => [...prev, { from: "user", text }]);
    setInput("");
    setLoading(true);

    try {
      let res;

      if (mode === "text") {
        // Normal chat
        res = await API.post("/api/chatbot/chat", { message: text });
      } else {
        // Diet from image
        const form = new FormData();
        form.append("message", text);
        if (file) form.append("file", file);

        res = await API.post("/api/chatbot/diet", form, {
          headers: {
            "Content-Type": "multipart/form-data",
            // Authorization is added by interceptor
          },
        });
      }

      const data = res?.data || {};
      const reply = data.reply || "I couldn't respond right now.";

      // Show bot reply
      setMessages((prev) => [...prev, { from: "bot", text: reply }]);

      // If backend says stats changed, refresh dashboard immediately
      if (data.dashboard_updated) {
        reloadDashboard();
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: "Sorry, there was an error talking to your AI trainer.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Mode + file selector */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex gap-3 text-xs">
          <button
            type="button"
            onClick={() => setMode("text")}
            className={
              mode === "text"
                ? "font-semibold text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }
          >
            Goal / Q&A
          </button>
          <button
            type="button"
            onClick={() => setMode("diet")}
            className={
              mode === "diet"
                ? "font-semibold text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }
          >
            Diet from image
          </button>
        </div>

        {mode === "diet" && (
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files[0] || null)}
            className="text-xs"
          />
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-3 pr-1">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
              m.from === "user"
                ? "ml-auto bg-blue-600 text-white"
                : "mr-auto bg-gray-100 text-gray-800"
            }`}
          >
            {m.text}
          </div>
        ))}
        {loading && (
          <div className="mr-auto bg-gray-100 text-gray-500 px-3 py-2 rounded-lg text-sm">
            Typing…
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 mt-auto">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            mode === "diet"
              ? "Describe the meal and upload an image..."
              : "Ask your AI trainer about goals, workouts, or diet..."
          }
          className="flex-1 border rounded-lg px-3 py-2 text-sm resize-none h-16 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={send}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
