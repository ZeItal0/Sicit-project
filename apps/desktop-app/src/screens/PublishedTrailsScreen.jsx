import { useEffect, useState } from "react";
import {
  BookOpen,
  Users,
  BarChart3,
  Award,
  GraduationCap,
  UserRound,
  CalendarDays,
  Play,
  Video,
} from "lucide-react";

import "../assets/PublishedTrailsScreen.css";

const API_URL = "http://localhost:3000";

const trailIcons = {
  GraduationCap,
  BookOpen,
  Play,
  Award,
  Video,
  Users,
};

export default function PublishedTrailsScreen() {
  const [trails, setTrails] = useState([]);
  const [results, setResults] = useState([]);
  const [users, setUsers] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("sicit_token");

  async function api(path) {
    const response = await fetch(`${API_URL}${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.message || "Erro na requisição");
    }

    return data;
  }

  async function loadData() {
    try {
      setLoading(true);

      const [pathsData, resultsData, usersData, sectorsData] =
        await Promise.all([
          api("/training/trainings/paths"),
          api("/training/trainings/paths/results/all"),
          api("/users/users"),
          api("/users/sectors"),
        ]);

      setTrails(Array.isArray(pathsData) ? pathsData : []);
      setResults(Array.isArray(resultsData) ? resultsData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setSectors(Array.isArray(sectorsData) ? sectorsData : []);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function getSectorName(sectorId) {
    const found = sectors.find((sector) => sector.id === sectorId);
    return found?.name || "Setor";
  }

  function getTrailResults(pathId) {
    return results.filter((result) => result.pathId === pathId);
  }

  function getTrailParticipants(path) {
    if (!path.sectorIds?.length) return 0;

    return users.filter((user) => path.sectorIds.includes(user.sectorId)).length;
  }

  function getAverageConclusion(pathId) {
    const trailResults = getTrailResults(pathId);

    if (trailResults.length === 0) return 0;

    const total = trailResults.reduce(
      (sum, result) => sum + Number(result.completionPercent || 0),
      0
    );

    return Math.round(total / trailResults.length);
  }

  const totalParticipants = trails.reduce(
    (sum, trail) => sum + getTrailParticipants(trail),
    0
  );

  const completedResults = results.filter((result) => result.approved === true);

  const averageConclusion =
    results.length > 0
      ? Math.round(
        results.reduce(
          (sum, result) => sum + Number(result.completionPercent || 0),
          0
        ) / results.length
      )
      : 0;

  const cards = [
    {
      icon: BookOpen,
      value: trails.length,
      label: "Trilhas publicadas",
      color: "#006cff",
    },
    {
      icon: Users,
      value: totalParticipants,
      label: "Participantes",
      color: "#80d900",
    },
    {
      icon: BarChart3,
      value: `${averageConclusion}%`,
      label: "Média de conclusão",
      color: "#4b00ff",
    },
    {
      icon: Award,
      value: completedResults.length,
      label: "Certificados emitidos",
      color: "#d7c900",
    },
  ];

  return (
    <div className="published-trails-page">
      <header className="published-trails-header">
        <h1>Trilhas publicadas</h1>
        <p>
          Visualize todas as trilhas publicadas para os setores e acompanhe o
          progresso dos participantes.
        </p>
      </header>

      <section className="published-trails-card">
        {loading && <p>Carregando trilhas publicadas...</p>}

        <div className="published-stats">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <div className="published-stat-card" key={card.label}>
                <div
                  className="published-stat-icon"
                  style={{ backgroundColor: card.color }}
                >
                  <Icon size={30} />
                </div>

                <div>
                  <strong>{card.value}</strong>
                  <span>{card.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="published-table-header">
          <span>TRILHA</span>
          <span>SETOR</span>
          <span>PARTICIPANTES</span>
          <span>CONCLUSÃO MÉDIA</span>
          <span>CRIADA EM</span>
        </div>

        <div className="published-trails-list">
          {trails.map((trail) => {
            const participants = getTrailParticipants(trail);
            const conclusion = getAverageConclusion(trail.id);
            const color = trail.color || "#d7c900";
            const TrailIcon = trailIcons[trail.icon] || GraduationCap;

            const sectorNames = trail.sectorIds?.length
              ? trail.sectorIds.map(getSectorName).join(", ")
              : "Todos";

            return (
              <div className="published-trail-row" key={trail.id}>
                <div className="published-trail-info">
                  <div className="published-trail-icon" style={{ backgroundColor: color }}>
                    <TrailIcon size={22} color="white" strokeWidth={2.5}/>
                  </div>

                  <div>
                    <strong>{trail.title || trail.name}</strong>
                    <p>{trail.description || "Sem descrição"}</p>
                  </div>
                </div>

                <div>
                  <span className="sector-badge">{sectorNames}</span>
                </div>

                <div className="participants-info">
                  <UserRound size={20} />
                  <div>
                    <strong>{participants}</strong>
                    <p>inscritos</p>
                  </div>
                </div>

                <div className="conclusion-info">
                  <div className="conclusion-bar">
                    <div
                      style={{
                        width: `${conclusion}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>

                  <strong style={{ color }}>{conclusion}%</strong>
                </div>

                <div className="created-info">
                  <CalendarDays size={21} />
                  <span>
                    {trail.createdAt
                      ? new Date(trail.createdAt).toLocaleDateString("pt-BR")
                      : "--/--/----"}
                  </span>
                </div>
              </div>
            );
          })}

          {!loading && trails.length === 0 && (
            <p>Nenhuma trilha publicada encontrada.</p>
          )}
        </div>
      </section>
    </div>
  );
}