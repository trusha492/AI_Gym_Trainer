import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { UserProvider } from "./context/UserContext";
import { DashboardProvider } from "./context/DashboardContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
   <UserProvider>
    <DashboardProvider>
      <App />
    </DashboardProvider>
  </UserProvider>
  </React.StrictMode>
);
