import { useEffect, useState } from "react";

import {
  GraduationCap,
  BookOpen,
  Play,
  Award,
  Video,
  Users,
  Lock,
  Medal,
} from "lucide-react";

import "../assets/MyTrailsScreen.css";
import downloadicon from "../assets/download.png";

const API_URL = "http://localhost:3000";

const iconMap = {
  GraduationCap,
  BookOpen,
  Play,
  Award,
  Video,
  Users,
};

export default function MyTrailsScreen() {
  const [trails, setTrails] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("sicit_token");
  const savedUser = localStorage.getItem("sicit_user");
  const userData = savedUser ? JSON.parse(savedUser) : null;

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

  async function loadMyTrails() {
    try {
      setLoading(true);

      const [pathsData, resultsData] = await Promise.all([
        api("/training/trainings/paths"),
        api("/training/trainings/paths/me/results"),
      ]);

      const paths = Array.isArray(pathsData) ? pathsData : [];
      const myResults = Array.isArray(resultsData) ? resultsData : [];

      const filteredPaths = userData?.sectorId
        ? paths.filter((path) => path.sectorIds?.includes(userData.sectorId))
        : paths;

      setTrails(filteredPaths);
      setResults(myResults);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  function getTrailResult(pathId) {
    return results.find((result) => result.pathId === pathId);
  }

  function getCurrentStep(trail, result) {
    const completed = Number(result?.completedTrainings || 0);
    const steps = [...(trail.steps || [])].sort((a, b) => a.order - b.order);

    if (completed >= steps.length) {
      return {
        number: "Concluída",
        title: "Todas as etapas concluídas",
      };
    }

    const currentStep = steps[completed];

    return {
      number: currentStep?.order || 1,
      title: currentStep?.title || "Próxima etapa",
    };
  }

  async function handleDownloadCertificate(trail) {
    try {
      const data = await api(`/training/trainings/paths/${trail.id}/certificate`, {
        method: "POST",
      });

      if (data.downloadUrl) {
        window.open(data.downloadUrl, "_blank");
      }
    } catch (error) {
      alert(error.message);
    }
  }

  useEffect(() => {
    loadMyTrails();
  }, []);

  return (
    <div className="my-trails-page">
      <header className="my-trails-header">
        <h1>Minhas Trilhas</h1>
        <p>Acompanhe seu progresso nas trilhas</p>
      </header>

      <div className="my-trails-table-header">
        <span>TRILHA</span>
        <span>PROGRESSO</span>
        <span>ETAPAS CONCLUÍDAS</span>
        <span>ETAPA ATUAL</span>
        <span>CERTIFICADO</span>
      </div>

      {loading && <p>Carregando...</p>}

      <div className="my-trails-list">
        {trails.map((trail) => {
          const result = getTrailResult(trail.id);

          const totalSteps = trail.steps?.length || 0;
          const completedSteps = Number(result?.completedTrainings || 0);
          const progress = Number(result?.completionPercent || 0);
          const certificateAvailable = result?.approved === true;
          const currentStep = getCurrentStep(trail, result);
          const color = trail.color || "#D7C900";

          const Icon = iconMap[trail.icon] || GraduationCap;

          return (
            <div className="my-trail-card" key={trail.id}>
              <div className="my-trail-info">
                <div
                  className="my-trail-icon"
                  style={{ backgroundColor: color }}
                >
                  <Icon size={22} color="white" strokeWidth={2.5} />
                </div>

                <div>
                  <strong>{trail.title}</strong>
                  <p>{trail.description || "Sem descrição"}</p>
                </div>
              </div>

              <div className="my-trail-progress">
                <strong style={{ color }}>{progress}%</strong>

                <div className="my-trail-progress-bar">
                  <div
                    style={{
                      width: `${progress}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>

              <div className="my-trail-steps">
                <strong>
                  {completedSteps}/{totalSteps}
                </strong>
                <span>etapas</span>
              </div>

              <div className="my-trail-current">
                <strong>{currentStep.number}</strong>
                <span>{currentStep.title}</span>
              </div>

              <div className="my-trail-certificate">
                {certificateAvailable ? (
                  <>
                    <span className="certificate-available">
                      <Medal size={14} strokeWidth={2.5} />
                      Disponível
                    </span>

                    <button
                      type="button"
                      onClick={() => handleDownloadCertificate(trail)}
                    >
                      <img
                        src={downloadicon}
                        className="downloadicon"
                        alt="Baixar certificado"
                      />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="certificate-locked">
                      <Lock size={14} strokeWidth={2.5} />
                      Bloqueado
                    </span>

                    <button type="button" disabled>
                      <img
                        src={downloadicon}
                        className="downloadicon"
                        alt="Certificado bloqueado"
                      />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}

        {!loading && trails.length === 0 && (
          <p>Nenhuma trilha disponível.</p>
        )}
      </div>
    </div>
  );
}