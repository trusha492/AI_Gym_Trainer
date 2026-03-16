export default function MessageBubble({ type = "ai", text }) {
  return (
    <div
      className={`max-w-[80%] px-4 py-2 rounded-2xl mb-2 text-sm whitespace-pre-line break-words ${
        type === "user"
          ? "ml-auto bg-blue-600 text-white"
          : "mr-auto bg-gray-100 text-gray-900 shadow-sm"
      }`}
    >
      {text}
    </div>
  );
}
