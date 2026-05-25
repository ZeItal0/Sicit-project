import { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Users,
  Shield,
  Clock,
  Search,
  CalendarDays,
  UserCircle,
  GraduationCap,
} from "lucide-react";

import "../assets/AuditScreen.css";

const API_URL = "http://localhost:3000";

export default function AuditScreen() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const token = localStorage.getItem("sicit_token");

  async function loadEvents() {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/audit/events`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json().catch(() => []);

      if (!response.ok) {
        throw new Error(data?.message || "Erro ao buscar eventos");
      }

      setEvents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  const actions = useMemo(() => {
    return [...new Set(events.map((event) => event.action).filter(Boolean))];
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const text = JSON.stringify(event).toLowerCase();

      const matchesSearch = !search || text.includes(search.toLowerCase());
      const matchesAction = !actionFilter || event.action === actionFilter;

      let matchesDate = true;

      if (event.createdAt) {
        const eventDate = new Date(event.createdAt);

        if (startDate) {
          const start = new Date(startDate);
          start.setHours(0, 0, 0, 0);
          matchesDate = matchesDate && eventDate >= start;
        }

        if (endDate) {
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          matchesDate = matchesDate && eventDate <= end;
        }
      }

      return matchesSearch && matchesAction && matchesDate;
    });
  }, [events, search, actionFilter, startDate, endDate]);

  const todayEvents = events.filter((event) => {
    if (!event.createdAt) return false;

    return (
      new Date(event.createdAt).toDateString() === new Date().toDateString()
    );
  });

  const uniqueUsers = new Set(events.map((event) => event.userId).filter(Boolean));

  const criticalEvents = events.filter((event) =>
    isCriticalAction(event.action)
  );

  const lastEvent = events[0];

  return (
    <div className="audit-page">
      <header className="audit-header">
        <h1>Auditoria</h1>
        <p>Acompanhe todas as ações realizadas pelos usuários no sistema.</p>
      </header>

      <section className="audit-card">
        <div className="audit-stats">
          <StatCard
            icon={FileText}
            color="#006cff"
            title="Eventos hoje"
            value={todayEvents.length}
            detail={`${events.length} eventos registrados`}
          />

          <StatCard
            icon={Users}
            color="#80d900"
            title="Usuários ativos"
            value={uniqueUsers.size}
            detail="usuários com eventos"
          />

          <StatCard
            icon={Shield}
            color="#6e00ff"
            title="Ações críticas"
            value={criticalEvents.length}
            detail="ações sensíveis detectadas"
          />

          <StatCard
            icon={Clock}
            color="#d9a21b"
            title="Último evento"
            value={
              lastEvent?.createdAt
                ? new Date(lastEvent.createdAt).toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "--"
            }
            detail={
              lastEvent?.createdAt
                ? new Date(lastEvent.createdAt).toLocaleDateString("pt-BR")
                : "Sem eventos"
            }
          />
        </div>

        <section className="audit-table-card">
          <div className="audit-filters">
            <div className="audit-search">
              <input
                type="text"
                placeholder="Buscar eventos"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search size={18} />
            </div>

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            >
              <option value="">Todas as ações</option>

              {actions.map((action) => (
                <option key={action} value={action}>
                  {formatAction(action)}
                </option>
              ))}
            </select>

            <div className="audit-date-picker">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <CalendarDays size={18} />
            </div>

            <div className="audit-date-picker">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <CalendarDays size={18} />
            </div>
          </div>

          {loading && <p>Carregando eventos...</p>}

          <div className="audit-table-header">
            <span>DATA / HORA</span>
            <span>USUÁRIO</span>
            <span>AÇÃO</span>
            <span>RECURSOS</span>
            <span>DETALHES</span>
            <span>STATUS</span>
          </div>

          <div className="audit-table-body">
            {!loading && filteredEvents.length === 0 && (
              <p>Nenhum evento encontrado.</p>
            )}

            {filteredEvents.map((event) => {
              const metadataText = formatMetadata(event.metadata);

              return (
                <div className="audit-row" key={event.id || event.createdAt}>
                  <div className="audit-date-cell">
                    <b></b>

                    <div>
                      <span>
                        {event.createdAt
                          ? new Date(event.createdAt).toLocaleDateString("pt-BR")
                          : "--/--/----"}
                      </span>{" "}

                      <small>
                        {event.createdAt
                          ? new Date(event.createdAt).toLocaleTimeString("pt-BR")
                          : "--:--:--"}
                      </small>
                    </div>
                  </div>

                  <div className="audit-user-cell">
                    <UserCircle size={18} />
                    <span>{event.userEmail || event.userId || "Sistema"}</span>
                  </div>

                  <div className="audit-action-cell">
                    {formatAction(event.action)}
                  </div>

                  <div className="audit-resource-cell">
                    <div
                      style={{
                        backgroundColor: getResourceColor(event.resourceType),
                      }}
                    >
                      <GraduationCap size={16} />
                    </div>

                    <span>{event.resourceType || "-"}</span>
                  </div>

                  <div className="audit-detail-cell" title={metadataText}>
                    {metadataText}
                  </div>

                  <div>
                    <span
                      className={`audit-status ${
                        isCriticalAction(event.action) ? "critical" : "success"
                      }`}
                    >
                      {isCriticalAction(event.action) ? "Crítico" : "Sucesso"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, color, title, value, detail }) {
  return (
    <div className="audit-stat-card">
      <div className="audit-stat-icon" style={{ backgroundColor: color }}>
        <Icon size={30} />
      </div>

      <div>
        <span>{title}</span>
        <strong>{value}</strong>
        <p>{detail}</p>
      </div>
    </div>
  );
}

function formatAction(action) {
  const actions = {
    LIVE_STARTED: "Live iniciada",
    LIVE_ENDED: "Live encerrada",
    CHANNEL_CREATED: "Canal criado",
    DIRECT_CHANNEL_CREATED: "Conversa direta criada",
    MEMBER_JOINED_CHANNEL: "Membro entrou no canal",
    TRAINING_RESULTS_GENERATED: "Resultado de treinamento gerado",
    CERTIFICATE_GENERATED: "Certificado gerado",
    LEARNING_PATH_COMPLETED: "Trilha concluída",
    MOODLE_SYNC_ATTEMPTED: "Tentativa de sincronização Moodle",
  };

  return actions[action] || action || "Ação";
}

function formatMetadata(metadata) {
  if (!metadata) return "-";

  if (typeof metadata === "string") return metadata;

  if (metadata.name) return metadata.name;
  if (metadata.title) return metadata.title;
  if (metadata.email) return metadata.email;

  const hiddenKeys = ["userId", "hostId", "createdBy", "targetUserId"];

  const values = Object.entries(metadata)
    .filter(([key]) => !hiddenKeys.includes(key))
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(" | ");

  return values || "Evento registrado no sistema";
}

function isCriticalAction(action = "") {
  return (
    action.includes("DELETE") ||
    action.includes("REMOVED") ||
    action.includes("DISABLED") ||
    action.includes("ERROR") ||
    action.includes("FAILED")
  );
}

function getResourceColor(resourceType = "") {
  if (resourceType.includes("STREAM")) return "#1cc7d9";
  if (resourceType.includes("TRAINING")) return "#d7c900";
  if (resourceType.includes("CHANNEL")) return "#80d900";
  if (resourceType.includes("CERTIFICATE")) return "#6e00ff";
  if (resourceType.includes("LEARNING")) return "#d9a21b";

  return "#006cff";
}