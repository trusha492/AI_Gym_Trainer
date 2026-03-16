// src/context/DashboardContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { getDashboardData } from "../api/user.api";

const DashboardContext = createContext(null);

export function DashboardProvider({ children }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await getDashboardData(); // weight, bmi, calories
      setStats(data);
    } catch (err) {
      console.error("Failed to load dashboard", err); // prevents uncaught AxiosError
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) loadDashboard();
    else setLoading(false);
  }, []);

  return (
    <DashboardContext.Provider
      value={{ stats, loading, reloadDashboard: loadDashboard }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export const useDashboard = () => useContext(DashboardContext);
