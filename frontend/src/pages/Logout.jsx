import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

export default function Logout() {
  const navigate = useNavigate();
  const { clearUser } = useUser();

  useEffect(() => {
    clearUser();          // removes token + user from context/localStorage
    navigate("/login", { replace: true });
  }, [clearUser, navigate]);

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <p className="text-gray-600 text-sm">Logging you out...</p>
    </div>
  );
}
