<<<<<<< HEAD
// admin-frontend/src/api/axios.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000",
});

API.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("adminAccessToken") ||
    localStorage.getItem("accessToken");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

=======
// src/api/axios.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://192.168.1.8:8000",
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers = config.headers || {};
    if (!config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      localStorage.removeItem("accessToken");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

>>>>>>> 1a34ac605a79bfc4eed8211d1bc237ddfec690b8
export default API;
