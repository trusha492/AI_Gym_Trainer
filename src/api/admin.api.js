import API from "./axios";

export const getOverview = async () => {
  const res = await API.get("/api/admin/overview");
  return res.data;
};

export const getUsers = async () => {
  const res = await API.get("/api/admin/users");
  return res.data;
};

export const getAnalytics = async () => {
  const res = await API.get("/api/admin/analytics");
  return res.data;
};

export const deleteUser = async (userId) => {
  const res = await API.delete(`/api/admin/users/${userId}`);
  return res.data;
};

export const updateUser = async (userId, userData) => {
  const res = await API.put(`/api/admin/users/${userId}`, userData);
  return res.data;
}