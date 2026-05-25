import { useEffect, useMemo, useState } from "react";
import {
  Info,
  MessageSquare,
  Users,
  Eye,
  Clock,
  GraduationCap,
  BookOpen,
  Play,
  Award,
  Video,
  Medal,
  UserRound,
} from "lucide-react";

import userblack from "../assets/user-black.png";
import arrow from "../assets/arrow.png";
import "../assets/LiveDetailsScreen.css";

const API_URL = "http://localhost:3000";

const trailIcons = {
  GraduationCap,
  BookOpen,
  Play,
  Award,
  Video,
  Users,
  Medal,
  UserRound,
};

export default function LiveDetailsScreen({ live, onBack }) {
  const [details, setDetails] = useState(live || null);
  const [messages, setMessages] = useState(live?.chatMessages || []);
  const [presences, setPresences] = useState(live?.presences || []);
  const [linkedPath, setLinkedPath] = useState(live?.linkedPath || null);
  const [linkedStep, setLinkedStep] = useState(live?.linkedStep || null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("sicit_token");

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

  async function loadDetails() {
    if (!live?.id) return;

    try {
      setLoading(true);

      const [streamData, usersData] = await Promise.all([
        api(`/stream/streams/${live.id}`),
        api("/users/users"),
      ]);

      const safeUsers = Array.isArray(usersData) ? usersData : [];
      setUsers(safeUsers);

      const hostUser = safeUsers.find((user) => user.id === streamData.hostId);

      const mergedLive = {
        ...live,
        ...streamData,
        hostName: hostUser?.name || hostUser?.email || streamData.hostId,
      };

      setDetails(mergedLive);

      if (mergedLive.chatChannelId) {
        const chatData = await api(
          `/communication/channels/${mergedLive.chatChannelId}/messages`
        );

        setMessages(Array.isArray(chatData) ? chatData : []);
      }

      const presenceData = await api(`/stream/streams/${live.id}/presences`);
      setPresences(Array.isArray(presenceData) ? presenceData : []);

      await loadLinkedLearningPath(live.id);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadLinkedLearningPath(streamId) {
    try {
      const paths = await api("/training/trainings/paths");

      const path = Array.isArray(paths)
        ? paths.find((item) =>
          item.steps?.some((step) => step.streamId === streamId)
        )
        : null;

      const step = path?.steps?.find((item) => item.streamId === streamId);

      setLinkedPath(path || live?.linkedPath || null);
      setLinkedStep(step || live?.linkedStep || null);
    } catch {
      setLinkedPath(live?.linkedPath || null);
      setLinkedStep(live?.linkedStep || null);
    }
  }

  useEffect(() => {
    loadDetails();
  }, [live?.id]);

  const currentLive = details || live;

  const participants = useMemo(() => {
    const grouped = new Map();

    presences.forEach((presence) => {
      const key = presence.userId || presence.email || presence.id;
      if (!key) return;

      const previous = grouped.get(key);
      const user = users.find((item) => item.id === presence.userId);

      grouped.set(key, {
        id: key,
        name:
          user?.name ||
          user?.email ||
          presence.userName ||
          presence.name ||
          presence.email ||
          presence.userId ||
          "Usuário",
        durationSeconds:
          (previous?.durationSeconds || 0) +
          Number(presence.durationSeconds || 0),
      });
    });

    return Array.from(grouped.values());
  }, [presences, users]);

  if (!live) return null;

  const totalDuration = calculateDuration(
    currentLive?.startedAt,
    currentLive?.endedAt
  );

  const trailColor =
    linkedPath?.color ||
    currentLive?.linkedPath?.color ||
    currentLive?.trailColor ||
    "#59718e";

  const TrailIcon = trailIcons[linkedPath?.icon] || GraduationCap;

  const formattedMessages = messages.map((item) => {
    const messageUser = users.find((user) => user.id === item.senderId);

    return {
      id: item.id || item.createdAt,
      user:
        item.senderName ||
        item.userName ||
        item.user ||
        messageUser?.name ||
        messageUser?.email ||
        item.senderId ||
        "Usuário",
      message: item.content || item.message || item.text || "",
      time: formatTime(item.createdAt),
    };
  });

  return (
    <div className="live-details-page">
      <button type="button" className="live-details-back" onClick={onBack}>
        <img src={arrow} alt="" className="arrow" />
        Voltar
      </button>

      <header className="live-details-header">
        <h1>{currentLive?.title || "Nome da live ou reunião"}</h1>
        <span>Finalizada</span>
      </header>

      {loading && <p>Carregando detalhes...</p>}

      <div className="live-details-layout">
        <div className="live-details-left">
          <section className="live-details-stats-top">
            <div>{formatDate(currentLive?.startedAt || currentLive?.createdAt)}</div>
            <div>Duração: {totalDuration}</div>
            <div>
              Setor: {currentLive?.sectorName || currentLive?.sector || "Sem setor"}
            </div>
            <div>Visualizações: {participants.length}</div>
          </section>

          <section className="live-details-grid">
            <div className="live-details-card transmission-info">
              <h2>
                <Info size={16} />
                Dados da transmissão
              </h2>

              <InfoRow
                label="Título"
                value={currentLive?.title || "nome da live"}
              />

              <InfoRow
                label="Descrição"
                value={currentLive?.description || "descrição da live"}
              />

              <div className="live-info-row">
                <strong>Transmitido por</strong>
                <span className="user-inline">
                  <img src={userblack} alt="Usuário" className="userlive" />
                  {currentLive?.hostName ||
                    currentLive?.host ||
                    currentLive?.hostId ||
                    "nome do usuario"}
                </span>
              </div>

              <InfoRow
                label="Início"
                value={formatDateTime(currentLive?.startedAt)}
              />

              <InfoRow
                label="Término"
                value={formatDateTime(currentLive?.endedAt)}
              />

              <InfoRow label="Duração total" value={totalDuration} />
            </div>

            <div className="live-details-side">
              <div
                className="live-details-card trail-info-card-details"
                style={{ borderColor: `${trailColor}88` }}
              >
                <h2>Trilha e etapa Vinculada</h2>

                <div className="trail-linked">
                  <div
                    className="trail-linked-icon"
                    style={{
                      background: trailColor,
                      boxShadow: `0 0 18px ${trailColor}55`,
                    }}
                  >
                    <TrailIcon size={22} color="white" strokeWidth={2.5} />
                  </div>

                  <div>
                    <strong style={{ color: trailColor }}>
                      {linkedPath?.title ||
                        currentLive?.trailName ||
                        "Sem trilha"}
                    </strong>

                    <span>
                      {linkedStep
                        ? `Etapa ${linkedStep.order} - ${linkedStep.title}`
                        : currentLive?.stepName || "Sem etapa"}
                    </span>
                  </div>
                </div>

                <div className="trail-progress-detail">
                  <div>
                    <span
                      style={{
                        width: linkedPath ? "100%" : "0%",
                        background: trailColor,
                        boxShadow: `0 0 12px ${trailColor}`,
                      }}
                    />
                  </div>

                  <strong style={{ color: trailColor }}>
                    {linkedPath ? "Etapa vinculada" : "Não vinculada"}
                  </strong>
                </div>
              </div>

              <div className="live-details-card result-card">
                <h2>Resultado Gerado</h2>

                <div className="result-content">
                  <div className="result-row">
                    <strong>Avaliação da etapa concluída</strong>
                    <span className="success-pill">
                      {linkedStep ? "Concluída" : "Não gerada"}
                    </span>
                  </div>

                  <div className="result-row">
                    <strong>Pontuação</strong>
                    <span>{linkedStep ? "Calculada por presença" : "-"}</span>
                  </div>

                  <div className="result-row">
                    <strong>Status</strong>
                    <span className="finished-pill">Finalizada</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="live-details-card bottom-stats">
            <h2>Dados da transmissão</h2>

            <div className="bottom-stat active">
              <MessageSquare size={25} />
              <div>
                <strong>{messages.length}</strong>
                <span>Mensagens</span>
              </div>
            </div>

            <div className="bottom-stat">
              <Users size={25} />
              <div>
                <strong>{participants.length}</strong>
                <span>Participantes</span>
              </div>
            </div>

            <div className="bottom-stat">
              <Eye size={25} />
              <div>
                <strong>{participants.length}</strong>
                <span>Visualizações</span>
              </div>
            </div>

            <div className="bottom-stat">
              <Clock size={25} />
              <div>
                <strong>{totalDuration}</strong>
                <span>Duração total</span>
              </div>
            </div>
          </section>
        </div>

        <aside className="live-details-extra">
          <section className="live-details-card participants-presence-card">
            <h2>
              <Users size={16} />
              Participantes e tempo de presença
            </h2>

            <div className="presence-list">
              {participants.length === 0 && <p>Nenhuma presença registrada.</p>}

              {participants.map((item) => (
                <div className="presence-item" key={item.id}>
                  <div className="presence-user">
                    <img src={userblack} alt="Usuário" />
                    <span>{item.name}</span>
                  </div>

                  <span className="presence-time">
                    {formatSeconds(item.durationSeconds)}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="live-details-card transmission-chat-card">
            <h2>Chat de transmissão</h2>

            <div className="transmission-chat-list">
              {formattedMessages.length === 0 && (
                <p>Nenhuma mensagem registrada.</p>
              )}

              {formattedMessages.map((item) => (
                <div className="transmission-chat-item" key={item.id}>
                  <img src={userblack} alt="Usuário" />

                  <div>
                    <div className="transmission-chat-top">
                      <strong>{item.user}</strong>
                      <span>{item.time}</span>
                    </div>

                    <p>{item.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="live-info-row">
      <strong>{label}</strong>
      <span>{value}</span>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "--/--/----";
  return new Date(value).toLocaleDateString("pt-BR");
}

function formatDateTime(value) {
  if (!value) return "--/--/---- às --:--";

  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTime(value) {
  if (!value) return "agora";

  return new Date(value).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function calculateDuration(start, end) {
  if (!start || !end) return "00:00";

  const diffMs = new Date(end) - new Date(start);
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));

  return formatSeconds(totalSeconds);
}

function formatSeconds(seconds = 0) {
  const totalSeconds = Math.max(0, Number(seconds) || 0);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, "0")}min`;
  }

  return `${minutes}min`;
}