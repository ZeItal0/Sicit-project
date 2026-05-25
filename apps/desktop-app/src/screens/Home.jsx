import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

import AppLayout from "../components/AppLayout";
import LiveScreen from "./LiveScreen";
import LivesListScreen from "./LivesListScreen";
import WatchLiveScreen from "./WatchLiveScreen";
import ActiveUsersScreen from "./ActiveUsersScreen";
import ConversationsScreen from "./ConversationsScreen";
import SectorsScreen from "./SectorsScreen";
import CreateTrailScreen from "./CreateTrailScreen";
import MyTrailsScreen from "./MyTrailsScreen";
import DashboardScreen from "./DashboardScreen";
import PublishedTrailsScreen from "./PublishedTrailsScreen";
import MicroservicesTopologyScreen from "./MicroservicesTopologyScreen";
import AuditScreen from "./AuditScreen";
import LiveLibraryScreen from "./LiveLibraryScreen";
import LiveDetailsScreen from "./LiveDetailsScreen";

const COMMUNICATION_SOCKET_URL = "http://localhost:3003";

export default function Home({ onLogout }) {
  const [page, setPage] = useState("home");
  const [selectedLive, setSelectedLive] = useState(null);
  const [communicationSocket, setCommunicationSocket] = useState(null);
  const [selectedLibraryLive, setSelectedLibraryLive] = useState(null);

  const socketRef = useRef(null);

  const savedUser = localStorage.getItem("sicit_user");
  const userData = savedUser ? JSON.parse(savedUser) : null;
  const token = localStorage.getItem("sicit_token");

  function handleOpenLive(live) {
    setSelectedLive(live);
    setPage("watch-live");
  }

  function handleOpenLiveDetails(live) {
    setSelectedLibraryLive(live);
    setPage("live-details");
  }

  function handleLogout() {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setCommunicationSocket(null);

    onLogout();
  }

  useEffect(() => {
    if (!token) {
      handleLogout();
      return;
    }

    const socket = io(COMMUNICATION_SOCKET_URL, {
      auth: { token },
    });

    socketRef.current = socket;
    setCommunicationSocket(socket);

    socket.on("connect", () => {
      console.log("Presence socket conectado:", socket.id);
    });

    socket.on("connect_error", (error) => {
      console.error("Erro no presence socket:", error.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setCommunicationSocket(null);
    };
  }, [token]);

  return (
    <AppLayout
      userName={userData?.name || userData?.email || "Nome do Usuario"}
      userRole={userData?.role || "Sem nível"}
      onNavigate={setPage}
      onLogout={handleLogout}
      communicationSocket={communicationSocket}
    >
      {page === "live" && <LiveScreen />}

      {page === "lives-list" && (
        <LivesListScreen onOpenLive={handleOpenLive} />
      )}

      {page === "watch-live" && (
        <WatchLiveScreen
          live={selectedLive}
          onBack={() => setPage("lives-list")}
        />
      )}

      {page === "dashboard" && <DashboardScreen />}
      {page === "conversations" && <ConversationsScreen />}
      {page === "active-users" && <ActiveUsersScreen />}
      {page === "sectors" && <SectorsScreen />}

      {page === "trails" && <CreateTrailScreen />}
      {page === "My-trails" && <MyTrailsScreen />}
      {page === "published-trails" && <PublishedTrailsScreen />}

      {page === "microservices" && <MicroservicesTopologyScreen />}

      {page === "audit" && <AuditScreen />}

      {page === "live-library" && (
        <LiveLibraryScreen onOpenLiveDetails={handleOpenLiveDetails} />
      )}
      {page === "live-details" && (
        <LiveDetailsScreen
          live={selectedLibraryLive}
          onBack={() => setPage("live-library")}
        />
      )}


    </AppLayout>
  );
}