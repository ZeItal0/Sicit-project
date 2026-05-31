import { getSocketServer } from "./socketServer.js";

export function emitUserOnline(presence) {
  const io = getSocketServer();
  if (!io) return;

  io.emit("user_online", presence);
}

export function emitUserOffline(presence) {
  const io = getSocketServer();
  if (!io) return;

  io.emit("user_offline", presence);
}