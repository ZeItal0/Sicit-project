import { useEffect, useRef, useState } from "react";
import {
  GraduationCap,
  BookOpen,
  Play,
  Award,
  Video,
  Users,
  Medal,
} from "lucide-react";
import { io } from "socket.io-client";
import Peer from "peerjs";

import aovivo from "../assets/aovivo.png";
import userblack from "../assets/user-black.png";
import userblue from "../assets/user-blue.png";
import eye from "../assets/eyeblack.png";
import send from "../assets/send.png";
import arrow from "../assets/arrow.png";
import calendar from "../assets/calendar.png";
import "../assets/WatchLiveScreen.css";

const API_URL = "http://localhost:3000";
const STREAM_SOCKET_URL = "http://localhost:3004";
const COMMUNICATION_SOCKET_URL = "http://localhost:3003";
const trailIcons = {
  GraduationCap,
  BookOpen,
  Play,
  Award,
  Video,
  Users,
  Medal,
};

export default function WatchLiveScreen({ live, onBack }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [viewerCount, setViewerCount] = useState(0);
  const [connected, setConnected] = useState(false);
  const [chatChannelId, setChatChannelId] = useState(live?.chatChannelId || null);
  const [typingUsers, setTypingUsers] = useState([]);

  const [linkedPath, setLinkedPath] = useState(null);
  const [linkedStep, setLinkedStep] = useState(null);

  const [stepResults, setStepResults] = useState([]);

  const typingTimeoutRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerRef = useRef(null);
  const streamSocketRef = useRef(null);
  const chatSocketRef = useRef(null);

  const token = localStorage.getItem("sicit_token");
  const savedUser = localStorage.getItem("sicit_user");
  const userData = savedUser ? JSON.parse(savedUser) : null;

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

  function createPeer() {
    return new Peer(undefined, {
      host: "localhost",
      port: 9000,
      path: "/",
      config: {
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      },
    });
  }

  async function loadMessages(channelId) {
    const data = await api(`/communication/channels/${channelId}/messages`);
    setMessages(Array.isArray(data) ? data : []);
  }

  function connectChatSocket(channelId) {
    chatSocketRef.current?.disconnect();

    const socket = io(COMMUNICATION_SOCKET_URL, {
      auth: { token },
    });

    chatSocketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_channel", { channelId });
    });

    socket.on("message_created", (newMessage) => {
      if (newMessage.channelId !== channelId) return;

      setMessages((prev) => {
        const exists = prev.some((msg) => msg.id === newMessage.id);
        if (exists) return prev;
        return [...prev, newMessage];
      });
    });

    socket.on("new_notification", (notification) => {
      if (notification.channelId !== channelId) return;

      setMessages((prev) => {
        const exists = prev.some((msg) => msg.id === notification.messageId);
        if (exists) return prev;

        return [
          ...prev,
          {
            id: notification.messageId,
            channelId: notification.channelId,
            senderId: notification.senderId,
            senderName: notification.senderName,
            content: notification.content,
            createdAt: notification.createdAt,
          },
        ];
      });
    });

    socket.on("user_typing", ({ name }) => {
      const userName = name || "Usuário";

      setTypingUsers((prev) => {
        if (prev.includes(userName)) return prev;
        return [...prev, userName];
      });
    });

    socket.on("user_stop_typing", ({ name }) => {
      const userName = name || "Usuário";
      setTypingUsers((prev) => prev.filter((item) => item !== userName));
    });
  }

  async function loadMyStepResults(pathId) {
    try {
      const data = await api(`/training/trainings/paths/${pathId}/me/step-results`);
      setStepResults(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error.message);
    }
  }

  async function loadLinkedLearningPath() {
    try {
      const paths = await api("/training/trainings/paths");

      const foundPath = paths.find((path) =>
        path.steps?.some((step) => step.streamId === live?.id)
      );

      if (!foundPath) {
        setLinkedPath(null);
        setLinkedStep(null);
        return;
      }

      const foundStep = foundPath.steps.find(
        (step) => step.streamId === live?.id
      );

      setLinkedPath(foundPath);
      setLinkedStep(foundStep);
      await loadMyStepResults(foundPath.id);
    } catch (error) {
      console.error(error.message);
    }
  }

  async function connectToLive() {
    if (!live?.id) return;

    try {
      const joined = await api(`/stream/streams/${live.id}/join`, {
        method: "POST",
      });

      const resolvedChatChannelId = live.chatChannelId || joined.chatChannelId;
      setChatChannelId(resolvedChatChannelId);

      if (resolvedChatChannelId) {
        await api(`/communication/channels/${resolvedChatChannelId}/join`, {
          method: "POST",
        });

        await loadMessages(resolvedChatChannelId);
        connectChatSocket(resolvedChatChannelId);
      }

      const peer = createPeer();
      peerRef.current = peer;

      peer.on("open", (peerId) => {
        const socket = io(STREAM_SOCKET_URL, {
          auth: { token },
        });

        streamSocketRef.current = socket;

        socket.on("connect", () => {
          socket.emit("stream:join", {
            streamId: live.id,
            role: "viewer",
            peerId,
          });

          socket.emit("stream:get-state", {
            streamId: live.id,
          });

          setConnected(true);
        });

        socket.on("stream:viewers-updated", (data) => {
          setViewerCount(data.viewerCount || 0);
        });

        socket.on("stream:state", (data) => {
          setViewerCount(data.state?.viewerCount || 0);
        });

        socket.on("stream:error", (error) => {
          alert(error.message || "Erro ao assistir live");
        });
      });

      peer.on("call", (call) => {
        call.answer();

        call.on("stream", async (remoteStream) => {
          if (!remoteVideoRef.current) return;

          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.muted = true;

          try {
            await remoteVideoRef.current.play();
          } catch (error) {
            console.error("Autoplay bloqueado:", error.message);
          }
        });
      });

      peer.on("error", (error) => {
        console.error("Erro PeerJS:", error);
        alert(error.message);
      });
    } catch (error) {
      alert(error.message);
    }
  }

  async function handleSend() {
    try {
      if (!message.trim()) return;

      const resolvedChatChannelId = chatChannelId || live?.chatChannelId;

      if (!resolvedChatChannelId) {
        alert("Chat da live não encontrado");
        return;
      }

      const sentMessage = await api(
        `/communication/channels/${resolvedChatChannelId}/messages`,
        {
          method: "POST",
          body: JSON.stringify({
            content: message,
            senderName: userData?.name || userData?.email,
          }),
        }
      );

      setMessages((prev) => {
        const exists = prev.some((msg) => msg.id === sentMessage.id);
        if (exists) return prev;
        return [...prev, sentMessage];
      });

      setMessage("");

      chatSocketRef.current?.emit("typing_stop", {
        channelId: resolvedChatChannelId,
      });
    } catch (error) {
      alert(error.message);
    }
  }

  function handleTyping(value) {
    setMessage(value);

    const resolvedChatChannelId = chatChannelId || live?.chatChannelId;

    if (!resolvedChatChannelId) return;

    chatSocketRef.current?.emit("typing_start", {
      channelId: resolvedChatChannelId,
    });

    clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      chatSocketRef.current?.emit("typing_stop", {
        channelId: resolvedChatChannelId,
      });
    }, 1200);
  }

  function handleLeave() {
    if (live?.id && streamSocketRef.current?.connected) {
      streamSocketRef.current.emit("stream:leave", {
        streamId: live.id,
      });
    }

    clearTimeout(typingTimeoutRef.current);

    peerRef.current?.destroy();
    chatSocketRef.current?.disconnect();

    setTimeout(() => {
      streamSocketRef.current?.disconnect();
      onBack?.();
    }, 200);
  }

  useEffect(() => {
    loadLinkedLearningPath();
    connectToLive();
    return () => {
      if (live?.id) {
        streamSocketRef.current?.emit("stream:leave", {
          streamId: live.id,
        });
      }

      clearTimeout(typingTimeoutRef.current);
      peerRef.current?.destroy();
      streamSocketRef.current?.disconnect();
      chatSocketRef.current?.disconnect();
    };
  }, [live?.id]);
  const pathColor = linkedPath?.color || "#D7C900";

  const completedSteps = linkedPath?.steps?.filter((step) =>
    stepResults.some(
      (result) => result.stepId === step.id && result.approved === true
    )
  ).length || 0;

  const totalSteps = linkedPath?.steps?.length || 0;

  const progressPercent =
    totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  const PathIcon =
    trailIcons[linkedPath?.icon] ??
    GraduationCap;
  return (
    <div className="watch-live-page">
      <section className="watch-main">
        <div className="watch-top">
          <button type="button" className="watch-back" onClick={handleLeave}>
            <img src={arrow} alt="" className="arrow" />
            Voltar
          </button>

          <header className="watch-header">
            <h1>{live?.title || "Nome da live ou reunião"}</h1>

            <div className="watch-meta">
              <span>
                <img src={userblack} alt="" />
                {live?.hostName || live?.hostId || "Administrador"}
              </span>

              <span>
                <img src={eye} alt="" />
                Assistindo {viewerCount}
              </span>
            </div>
          </header>
        </div>

        <section className="watch-video">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            muted
            controls
            className="watch-video-player"
          />

          {!connected && <p>Conectando na transmissão...</p>}

          <img src={aovivo} alt="Ao vivo" />
        </section>

        <section className="watch-about">
          <div className="watch-about-left">
            <h2>Sobre a transmissão</h2>
            <p>
              Acompanhe esta transmissão ao vivo. Participe, interaja e fique por
              dentro de tudo!
            </p>
          </div>

          <div className="watch-about-info">
            <div>
              <strong>
                <img src={calendar} alt="" className="calendar" />
                Início
              </strong>

              <span>
                {live?.startedAt
                  ? new Date(live.startedAt).toLocaleString("pt-BR")
                  : "Ao vivo"}
              </span>
            </div>
          </div>
        </section>

        <section
          className="watch-learning-path"
          style={{ borderColor: pathColor }}
        >
          <div className="watch-learning-path-top">
            <div className="watch-learning-icon" style={{ backgroundColor: pathColor }}>
              <PathIcon size={26} color="white" strokeWidth={2.4} />
            </div>

            <div>
              <h2>{linkedPath?.title || "Trilha de treinamento"}</h2>
              <p>
                {linkedPath?.description ||
                  "Esta transmissão faz parte de uma trilha de treinamento"}
              </p>
            </div>
          </div>

          <div className="watch-learning-progress">
            <div className="watch-learning-progress-header">
              <span>
                Etapa {linkedStep?.order || 1}
              </span>
              <span>
                {completedSteps}/{totalSteps} etapas concluídas • {progressPercent}%
              </span>
            </div>

            <div className="watch-learning-progress-bar">
              <div
                className="watch-learning-progress-fill"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: pathColor,
                }}
              />
            </div>
          </div>

          <div className="watch-learning-steps">
            {linkedPath?.steps?.map((step) => {
              const isCompleted = stepResults.some(
                (result) => result.stepId === step.id && result.approved === true
              );

              const isCurrent = step.id === linkedStep?.id;

              return (
                <div
                  key={step.id}
                  className={`watch-learning-step ${isCurrent ? "active" : ""}`}
                >
                  <div
                    style={{backgroundColor: isCompleted || isCurrent ? pathColor : "#9a9a9a",
                    }}
                  >
                    {
                      step.type === "CERTIFICATE"?
                        <Medal size={15} color="white" strokeWidth={2.5}/>
                        :
                        <PathIcon size={14} color="white" strokeWidth={2.6}/>
                    }
                  </div>

                  <span>{step.order}</span>

                  <small>
                    {isCompleted ? "Concluído" : isCurrent ? "Em andamento" : "Pendente"}
                  </small>
                </div>
              );
            })}
          </div>
        </section>
      </section>

      <aside className="watch-chat">
        <h2>Chat ao vivo</h2>

        <div className="watch-chat-list">
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id || msg.createdAt}
              message={msg}
              currentUserId={userData?.id}
            />
          ))}
        </div>

        {typingUsers.length > 0 && (
          <div className="typing-indicator">
            {typingUsers.join(", ")} digitando...
          </div>
        )}

        <div className="watch-chat-input">
          <input
            type="text"
            placeholder="Digite sua mensagem"
            value={message}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />

          <button type="button" onClick={handleSend}>
            <img src={send} alt="Enviar" />
          </button>
        </div>
      </aside>
    </div>
  );
}

function ChatMessage({ message, currentUserId }) {
  const isMe = message.senderId === currentUserId;

  return (
    <div className="watch-chat-message">
      <img src={userblue} alt="" />

      <div className="watch-chat-message-content">
        <div className="watch-chat-message-top">
          <strong>
            {isMe
              ? "Você"
              : message.senderName ||
              message.userName ||
              message.user ||
              "Usuário"}
          </strong>

          <span>
            {message.createdAt
              ? new Date(message.createdAt).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })
              : message.time || "agora"}
          </span>
        </div>

        <p>{message.content || message.text}</p>
      </div>
    </div>
  );
}