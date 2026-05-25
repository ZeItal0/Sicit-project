import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

import notification from "../assets/notification.png";
import minimize from "../assets/minus.png";
import closed from "../assets/closed.png";

const API_URL = "http://localhost:3000";
const SOCKET_URL = "http://localhost:3003";

export default function TopActions() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const socketRef = useRef(null);
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

  async function loadNotifications() {
    const data = await api("/communication/notifications");
    setNotifications(Array.isArray(data) ? data : []);
  }

  async function loadUnreadCount() {
    const data = await api("/communication/notifications/unread-count");
    setUnreadCount(data?.unreadCount || 0);
  }

  async function markAsRead(notificationId) {
    await api(`/communication/notifications/${notificationId}/read`, {
      method: "PATCH",
    });

    await loadNotifications();
    await loadUnreadCount();
  }

  useEffect(() => {
    if (!token) return;

    loadNotifications();
    loadUnreadCount();

    socketRef.current = io(SOCKET_URL, {
      auth: { token },
    });

    socketRef.current.on("new_notification", (newNotification) => {
      setNotifications((prev) => [newNotification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [token]);

  return (
    <div className="top-actions">
      <div className="notification-wrapper">
        <button
          type="button"
          className="top-icon-btn"
          onClick={() => setOpen((prev) => !prev)}
        >
          <img src={notification} alt="notification" className="notification" />

          {unreadCount > 0 && (
            <span className="notification-badge">{unreadCount}</span>
          )}
        </button>

        {open && (
          <div className="notification-dropdown">
            <header>
              <strong>Notificações</strong>
              <small>{unreadCount} não lidas</small>
            </header>

            <div className="notification-list">
              {notifications.length === 0 && (
                <p className="notification-empty">Nenhuma notificação.</p>
              )}

              {notifications.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  className={`notification-item ${item.isRead ? "read" : "unread"}`}
                  onClick={() => markAsRead(item.id)}
                >
                  <strong>{formatNotificationType(item.type)}</strong>
                  <p>{item.content || "Nova atualização no sistema"}</p>
                  <small>{formatDate(item.createdAt)}</small>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="window-actions">
        <button
          type="button"
          className="window-btn"
          onClick={() => window.electronAPI?.minimize?.()}
        >
          <img src={minimize} alt="minimize" className="minimize" />
        </button>

        <button
          type="button"
          className="window-btn"
          onClick={() => window.electronAPI?.close?.()}
        >
          <img src={closed} alt="closed" className="closed" />
        </button>
      </div>
    </div>
  );
}

function formatNotificationType(type) {
  const types = {
    NEW_MESSAGE: "Nova mensagem",
    LIVE_STARTED: "Live iniciada",
    CERTIFICATE_AVAILABLE: "Certificado disponível",
    LEARNING_PATH_ASSIGNED: "Nova trilha",
  };

  return types[type] || type || "Notificação";
}

function formatDate(date) {
  if (!date) return "Agora";

  return new Date(date).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}