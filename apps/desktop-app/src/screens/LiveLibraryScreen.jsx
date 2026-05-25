import { useEffect, useMemo, useState } from "react";
import { Search, Radio, ChevronRight } from "lucide-react";
import "../assets/LiveLibraryScreen.css";

const API_URL = "http://localhost:3000";

export default function LiveLibraryScreen({ onOpenLiveDetails }) {
  const [lives, setLives] = useState([]);
  const [search, setSearch] = useState("");
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

  async function loadLives() {
    try {
      setLoading(true);

      const [streamsData, pathsData, sectorsData] = await Promise.all([
        api("/stream/streams"),
        api("/training/trainings/paths"),
        api("/users/sectors"),
      ]);

      const endedLives = Array.isArray(streamsData)
        ? streamsData.filter((item) => item.status === "ended")
        : [];

      const safeSectors = Array.isArray(sectorsData) ? sectorsData : [];

      const enrichedLives = await Promise.all(
        endedLives.map(async (live) => {
          const [messages, presences] = await Promise.all([
            loadLiveMessages(live.chatChannelId),
            loadLivePresences(live.id),
          ]);

          const linked = findLinkedPathAndStep(pathsData, live.id);

          const sector = safeSectors.find(
            (sectorItem) => sectorItem.id === live.sectorId
          );

          return {
            ...live,
            sectorName: sector?.name || live.sectorName || "Sem setor",
            messagesCount: messages.length,
            participantsCount: countUniqueParticipants(presences),
            chatMessages: messages,
            presences,
            trailName: linked.path?.title || "Sem trilha",
            stepName: linked.step
              ? `Etapa ${linked.step.order} - ${linked.step.title}`
              : "Sem etapa",
            linkedPath: linked.path,
            linkedStep: linked.step,
          };
        })
      );

      setLives(enrichedLives);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadLiveMessages(chatChannelId) {
    if (!chatChannelId) return [];

    try {
      const data = await api(`/communication/channels/${chatChannelId}/messages`);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  async function loadLivePresences(streamId) {
    if (!streamId) return [];

    try {
      const data = await api(`/stream/streams/${streamId}/presences`);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  function findLinkedPathAndStep(paths, streamId) {
    if (!Array.isArray(paths)) {
      return {
        path: null,
        step: null,
      };
    }

    const path = paths.find((item) =>
      item.steps?.some((step) => step.streamId === streamId)
    );

    if (!path) {
      return {
        path: null,
        step: null,
      };
    }

    const step = path.steps.find((item) => item.streamId === streamId);

    return {
      path,
      step,
    };
  }

  function countUniqueParticipants(presences) {
    const unique = new Set();

    presences.forEach((presence) => {
      const key = presence.userId || presence.email || presence.id;

      if (key) {
        unique.add(key);
      }
    });

    return unique.size;
  }

  useEffect(() => {
    loadLives();
  }, []);

  const filteredLives = useMemo(() => {
    const term = search.toLowerCase();

    return lives.filter((live) => {
      return (
        live.title?.toLowerCase().includes(term) ||
        live.description?.toLowerCase().includes(term) ||
        live.sectorName?.toLowerCase().includes(term) ||
        live.trailName?.toLowerCase().includes(term) ||
        live.stepName?.toLowerCase().includes(term)
      );
    });
  }, [lives, search]);

  return (
    <div className="live-library-page">
      <header className="live-library-header">
        <h1>Biblioteca de lives</h1>
        <p>
          Confira todas as transmissões finalizadas, acesse o conteúdo,
          participantes e mensagens.
        </p>
      </header>

      <section className="live-library-search">
        <input
          type="text"
          placeholder="Buscar por título da live, trilha ou setor"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Search size={20} />
      </section>

      <section className="live-library-table">
        <div className="live-library-table-header">
          <span>Título da live</span>
          <span>Data</span>
          <span>Setor</span>
          <span>Mensagens</span>
          <span>Participantes</span>
          <span>Duração</span>
          <span>Trilha/Etapa</span>
          <span>Ações</span>
        </div>

        <div className="live-library-list">
          {loading && <p>Carregando lives finalizadas...</p>}

          {!loading && filteredLives.length === 0 && (
            <p>Nenhuma live finalizada encontrada.</p>
          )}

          {filteredLives.map((live) => (
            <div className="live-library-row" key={live.id}>
              <div className="live-title-cell">
                <div className="live-thumb">
                  <Radio fill="#ff2a2a" strokeWidth={0.6} />
                  <span>Finalizada</span>
                </div>

                <strong>{live.title || "Sem título"}</strong>
              </div>

              <span>{formatDate(live.endedAt || live.createdAt)}</span>

              <span>{live.sectorName || "Sem setor"}</span>

              <span>{live.messagesCount ?? 0}</span>

              <span>{live.participantsCount ?? 0}</span>

              <span>{calculateDuration(live.startedAt, live.endedAt)}</span>

              <div className="trail-cell">
                <strong>{live.trailName || "Sem trilha"}</strong>
                <span>{live.stepName || "Sem etapa"}</span>
              </div>

              <button
                type="button"
                className="open-live-btn"
                onClick={() => onOpenLiveDetails?.(live)}
              >
                <ChevronRight size={30} />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function formatDate(value) {
  if (!value) return "--/--/----";

  return new Date(value).toLocaleDateString("pt-BR");
}

function calculateDuration(start, end) {
  if (!start || !end) return "00:00";

  const diffMs = new Date(end) - new Date(start);
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, "0")}min`;
  }

  return `${minutes}min`;
}