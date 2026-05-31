import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { AuditServiceClient } from "../../infrastructure/services/AuditServiceClient.js";
import { RegisterAuditEventUseCase } from "../../application/use-cases/RegisterAuditEventUseCase.js";

import {
  ensureStreamRoom,
  setHost,
  getHost,
  addViewer,
  removeViewer,
  removeSocketFromAllStreams,
  getStreamState
} from "./streamRegistry.js";

dotenv.config();

const auditServiceClient = new AuditServiceClient();
const registerAuditEventUseCase = new RegisterAuditEventUseCase(auditServiceClient);

function emitViewersUpdated(io, streamId) {
  const state = getStreamState(streamId);

  io.to(streamId).emit("stream:viewers-updated", {
    streamId,
    viewerCount: state.viewerCount,
    viewers: state.viewers
  });
}

export function registerStreamSocket(io, streamPresenceRepository) {
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

  io.on("connection", (socket) => {
    console.log(`Stream socket conectado: ${socket.id}`);

    socket.on("stream:join", ({ streamId, role, peerId }) => {
      if (!streamId || !role || !peerId) {
        return socket.emit("stream:error", {
          message: "streamId, role e peerId são obrigatórios"
        });
      }

      socket.data.streamId = streamId;
      socket.data.role = role;
      socket.data.peerId = peerId;

      socket.join(streamId);
      ensureStreamRoom(streamId);

      if (role === "host") {
        setHost(streamId, {
          userId: socket.user.id,
          name: socket.user.name,
          email: socket.user.email,
          socketId: socket.id,
          peerId
        });

        socket.emit("stream:joined", { streamId, role, peerId });

        io.to(streamId).emit("stream:host-ready", {
          streamId,
          hostUserId: socket.user.id,
          hostName: socket.user.name,
          hostEmail: socket.user.email,
          hostPeerId: peerId
        });

        emitViewersUpdated(io, streamId);
        return;
      }

      if (role === "viewer") {
        addViewer(streamId, socket.id, {
          userId: socket.user.id,
          name: socket.user.name,
          email: socket.user.email,
          peerId
        });

        registerAuditEventUseCase.execute({
          token: socket.handshake.auth?.token,
          action: "VIEWER_JOINED",
          resourceType: "STREAM",
          resourceId: streamId,
          metadata: {
            userId: socket.user.id,
            name: socket.user.name,
            email: socket.user.email,
            peerId
          }
        }).catch((error) => {
          console.error("Erro ao auditar VIEWER_JOINED:", error.message);
        });

        streamPresenceRepository.startPresence({
          tenantId: socket.user.tenantId,
          streamId,
          userId: socket.user.id,
          email: socket.user.email,
          role: "viewer"
        }).catch((error) => {
          console.error("Erro ao iniciar presença:", error.message);
        });

        socket.emit("stream:joined", { streamId, role, peerId });

        const host = getHost(streamId);

        if (host) {
          socket.emit("stream:host-ready", {
            streamId,
            hostUserId: host.userId,
            hostName: host.name,
            hostEmail: host.email,
            hostPeerId: host.peerId
          });

          io.to(host.socketId).emit("stream:viewer-joined", {
            streamId,
            viewerUserId: socket.user.id,
            viewerName: socket.user.name,
            viewerEmail: socket.user.email,
            viewerPeerId: peerId
          });
        }

        emitViewersUpdated(io, streamId);
        return;
      }

      socket.emit("stream:error", {
        message: "Role inválido"
      });
    });

    socket.on("stream:get-state", ({ streamId }) => {
      if (!streamId) {
        return socket.emit("stream:error", {
          message: "streamId é obrigatório"
        });
      }

      socket.emit("stream:state", {
        streamId,
        state: getStreamState(streamId)
      });
    });

    socket.on("stream:leave", ({ streamId }) => {
      const currentStreamId = streamId || socket.data.streamId;
      if (!currentStreamId) return;

      if (socket.data.role === "viewer") {
        const viewer = removeViewer(currentStreamId, socket.id);

        registerAuditEventUseCase.execute({
          token: socket.handshake.auth?.token,
          action: "VIEWER_LEFT",
          resourceType: "STREAM",
          resourceId: currentStreamId,
          metadata: {
            userId: socket.user.id,
            name: socket.user.name,
            email: socket.user.email,
            peerId: viewer?.peerId || socket.data.peerId
          }
        }).catch((error) => {
          console.error("Erro ao auditar VIEWER_LEFT:", error.message);
        });

        streamPresenceRepository.endPresence({
          tenantId: socket.user.tenantId,
          streamId: currentStreamId,
          userId: socket.user.id
        }).catch((error) => {
          console.error("Erro ao finalizar presença:", error.message);
        });

        socket.to(currentStreamId).emit("stream:viewer-left", {
          streamId: currentStreamId,
          viewerUserId: socket.user.id,
          viewerName: socket.user.name,
          viewerEmail: socket.user.email,
          viewerPeerId: viewer?.peerId || socket.data.peerId
        });

        emitViewersUpdated(io, currentStreamId);
      }

      if (socket.data.role === "host") {
        socket.to(currentStreamId).emit("stream:host-left", {
          streamId: currentStreamId,
          hostUserId: socket.user.id,
          hostName: socket.user.name,
          hostEmail: socket.user.email
        });
      }

      socket.leave(currentStreamId);

      socket.data.streamId = null;
      socket.data.role = null;
      socket.data.peerId = null;
    });

    socket.on("disconnect", () => {
      console.log(`Stream socket desconectado: ${socket.id}`);

      const removedItems = removeSocketFromAllStreams(socket.id);

      for (const item of removedItems) {
        if (item.role === "viewer") {
          socket.to(item.streamId).emit("stream:viewer-left", {
            streamId: item.streamId,
            viewerUserId: item.userId,
            viewerName: item.name,
            viewerEmail: item.email,
            viewerPeerId: item.peerId
          });

          registerAuditEventUseCase.execute({
            token: socket.handshake.auth?.token,
            action: "VIEWER_LEFT",
            resourceType: "STREAM",
            resourceId: item.streamId,
            metadata: {
              userId: item.userId,
              name: item.name,
              email: item.email,
              peerId: item.peerId,
              reason: "disconnect"
            }
          }).catch((error) => {
            console.error("Erro ao auditar VIEWER_LEFT disconnect:", error.message);
          });

          streamPresenceRepository.endPresence({
            tenantId: socket.user.tenantId,
            streamId: item.streamId,
            userId: item.userId
          }).catch((error) => {
            console.error("Erro ao finalizar presença:", error.message);
          });

          emitViewersUpdated(io, item.streamId);
        }

        if (item.role === "host") {
          socket.to(item.streamId).emit("stream:host-left", {
            streamId: item.streamId,
            hostUserId: item.userId,
            hostName: item.name,
            hostEmail: item.email
          });

          emitViewersUpdated(io, item.streamId);
        }
      }
    });
  });
}