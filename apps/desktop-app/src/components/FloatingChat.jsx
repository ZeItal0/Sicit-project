import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import "../assets/FloatingChat.css";

import userblue from "../assets/user-blue.png";
import send from "../assets/send.png";
import lupa from "../assets/lupa.png";
import messagens from "../assets/message.png";

const API_URL = "http://localhost:3000";
const COMMUNICATION_SOCKET_URL = "http://localhost:3003";

export default function FloatingChat({ communicationSocket }) {
    const [isListOpen, setIsListOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [currentChannelId, setCurrentChannelId] = useState(null);
    const [typingUsers, setTypingUsers] = useState([]);
    const selectedUserUpdated = users.find((user) => user.id === selectedUser?.id) || selectedUser;

    const socketRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const token = localStorage.getItem("sicit_token");
    const savedUser = localStorage.getItem("sicit_user");
    const currentUser = savedUser ? JSON.parse(savedUser) : null;

    async function api(path, options = {}) {
        const response = await fetch(`${API_URL}${path}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                ...(options.headers || {})
            }
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            throw new Error(data?.message || "Erro na requisição");
        }

        return data;
    }

    function getDisplayName(user) {
        const value = user?.name || user?.email || "Usuário";
        return String(value).includes("@") ? String(value).split("@")[0] : value;
    }

    async function loadUsers() {
        try {
            const data = await api("/users/users");

            const filtered = Array.isArray(data)
                ? data.filter((user) => user.id !== currentUser?.id)
                : [];

            await loadUsersPresence(filtered);
        } catch (error) {
            console.error(error.message);
        }
    }

    async function loadMessages(channelId) {
        const data = await api(`/communication/channels/${channelId}/messages`);
        setMessages(Array.isArray(data) ? data : []);
    }

    function connectSocket(channelId) {
        socketRef.current?.disconnect();

        const socket = io(COMMUNICATION_SOCKET_URL, {
            auth: { token }
        });

        socketRef.current = socket;

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
                        createdAt: notification.createdAt
                    }
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

    async function handleOpenUser(user) {
        try {
            setSelectedUser(user);
            setMessages([]);
            setTypingUsers([]);

            const channel = await api("/communication/direct-channels", {
                method: "POST",
                body: JSON.stringify({
                    targetUserId: user.id
                })
            });

            const channelId = channel.id || channel.channelId;

            setCurrentChannelId(channelId);

            await api(`/communication/channels/${channelId}/join`, {
                method: "POST"
            });

            await loadMessages(channelId);
            connectSocket(channelId);
        } catch (error) {
            alert(error.message);
        }
    }

    async function loadUsersPresence(usersList) {
        const usersWithPresence = await Promise.all(
            usersList.map(async (user) => {
                try {
                    const presence = await api(`/communication/presence/${user.id}`);

                    return {
                        ...user,
                        isOnline: presence?.status === "ONLINE" || presence?.isOnline === true
                    };
                } catch {
                    return {
                        ...user,
                        isOnline: false
                    };
                }
            })
        );

        setUsers(usersWithPresence);
    }

    async function handleSend() {
        try {
            if (!message.trim()) return;
            if (!currentChannelId) return;

            const sentMessage = await api(
                `/communication/channels/${currentChannelId}/messages`,
                {
                    method: "POST",
                    body: JSON.stringify({
                        content: message,
                        senderName: currentUser?.name || currentUser?.email
                    })
                }
            );

            setMessages((prev) => {
                const exists = prev.some((msg) => msg.id === sentMessage.id);
                if (exists) return prev;
                return [...prev, sentMessage];
            });

            setMessage("");

            socketRef.current?.emit("typing_stop", {
                channelId: currentChannelId
            });
        } catch (error) {
            alert(error.message);
        }
    }

    function handleTyping(value) {
        setMessage(value);

        if (!currentChannelId) return;

        socketRef.current?.emit("typing_start", {
            channelId: currentChannelId
        });

        clearTimeout(typingTimeoutRef.current);

        typingTimeoutRef.current = setTimeout(() => {
            socketRef.current?.emit("typing_stop", {
                channelId: currentChannelId
            });
        }, 1200);
    }

    function closeChatWindow() {
        if (currentChannelId) {
            socketRef.current?.emit("leave_channel", {
                channelId: currentChannelId
            });
        }

        clearTimeout(typingTimeoutRef.current);
        socketRef.current?.emit("leave_channel", {
            channelId: currentChannelId
        });

        setSelectedUser(null);
        setCurrentChannelId(null);
        setMessages([]);
        setTypingUsers([]);
    }

    useEffect(() => {
        loadUsers();
        if (!communicationSocket) return;

        communicationSocket.on("user_online", (presence) => {
            setUsers((prev) =>
                prev.map((user) =>
                    user.id === presence.userId
                        ? { ...user, isOnline: true }
                        : user
                )
            );
        });

        communicationSocket.on("user_offline", (presence) => {
            setUsers((prev) =>
                prev.map((user) =>
                    user.id === presence.userId
                        ? { ...user, isOnline: false }
                        : user
                )
            );
        });

        return () => {
            communicationSocket.off("user_online");
            communicationSocket.off("user_offline");
        };
    }, [communicationSocket]);

    const filteredUsers = users.filter((user) => {
        const term = search.toLowerCase();
        const name = String(user.name || "").toLowerCase();
        const email = String(user.email || "").toLowerCase();

        return name.includes(term) || email.includes(term);
    });

    return (
        <>
            <button
                type="button"
                className="floating-chat-button"
                onClick={() => setIsListOpen((prev) => !prev)}
            >
                <img src={messagens} alt="message" className="messagens" />
            </button>

            {isListOpen && (
                <section className="floating-chat-list">
                    <div className="floating-chat-list-arrow" />

                    <header className="floating-chat-list-header">
                        <h2>Conversas</h2>

                        <button type="button" onClick={() => setIsListOpen(false)}>
                            ×
                        </button>
                    </header>

                    <div className="floating-chat-search">
                        <input
                            type="text"
                            placeholder="Buscar usuário..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <img src={lupa} alt="" />
                    </div>

                    <div className="floating-chat-users">
                        {filteredUsers.map((user) => (
                            <button
                                type="button"
                                key={user.id}
                                className="floating-chat-user"
                                onClick={() => handleOpenUser(user)}
                            >
                                <div className="floating-chat-avatar">
                                    <img src={userblue} alt="" />
                                    <span className={user.isOnline ? "online" : "offline"} />
                                </div>

                                <div>
                                    <strong>{getDisplayName(user)}</strong>
                                    <p>{user.email}</p>
                                </div>

                                <div className="floating-chat-user-info">
                                    <small>{user.isOnline ? "Online" : "Offline"}</small>
                                </div>
                            </button>
                        ))}
                    </div>
                </section>
            )}

            {selectedUser && (
                <section className="floating-chat-window">
                    <header className="floating-chat-window-header">
                        <div>
                            <img src={userblue} alt="" />
                            <div>
                                <strong>{getDisplayName(selectedUser)}</strong>
                                <p>{selectedUser.isOnline ? "Online" : "Offline"}</p>
                            </div>
                        </div>

                        <button type="button" onClick={closeChatWindow}>
                            ×
                        </button>
                    </header>

                    <div className="floating-chat-messages">
                        {messages.map((msg) => {
                            const fromMe = msg.senderId === currentUser?.id;

                            return (
                                <div
                                    key={msg.id || msg.createdAt}
                                    className={`floating-message ${fromMe ? "mine" : "other"}`}
                                >
                                    {!fromMe && <img src={userblue} alt="" />}

                                    <div>
                                        {!fromMe && (
                                            <strong>
                                                {msg.senderName || selectedUser.name || "Usuário"}
                                            </strong>
                                        )}
                                        <p>{msg.content || msg.text}</p>
                                        <span>
                                            {msg.createdAt
                                                ? new Date(msg.createdAt).toLocaleTimeString("pt-BR", {
                                                    hour: "2-digit",
                                                    minute: "2-digit"
                                                })
                                                : msg.time || "agora"}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {typingUsers.length > 0 && (
                        <div className="floating-typing-indicator">
                            {typingUsers.join(", ")} digitando...
                        </div>
                    )}

                    <div className="floating-chat-input">
                        <input
                            type="text"
                            placeholder="Digite uma mensagem"
                            value={message}
                            onChange={(e) => handleTyping(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        />

                        <button type="button" onClick={handleSend}>
                            <img src={send} alt="Enviar" />
                        </button>
                    </div>
                </section>
            )}
        </>
    );
}