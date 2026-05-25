import { useEffect, useState } from "react";

import simbol_live from "../assets/live-streaming-red.png";
import aovivo from "../assets/aovivo.png";
import userblack from "../assets/user-black.png";
import eye from "../assets/eye.png";

import "../assets/LivesListScreen.css";

const API_URL = "http://localhost:3000";

export default function LivesListScreen({ onOpenLive }) {
  const [lives, setLives] = useState([]);
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

  async function loadLives() {
    try {
      setLoading(true);

      const [streamsData, usersData] = await Promise.all([
        api("/stream/streams"),
        api("/users/users"),
      ]);

      const safeStreams = Array.isArray(streamsData) ? streamsData : [];
      const safeUsers = Array.isArray(usersData) ? usersData : [];

      const enrichedLives = await Promise.all(
        safeStreams.map(async (live) => {
          const host = safeUsers.find((user) => user.id === live.hostId);

          const presences = await loadLivePresences(live.id);

          return {
            ...live,
            hostName:
              host?.name || host?.email || live.hostName || "Organizador",
            viewerCount: countUniqueViewers(presences),
          };
        })
      );

      setLives(enrichedLives);
    } catch (error) {
      console.error(error);
      alert("Erro ao carregar transmissões");
    } finally {
      setLoading(false);
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

  function countUniqueViewers(presences) {
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

    const interval = setInterval(loadLives, 15000);

    return () => clearInterval(interval);
  }, []);

  const liveStreams = lives.filter((live) => {
    const status = String(live.status || "").toLowerCase();

    return status === "live" || status === "ao_vivo";
  });

  return (
    <div className="lives-list-page">
      <header className="lives-list-header">
        <h1>Transmissões</h1>
        <p>Acompanhe somente as transmissões ao vivo agora</p>
      </header>

      {loading && <p>Carregando transmissões...</p>}

      <section className="lives-card-grid">
        {liveStreams.map((live) => (
          <button
            type="button"
            className="transmission-card"
            key={live.id}
            onClick={() => onOpenLive(live)}
          >
            <div className="transmission-video">
              <img
                className="transmission-badge"
                src={aovivo}
                alt="Ao vivo"
              />

              <img
                className="transmission-live-icon"
                src={simbol_live}
                alt=""
              />
            </div>

            <div className="transmission-info">
              <h2>{live.title}</h2>

              <div className="transmission-user">
                <img src={userblack} alt="Administrador" />
                <span>{live.hostName}</span>
              </div>

              <div className="transmission-user">
                <img src={eye} alt="Assistindo" className="eye-icon" />

                <span>
                  {live.viewerCount === 1
                    ? "1 pessoa assistindo"
                    : `${live.viewerCount || 0} pessoas assistindo`}
                </span>
              </div>
            </div>
          </button>
        ))}

        {!loading && liveStreams.length === 0 && (
          <p>Nenhuma transmissão ao vivo no momento.</p>
        )}
      </section>
    </div>
  );
}