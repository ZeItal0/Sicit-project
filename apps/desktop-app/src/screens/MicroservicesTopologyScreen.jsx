import { useEffect, useMemo, useState } from "react";
import {
    Users,
    MessageSquare,
    Video,
    GraduationCap,
    ClipboardCheck,
    ShieldCheck,
    BarChart3,
    CheckCircle,
    AlertTriangle,
    XCircle,
    RefreshCw,
} from "lucide-react";

import "../assets/MicroservicesTopologyScreen.css";
import gatewayimg from "../assets/gatewayapi.png";

const API_URL = "http://localhost:3000";

const SERVICE_CONFIG = {
    auth: {
        name: "AUTH-SERVICE",
        icon: ShieldCheck,
        color: "#dd6f9d",
    },
    user: {
        name: "USER-SERVICE",
        icon: Users,
        color: "#4d8dff",
    },
    communication: {
        name: "COMMUNICATION-SERVICE",
        icon: MessageSquare,
        color: "#8f5cf7",
    },
    stream: {
        name: "STREAM-SERVICE",
        icon: Video,
        color: "#c9d984",
    },
    training: {
        name: "TRAINING-SERVICE",
        icon: GraduationCap,
        color: "#d9a21b",
    },
    audit: {
        name: "AUDIT-SERVICE",
        icon: ClipboardCheck,
        color: "#20c9a6",
    },
    analytics: {
        name: "ANALYTICS-SERVICE",
        icon: BarChart3,
        color: "#ef5555",
    },
};

export default function MicroservicesTopologyScreen() {
    const [health, setHealth] = useState(null);
    const [loading, setLoading] = useState(false);
    const [lastCheck, setLastCheck] = useState(null);

    async function loadHealth() {
        try {
            setLoading(true);

            const response = await fetch(`${API_URL}/health`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error("Erro ao buscar healthcheck");
            }

            setHealth(data);
            setLastCheck(new Date());
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadHealth();

        const interval = setInterval(loadHealth, 15000);

        return () => clearInterval(interval);
    }, []);

    const services = useMemo(() => {
        const serviceStatus = health?.services || {};

        return Object.entries(SERVICE_CONFIG).map(([key, config], index) => {
            const serviceHealth = serviceStatus[key] || {};
            const status = serviceHealth.status || "down";

            return {
                key,
                name: config.name,
                icon: config.icon,
                color: config.color,
                status,
                label: status === "up" ? "Saudável" : "Indisponível",
                responseTime:
                    status === "up" && serviceHealth.responseTimeMs != null
                        ? `${serviceHealth.responseTimeMs} ms`
                        : "--",
                statusCode: serviceHealth.statusCode,
                checkedAt: serviceHealth.checkedAt,
                error: serviceHealth.error,
            };
        });
    }, [health]);

    const onlineServices = services.filter((service) => service.status === "up");
    const offlineServices = services.filter((service) => service.status !== "up");
    const allUp = services.length > 0 && offlineServices.length === 0;

    const availability =
        services.length > 0
            ? Math.round((onlineServices.length / services.length) * 100)
            : 0;

    const averageTime =
        onlineServices.length > 0
            ? Math.round(
                onlineServices.reduce(
                    (sum, service) => sum + Number(service.responseTime.replace(" ms", "")),
                    0
                ) / onlineServices.length
            )
            : 0;

    return (
        <main className="micro-page">
            <header className="micro-header">
                <div>
                    <h1>Topologia de Microservices</h1>
                    <p>
                        Visualize as conexões entre API Gateway e os microServices e acompanhe
                        o status de saúde de cada serviço.
                    </p>
                </div>

                <button
                    type="button"
                    className="micro-refresh-btn"
                    onClick={loadHealth}
                    disabled={loading}
                >
                    <RefreshCw size={14} />
                    {loading ? "Atualizando..." : "Atualizar"}
                </button>
            </header>

            <section className="micro-card">
                <div className="micro-map">
                    <article className="gateway-card">
                        <div className="gateway-icon">
                            <img src={gatewayimg} className="gatewayimg" alt="" />
                        </div>

                        <div>
                            <h3>API GATEWAY</h3>

                            <span className={`status-pill ${health?.status === "degraded" ? "pill-warning" : ""}`}>
                                {health?.status === "degraded" ? (
                                    <AlertTriangle size={11} />
                                ) : (
                                    <CheckCircle size={11} />
                                )}
                                {health?.status === "degraded" ? "Degradado" : "Saudável"}
                            </span>
                        </div>
                    </article>

                    <div
                        className={`gateway-dot ${health?.status === "degraded" ? "dot-warning" : ""
                            }`}
                    ></div>

                    <div className="topology-lines">
                        <div
                            className={`topology-main-line ${health?.status === "degraded" ? "line-warning" : ""
                                }`}
                        ></div>

                        {services.map((service, index) => (
                            <div
                                key={service.name}
                                className={`topology-branch ${service.status !== "up" ? "branch-error" : ""
                                    }`}
                                style={{
                                    top: `${18 + index * 70}px`,
                                }}
                            />
                        ))}
                    </div>

                    <div className="services-list">
                        {services.map((service) => {
                            const Icon = service.icon;
                            const isUp = service.status === "up";

                            return (
                                <article
                                    className={`service-card ${!isUp ? "service-down" : ""}`}
                                    key={service.name}
                                >
                                    <div
                                        className="service-icon"
                                        style={{ backgroundColor: service.color }}
                                    >
                                        <Icon size={18} />
                                    </div>

                                    <div className="service-info">
                                        <h3>{service.name}</h3>

                                        <span className={`status-pill ${!isUp ? "pill-error" : ""}`}>
                                            {isUp ? <CheckCircle size={10} /> : <XCircle size={10} />}
                                            {service.label}
                                        </span>
                                    </div>

                                    <div className="service-time">
                                        <strong>{service.responseTime}</strong>
                                        <span>Resposta</span>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </div>

                <div className="micro-side">
                    <div className="micro-top-panels">
                        <section className="system-panel">
                            <h2>Status Geral do Sistema</h2>

                            {allUp ? (
                                <CheckCircle className="system-check" size={44} />
                            ) : (
                                <AlertTriangle className="system-check system-warning" size={44} />
                            )}

                            <strong>
                                {allUp
                                    ? "Todos os serviços operacionais"
                                    : "Sistema operando com degradação"}
                            </strong>

                            <p>
                                {onlineServices.length} de {services.length} serviços saudáveis
                            </p>

                            <div className="system-metrics">
                                <div>
                                    <strong>{availability}%</strong>
                                    <span>Disponibilidade</span>
                                </div>

                                <div>
                                    <strong>{onlineServices.length}</strong>
                                    <span>Serviços online</span>
                                </div>

                                <div>
                                    <strong>{offlineServices.length}</strong>
                                    <span>Alertas</span>
                                </div>

                                <div>
                                    <strong>{averageTime} ms</strong>
                                    <span>tempo médio</span>
                                </div>
                            </div>
                        </section>

                        <section className="legend-panel">
                            <h2>Legenda</h2>

                            <p>
                                <b className="healthy"></b>
                                Saudável
                            </p>

                            <p>
                                <b className="warning"></b>
                                Alerta
                            </p>

                            <p>
                                <b className="error"></b>
                                Erro
                            </p>

                            <p>
                                <b className="offline"></b>
                                Indisponível
                            </p>

                            <p className="last-check">
                                Atualizado:{" "}
                                {lastCheck
                                    ? lastCheck.toLocaleTimeString("pt-BR")
                                    : "--:--:--"}
                            </p>
                        </section>
                    </div>

                    <section className="health-panel">
                        <h2>Últimos Health Checks</h2>

                        {services.map((service) => {
                            const isUp = service.status === "up";

                            return (
                                <div className="health-row" key={service.name}>
                                    {isUp ? <CheckCircle size={13} /> : <XCircle size={13} />}
                                    <strong>{service.name}</strong>

                                    <span className={!isUp ? "health-error" : ""}>
                                        {service.label}
                                    </span>

                                    <time>
                                        {lastCheck
                                            ? lastCheck.toLocaleTimeString("pt-BR")
                                            : "00:00:00"}
                                    </time>
                                </div>
                            );
                        })}
                    </section>

                    <section className="alerts-panel">
                        <h2>Alertas</h2>

                        {offlineServices.length === 0 ? (
                            <p className="no-alerts">Nenhum alerta ativo.</p>
                        ) : (
                            offlineServices.map((service) => (
                                <div className="alert-row" key={service.name}>
                                    <AlertTriangle size={14} />

                                    <div>
                                        <strong>{service.name}</strong>
                                        <p>Serviço indisponível no healthcheck</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </section>
                </div>
            </section>
        </main>
    );
}