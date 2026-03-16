// src/api/user.api.js
import API from "./axios";

export const getProfile = async () => {
  const res = await API.get("/api/user/profile");
  return res.data;
};

export const updateProfile = async (data) => {
  const res = await API.post("/api/user/profile", data);
  return res.data;
};

export const getWeightAnalytics = async () => {
  const res = await API.get("/api/analytics/weight");
  return res.data;
};

export const getDashboardData = async () => {
  const res = await API.get("/api/user/dashboard");
  return res.data;
};

export const getWeeklyPlan = async () => {
  const res = await API.get("/api/user/weekly-plan");
  return res.data;
};

export const saveWeeklyPlan = async (payload) => {
  const res = await API.post("/api/user/weekly-plan", payload);
  return res.data;
};

export const logoutUser = async () => {
  const res = await API.post("/api/auth/logout");
  return res.data;
};

export const getDailyCheckinToday = async () => {
  const res = await API.get("/api/user/daily-checkin/today");
  return res.data;
};

export const upsertDailyCheckinToday = async (payload) => {
  const res = await API.post("/api/user/daily-checkin/today", payload);
  return res.data;
};

export const getRecentDailyCheckins = async (days = 7) => {
  const res = await API.get("/api/user/daily-checkins", { params: { days } });
  return res.data;
};

export const getTodayWorkoutSession = async () => {
  const res = await API.get("/api/user/workout-session/today");
  return res.data;
};

export const upsertTodayWorkoutSession = async (payload) => {
  const res = await API.post("/api/user/workout-session/today", payload);
  return res.data;
};

export const getInputHistory = async (days = 60) => {
  const res = await API.get("/api/user/input-history", { params: { days } });
  return res.data;
};

export const upsertInputHistory = async (payload) => {
  const res = await API.post("/api/user/input-history", payload);
  return res.data;
};
