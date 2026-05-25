import React, { useEffect, useState } from "react";
import "../assets/cadastro.css";
import siciticon from "../icons/logosic.png";
import GlassBox from "../components/GlassBox";

export default function Cadastro({ isOpen, onClose, userData }) {
    const [formData, setFormData] = useState({
        nome: "",
        email: userData?.email || "",
        dominio: "",
        ldapUrl: "",
        baseDn: "",
        bindDn: "",
        bindSenha: "",
    });

    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleOverlayClick = (event) => {
        if (event.target.classList.contains("cadastro-overlay")) {
            onClose();
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            const token = localStorage.getItem("sicit_token");

            const linkResponse = await fetch("http://localhost:3000/auth/google/link-tenant", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    domain: formData.dominio
                })
            });

            const linkData = await linkResponse.json();

            if (!linkResponse.ok) {
                alert(linkData.message || "Erro ao vincular empresa");
                return;
            }

            const ldapResponse = await fetch("http://localhost:3000/auth/ldap/config", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    tenantId: linkData.user.tenantId,
                    ldapUrl: formData.ldapUrl,
                    baseDn: formData.baseDn,
                    bindDn: formData.bindDn,
                    bindPassword: formData.bindSenha
                })
            });

            if (!ldapResponse.ok) {
                const err = await ldapResponse.json();
                alert(err.message || "Erro ao salvar LDAP");
                return;
            }

            alert("Configuração realizada com sucesso 🚀");
            onClose();

        } catch (error) {
            console.error(error);
            alert("Erro na configuração");
        }
    };

    const handleTestLdap = async () => {
        try {
            const response = await fetch("http://localhost:3000/auth/ldap/test-connection", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ldapUrl: formData.ldapUrl,
                    bindDn: formData.bindDn,
                    bindPassword: formData.bindSenha
                })
            });

            const data = await response.json();

            if (data.success) {
                alert("LDAP conectado com sucesso");
            } else {
                alert(data.message);
            }

        } catch (error) {
            alert("Erro ao testar conexão LDAP");
        }
    };

    return (
        <div className="cadastro-overlay" onClick={handleOverlayClick}>
            <div className="cadastro-modal-wrapper">
                <GlassBox>
                    <div className="cadastro-modal">
                        <button className="cadastro-close" onClick={onClose} aria-label="Fechar modal" type="button">×</button>

                        <img src={siciticon} className="cadastro-logo" alt="Logo SICIT" />

                        <h2 className="cadastro-title">
                            {userData?.name || userData?.email || "Nome do usuário"}
                        </h2>

                        <p className="cadastro-subtitle">Preencha os dados para configura o acesso e comunicaçãoao seu repositório LDAP.</p>

                        <form className="cadastro-form" onSubmit={handleSubmit}>
                            <div className="cadastro-grid">

                                <div className="cadastro-field">
                                    <label htmlFor="email">E-mail</label>
                                    <input id="email" name="email" type="email" value={formData.email} onChange={handleChange} disabled />
                                </div>
                            </div>

                            <div className="cadastro-field cadastro-field-full">
                                <label htmlFor="dominio">Domínio/Empresa</label>
                                <input id="dominio" name="dominio" type="text" value={formData.dominio} onChange={handleChange} />
                            </div>

                            <div className="cadastro-grid">
                                <div className="cadastro-field">
                                    <label htmlFor="ldapUrl">LDAP URL</label>
                                    <input id="ldapUrl" name="ldapUrl" type="text" value={formData.ldapUrl} onChange={handleChange} />
                                </div>

                                <div className="cadastro-field">
                                    <label htmlFor="baseDn">Base DN</label>
                                    <input id="baseDn" name="baseDn" type="text" value={formData.baseDn} onChange={handleChange} />
                                </div>

                                <div className="cadastro-field">
                                    <label htmlFor="bindDn">Bind DN</label>
                                    <input id="bindDn" name="bindDn" type="text" value={formData.bindDn} onChange={handleChange} />
                                </div>

                                <div className="cadastro-field">
                                    <label htmlFor="bindSenha">Senha do Bind</label>
                                    <input id="bindSenha" name="bindSenha" type="password" value={formData.bindSenha} onChange={handleChange} />
                                </div>
                            </div>

                            <div className="cadastro-actions">
                                
                            </div>
                            <button className="cadastro-submit" type="button" onClick={handleTestLdap}>Testar Conexão e Continuar</button>
                        </form>
                    </div>
                </GlassBox>
            </div>
        </div>
    );
}