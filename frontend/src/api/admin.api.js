// frontend/src/api/admin.api.js
import API from "./axios";

export const fetchAdminOverview = async () => {
  const res = await API.get("/api/admin/overview");
  return res.data;
};

export const fetchAdminUsers = async () => {
  const res = await API.get("/api/admin/users");
  return res.data;
};

export const fetchAdminAnalytics = async () => {
  const res = await API.get("/api/admin/analytics");
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await API.delete(`/api/admin/users/${id}`);
  return res.data;
};
