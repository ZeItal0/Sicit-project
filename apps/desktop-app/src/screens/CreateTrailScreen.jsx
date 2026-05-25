import { useEffect, useState } from "react";
import {
  GraduationCap,
  BookOpen,
  Play,
  Award,
  Video,
  Users,
} from "lucide-react";

import "../assets/CreateTrailScreen.css";
import trash from "../assets/trash.png";

const API_URL = "http://localhost:3000";

const colors = [
  "#006CFF",
  "#FF0000",
  "#4B00FF",
  "#6E00FF",
  "#1DE5E5",
  "#D7C900",
  "#00E436",
  "#FFA500",
];

const iconOptions = [
  { value: "GraduationCap", label: "Treino", Icon: GraduationCap },
  { value: "BookOpen", label: "Material", Icon: BookOpen },
  { value: "Play", label: "Live", Icon: Play },
  { value: "Award", label: "Certificado", Icon: Award },
  { value: "Video", label: "Vídeo", Icon: Video },
  { value: "Users", label: "Equipe", Icon: Users },
];

const iconMap = {
  GraduationCap,
  BookOpen,
  Play,
  Award,
  Video,
  Users,
};

export default function CreateTrailScreen() {
  const [trailName, setTrailName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState("#D7C900");
  const [selectedIcon, setSelectedIcon] = useState("GraduationCap");
  const [minPercent, setMinPercent] = useState(80);
  const [deadline, setDeadline] = useState("");
  const [sector, setSector] = useState("");
  const [sectors, setSectors] = useState([]);
  const [steps, setSteps] = useState([
    { id: 1, title: "Vazio", requiredPercent: 80 },
    { id: 2, title: "Vazio", requiredPercent: 80 },
    { id: 3, title: "Vazio", requiredPercent: 80 },
  ]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("sicit_token");
  const SelectedIcon = iconMap[selectedIcon] || GraduationCap;

  async function api(path, options = {}) {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.message || "Erro na requisição");
    }

    return data;
  }

  async function loadSectors() {
    try {
      const data = await api("/users/sectors");
      setSectors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error.message);
    }
  }

  useEffect(() => {
    loadSectors();
  }, []);

  function addStep() {
    setSteps((prev) => [
      ...prev,
      {
        id: Date.now(),
        title: "Vazio",
        requiredPercent: 80,
      },
    ]);
  }

  function removeStep(id) {
    setSteps((prev) => prev.filter((step) => step.id !== id));
  }

  function updateStep(id, field, value) {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === id
          ? {
            ...step,
            [field]: value,
          }
          : step
      )
    );
  }

  async function handlePublishTrail() {
    try {
      if (!trailName.trim()) {
        alert("Informe o nome da trilha");
        return;
      }

      if (!sector) {
        alert("Selecione um setor");
        return;
      }

      if (steps.length === 0) {
        alert("A trilha precisa ter pelo menos uma etapa");
        return;
      }

      setLoading(true);

      const payload = {
        title: trailName,
        description,
        color: selectedColor,
        icon: selectedIcon,
        minCompletionPercent: Number(minPercent),
        deadline: deadline || null,
        sectorIds: [sector],
        status: "PUBLISHED",
        steps: steps.map((step, index) => ({
          title: step.title || "Vazio",
          type: "LIVE",
          order: index + 1,
          requiredPercent: Number(step.requiredPercent) || 80,
        })),
      };

      const created = await api("/training/trainings/paths", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      alert("Trilha publicada com sucesso!");
      console.log("TRILHA CRIADA:", created);

      setTrailName("");
      setDescription("");
      setSelectedColor("#D7C900");
      setSelectedIcon("GraduationCap");
      setMinPercent(80);
      setDeadline("");
      setSector("");
      setSteps([
        { id: 1, title: "Vazio", requiredPercent: 80 },
        { id: 2, title: "Vazio", requiredPercent: 80 },
        { id: 3, title: "Vazio", requiredPercent: 80 },
      ]);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="create-trail-page">
      <div className="create-trail-header">
        <div className="create-trail-title">
          <h1>Criar nova trilha de treinamento</h1>
          <p>Monte uma jornada de aprendizado com lives e outros conteúdos.</p>
        </div>

        <button
          type="button"
          className="publish-trail-btn"
          onClick={handlePublishTrail}
          disabled={loading}
        >
          {loading ? "Publicando..." : "Publicar trilha"}
        </button>
      </div>

      <div className="trail-top-row">
        <section className="trail-info-card">
          <h2>Informações da Trilha</h2>

          <label>Nome da trilha</label>
          <input
            type="text"
            placeholder="Nome da trilha..."
            value={trailName}
            onChange={(e) => setTrailName(e.target.value)}
          />

          <label>Descrição</label>
          <textarea
            placeholder="Descrição da trilha..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="trail-info-bottom">
            <div>
              <label>Cor da trilha</label>

              <div className="trail-colors">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={selectedColor === color ? "selected" : ""}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  >
                    {selectedColor === color && "✓"}
                  </button>
                ))}
              </div>
            </div>

            <div className="trail-icon-select">
              <label>Ícone</label>

              <div className="trail-icon-dropdown">

                <select
                  value={selectedIcon}
                  onChange={(e) => setSelectedIcon(e.target.value)}
                >
                  {iconOptions.map((item) => (
                    <option
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </option>
                  ))}
                </select>

                <div className="trail-selected-icon">
                  <SelectedIcon
                    size={38}
                    strokeWidth={2}
                  />
                </div>

              </div>
            </div>
          </div>
        </section>

        <section className="trail-preview-card">
          <h2>Prévia da Trilha</h2>

          <div className="trail-preview-header">
            <div
              className="trail-preview-icon"
              style={{ backgroundColor: selectedColor }}
            >
              <SelectedIcon size={28} color="white" strokeWidth={2.5} />
            </div>

            <strong>{trailName || "Nome da trilha"}</strong>
          </div>

          <div className="trail-progress-info">
            <span>Progresso geral da trilha</span>
            <span>0/{steps.length + 1} etapas concluídas</span>
          </div>

          <div className="trail-progress-bar">
            <div style={{ width: "0%", backgroundColor: selectedColor }} />
          </div>

          <span className="trail-percent">0%</span>

          <div className="trail-preview-steps">
            {steps.map((step, index) => (
              <div className="trail-preview-step" key={step.id}>
                <div
                  className="trail-step-circle"
                  style={{ backgroundColor: selectedColor }}
                >
                  <Play size={14} color="white" fill="white" />
                </div>

                <strong>{index + 1}</strong>
                <span>{step.title || "Vazio"}</span>
                <p>Aguardando live</p>
              </div>
            ))}

            <div className="trail-preview-step">
              <div
                className="trail-step-circle"
                style={{ backgroundColor: selectedColor }}
              >
                <Award size={15} color="white" />
              </div>

              <strong>{steps.length + 1}</strong>
              <span>Certificado</span>
              <p>Bloqueado</p>
            </div>
          </div>
        </section>
      </div>

      <div className="trail-bottom-row">
        <section className="trail-steps-card">
          <div className="trail-steps-header">
            <div>
              <h2>Etapas da Trilha</h2>
              <p>Adicione etapas que devem ser concluídas</p>
            </div>

            <button type="button" onClick={addStep}>
              + Adicionar etapa
            </button>
          </div>

          <div className="trail-steps-list">
            {steps.map((step, index) => (
              <div className="trail-step-item" key={step.id}>
                <span>{index + 1}</span>

                <div
                  className="trail-step-icon"
                  style={{ backgroundColor: selectedColor }}
                >
                  <Play size={14} color="white" fill="white" />
                </div>

                <b
                  style={{
                    backgroundColor: `${selectedColor}35`,
                    color: selectedColor,
                  }}
                  className="backcolor"
                >
                  Live
                </b>

                <input
                  className="trail-step-title-input"
                  type="text"
                  value={step.title}
                  onChange={(e) =>
                    updateStep(step.id, "title", e.target.value)
                  }
                  placeholder="Nome da etapa"
                />

                <small
                  style={{
                    backgroundColor: `${selectedColor}35`,
                    color: selectedColor,
                  }}
                >
                  mínimo:
                  <input
                    className="trail-step-percent-input"
                    type="number"
                    value={step.requiredPercent}
                    onChange={(e) =>
                      updateStep(step.id, "requiredPercent", e.target.value)
                    }
                  />
                  % de presença
                </small>

                <button type="button" onClick={() => removeStep(step.id)}>
                  <img src={trash} alt="" className="trash_etapa" />
                </button>
              </div>
            ))}
          </div>
        </section>

        <div className="trail-right-column">
          <section className="trail-requirements-card">
            <h2>Requisitos para conclusão</h2>

            <div className="trail-requirement-line">
              <label>% mínimo geral da trilha</label>

              <div className="trail-percent-box">
                <input
                  type="number"
                  value={minPercent}
                  onChange={(e) => setMinPercent(e.target.value)}
                />
                <span>%</span>
              </div>
            </div>

            <div className="trail-requirement-line">
              <label>Prazo para conclusão</label>

              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </section>

          <section className="trail-public-card">
            <h2>Público da trilha</h2>
            <p>Quem deve realizar esta trilha ?</p>

            <label>Setores</label>

            <select value={sector} onChange={(e) => setSector(e.target.value)}>
              <option value="">Selecione</option>

              {sectors.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </section>
        </div>
      </div>
    </div>
  );
}