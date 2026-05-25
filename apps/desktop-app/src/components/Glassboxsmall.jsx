import React from "react";
import "../assets/Glassboxsmall.css";

export default function GlassBox({ children, className = "" }) {
  return (
    <div className={`glass-small ${className}`}>
      {children}
    </div>
  );
}