// src/api/chat.api.js
import axios from "./axios";

// Load chat history
export const getChatHistory = async () => {
  const res = await axios.get("/api/chatbot/history");
  return res.data;
};

// Text-only chat
export const sendChatMessage = async (message, preferredLanguage = "en") => {
  const res = await axios.post("/api/chat", {
    message,
    preferred_language: preferredLanguage,
  });
  return res.data; // { reply, dashboard_updated }
};

// Image + optional prompt
export const sendImageMessage = async (file, message = "", preferredLanguage = "en") => {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("prompt", message);
  formData.append("preferred_language", preferredLanguage);

  const res = await axios.post("/api/chatbot/image-chat", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data; // { reply, calories, dashboard_updated? }
};
