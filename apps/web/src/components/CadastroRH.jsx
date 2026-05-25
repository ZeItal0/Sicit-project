import React, { useEffect, useState } from "react";
import "../assets/cadastroRH.css";
import siciticon from "../icons/logosic.png";
import GlassBox from "../components/GlassBox";

const API_URL = "http://localhost:3000";

export default function CadastroRH({ isOpen, onClose, userData }) {
  const [formData, setFormData] = useState({
    apiUrl: "",
    apiToken: "",
    employeesEndpoint: "",
    sectorsEndpoint: "",
    rolesEndpoint: "",
    syncEmployees: true,
    syncRoles: true,
    syncSectors: true,
    frequency: "Diaria",
  });

  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(false);

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") onClose();
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      loadSavedConfig();
    }

    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  if (!isOpen) return null;

  async function loadSavedConfig() {
    try {
      setLoadingConfig(true);

      const token = localStorage.getItem("sicit_token");

      const response = await fetch(`${API_URL}/auth/hr/config`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) return;

      if (data) {
        setFormData((prev) => ({
          ...prev,
          apiUrl: data.apiUrl || "",
          apiToken: data.apiToken || "",
          employeesEndpoint: data.employeesEndpoint || "",
          sectorsEndpoint: data.sectorsEndpoint || "",
          rolesEndpoint: data.rolesEndpoint || "",
          syncEmployees: data.syncEmployees ?? true,
          syncRoles: data.syncRoles ?? true,
          syncSectors: data.syncSectors ?? true,
          frequency: data.frequency || "Diaria",
        }));
      }
    } catch (error) {
      console.error("Erro ao carregar configuração RH:", error);
    } finally {
      setLoadingConfig(false);
    }
  }

  function handleOverlayClick(event) {
    if (event.target.classList.contains("cadastro-rh-overlay")) {
      onClose();
    }
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setLoading(true);

      const token = localStorage.getItem("sicit_token");

      const response = await fetch(`${API_URL}/auth/hr/config`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          provider: "CUSTOM_API",
          ...formData,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "Erro ao salvar configuração de RH");
      }

      alert("Configuração de RH salva com sucesso!");
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSyncNow() {
    try {
      setSyncing(true);

      const token = localStorage.getItem("sicit_token");

      const response = await fetch(`${API_URL}/auth/hr/sync`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || "Erro ao sincronizar com RH");
      }

      const synced = data?.result?.synced;

      alert(
        `Sincronização concluída!\n\nSetores: ${synced?.sectors ?? 0}\nCargos: ${
          synced?.roles ?? 0
        }\nUsuários: ${synced?.users ?? 0}`
      );
    } catch (error) {
      alert(error.message);
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="cadastro-rh-overlay" onClick={handleOverlayClick}>
      <div className="cadastro-rh-wrapper">
        <GlassBox>
          <form className="cadastro-rh-modal" onSubmit={handleSubmit}>
            <button className="cadastro-rh-close" type="button"onClick={onClose}>×</button>

            <section className="cadastro-rh-left">
              <div className="cadastro-rh-user">
                <img src={siciticon} alt="SICIT" />
                <h2>{userData?.name || userData?.email || "Nome do usuário"}</h2>
              </div>

              <p className="cadastro-rh-subtitle">
                Conecte o SICIT ao sistema de Recursos Humanos da sua empresa.
              </p>

              {loadingConfig && <p>Carregando configuração salva...</p>}

              <div className="cadastro-rh-field cadastro-rh-full">
                <label>URL da API</label>
                <input name="apiUrl" value={formData.apiUrl} onChange={handleChange} placeholder="http://localhost:8085"/>
              </div>

              <div className="cadastro-rh-grid">
                <div className="cadastro-rh-field">
                  <label>Token / API Key</label>
                  <input name="apiToken" value={formData.apiToken} onChange={handleChange} placeholder="fake-token-123"/>
                </div>

                <div className="cadastro-rh-field">
                  <label>EndPoint - Funcionários</label>
                  <input name="employeesEndpoint" value={formData.employeesEndpoint} onChange={handleChange} placeholder="/api/v1/employees"/>
                </div>

                <div className="cadastro-rh-field">
                  <label>EndPoint - Setores</label>
                  <input name="sectorsEndpoint" value={formData.sectorsEndpoint} onChange={handleChange} placeholder="/api/v1/departments"/>
                </div>

                <div className="cadastro-rh-field">
                  <label>Endpoint - Cargos</label>
                  <input name="rolesEndpoint" value={formData.rolesEndpoint} onChange={handleChange} placeholder="/api/v1/jobs"/>
                </div>
              </div>

              <button className="cadastro-rh-save" type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Testar Conexão e Salvar"}
              </button>
            </section>

            <section className="cadastro-rh-right">
              <h2>Sincronização de Dados</h2>

              <p>Selecione os dados que deseja sincronizar:</p>

              <label className="cadastro-rh-check">
                <input type="checkbox" name="syncEmployees" checked={formData.syncEmployees} onChange={handleChange}/>Funcionários</label>

              <label className="cadastro-rh-check">
                <input type="checkbox" name="syncRoles" checked={formData.syncRoles} onChange={handleChange}/>
                Cargos
              </label>

              <label className="cadastro-rh-check">
                <input type="checkbox" name="syncSectors" checked={formData.syncSectors} onChange={handleChange}/>
                Setores
              </label>

              <div className="cadastro-rh-field">
                <label>Frequência de sincronização</label>

                <select name="frequency" value={formData.frequency} onChange={handleChange} className="frequencyback">
                  <option>Diaria</option>
                  <option>Semanal</option>
                  <option>Mensal</option>
                  <option>Manual</option>
                </select>
              </div>

              <button className="cadastro-rh-sync" type="button" onClick={handleSyncNow} disabled={syncing}>
                {syncing ? "Sincronizando..." : "Sincronizar Agora"}
              </button>
            </section>
          </form>
        </GlassBox>
      </div>
    </div>
  );
}