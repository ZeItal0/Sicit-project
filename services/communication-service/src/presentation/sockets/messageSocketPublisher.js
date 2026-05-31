import { getSocketServer } from "./socketServer.js";

export function emitMessageCreated(message) {
  const io = getSocketServer();

  if (!io) return;

  io.to(message.channelId).emit("message_created", message);
}