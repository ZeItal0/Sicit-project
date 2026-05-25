import { useEffect, useState } from "react";

import userblack from "../assets/user-black.png";
import lupa from "../assets/lupa.png";
import leftarrow from "../assets/rightarrow.png";
import rightarrow from "../assets/leftarrow.png";
import edit from "../assets/edittext.png";
import trash from "../assets/trash.png";
import sector from "../assets/sectorlogo.png";
import live from "../assets/live.png";
import GlassBox from "../components/GlassBoxsmall";
import "../assets/SectorsScreen.css";

const USERS_API_URL = "http://localhost:3000/users";
const STREAM_API_URL = "http://localhost:3000/stream";

export default function SectorsScreen() {
  const [sectors, setSectors] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedSector, setSelectedSector] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const [sectorForm, setSectorForm] = useState({
    name: "",
    description: "",
  });

  const token = localStorage.getItem("sicit_token");

  async function loadData() {
    try {
      const [sectorsResponse, usersResponse, transmissionsResponse] =
        await Promise.all([
          fetch(`${USERS_API_URL}/sectors`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${USERS_API_URL}/users`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${STREAM_API_URL}/stats/transmissions-by-sector`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

      const sectorsData = await sectorsResponse.json();
      const usersData = await usersResponse.json();
      const transmissionsData = await transmissionsResponse.json().catch(() => []);

      if (!sectorsResponse.ok) {
        throw new Error(sectorsData.message || "Erro ao buscar setores");
      }

      if (!usersResponse.ok) {
        throw new Error(usersData.message || "Erro ao buscar usuários");
      }

      const safeTransmissions = Array.isArray(transmissionsData)
        ? transmissionsData
        : [];

      setUsers(Array.isArray(usersData) ? usersData : []);

      const sectorsWithUsers = sectorsData.map((sectorItem) => {
        const sectorUsers = usersData.filter(
          (user) => user.sectorId === sectorItem.id
        );

        const transmissionInfo = safeTransmissions.find(
          (item) => item.sectorId === sectorItem.id
        );

        return {
          ...sectorItem,
          users: sectorUsers,
          usersCount: sectorUsers.length,
          transmissions: transmissionInfo?.transmissions || 0,
        };
      });

      setSectors(sectorsWithUsers);

      if (selectedSector) {
        const updatedSelected = sectorsWithUsers.find(
          (item) => item.id === selectedSector.id
        );

        setSelectedSector(updatedSelected || null);
      }
    } catch (error) {
      alert(error.message);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function selectSector(item) {
    setSelectedSector(item);
    setSectorForm({
      name: item.name,
      description: item.description || "",
    });
    setIsEditing(false);
  }

  async function handleCreateSector() {
    const response = await fetch(`${USERS_API_URL}/sectors`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: "Novo setor",
        description: "Descrição do novo setor",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Erro ao criar setor");
      return;
    }

    await loadData();

    setSelectedSector({
      ...data,
      users: [],
      usersCount: 0,
      transmissions: 0,
    });

    setSectorForm({
      name: data.name,
      description: data.description || "",
    });

    setIsEditing(true);
  }

  async function handleSaveSector() {
    if (!selectedSector) return;

    const response = await fetch(`${USERS_API_URL}/sectors/${selectedSector.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: sectorForm.name,
        description: sectorForm.description,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Erro ao editar setor");
      return;
    }

    setIsEditing(false);
    await loadData();

    alert("Setor atualizado com sucesso");
  }

  async function handleAddUser(userToAdd) {
    if (!selectedSector) return;

    const response = await fetch(`${USERS_API_URL}/users/${userToAdd.id}/sector`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        sectorId: selectedSector.id,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Erro ao adicionar usuário ao setor");
      return;
    }

    setIsUserModalOpen(false);
    await loadData();
  }

  async function handleRemoveUser(userId) {
    const response = await fetch(`${USERS_API_URL}/users/${userId}/sector`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        sectorId: null,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Erro ao remover usuário do setor");
      return;
    }

    await loadData();
  }

  async function handleDeleteSector() {
    if (!selectedSector) return;

    const confirmDelete = confirm("Deseja excluir este setor?");
    if (!confirmDelete) return;

    const response = await fetch(`${USERS_API_URL}/sectors/${selectedSector.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Erro ao excluir setor");
      return;
    }

    setSelectedSector(null);
    setIsEditing(false);
    await loadData();

    alert("Setor excluído com sucesso");
  }

  const usersNotInSector = selectedSector
    ? users.filter((userItem) => userItem.sectorId !== selectedSector.id)
    : [];

  return (
    <div className="sectors-page">
      <header className="sectors-header">
        <h1>Setores</h1>
        <p>Gerencie os setores e os usuários de cada setor</p>
      </header>

      <section className="sectors-layout">
        <aside className="sectors-list-panel">
          <h2>Lista de setores</h2>

          <div className="sector-search">
            <input type="text" placeholder="Buscar setor..." />
            <img src={lupa} alt="Buscar" />
          </div>

          <button
            type="button"
            className="new-sector-btn"
            onClick={handleCreateSector}
          >
            + Novo setor
          </button>

          <div className="sector-list">
            {sectors.map((item) => (
              <button
                type="button"
                key={item.id}
                className={`sector-item ${
                  selectedSector?.id === item.id ? "selected" : ""
                }`}
                onClick={() => selectSector(item)}
              >
                <img src={sector} alt="" />

                <div>
                  <strong>{item.name}</strong>
                  <span>{item.usersCount} usuários</span>
                </div>

                <b>›</b>
              </button>
            ))}
          </div>

          <Pagination />
        </aside>

        {selectedSector && (
          <>
            <section className="sector-details-panel">
              <h2>Detalhes do setor</h2>

              <div className="sector-big-icon">
                <img src={sector} alt="" />
              </div>

              <label>Nome do setor</label>
              <input
                type="text"
                value={sectorForm.name}
                readOnly={!isEditing}
                onChange={(e) =>
                  setSectorForm((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
              />

              <label>Descrição</label>
              <textarea
                value={sectorForm.description}
                readOnly={!isEditing}
                onChange={(e) =>
                  setSectorForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />

              <hr />

              <h3>Estatísticas</h3>

              <div className="sector-stats">
                <div>
                  <img src={userblack} alt="" />
                  <strong>{selectedSector.usersCount}</strong>
                  <span>Usuários</span>
                </div>

                <div>
                  <img src={live} alt="" />
                  <strong>{selectedSector.transmissions}</strong>
                  <span>Transmissões</span>
                </div>
              </div>

              <hr />

              <h3>Ações</h3>

              <div className="sector-actions">
                {!isEditing ? (
                  <button type="button" onClick={() => setIsEditing(true)}>
                    <img src={edit} alt="" />
                    Editar setor
                  </button>
                ) : (
                  <button type="button" onClick={handleSaveSector}>
                    Salvar alterações
                  </button>
                )}

                <button type="button" onClick={handleDeleteSector}>
                  <img src={trash} alt="" />
                  Excluir setor
                </button>
              </div>
            </section>

            <aside className="sector-users-panel">
              <div className="sector-users-top">
                <h2>Usuários do setor</h2>

                <button type="button" onClick={() => setIsUserModalOpen(true)}>
                  + Adicionar usuário
                </button>
              </div>

              <div className="sector-search">
                <input type="text" placeholder="Buscar usuário..." />
                <img src={lupa} alt="Buscar" />
              </div>

              <div className="sector-users-list">
                {selectedSector.users.length > 0 ? (
                  selectedSector.users.map((userItem) => (
                    <div className="sector-user-card" key={userItem.id}>
                      <div className="sector-user-avatar">
                        <img src={userblack} alt="" />
                        <span className="online"></span>
                      </div>

                      <div>
                        <strong>{userItem.name}</strong>
                        <p>{userItem.role?.name || userItem.source || "Sem cargo"}</p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveUser(userItem.id)}
                      >
                        <img src={trash} alt="Remover" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="empty-sector-users">
                    Nenhum usuário neste setor.
                  </p>
                )}
              </div>

              <Pagination />
            </aside>
          </>
        )}
      </section>

      {isUserModalOpen && selectedSector && (
        <div className="add-user-modal-overlay">
          <div className="add-user-modal">
            <div className="add-user-modal-header">
              <h2>Adicionar usuário ao setor</h2>

              <button type="button" onClick={() => setIsUserModalOpen(false)}>
                ×
              </button>
            </div>

            <div className="sector-search">
              <input type="text" placeholder="Buscar usuário..." />
              <img src={lupa} alt="Buscar" />
            </div>

            <div className="add-user-modal-list">
              {usersNotInSector.length > 0 ? (
                usersNotInSector.map((userItem) => (
                  <button
                    type="button"
                    key={userItem.id}
                    className="add-user-modal-item"
                    onClick={() => handleAddUser(userItem)}
                  >
                    <div className="sector-user-avatar">
                      <img src={userblack} alt="" />
                      <span className="online"></span>
                    </div>

                    <div>
                      <strong>{userItem.name}</strong>
                      <p>{userItem.role?.name || userItem.source || "Sem cargo"}</p>
                    </div>

                    <span>Adicionar</span>
                  </button>
                ))
              ) : (
                <p className="empty-sector-users">
                  Todos os usuários disponíveis já estão neste setor.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Pagination() {
  return (
    <div className="conversation-pagination">
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
  );
}