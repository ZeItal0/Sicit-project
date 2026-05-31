import { getSocketServer } from "./socketServer.js";

export function emitMessageRead(messageRead) {
  const io = getSocketServer();

  if (!io) return;

  io.to(messageRead.channelId).emit("message_read", messageRead);
}