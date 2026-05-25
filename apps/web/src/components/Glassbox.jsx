import React from "react";
import "../assets/Glassbox.css";

export default function GlassBox({ children }) {
  return (
    <div className="glassmorphism"> {children}</div>
  );
}
