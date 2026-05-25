import React from "react";
import "../assets/userModal.css";
import user from "../icons/user.png";
import gear from "../icons/gear.png";
import logout from "../icons/logout.png";
import GlassBox from "../components/GlassBox";

export default function UserModal({ isOpen, onClose, onOpenCadastro, onOpenCadastroRH, userData, onLogout }) {
  if (!isOpen) return null;

  const handleOverlayClick = (event) => {
    if (event.target.classList.contains("user-modal-overlay")) {
      onClose();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("sicit_token");
    localStorage.removeItem("sicit_user");

    onLogout?.();
    onClose();
  };

  return (
    <div className="user-modal-overlay" onClick={handleOverlayClick}>
      <div className="user-modal-wrapper">
        <GlassBox>
          <div className="user-modal">
            <div className="user-avatar">
              <img src={userData?.picture || user} alt="Usuário" onError={(e) => { e.currentTarget.src = user; }}/>
            </div>

            <h2>Olá {userData?.name || userData?.email || "usuário"}</h2>

            <div className="user-divider" />

            <button className="user-config-button" type="button" onClick={onOpenCadastro}>
              <span>
                <img src={gear} alt="Configuração" className="icon-gear" />
              </span>
              <strong>Conectar LDAP clicando aqui.</strong>
            </button>

             <button className="user-config-button" type="button" onClick={onOpenCadastroRH}>
              <span>
                <img src={gear} alt="RH" className="icon-gear" />
              </span>
              <strong>Conectar sistema de RH clicando aqui.</strong>
            </button>


            <div className="user-divider" />

            <button className="user-logout-button" type="button" onClick={handleLogout}>
              <span>
                <img src={logout} alt="Sair" className="icon-logout" />
              </span>
              Sair
            </button>
          </div>
        </GlassBox>
      </div>
    </div>
  );
}