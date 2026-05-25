import { useState } from "react";
import "../assets/sideMenu.css";

import menu from "../assets/menu.png";
import learning from "../assets/learning.png";
import pie from "../assets/pie.png";
import log from "../assets/log.png";
import live from "../assets/live.png";
import warning from "../assets/warning.png";
import conection from "../assets/conection.png";
import logout from "../assets/exit.png";

export default function SideMenu({
  menuOpen,
  setMenuOpen,
  role,
  setTopOptions,
  setActiveTopOption,
  onNavigate,
  onLogout,
}) {
  const [active, setActive] = useState(null);

  const isAdmin = role === "TENANT_ADMIN" || role === "ADMIN";

  const menuItems = [
    {
      key: "live",
      icon: live,
      alt: "Lives",
      options: [
        { label: "Iniciar Transmissão", page: "live" },
        { label: "Transmissões agora", page: "lives-list" },
        { label: "Biblioteca de Treinamentos", page: "live-library" },
      ],
    },
    {
      key: "sectors",
      icon: pie,
      alt: "Setores",
      options: [
        { label: "Setores", page: "sectors" },
        { label: "Usuários ativos", page: "active-users" },
        { label: "Dashboard", page: "dashboard" },
      ],
    },
    {
      key: "Criar trilhas",
      icon: learning,
      alt: "trails",
      options: [
        { label: "Criar trilhas", page: "trails" },
        { label: "Minhas trilhas", page: "My-trails" },
        { label: "Trilhas publicadas", page: "published-trails" },
      ],
    },
    {
      key: "conection",
      icon: conection,
      alt: "Microservices",
      admin: true,
      options: [
        { label: "Microservices", page: "microservices" },
      ],
    },
    {
      key: "Auditoria",
      icon: log,
      alt: "audit",
      admin: true,
      options: [
        { label: "Auditoria", page: "audit" },
      ],
    },
  ];

  const visibleItems = menuItems.filter((item) => !item.admin || isAdmin);

  function handleToggleMenu() {
    setMenuOpen(!menuOpen);
  }

  function handleMenuClick(item) {
    const firstOption = item.options?.[0];

    setActive(item.key);
    setTopOptions(item.options || []);

    if (firstOption) {
      setActiveTopOption(firstOption.page);
      onNavigate(firstOption.page);
    }
  }

  function handleLogout() {
    setTopOptions([]);
    setActiveTopOption(null);
    setActive(null);

    if (onLogout) {
      onLogout();
    }
  }

  return (
    <aside className="side-icons">
      <button
        type="button"
        className={`side-btn ${menuOpen ? "active" : ""}`}
        onClick={handleToggleMenu}
      >
        <img src={menu} alt="Menu" />
      </button>

      <div className={`side-menu-items ${menuOpen ? "open" : "closing"}`}>
        {visibleItems.map((item, index) => (
          <button
            key={item.key}
            type="button"
            className={`side-btn ${active === item.key ? "active" : ""}`}
            style={{
              "--delay": menuOpen
                ? `${index * 60}ms`
                : `${(visibleItems.length - 1 - index) * 45}ms`,
            }}
            onClick={() => handleMenuClick(item)}
          >
            <img src={item.icon} alt={item.alt} />
          </button>
        ))}
      </div>

      <button type="button" className="side-btn logout-side" onClick={handleLogout}>
        <img src={logout} alt="Sair" />
      </button>
    </aside>
  );
}