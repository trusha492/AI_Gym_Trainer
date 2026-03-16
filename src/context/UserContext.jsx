import { createContext, useContext, useEffect, useState } from "react";
import { getProfile } from "../api/user.api";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    const token = localStorage.getItem("accessToken");  // <- changed

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const data = await getProfile(token);
      setUser(data);
    } catch (err) {
      console.error("Failed to load user", err);
      localStorage.removeItem("accessToken");          // <- changed
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const clearUser = () => {
    localStorage.removeItem("accessToken");            // <- changed
    setUser(null);
  };

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        reloadUser: loadUser,
        clearUser,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
