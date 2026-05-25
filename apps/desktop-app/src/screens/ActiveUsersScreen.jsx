import { useEffect, useState } from "react";

import {LineChart,GraduationCap,Percent,Award,Clock3,} from "lucide-react";

import userblack from "../assets/user-black.png";
import rightarrow from "../assets/leftarrow.png";
import leftarrow from "../assets/rightarrow.png";
import engine from "../assets/engine.png";
import sector from "../assets/sector.png";
import userinfo from "../assets/userinfo.png";
import statusIcon from "../assets/status.png";
import mail from "../assets/mail.png";
import calendar from "../assets/calendarinfo.png";
import lupa from "../assets/lupa.png";
import edit from "../assets/edittext.png";
import trash from "../assets/trash.png";
import GlassBox from "../components/GlassBoxsmall";
import "../assets/ActiveUsersScreen.css";

const API_URL = "http://localhost:3000";

export default function ActiveUsersScreen() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState([]);

  const [learningPaths, setLearningPaths] = useState([]);
  const [learningPathResults, setLearningPathResults] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    status: "",
    roleId: "",
    sectorId: "",
    permissions: [],
  });

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

  async function loadData() {
    try {
      const [
        usersData,
        rolesData,
        sectorsData,
        permissionsData,
        pathsData,
        pathResultsData,
      ] = await Promise.all([
        api("/users/users"),
        api("/users/roles"),
        api("/users/sectors"),
        api("/users/permissions"),
        api("/training/trainings/paths"),
        api("/training/trainings/paths/results/all"),
      ]);

      setUsers(Array.isArray(usersData) ? usersData : []);
      setRoles(Array.isArray(rolesData) ? rolesData : []);
      setSectors(Array.isArray(sectorsData) ? sectorsData : []);
      setPermissions(Array.isArray(permissionsData) ? permissionsData : []);
      setLearningPaths(Array.isArray(pathsData) ? pathsData : []);
      setLearningPathResults(Array.isArray(pathResultsData) ? pathResultsData : []);

      const rolePerms = [];

      for (const role of rolesData || []) {
        const perms = await api(`/users/roles/${role.id}/permissions`);

        rolePerms.push({
          roleId: role.id,
          permissions: perms.map((item) => item.permission),
        });
      }

      setRolePermissions(rolePerms);
    } catch (error) {
      alert(error.message);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function getUserPermissions(user) {
    const found = rolePermissions.find((item) => item.roleId === user.roleId);
    return found?.permissions?.map((permission) => permission.code) || [];
  }

  function getUserPerformance(userId) {
    const userResults = learningPathResults.filter(
      (result) => result.userId === userId
    );

    const completedResults = userResults.filter(
      (result) => result.approved === true
    );

    const completionRate =
      userResults.length > 0
        ? Math.round(
          userResults.reduce(
            (sum, result) => sum + Number(result.completionPercent || 0),
            0
          ) / userResults.length
        )
        : 0;

    const trails = learningPaths.map((path) => {
      const result = userResults.find((item) => item.pathId === path.id);
      const progress = Number(result?.completionPercent || 0);

      return {
        name: path.title,
        progress,
        status:
          progress >= 100 || result?.approved
            ? "Concluída"
            : progress > 0
              ? "Em andamento"
              : "Não iniciada",
        color:
          progress >= 100 || result?.approved
            ? "#61c99a"
            : progress > 0
              ? "#5b8def"
              : "#ef5555",
      };
    });

    return {
      completedTrails: completedResults.length,
      totalTrails: learningPaths.length,
      completionRate,
      certificates: completedResults.length,
      trails,
      history: completedResults.slice(0, 5).map((result) => {
        const path = learningPaths.find((item) => item.id === result.pathId);

        return {
          type: "Trilha concluída",
          desc: `Concluiu ${path?.title || "uma trilha"}`,
          date: result.generatedAt
            ? new Date(result.generatedAt).toLocaleString("pt-BR")
            : "Sem data",
          icon: GraduationCap,
        };
      }),
    };
  }

  function openUser(user) {
    const userPerms = getUserPermissions(user);

    setSelectedUser(user);
    setOpenMenuId(null);
    setIsEditing(false);

    setUserForm({
      name: user.name || "",
      email: user.email || "",
      status: user.status || "ACTIVE",
      roleId: user.roleId || "",
      sectorId: user.sectorId || "",
      permissions: userPerms,
    });
  }

  function handleEditUser() {
    if (!selectedUser) return;
    openUser(selectedUser);
    setIsEditing(true);
  }

  async function handleSaveUser() {
    try {
      if (!selectedUser) return;

      if (userForm.roleId && userForm.roleId !== selectedUser.roleId) {
        await api(`/users/users/${selectedUser.id}/role`, {
          method: "PUT",
          body: JSON.stringify({ roleId: userForm.roleId }),
        });
      }

      if (userForm.sectorId !== selectedUser.sectorId) {
        await api(`/users/users/${selectedUser.id}/sector`, {
          method: "PUT",
          body: JSON.stringify({ sectorId: userForm.sectorId || null }),
        });
      }

      if (userForm.status !== selectedUser.status) {
        await api(`/users/users/${selectedUser.id}/status`, {
          method: "PUT",
          body: JSON.stringify({ status: userForm.status }),
        });
      }

      await loadData();
      setIsEditing(false);
      alert("Usuário atualizado com sucesso");
    } catch (error) {
      alert(error.message);
    }
  }

  async function handleToggleUserStatus() {
    try {
      if (!selectedUser) return;

      const newStatus = selectedUser.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

      const confirmAction = confirm(
        `Deseja ${newStatus === "ACTIVE" ? "ativar" : "desativar"} este usuário?`
      );

      if (!confirmAction) return;

      await api(`/users/users/${selectedUser.id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: newStatus }),
      });

      await loadData();

      setSelectedUser((prev) => ({
        ...prev,
        status: newStatus,
      }));
    } catch (error) {
      alert(error.message);
    }
  }

  const selectedPerformance = selectedUser
    ? getUserPerformance(selectedUser.id)
    : null;

  return (
    <div className="active-users-page">
      <header className="active-users-header">
        <h1>Usuários Ativos</h1>
        <p>Gerencie todos os usuários da plataforma.</p>
      </header>

      <section className="active-users-layout">
        <div className="users-list-panel">
          <h2>Lista de usuários</h2>

          <div className="users-search">
            <input type="text" placeholder="Buscar usuário..." />
            <img src={lupa} alt="Buscar" />
          </div>

          <div className="users-list">
            {users.map((user) => (
              <button
                type="button"
                key={user.id}
                className={`user-list-item ${selectedUser?.id === user.id ? "selected" : ""
                  }`}
                onClick={() => openUser(user)}
              >
                <div className="user-avatar-box">
                  <img src={userblack} alt="Usuário" />
                  <span className={user.status === "ACTIVE" ? "online" : "offline"} />
                </div>

                <div>
                  <strong className="userName">{user.name}</strong>
                  <p>{user.email}</p>
                </div>

                <div className="user-actions-mini">
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === user.id ? null : user.id);
                    }}
                  >
                    ⋮
                  </span>

                  {openMenuId === user.id && (
                    <div className="user-dropdown">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openUser(user);
                        }}
                      >
                        Ver informações
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openUser(user);
                          setIsEditing(true);
                        }}
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openUser(user);
                          setTimeout(handleToggleUserStatus, 0);
                        }}
                      >
                        {user.status === "ACTIVE" ? "Desativar" : "Ativar"}
                      </button>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {users.length > 20 && (
            <div className="users-pagination">
              <GlassBox>
                <button type="button">
                  <img src={leftarrow} alt="" />
                </button>
              </GlassBox>
              <GlassBox>
                <button type="button">1</button>
              </GlassBox>
              <GlassBox>
                <button type="button">2</button>
              </GlassBox>
              <GlassBox>
                <button type="button">3</button>
              </GlassBox>
              <GlassBox>
                <button type="button">
                  <img src={rightarrow} alt="" />
                </button>
              </GlassBox>
            </div>
          )}
        </div>

        {selectedUser && (
          <div className="user-details-card">
            <button
              className="profile-menu-btn"
              type="button"
              onClick={() => {
                setSelectedUser(null);
                setIsEditing(false);
              }}
            >
              ×
            </button>

            <div className="user-details-left">
              <h2 className="profile-title">Perfil do usuário</h2>

              <section className="profile-top">
                <img src={userblack} alt="Usuário" />

                <div>
                  <h2>{isEditing ? userForm.name : selectedUser.name}</h2>
                  <span>{selectedUser.role?.name || "Sem cargo"}</span>
                </div>
              </section>

              <section className="profile-section">
                <h3>
                  <img src={userinfo} alt="" /> Informações pessoais
                </h3>

                <div className="profile-grid">
                  <p>
                    <img src={userinfo} alt="" /> Nome completo:
                  </p>
                  <span>{selectedUser.name}</span>

                  <p>
                    <img src={calendar} alt="" /> Data de cadastro:
                  </p>
                  <span>
                    {selectedUser.createdAt
                      ? new Date(selectedUser.createdAt).toLocaleDateString("pt-BR")
                      : "--/--/----"}
                  </span>

                  <p>
                    <img src={mail} alt="" /> E-mail:
                  </p>
                  <span>{selectedUser.email}</span>

                  <p>
                    <img src={statusIcon} alt="" /> Status:
                  </p>
                  <GlassBox>
                    
                      {selectedUser.status === "ACTIVE" ? "Ativo" : "Inativo"}
                    
                  </GlassBox>
                </div>
              </section>

              <section className="profile-section">
                <h3>
                  <img src={sector} alt="" /> Setor
                </h3>

                <div className="profile-grid sector-grid">
                  <p>Setor:</p>

                  {isEditing ? (
                    <select
                      className="profile-edit-input"
                      value={userForm.sectorId}
                      onChange={(e) =>
                        setUserForm((prev) => ({
                          ...prev,
                          sectorId: e.target.value,
                        }))
                      }
                    >
                      <option value="">Sem setor</option>
                      {sectors.map((sectorItem) => (
                        <option key={sectorItem.id} value={sectorItem.id}>
                          {sectorItem.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <GlassBox>
                      <span className="sector-pill">
                        {selectedUser.sector?.name || "Sem setor"}
                      </span>
                    </GlassBox>
                  )}

                  <p>Cargo:</p>

                  {isEditing ? (
                    <select
                      className="profile-edit-input"
                      value={userForm.roleId}
                      onChange={(e) =>
                        setUserForm((prev) => ({
                          ...prev,
                          roleId: e.target.value,
                        }))
                      }
                    >
                      <option value="">Sem cargo</option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span>{selectedUser.role?.name || "Sem cargo"}</span>
                  )}

                  <p>Fonte:</p>
                  <span>{selectedUser.source || "Local"} / ORANGERHM</span>
                </div>
              </section>

              <section className="profile-section">
                <h3>
                  <img src={engine} alt="" /> RolePermission
                </h3>

                <div className="role-permission-list">
                  {getUserPermissions(selectedUser).map((permissionCode) => (
                    <label className="role-permission-item" key={permissionCode}>
                      <input type="checkbox" disabled checked readOnly />
                      <span>{permissionCode}</span>
                    </label>
                  ))}
                </div>
              </section>

              <section className="profile-section">
                <h3>
                  <img src={engine} alt="" /> Ações
                </h3>

                <div className="profile-actions">
                  {!isEditing ? (
                    <button type="button" onClick={handleEditUser}>
                      <img src={edit} alt="" />
                      Editar informações
                    </button>
                  ) : (
                    <button type="button" onClick={handleSaveUser}>
                      Salvar alterações
                    </button>
                  )}

                  <button type="button" onClick={handleToggleUserStatus}>
                    <img src={trash} alt="" />
                    {selectedUser.status === "ACTIVE"
                      ? "Desativar usuário"
                      : "Ativar usuário"}
                  </button>
                </div>
              </section>
            </div>

            <aside className="user-performance-panel">
              <h2>
                <LineChart size={18} />
                Desempenho do usuário
              </h2>

              <div className="performance-cards">
                <div>
                  <span>Trilhas concluídas</span>

                  <strong>
                    <GraduationCap size={20} />
                    {selectedPerformance?.completedTrails || 0}
                  </strong>

                  <small>de {selectedPerformance?.totalTrails || 0} trilhas</small>
                </div>

                <div>
                  <span>Taxa de conclusão</span>

                  <strong>
                    <Percent size={20} />
                    {selectedPerformance?.completionRate || 0}%
                  </strong>

                  <small>média geral</small>
                </div>

                <div>
                  <span>Certificados</span>

                  <strong>
                    <Award size={20} />
                    {selectedPerformance?.certificates || 0}
                  </strong>

                  <small>emitidos</small>
                </div>
              </div>

              <section className="performance-section">
                <h3>Progresso nas trilhas</h3>

                {selectedPerformance?.trails?.length > 0 ? (
                  selectedPerformance.trails.map((trail) => (
                    <div className="performance-trail" key={trail.name}>
                      <div className="performance-trail-top">
                        <span>{trail.name}</span>
                        <b>{trail.status}</b>
                      </div>

                      <div className="performance-trail-progress">
                        <div className="performance-bar">
                          <div
                            style={{
                              width: `${trail.progress}%`,
                              backgroundColor: trail.color,
                            }}
                          />
                        </div>

                        <strong>{trail.progress}%</strong>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>Nenhuma trilha cadastrada.</p>
                )}
              </section>

              <section className="performance-section">
                <div className="history-title">
                  <h3>
                    <Clock3 size={15} />
                    Histórico de atividades
                  </h3>
                </div>

                {selectedPerformance?.history?.length > 0 ? (
                  selectedPerformance.history.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div className="history-item" key={`${item.desc}-${item.date}`}>
                        <span>
                          <Icon size={15} />
                        </span>

                        <div>
                          <strong>{item.type}</strong>
                          <p>{item.desc}</p>
                        </div>

                        <small>{item.date}</small>
                      </div>
                    );
                  })
                ) : (
                  <p>Nenhuma atividade concluída ainda.</p>
                )}
              </section>
            </aside>
          </div>
        )}
      </section>
    </div>
  );
}