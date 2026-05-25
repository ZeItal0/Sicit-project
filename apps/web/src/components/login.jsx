import React, { useEffect } from "react";
import "../assets/login.css";
import siciticon from "../icons/logosic.png";
import GlassBox from "../components/GlassBox";
import lock from "../icons/lock.png";
import { GoogleLogin } from "@react-oauth/google";

export default function Login({ isOpen, onClose, onLoginSuccess }) {
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    if (isOpen) document.addEventListener("keydown", handleEscape);

    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (event) => {
    if (event.target.classList.contains("login-overlay")) {
      onClose();
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch("http://localhost:3000/auth/login-google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          idToken: credentialResponse.credential
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Erro ao entrar com Google");
        return;
      }

      localStorage.setItem("sicit_token", data.token);
      localStorage.setItem("sicit_user", JSON.stringify(data.user));

      onLoginSuccess?.(data.user);
      onClose();
    } catch (error) {
      alert("Erro ao autenticar com Google");
      console.error(error);
    }
  };

  return (
    <div className="login-overlay" onClick={handleOverlayClick}>
      <div className="login-modal-wrapper">
        <GlassBox>
          <div className="login-modal">
            <button className="login-close" onClick={onClose}>×</button>

            <img src={siciticon} className="login-logo" alt="Logo" />

            <h3 className="login-system-name">Login</h3>
            <h2 className="login-title">Entre com sua conta</h2>

            <div className="google-button">
              <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => { alert("Falha no login com Google");}}  width="390"/>
            </div>

            <div className="login-footer">
              <p>
                <span>Termos de Serviço</span>
                <span>Política de Privacidade</span>
              </p>
              <strong>
                <img src={lock} className="logo-lock" alt="Logo lock" />
                Ambiente Seguro
              </strong>
            </div>
          </div>
        </GlassBox>
      </div>
    </div>
  );
}