import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {
  registerUserSocket,
  unregisterUserSocket
} from "./socketRegistry.js";

dotenv.config();

export function registerCommunicationSocket(
  io,
  setUserOnlineUseCase,
  setUserOfflineUseCase,
  emitUserOnline,
  emitUserOffline
) {
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;

      if (!token) {
        return next(new Error("Token não informado"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch {
      next(new Error("Token inválido"));
    }
  });

  io.on("connection", async (socket) => {
    console.log(`Socket conectado: ${socket.id}`);
    console.log("Socket user decodado:", socket.user);

    registerUserSocket(socket.user.id, socket.id);

    try {
      const presence = await setUserOnlineUseCase.execute({
        tenantId: socket.user.tenantId,
        userId: socket.user.id,
        socketId: socket.id
      });

      console.log("Presence online salva:", presence);
      emitUserOnline(presence);
    } catch (error) {
      console.error("Erro ao marcar usuário online:", error);
    }

    socket.on("join_channel", ({ channelId }) => {
      if (!channelId) return;

      socket.join(channelId);

      socket.emit("joined_channel", {
        channelId,
        userId: socket.user.id
      });
    });

    socket.on("leave_channel", ({ channelId }) => {
      if (!channelId) return;

      socket.leave(channelId);

      socket.emit("left_channel", {
        channelId,
        userId: socket.user.id
      });
    });

    socket.on("typing_start", ({ channelId }) => {
      if (!channelId) return;

      socket.to(channelId).emit("user_typing", {
        channelId,
        userId: socket.user.id,
        name: socket.user.name || socket.user.email
      });
    });

    socket.on("typing_stop", ({ channelId }) => {
      if (!channelId) return;

      socket.to(channelId).emit("user_stop_typing", {
        channelId,
        userId: socket.user.id,
        name: socket.user.name || socket.user.email
      });
    });

    socket.on("disconnect", async () => {
      console.log(`Socket desconectado: ${socket.id}`);

      unregisterUserSocket(socket.user.id, socket.id);

      try {
        const presence = await setUserOfflineUseCase.execute({
          tenantId: socket.user.tenantId,
          userId: socket.user.id
        });

        console.log("Presence offline salva:", presence);

        if (presence) {
          emitUserOffline(presence);
        }
      } catch (error) {
        console.error("Erro ao marcar usuário offline:", error);
      }
    });
  });
}