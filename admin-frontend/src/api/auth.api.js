<<<<<<< HEAD
// admin-frontend/src/api/auth.api.js
import API from "./axios";

export const login = async (email, password) => {
  const body = new URLSearchParams({ username: email, password });
  const res = await API.post("/api/auth/login", body);
  localStorage.setItem("adminAccessToken", res.data.access_token);
  try {
    await API.get("/api/admin/overview");
  } catch (err) {
    localStorage.removeItem("adminAccessToken");
    throw err;
  }
  return res.data;
};

export const registerAdmin = async ({ name, email, password, adminKey }) => {
  const res = await API.post("/api/auth/register-admin", {
    name,
    email,
    password,
    admin_key: adminKey || null,
  });
  return res.data;
};
=======
// admin-frontend/src/api/auth.api.js
import API from "./axios";

export const login = async (email, password) => {
  const body = new URLSearchParams({ username: email, password });
  const res = await API.post("/api/auth/login", body);
  localStorage.setItem("adminAccessToken", res.data.access_token);
  try {
    await API.get("/api/admin/overview");
  } catch (err) {
    localStorage.removeItem("adminAccessToken");
    throw err;
  }
  return res.data;
};

export const registerAdmin = async ({ name, email, password, adminKey }) => {
  const res = await API.post("/api/auth/register-admin", {
    name,
    email,
    password,
    admin_key: adminKey || null,
  });
  return res.data;
};
>>>>>>> e5dfb0c (Removed venv and updated gitignore)
