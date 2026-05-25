import React, { useState } from "react";
import "../assets/download.css";
import Frame35 from "../assets/Frame35.png";
import downloadIcon from "../icons/download.png";
import windowsIcon from "../icons/windows_icon.png";
import GlassBox from "../components/GlassBox";
import { Link } from "react-router-dom";
import Login from "../components/login";
import user from "../icons/user.png";
import UserModal from "../components/UserModal";
import Cadastro from "../components/cadastro";

export default function Download() {
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCadastroOpen, setIsCadastroOpen] = useState(false);

  const [userData, setUserData] = useState(() => {
    const saved = localStorage.getItem("sicit_user");
    return saved ? JSON.parse(saved) : null;
  });

  function handleLogout() {
    localStorage.removeItem("sicit_token");
    localStorage.removeItem("sicit_user");
    setUserData(null);
    setIsUserModalOpen(false);
  }

  return (
    <div className="download-container">
      <svg className="bg-svg" viewBox="0 0 1440 1024" preserveAspectRatio="none">
        <path d="M0 0H320C270 -60 550 400 610 690C690 900 0 1024 250 1024H0V0Z" fill="#8F9FB1" />
        <path d="M0 0H160C120 -60 580 480 640 780C680 1200 110 1024 300 1024H0V0Z" fill="#BACEE5" />
      </svg>

      <div className="content">
        <nav className="navbar">
          <div className="navbar-inner">
            <div className="logo">
              <img src={Frame35} className="logo-icon" alt="Logo SICIT" />
            </div>

            <div className="nav-links">
              <Link to="/" state={{ scrollTo: "inicio" }}>Início</Link>
              <Link to="/" state={{ scrollTo: "recursos" }}>Recursos</Link>
              <span>Download</span>
              <Link to="/" state={{ scrollTo: "sobre" }}>Sobre</Link>
            </div>

            <div className="nav-actions">
              {!userData && (
                <button
                  className="btn-entrar"
                  onClick={() => setIsLoginOpen(true)}
                >
                  Entrar
                </button>
              )}

              {userData && (
                <div
                  className="user-icon-wrapper"
                  onClick={() => setIsUserModalOpen(true)}
                >
                  <img src={user} alt="Usuário" className="user-icon" />
                </div>
              )}
            </div>
          </div>
        </nav>

        <main className="download-main">
          <h1 className="download-title">Download do SICIT</h1>

          <p className="download-subtitle">
            Instale o aplicativo oficial para transmissões, interação em tempo real e acesso completo aos recursos.
          </p>

          <div className="download-card-wrapper">
            <GlassBox>
              <div className="download-card">
                <img src={windowsIcon} className="windows-icon" alt="Windows" />

                <h2>SICIT Desktop para Windows</h2>

                <p className="download-card-text">Compatível com Windows 11+</p>

                <button className="download-button">
                  <img src={downloadIcon} className="download-button-icon" alt="Download" />
                  <span>Download</span>
                </button>

                <p className="download-version">
                  Versão 1.0 &nbsp;|&nbsp; 54MB atualizado em outubro/2026
                </p>
              </div>
            </GlassBox>
          </div>
        </main>

        <div className="footer-copy">
          © 2026 SICIT — Sistema de Interação Corporativa com Imagem e Texto
        </div>
      </div>

      <Login
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={setUserData}
      />

      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        userData={userData}
        onLogout={handleLogout}
        onOpenCadastro={() => {
          setIsUserModalOpen(false);
          setIsCadastroOpen(true);
        }}
      />

      <Cadastro
        isOpen={isCadastroOpen}
        onClose={() => setIsCadastroOpen(false)}
        userData={userData}
      />
    </div>
  );
}