import React from "react";
import "../assets/Sobre.css";
import dashboard from "../assets/dashboard.png";
import chat from "../icons/chat2.png";
import shield from "../icons/shield.png";
import training from "../icons/training.png";
import download from "../icons/download.png";
import GlassBox from "../components/GlassBox";
import { Link } from "react-router-dom";

export default function Sobre() {
    return (
        <section className="sobre" id="sobre">
            <div className="sobre-top">
                <div className="sobre-texto">
                    <h2>Sobre o SICIT</h2>

                    <p>
                        O sistema de Interação Corporativa com Imagem e Texto (SICIT)
                        foi desenvolvido para proporcionar uma plataforma integrada
                        de comunicação corporativa, permitindo transmissões ao vivo,
                        interação via chat e gerenciamento eficiente de conteúdos.
                    </p>

                    <p>
                        O SICIT busca centralizar e otimizar a comunicação interna das empresas,
                        aumentando o engajamento e a produtividade dos colaboradores
                        por meio de um sistema seguro e intuitivo.
                    </p>
                </div>

                <div className="sobre-img-area">
                    <div className="sobre-img">
                        <img src={dashboard} alt="Dashboard" />
                    </div>

                    <button className="download-float-btn">
                        <div className="download-float-inner">
                            <img src={download} className="download-icon" alt="Download"/>
                            <Link to="/download" className="download-text">Download</Link>
                        </div>
                    </button>
                </div>
            </div>

            <div className="sobre-cards">
                <GlassBox>
                    <div className="sobre-card">
                        <div className="card-header">
                            <img src={shield} className="logo-down-sobre" alt="Logo shield" />
                            <h3>Ambiente seguro e controlado</h3>
                        </div>
                        <p className="numero">+95%</p>
                        <span>Segurança e controle em transmissões internas</span>
                    </div>
                </GlassBox>

                <GlassBox>
                    <div className="sobre-card">
                        <div className="card-header">
                            <img src={training} className="logo-down-sobre" alt="Logo training" />
                            <h3>Treinamentos ao vivo e eficazes</h3>
                        </div>
                        <p className="numero">+5.000</p>
                        <span>Treinamentos realizados</span>
                    </div>
                </GlassBox>

                <GlassBox>
                    <div className="sobre-card">
                        <div className="card-header">
                            <img src={chat} className="logo-down-sobre" alt="Logo chat" />
                            <h3>Chat e colaboração otimizada</h3>
                        </div>
                        <p className="numero">+10.000</p>
                        <span>Mensagens trocadas entre equipes</span>
                    </div>
                </GlassBox>
            </div>
        </section>
    );
}