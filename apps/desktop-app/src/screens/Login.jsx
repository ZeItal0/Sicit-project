import { useState } from "react";
import logo from "../assets/logo.png";
import GlassBox from "../components/GlassBox";
import "../assets/login.css";
import minimize from "../assets/minus.png";
import closed from "../assets/closed.png";

export default function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    domain: "",
    login: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  }

  async function handleLogin(e) {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await fetch("http://localhost:3000/auth/login-employee", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          domain: formData.domain,
          login: formData.login,
          password: formData.password
        })
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Erro ao fazer login");
        return;
      }

      localStorage.setItem("sicit_token", data.token);
      localStorage.setItem("sicit_user", JSON.stringify(data.user));

      onLogin(data.user);
    } catch (error) {
      console.error(error);
      alert("Erro ao conectar com o servidor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-screen">
      <div className="drag-area"></div>

      <div className="window-actions">
        <button type="button" onClick={() => window.electronAPI.minimize()}><img src={minimize} alt="minimize" className="minimize" /></button>
        <button type="button" onClick={() => window.electronAPI.close()}><img src={closed} alt="closed" className="closed" /></button>
      </div>

      <div className="login-wrapper">
        <GlassBox>
          <div className="login-card">
            <img src={logo} alt="SICIT" className="login-logo" />

            <h1>
              Entre <br /> com sua conta
            </h1>

            <form className="login-form" onSubmit={handleLogin}>
              <label>Domínio/Empresa</label>
              <input
                name="domain"
                type="text"
                value={formData.domain}
                onChange={handleChange}
                placeholder="Dominio"
              />

              <label>Login LDAP</label>
              <input
                name="login"
                type="text"
                value={formData.login}
                onChange={handleChange}
                placeholder="usuario"
              />

              <label>Senha</label>
              <input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="senha"
              />

              <button type="submit" className="login-button" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </button>
            </form>
          </div>
        </GlassBox>
      </div>
    </div>
  );
}