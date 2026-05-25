import { useState } from "react";

import "../assets/home.css";
import "../assets/AppLayout.css";
import "../assets/TopActions.css";
import "../assets/UserInfo.css";

import FloatingChat from "./FloatingChat";
import TopActions from "./TopActions";
import SideMenu from "./SideMenu";
import UserInfo from "./UserInfo";

import logo from "../assets/logoG.png";
import logotop from "../assets/LogoTop.png";

export default function AppLayout({
  children,
  userName = "Nome do Usuario",
  userRole = "Sem nível",
  onNavigate,
  onLogout,
  communicationSocket,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [topOptions, setTopOptions] = useState([]);
  const [topOptionsState, setTopOptionsState] = useState("hidden");
  const [activeTopOption, setActiveTopOption] = useState(null);

  function handleChangeTopOptions(options) {
    if (topOptions.length > 0) {
      setTopOptionsState("leaving");

      setTimeout(() => {
        setTopOptions(options);
        setTopOptionsState("entering");
      }, 260);

      return;
    }

    setTopOptions(options);
    setTopOptionsState("entering");
  }

  function handleSubOptionClick(page) {
    setActiveTopOption(page);
    onNavigate(page);
  }

  return (
    <main className="home-screen">
      <div className="sidebar-area">
        <SideMenu
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          role={userRole}
          setTopOptions={handleChangeTopOptions}
          activeTopOption={activeTopOption}
          setActiveTopOption={setActiveTopOption}
          onNavigate={onNavigate}
          onLogout={onLogout}
        />
      </div>

      <img className="logo-top" src={logotop} alt="SICIT" />

      {topOptions.length > 0 && (
        <div className={`top-sub-options ${topOptionsState}`}>
          {topOptions.map((option, index) => (
            <button
              key={option.page}
              type="button"
              className={`top-sub-btn ${
                activeTopOption === option.page ? "active" : ""
              }`}
              style={{ "--delay": `${index * 70}ms` }}
              onClick={() => handleSubOptionClick(option.page)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      <TopActions />
      <UserInfo name={userName} role={userRole} />

      <img className="center-logo" src={logo} alt="" />

      <section className="page-content">{children}</section>

      <FloatingChat communicationSocket={communicationSocket} />
    </main>
  );
}