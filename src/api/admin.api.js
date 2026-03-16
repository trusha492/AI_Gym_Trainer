<<<<<<< HEAD
import API from "./axios";

export const getOverview = async () => {
=======
// frontend/src/api/admin.api.js
import API from "./axios";

export const fetchAdminOverview = async () => {
>>>>>>> 1a34ac605a79bfc4eed8211d1bc237ddfec690b8
  const res = await API.get("/api/admin/overview");
  return res.data;
};

<<<<<<< HEAD
export const getUsers = async () => {
=======
export const fetchAdminUsers = async () => {
>>>>>>> 1a34ac605a79bfc4eed8211d1bc237ddfec690b8
  const res = await API.get("/api/admin/users");
  return res.data;
};

<<<<<<< HEAD
export const getAnalytics = async () => {
=======
export const fetchAdminAnalytics = async () => {
>>>>>>> 1a34ac605a79bfc4eed8211d1bc237ddfec690b8
  const res = await API.get("/api/admin/analytics");
  return res.data;
};

<<<<<<< HEAD
export const deleteUser = async (userId) => {
  const res = await API.delete(`/api/admin/users/${userId}`);
  return res.data;
};

export const updateUser = async (userId, userData) => {
  const res = await API.put(`/api/admin/users/${userId}`, userData);
  return res.data;
}
=======
export const deleteUser = async (id) => {
  const res = await API.delete(`/api/admin/users/${id}`);
  return res.data;
};
>>>>>>> 1a34ac605a79bfc4eed8211d1bc237ddfec690b8
