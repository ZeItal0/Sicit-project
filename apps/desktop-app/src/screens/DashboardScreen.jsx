import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import {
  Users,
  GraduationCap,
  Radio,
  PieChart,
  FileBadge,
  PlaySquare,
  Award,
  UserPlus,
  Activity,
} from "lucide-react";

import "../assets/DashboardScreen.css";

const API_URL = "http://localhost:3000";

export default function DashboardScreen() {
  const [executive, setExecutive] = useState(null);
  const [learningKpis, setLearningKpis] = useState(null);
  const [streamKpis, setStreamKpis] = useState(null);
  const [trainingKpis, setTrainingKpis] = useState(null);
  const [auditSummary, setAuditSummary] = useState(null);
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

  async function loadDashboard() {
    try {
      setLoading(true);

      const [
        executiveData,
        learningData,
        streamData,
        trainingData,
        auditData,
      ] = await Promise.all([
        api("/analytics/dashboard/executive"),
        api("/analytics/kpis/learning-paths"),
        api("/analytics/kpis/stream"),
        api("/analytics/kpis/training"),
        api("/analytics/audit/summary"),
      ]);

      setExecutive(executiveData);
      setLearningKpis(learningData);
      setStreamKpis(streamData);
      setTrainingKpis(trainingData);
      setAuditSummary(auditData);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const summary = executive?.summary || {};

  const cards = [
    {
      title: "Usuários ativos",
      value: summary.totalUsers || 0,
      percent: "+ 0%",
      icon: Users,
    },
    {
      title: "Trilhas de treinamento",
      value: learningKpis?.totalLearningPaths || 0,
      percent: "+ 0%",
      icon: GraduationCap,
    },
    {
      title: "Lives realizadas",
      value: streamKpis?.endedStreams || summary.totalStreams || 0,
      percent: "+ 0%",
      icon: Radio,
    },
    {
      title: "Eventos de presença",
      value: streamKpis?.viewerJoinedEvents || 0,
      percent: "+ 0%",
      icon: Users,
    },
    {
      title: "Conclusão média das trilhas",
      value: `${learningKpis?.averageCompletionPercent || 0}%`,
      percent: "+ 0%",
      icon: PieChart,
    },
    {
      title: "Certificados emitidos",
      value:
        trainingKpis?.certificatesGenerated ||
        summary.totalCertificatesGenerated ||
        0,
      percent: "+ 0%",
      icon: FileBadge,
    },
  ];

  const completion = learningKpis?.averageCompletionPercent || 0;
  const completed = learningKpis?.completedLearningPaths || 0;
  const pending = learningKpis?.pendingLearningPaths || 0;
  const totalResults = learningKpis?.totalLearningPathResults || 0;
  const notStarted = Math.max(
    0,
    (learningKpis?.totalLearningPaths || 0) - totalResults
  );

  const lineOptions = {
    chart: { toolbar: { show: false }, background: "transparent" },
    colors: ["#5b8def", "#61c99a"],
    stroke: { curve: "smooth", width: 3 },
    grid: { borderColor: "rgba(50,55,61,0.08)" },
    xaxis: {
      categories: ["Trilhas", "Lives", "Certificados", "Auditoria"],
      labels: { style: { colors: "#32373d", fontSize: "9px" } },
    },
    yaxis: {
      labels: { style: { colors: "#32373d", fontSize: "9px" } },
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
      fontSize: "10px",
      labels: { colors: "#32373d" },
    },
    dataLabels: { enabled: false },
  };

  const lineSeries = [
    {
      name: "Quantidade",
      data: [
        learningKpis?.totalLearningPaths || 0,
        streamKpis?.totalStreams || 0,
        trainingKpis?.certificatesGenerated || 0,
        auditSummary?.totalEvents || 0,
      ],
    },
    {
      name: "Concluídos",
      data: [
        learningKpis?.completedLearningPaths || 0,
        streamKpis?.endedStreams || 0,
        trainingKpis?.learningPathsCompleted || 0,
        trainingKpis?.trainingResultsGenerated || 0,
      ],
    },
  ];

  const donutSeries = [completed, pending, notStarted, 0];

  const donutOptions = {
    labels: ["Concluídas", "Em andamento", "Não iniciadas", "Atrasadas"],
    colors: ["#61c99a", "#5b8def", "#c7d4e1", "#ef5555"],
    chart: { background: "transparent" },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    legend: { show: false },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total",
              formatter: () => String(learningKpis?.totalLearningPaths || 0),
            },
          },
        },
      },
    },
  };

  const sectors = [
    ["Geral", completion, "#5b8def"],
    ["Trilhas concluídas", completed, "#61c99a"],
    ["Pendentes", pending, "#f6a300"],
    ["Não iniciadas", notStarted, "#c7d4e1"],
  ];

  const lives = [
    ["Total de transmissões", `${streamKpis?.totalStreams || 0} lives`],
    ["Lives ao vivo", `${streamKpis?.liveStreams || 0} agora`],
    ["Lives encerradas", `${streamKpis?.endedStreams || 0} concluídas`],
    ["Entradas de viewers", `${streamKpis?.viewerJoinedEvents || 0} eventos`],
    ["Saídas de viewers", `${streamKpis?.viewerLeftEvents || 0} eventos`],
  ];

  const trails = [
    ["Trilhas cadastradas", learningKpis?.totalLearningPaths || 0],
    ["Resultados gerados", learningKpis?.totalLearningPathResults || 0],
    ["Trilhas concluídas", learningKpis?.completedLearningPaths || 0],
    ["Trilhas pendentes", learningKpis?.pendingLearningPaths || 0],
    ["Conclusão média", learningKpis?.averageCompletionPercent || 0],
  ];

  const activities = Object.entries(auditSummary?.byAction || {})
    .slice(0, 5)
    .map(([action, count]) => ({
      title: action,
      desc: `${count} evento(s) registrados`,
      time: "Agora",
      icon:
        action === "CERTIFICATE_GENERATED"
          ? Award
          : action === "LIVE_STARTED"
          ? Radio
          : action === "USER_CREATED"
          ? UserPlus
          : Activity,
    }));

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Visão geral do sistema e indicadores</p>
      </header>

      {loading && <p>Carregando dashboard...</p>}

      <section className="dashboard-cards">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div className="dashboard-card" key={card.title}>
              <div className="dashboard-icon">
                <Icon size={20} />
              </div>

              <div>
                <span>{card.title}</span>
                <strong>{card.value}</strong>
                <small>{card.percent}</small>
                <p>dados atuais do sistema</p>
              </div>
            </div>
          );
        })}
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-panel chart-panel">
          <div className="panel-top">
            <h2>Desempenho geral</h2>
            <button type="button">Dados atuais</button>
          </div>

          <Chart
            options={lineOptions}
            series={lineSeries}
            type="line"
            height={190}
          />
        </div>

        <div className="dashboard-panel">
          <h2>Conclusão por indicador</h2>

          {sectors.map(([name, value, color]) => (
            <div className="sector-progress" key={name}>
              <div>
                <span>{name}</span>
                <strong>{value}%</strong>
              </div>

              <div className="bar">
                <div
                  style={{
                    width: `${Math.min(Number(value) || 0, 100)}%`,
                    backgroundColor: color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="dashboard-panel status-panel">
          <h2>Status das trilhas</h2>

          <Chart
            options={donutOptions}
            series={donutSeries}
            type="donut"
            height={190}
          />

          <div className="status-list">
            <p>
              <b className="green"></b>Concluídas <strong>{completed}</strong>
            </p>
            <p>
              <b className="blue"></b>Em andamento <strong>{pending}</strong>
            </p>
            <p>
              <b className="gray"></b>Não iniciadas <strong>{notStarted}</strong>
            </p>
            <p>
              <b className="red"></b>Atrasadas <strong>0</strong>
            </p>
          </div>
        </div>

        <div className="dashboard-panel">
          <h2>Resumo das lives</h2>

          {lives.map(([name, value]) => (
            <div className="simple-row" key={name}>
              <span>
                <PlaySquare size={13} />
              </span>
              <p>{name}</p>
              <strong>{value}</strong>
            </div>
          ))}
        </div>

        <div className="dashboard-panel">
          <h2>Resumo das trilhas</h2>

          {trails.map(([name, value], index) => (
            <div className="rank-row" key={name}>
              <span>{index + 1}</span>
              <p>{name}</p>

              <div className="mini-bar">
                <div
                  style={{
                    width: `${Math.min(Number(value) || 0, 100)}%`,
                  }}
                />
              </div>

              <strong>
                {name.includes("média") ? `${value}%` : value}
              </strong>
            </div>
          ))}
        </div>

        <div className="dashboard-panel">
          <h2>Atividades recentes</h2>

          {activities.length === 0 && <p>Nenhum evento registrado.</p>}

          {activities.map((item) => {
            const Icon = item.icon;

            return (
              <div className="activity-row" key={item.title}>
                <span>
                  <Icon size={13} />
                </span>

                <div>
                  <strong>{item.title}</strong>
                  <p>{item.desc}</p>
                </div>

                <small>{item.time}</small>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}