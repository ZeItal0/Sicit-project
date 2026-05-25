import React, { useEffect, useState } from "react";
import "../assets/Home.css";
import Login from "../components/login";
import Frame35 from "../assets/Frame35.png";
import business from "../icons/business.png";
import padlock from "../icons/padlock.png";
import process from "../icons/process.png";
import thunder from "../icons/thunder.png";
import user from "../icons/user.png";
import Recursos from "./recursos";
import Sobre from "./sobre";
import Cadastro from "../components/cadastro";
import CadastroRH from "../components/CadastroRH";
import UserModal from "../components/UserModal";
import { Link, useLocation } from "react-router-dom";

export default function Home() {
    const [isCadastroOpen, setIsCadastroOpen] = useState(false);
    const [isCadastroRHOpen, setIsCadastroRHOpen] = useState(false);
    const features = [
        {
            icon: thunder,
            title: "Interação em tempo real",
            desc: "Chat integrado às transmissões, promovendo engajamento e troca imediata de informações.",
        },
        {
            icon: padlock,
            title: "Comunicação segura",
            desc: "Transmissões e mensagens protegidas em um ambiente corporativo controlado.",
        },
        {
            icon: process,
            title: "Centralização de processos",
            desc: "Reuniões, treinamentos e comunicados em uma única plataforma.",
        },
        {
            icon: business,
            title: "Gestão e controle",
            desc: "Relatórios de participação, controle de usuários e histórico de transmissões.",
        },
    ];

    const [userData, setUserData] = useState(() => {
        const saved = localStorage.getItem("sicit_user");
        return saved ? JSON.parse(saved) : null;
    });

    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [isLoginOpen, setIsLoginOpen] = useState(false);

    const location = useLocation();

    const handleLogout = () => {
        setUserData(null);
    };

    useEffect(() => {
        if (location.state?.scrollTo) {
            const el = document.getElementById(location.state.scrollTo);
            if (el) {
                setTimeout(() => {
                    el.scrollIntoView({ behavior: "smooth" });
                }, 100);
            }
        }
    }, [location]);

    const scrollToSection = (id) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: "smooth" });
        }
    };

    return (
        <div className="home-container">
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
                            <span onClick={() => scrollToSection("inicio")}>Início</span>
                            <span onClick={() => scrollToSection("recursos")}>Recursos</span>
                            <Link to="/download">Download</Link>
                            <span onClick={() => scrollToSection("sobre")}>Sobre</span>
                        </div>

                        <div className="nav-right">
                            {!userData && (
                                <button className="btn-entrar" onClick={() => setIsLoginOpen(true)}> Entrar </button>
                            )}
                        </div>
                        {userData && (
                            <div className="user-icon-wrapper" onClick={() => setIsUserModalOpen(true)}> <img src={user} alt="Usuário" className="user-icon" /></div>
                        )}
                    </div>
                </nav>

                <section className="hero" id="inicio">
                    <h1 className="blend-text">Sistema de Interação Corporativa com Imagem e Texto</h1>
                    <p>Solução corporativa para comunicação integrada com transmissões ao vivo, chat em tempo real e gestão completa</p>
                </section>

                <section className="features">
                    {features.map((f, i) => (
                        <div
                            key={i}
                            className="feature-orb"
                            style={{ animationDelay: `${i * 0.6}s` }}
                        >
                            <div className="feature-orb-inner">
                                <img src={f.icon} className="feature-orb-icon" alt={f.title} />

                                <div className="feature-orb-content">
                                    <h3>{f.title}</h3>
                                    <p>{f.desc}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </section>

                <Recursos />
                <Sobre />
            </div>
            <div className="footer-copy">© 2026 SICIT — Sistema de Interação Corporativa com Imagem e Texto</div>
            <Login isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onLoginSuccess={setUserData} />
            <UserModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} userData={userData} onLogout={handleLogout} onOpenCadastro={() => { setIsUserModalOpen(false); setIsCadastroOpen(true);}} onOpenCadastroRH={() => { setIsUserModalOpen(false); setTimeout(() => { setIsCadastroRHOpen(true);}, 150);}}/>
            <Cadastro isOpen={isCadastroOpen} onClose={() => setIsCadastroOpen(false)} userData={userData} />
            <CadastroRH isOpen={isCadastroRHOpen} onClose={() => setIsCadastroRHOpen(false)} userData={userData} />
        </div>
    );
}