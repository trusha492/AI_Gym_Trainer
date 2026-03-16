<<<<<<< HEAD
// admin-frontend/src/api/auth.api.js
=======
>>>>>>> 1a34ac605a79bfc4eed8211d1bc237ddfec690b8
import API from "./axios";

export const login = async (email, password) => {
  const body = new URLSearchParams({ username: email, password });
  const res = await API.post("/api/auth/login", body);
<<<<<<< HEAD
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
  localStorage.setItem("accessToken", res.data.access_token);
  return res.data;
};

export const register = (data) => API.post("/api/auth/register", data);
>>>>>>> 1a34ac605a79bfc4eed8211d1bc237ddfec690b8
