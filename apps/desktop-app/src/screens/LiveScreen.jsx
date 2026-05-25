import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import Peer from "peerjs";

import stop_live from "../assets/cancelar.png";
import start_live from "../assets/comecar.png";
import simbol_live from "../assets/live-streaming-red.png";
import aovivo from "../assets/aovivo.png";
import edit from "../assets/edit.png";
import send from "../assets/send.png";
import send2 from "../assets/send2.png";
import check from "../assets/checkList.png";
import userView from "../assets/userView.png";
import userblack from "../assets/user-black.png";
import mutar from "../assets/mutar.png";
import learning from "../assets/learning.png";
import GlassBox from "../components/GlassBox";
import "../assets/LiveScreen.css";

const API_URL = "http://localhost:3000";
const STREAM_SOCKET_URL = "http://localhost:3004";
const COMMUNICATION_SOCKET_URL = "http://localhost:3003";

export default function LiveScreen() {
    const [liveTitle, setLiveTitle] = useState("Live SICIT");
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [currentLive, setCurrentLive] = useState(null);
    const [watchingUsers, setWatchingUsers] = useState([]);
    const [viewerCount, setViewerCount] = useState(0);
    const [isLive, setIsLive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [typingUsers, setTypingUsers] = useState([]);
    const [isMuted, setIsMuted] = useState(false);
    const [activeChatTab, setActiveChatTab] = useState("messages");
    const [learningPaths, setLearningPaths] = useState([]);
    const [selectedPathId, setSelectedPathId] = useState("");
    const [selectedStepId, setSelectedStepId] = useState("");
    const [linkedPathId, setLinkedPathId] = useState("");
    const [linkedStepId, setLinkedStepId] = useState("");

    const typingTimeoutRef = useRef(null);
    const localVideoRef = useRef(null);
    const localStreamRef = useRef(null);
    const peerRef = useRef(null);
    const streamSocketRef = useRef(null);
    const chatSocketRef = useRef(null);

    const token = localStorage.getItem("sicit_token");
    const savedUser = localStorage.getItem("sicit_user");
    const userData = savedUser ? JSON.parse(savedUser) : null;

    const uniqueWatchingUsers = uniqueViewers(watchingUsers);

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

    function getDisplayName(value) {
        if (!value) return "Usuário";

        const name = String(value);

        if (name.includes("@")) {
            return name.split("@")[0];
        }

        return name;
    }

    function uniqueViewers(viewers) {
        const map = new Map();

        viewers.forEach((viewer) => {
            const key = viewer.userId || viewer.email || viewer.name || viewer.socketId;

            if (!map.has(key)) {
                map.set(key, viewer);
            }
        });

        return Array.from(map.values());
    }

    async function startScreenShare() {
        const sources = await window.electronAPI.getSources();

        const source =
            sources.find((item) => item.id.startsWith("screen:")) || sources[0];

        if (!source) {
            throw new Error("Nenhuma tela encontrada");
        }

        const screenStream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                mandatory: {
                    chromeMediaSource: "desktop",
                    chromeMediaSourceId: source.id,
                    maxWidth: 1920,
                    maxHeight: 1080,
                    maxFrameRate: 30,
                },
            },
        });

        let micStream = null;

        try {
            micStream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false,
            });
        } catch {
            console.warn("Microfone não autorizado. Continuando sem áudio.");
        }

        const finalStream = new MediaStream([
            ...screenStream.getVideoTracks(),
            ...(micStream ? micStream.getAudioTracks() : []),
        ]);

        localStreamRef.current = finalStream;

        if (localVideoRef.current) {
            localVideoRef.current.srcObject = finalStream;
            localVideoRef.current.muted = true;

            localVideoRef.current.onloadedmetadata = async () => {
                await localVideoRef.current.play();
            };
        }

        const [videoTrack] = screenStream.getVideoTracks();

        if (videoTrack) {
            videoTrack.onended = () => {
                finalStream.getTracks().forEach((track) => track.stop());
                handleEndLive();
            };
        }

        return finalStream;
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

    function connectHostSocket(streamId, peerId) {
        streamSocketRef.current?.disconnect();

        const socket = io(STREAM_SOCKET_URL, {
            auth: { token },
        });

        streamSocketRef.current = socket;

        socket.on("connect", () => {
            socket.emit("stream:join", {
                streamId,
                role: "host",
                peerId,
            });

            socket.emit("stream:get-state", { streamId });
        });

        socket.on("stream:viewer-joined", (data) => {
            if (!peerRef.current || !localStreamRef.current) return;

            const call = peerRef.current.call(data.viewerPeerId, localStreamRef.current);

            call.on("error", (error) => {
                console.error("Erro na call:", error.message);
            });
        });

        socket.on("stream:viewers-updated", (data) => {
            setViewerCount(data.viewerCount || 0);
            setWatchingUsers(data.viewers || []);
        });

        socket.on("stream:state", (data) => {
            setViewerCount(data.state?.viewerCount || 0);
            setWatchingUsers(data.state?.viewers || []);
        });

        socket.on("stream:error", (error) => {
            alert(error.message || "Erro na live");
        });
    }

    async function handleStartLive() {
        try {
            setLoading(true);

            const createdLive = await api("/stream/streams", {
                method: "POST",
                body: JSON.stringify({
                    title: liveTitle,
                    description: "Transmissão interna",
                    visibility: "public",
                    sectorId: userData?.sectorId || null,
                }),
            });

            const startedLive = await api(`/stream/streams/${createdLive.id}/start`, {
                method: "POST",
            });

            if (selectedPathId && selectedStepId) {
                await api(`/training/trainings/paths/${selectedPathId}/steps/${selectedStepId}/stream`, {
                    method: "PUT",
                    body: JSON.stringify({
                        streamId: startedLive.id,
                        streamTitle: startedLive.title || liveTitle
                    }),
                });
                setLinkedPathId(selectedPathId);
                setLinkedStepId(selectedStepId);
                await loadLearningPaths();
                setSelectedStepId("");
            }

            const finalStream = await startScreenShare();

            const peer = createPeer();
            peerRef.current = peer;

            peer.on("open", (peerId) => {
                connectHostSocket(startedLive.id, peerId);
            });

            peer.on("call", (call) => {
                call.answer(finalStream);
            });

            peer.on("error", (error) => {
                console.error("Erro Peer:", error);
                alert(error.message);
            });

            setCurrentLive(startedLive);
            setIsLive(true);

            if (startedLive.chatChannelId) {
                await api(`/communication/channels/${startedLive.chatChannelId}/join`, {
                    method: "POST",
                });

                await loadMessages(startedLive.chatChannelId);
                connectChatSocket(startedLive.chatChannelId);
            }


        } catch (error) {
            console.error(error);
            alert(error.message || "Erro ao iniciar live");
        } finally {
            setLoading(false);
        }
    }

    async function handleEndLive() {
        try {
            if (currentLive) {
                await api(`/stream/streams/${currentLive.id}/end`, {
                    method: "POST",
                });
            }

            if (linkedPathId && linkedStepId) {
                await api(`/training/trainings/paths/${linkedPathId}/steps/${linkedStepId}/results/generate`, {
                    method: "POST"
                });
            }

            localStreamRef.current?.getTracks().forEach((track) => track.stop());
            peerRef.current?.destroy();

            if (currentLive?.id) {
                streamSocketRef.current?.emit("stream:leave", {
                    streamId: currentLive.id,
                });
            }

            streamSocketRef.current?.disconnect();
            chatSocketRef.current?.disconnect();

            setCurrentLive(null);
            setIsLive(false);
            setIsMuted(false);
            setMessages([]);
            setWatchingUsers([]);
            setViewerCount(0);
            setTypingUsers([]);
            setActiveChatTab("messages");
            setLinkedPathId("");
            setLinkedStepId("");
            await loadLearningPaths();

            if (localVideoRef.current) {
                localVideoRef.current.srcObject = null;
            }
        } catch (error) {
            alert(error.message || "Erro ao encerrar live");
        }
    }

    function handleMute() {
        if (!localStreamRef.current) return;

        const audioTracks = localStreamRef.current.getAudioTracks();

        audioTracks.forEach((track) => {
            track.enabled = isMuted;
        });

        setIsMuted((prev) => !prev);
    }

    async function handleSend() {
        try {
            if (!message.trim()) return;

            if (!currentLive?.chatChannelId) {
                alert("Chat da live ainda não foi criado");
                return;
            }

            const sentMessage = await api(
                `/communication/channels/${currentLive.chatChannelId}/messages`,
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
                channelId: currentLive.chatChannelId,
            });
        } catch (error) {
            alert(error.message);
        }
    }

    async function loadLearningPaths() {
        try {
            const data = await api("/training/trainings/paths");
            setLearningPaths(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Erro ao carregar trilhas:", error.message);
        }
    }

    function getSelectedPath() {
        return learningPaths.find((path) => path.id === selectedPathId);
    }

    function getAvailableSteps() {
        const path = getSelectedPath();

        if (!path?.steps) return [];

        return path.steps.filter(
            (step) => step.type === "LIVE" && !step.streamId
        );
    }

    function handleTyping(value) {
        setMessage(value);

        const channelId = currentLive?.chatChannelId;

        if (!channelId) return;

        chatSocketRef.current?.emit("typing_start", {
            channelId,
        });

        clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            chatSocketRef.current?.emit("typing_stop", {
                channelId,
            });
        }, 1200);
    }

    useEffect(() => {
        loadLearningPaths();
        return () => {
            clearTimeout(typingTimeoutRef.current);
            localStreamRef.current?.getTracks().forEach((track) => track.stop());
            peerRef.current?.destroy();
            streamSocketRef.current?.disconnect();
            chatSocketRef.current?.disconnect();
        };
    }, []);

    return (
        <div className="live-page">
            <header className="live-page-header">
                <h1>Transmissão</h1>
                <p>Realize transmissões ao vivo em alta velocidade</p>
            </header>

            <section className="live-layout">
                <div className="live-left">
                    <section className="live-video-card">
                        <div className="live-video-wrapper">
                            <video
                                ref={localVideoRef}
                                autoPlay
                                muted
                                playsInline
                                className="live-video-player"
                            />

                            {!isLive && (
                                <div className="live-center-status">
                                    <img src={simbol_live} alt="" />
                                    <p>Live offline</p>
                                </div>
                            )}

                            {isLive && (
                                <img className="live-badge-img" src={aovivo} alt="Ao vivo" />
                            )}
                        </div>

                        <div className="live-controls">
                            <GlassBox>
                                <button type="button" onClick={handleEndLive} disabled={!isLive}>
                                    <img src={stop_live} alt="Encerrar live" />
                                </button>
                            </GlassBox>

                            <GlassBox>
                                <button
                                    type="button"
                                    onClick={handleStartLive}
                                    disabled={loading || isLive}
                                >
                                    <img src={start_live} alt="Iniciar live" />
                                </button>
                            </GlassBox>

                            <GlassBox>
                                <button type="button" onClick={handleMute} disabled={!isLive}>
                                    <img src={mutar} alt="Mutar" />
                                </button>
                            </GlassBox>
                        </div>

                        <footer className="live-video-footer">
                            <div className="live-title">
                                {isEditingTitle && !isLive ? (
                                    <input
                                        type="text"
                                        value={liveTitle}
                                        onChange={(e) => setLiveTitle(e.target.value)}
                                        onBlur={() => setIsEditingTitle(false)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") setIsEditingTitle(false);
                                        }}
                                        autoFocus
                                        className="live-title-input"
                                    />
                                ) : (
                                    <h2>{currentLive?.title || liveTitle || "Nome da live ou reunião"}</h2>
                                )}

                                {!isLive && (
                                    <button
                                        type="button"
                                        onClick={() => setIsEditingTitle(true)}
                                        className="live-title-edit-btn"
                                    >
                                        <img src={edit} alt="Editar" />
                                    </button>
                                )}
                            </div>

                            <div className="live-date-info">
                                <strong>Início</strong>
                                <span>
                                    {currentLive?.startedAt
                                        ? new Date(currentLive.startedAt).toLocaleString("pt-BR", {
                                            day: "2-digit",
                                            month: "2-digit",
                                            year: "numeric",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                        })
                                        : "--/--/---- --:--"}
                                </span>
                            </div>
                            <div className="live-training-link">
                                <strong>Vincular trilha</strong>

                                <select
                                    value={selectedPathId}
                                    disabled={isLive}
                                    onChange={(e) => {
                                        setSelectedPathId(e.target.value);
                                        setSelectedStepId("");
                                    }}
                                >
                                    <option value="">Sem trilha</option>

                                    {learningPaths.map((path) => (
                                        <option key={path.id} value={path.id}>
                                            {path.title}
                                        </option>
                                    ))}
                                </select>

                                <select
                                    value={selectedStepId}
                                    disabled={isLive || !selectedPathId}
                                    onChange={(e) => setSelectedStepId(e.target.value)}
                                >
                                    <option value="">Selecione a etapa</option>

                                    {getAvailableSteps().map((step) => (
                                        <option key={step.id} value={step.id}>
                                            {step.order} - {step.title}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </footer>
                    </section>

                    <section className="live-stats-bar">
                        <div className="live-stat-card">
                            <img src={userView} alt="" />
                            <div>
                                <small>Assistindo agora</small>
                                <strong>{viewerCount}</strong>
                            </div>
                        </div>

                        <div className="live-stat-card">
                            <img src={learning} alt="" />
                            <div>
                                <small>Transmitindo para</small>
                                <strong>Público</strong>
                            </div>
                        </div>

                        <div className="live-stat-card">
                            <span className="stat-clock">◷</span>
                            <div>
                                <small>Tempo de live</small>
                                <strong>00:00</strong>
                            </div>
                        </div>

                        <div className="live-stat-card">
                            <img src={send2} alt="" />
                            <div>
                                <small>Mensagens</small>
                                <strong>{messages.length}</strong>
                            </div>
                        </div>
                    </section>
                </div>

                <aside className="live-chat-area">
                    <section className="live-chat-panel">
                        <header className="live-chat-header">
                            <h2>CHAT DA LIVE</h2>

                            <div className="live-chat-tabs">
                                <button
                                    type="button"
                                    className={activeChatTab === "messages" ? "active" : ""}
                                    onClick={() => setActiveChatTab("messages")}
                                >
                                    Mensagens
                                </button>

                                <button
                                    type="button"
                                    className={activeChatTab === "online" ? "active" : ""}
                                    onClick={() => setActiveChatTab("online")}
                                >
                                    Online
                                </button>
                            </div>
                        </header>

                        {activeChatTab === "messages" && (
                            <div className="live-chat-list">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id || msg.createdAt}
                                        className="live-chat-message"
                                    >
                                        <img src={userblack} alt="Usuário" />

                                        <div className="live-chat-message-content">
                                            <div className="live-chat-message-top">
                                                <strong>
                                                    {msg.senderId === userData?.id
                                                        ? "Você"
                                                        : msg.senderName ||
                                                        msg.userName ||
                                                        msg.user ||
                                                        "Usuário"}
                                                </strong>

                                                <span>
                                                    {msg.createdAt
                                                        ? new Date(msg.createdAt).toLocaleTimeString(
                                                            "pt-BR",
                                                            {
                                                                hour: "2-digit",
                                                                minute: "2-digit",
                                                            }
                                                        )
                                                        : "agora"}
                                                </span>
                                            </div>

                                            <p>{msg.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeChatTab === "online" && (
                            <div className="live-online-list">
                                {uniqueWatchingUsers.length > 0 ? (
                                    uniqueWatchingUsers.map((viewer) => (
                                        <div
                                            className="live-online-user"
                                            key={viewer.userId || viewer.email || viewer.name || viewer.socketId}
                                        >
                                            <img src={userblack} alt="Usuário" />

                                            <div>
                                                <strong>
                                                    {getDisplayName(viewer.name || viewer.email || viewer.userId)}
                                                </strong>
                                                <p>Viewer</p>
                                            </div>

                                            <img src={check} alt="Usuário" className="checklist" />
                                        </div>
                                    ))
                                ) : (
                                    <p className="live-empty-online">Nenhum usuário online.</p>
                                )}
                            </div>
                        )}

                        {typingUsers.length > 0 && activeChatTab === "messages" && (
                            <div className="typing-indicator">
                                {typingUsers.join(", ")} digitando...
                            </div>
                        )}
                    </section>

                    <div className="live-chat-input">
                        <input
                            type="text"
                            placeholder="Digite sua mensagem"
                            value={message}
                            disabled={!isLive}
                            onChange={(e) => handleTyping(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        />

                        <button type="button" onClick={handleSend} disabled={!isLive}>
                            <img src={send} alt="Enviar" />
                        </button>
                    </div>
                </aside>
            </section>
        </div>
    );
}