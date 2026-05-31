import { getSocketServer } from "./socketServer.js";
import { getUserSocketIds } from "./socketRegistry.js";

export function emitNotificationToUser(userId, notification) {
  const io = getSocketServer();
  if (!io) return;

  const socketIds = getUserSocketIds(userId);

  for (const socketId of socketIds) {
    io.to(socketId).emit("new_notification", notification);
  }
}