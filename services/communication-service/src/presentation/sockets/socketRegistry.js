const userSockets = new Map();

export function registerUserSocket(userId, socketId) {
  if (!userSockets.has(userId)) {
    userSockets.set(userId, new Set());
  }

  userSockets.get(userId).add(socketId);
}

export function unregisterUserSocket(userId, socketId) {
  if (!userSockets.has(userId)) return;

  const sockets = userSockets.get(userId);
  sockets.delete(socketId);

  if (sockets.size === 0) {
    userSockets.delete(userId);
  }
}

export function getUserSocketIds(userId) {
  if (!userSockets.has(userId)) return [];
  return Array.from(userSockets.get(userId));
}