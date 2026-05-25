import React from "react";
import "../assets/Recursos.css";
import chat from "../icons/chat.png"
import live from "../icons/live.png"
import computer from "../icons/computer.png"
import settings from "../icons/settings.png"

export default function Recursos() {
  return (
    <section className="recursos" id="recursos">

      <h2 className="recursos-title">
        Principais Recursos do SICIT
      </h2>

      <div className="recurso-item destaque">
        <img src={live} className="logo-down" alt="Logo live" />
        <div>
          <h3>Transmissão Corporativa em Tempo Real</h3>
          <p>Permite transmissões ao vivo para reuniões, comunicados e treinamentos internos, com estabilidade e baixa latência.</p>
        </div>
      </div>

      <div className="recurso-item reverse">
        <div>
          <h3>Comunicação em Tempo Real</h3>
          <p>Comunicação instantânea entre colaboradores durante transmissões, facilitando interação, dúvidas e feedback.</p>
        </div>
        <img src={chat} className="logo-down" alt="Logo chat" />
      </div>

      <div className="recurso-item destaque">
        <img src={computer} className="logo-down" alt="Logo computer" />
        <div>
          <h3>Gestão de Treinamentos</h3>
          <p>Centralização de treinamentos corporativos com transmissão, histórico e acompanhamento de participação.</p>
        </div>
      </div>

      <div className="recurso-item reverse">
        <div>
          <h3>Controle</h3>
          <p>Sistema completo para gerenciamento de usuários, permissões, transmissões e métricas organizacionais.</p>
        </div>
       <img src={settings} className="logo-down" alt="Logo settings" />
      </div>

    </section>
  );
}