import {
  getDailyCheckinToday,
  getRecentDailyCheckins,
  upsertDailyCheckinToday,
} from "../api/user.api";

const DAILY_CHECKIN_KEY = "daily_checkins_v1";
const userScopedKey = (userId) => `${DAILY_CHECKIN_KEY}_user_${userId || "anon"}`;

export const getDateKey = (date = new Date()) => date.toISOString().slice(0, 10);

export const readDailyCheckins = (userId) => {
  try {
    const raw = localStorage.getItem(userScopedKey(userId));
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

export const writeDailyCheckins = (store, userId) => {
  localStorage.setItem(userScopedKey(userId), JSON.stringify(store));
};

export const getTodayCheckin = (userId) => {
  const store = readDailyCheckins(userId);
  return store[getDateKey()] || null;
};

const mergeLocalEntry = (dateKey, patch, userId) => {
  const store = readDailyCheckins(userId);
  const next = {
    ...store,
    [dateKey]: {
      ...(store[dateKey] || {}),
      ...patch,
      updated_at: new Date().toISOString(),
    },
  };
  writeDailyCheckins(next, userId);
  return next[dateKey];
};

const applyServerRows = (rows, userId) => {
  const store = readDailyCheckins(userId);
  const next = { ...store };
  rows.forEach((row) => {
    if (!row?.date) return;
    next[row.date] = {
      ...(next[row.date] || {}),
      trained: row.trained,
      steps_band: row.steps_band,
      energy: row.energy,
      updated_at: row.updated_at || new Date().toISOString(),
    };
  });
  writeDailyCheckins(next, userId);
};

export const upsertTodayCheckin = async (patch, userId) => {
  const todayKey = getDateKey();
  const optimistic = mergeLocalEntry(todayKey, patch, userId);
  try {
    const saved = await upsertDailyCheckinToday(patch);
    if (saved?.date) {
      applyServerRows([saved], userId);
      return readDailyCheckins(userId)[saved.date] || optimistic;
    }
    return optimistic;
  } catch {
    return optimistic;
  }
};

export const fetchTodayCheckin = async (userId) => {
  try {
    const row = await getDailyCheckinToday();
    if (row?.date) {
      applyServerRows([row], userId);
      return readDailyCheckins(userId)[row.date] || row;
    }
    return getTodayCheckin(userId);
  } catch {
    return getTodayCheckin(userId);
  }
};

export const getRecentCheckins = (days = 7, userId) => {
  const store = readDailyCheckins(userId);
  const rows = [];
  const cursor = new Date();

  for (let i = 0; i < days; i += 1) {
    const dayKey = getDateKey(cursor);
    if (store[dayKey]) {
      rows.push({ date: dayKey, ...store[dayKey] });
    }
    cursor.setDate(cursor.getDate() - 1);
  }

  return rows;
};

export const fetchRecentCheckins = async (days = 7, userId) => {
  try {
    const rows = await getRecentDailyCheckins(days);
    if (Array.isArray(rows)) {
      applyServerRows(rows, userId);
    }
  } catch {
    // fall back to local cache
  }
  return getRecentCheckins(days, userId);
};
