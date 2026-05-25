import { useState } from "react";

import Login from "./screens/Login";
import Home from "./screens/Home";

export default function App() {
  const [screen, setScreen] = useState(() => {
    const token = localStorage.getItem("sicit_token");
    return token ? "home" : "login";
  });

  function handleLogin() {
    setScreen("home");
  }

  function handleLogout() {
    localStorage.removeItem("sicit_token");
    localStorage.removeItem("sicit_user");
    sessionStorage.clear();

    setScreen("login");
  }

  if (screen === "home") {
    return <Home onLogout={handleLogout} />;
  }

  return <Login onLogin={handleLogin} />;
}