<<<<<<< HEAD
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
=======
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
>>>>>>> 1a34ac605a79bfc4eed8211d1bc237ddfec690b8
