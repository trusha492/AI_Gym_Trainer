import API from "./axios";

export const login = async (email, password) => {
  const body = new URLSearchParams({ username: email, password });
  const res = await API.post("/api/auth/login", body);
  localStorage.setItem("accessToken", res.data.access_token);
  return res.data;
};

export const register = (data) => API.post("/api/auth/register", data);