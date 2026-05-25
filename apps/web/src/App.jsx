import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Home from "./pages/home";
import Download from "./pages/download";

function App() {
  return (
    <GoogleOAuthProvider clientId="">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/download" element={<Download />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>

  );
}

export default App
