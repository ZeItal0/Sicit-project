const streamRegistry = new Map();

export function ensureStreamRoom(streamId) {
  if (!streamRegistry.has(streamId)) {
    streamRegistry.set(streamId, {
      host: null,
      viewers: new Map()
    });
  }

  return streamRegistry.get(streamId);
}

export function setHost(streamId, hostData) {
  const room = ensureStreamRoom(streamId);
  room.host = hostData;
}

export function getHost(streamId) {
  return streamRegistry.get(streamId)?.host || null;
}

export function addViewer(streamId, socketId, viewerData) {
  const room = ensureStreamRoom(streamId);

  for (const [oldSocketId, viewer] of room.viewers.entries()) {
    if (viewer.userId === viewerData.userId) {
      room.viewers.delete(oldSocketId);
    }
  }

  room.viewers.set(socketId, {
    ...viewerData,
    socketId,
    joinedAt: new Date()
  });
}

export function removeViewer(streamId, socketId) {
  const room = streamRegistry.get(streamId);
  if (!room) return null;

  const viewer = room.viewers.get(socketId);
  room.viewers.delete(socketId);

  if (!room.host && room.viewers.size === 0) {
    streamRegistry.delete(streamId);
  }

  return viewer || null;
}

export function getViewers(streamId) {
  const room = streamRegistry.get(streamId);
  if (!room) return [];

  const unique = new Map();

  for (const [socketId, data] of room.viewers.entries()) {
    const key = data.userId || socketId;

    unique.set(key, {
      socketId,
      ...data
    });
  }

  return Array.from(unique.values());
}

export function getViewerCount(streamId) {
  return getViewers(streamId).length;
}

export function getStreamState(streamId) {
  const room = streamRegistry.get(streamId);

  if (!room) {
    return {
      host: null,
      viewers: [],
      viewerCount: 0
    };
  }

  return {
    host: room.host,
    viewers: getViewers(streamId),
    viewerCount: getViewerCount(streamId)
  };
}

export function removeSocketFromAllStreams(socketId) {
  const removed = [];

  for (const [streamId, room] of streamRegistry.entries()) {
    if (room.host?.socketId === socketId) {
      const host = room.host;

      room.host = null;

      removed.push({
        streamId,
        role: "host",
        userId: host.userId,
        name: host.name,
        email: host.email,
        peerId: host.peerId
      });
    }

    if (room.viewers.has(socketId)) {
      const viewer = room.viewers.get(socketId);

      room.viewers.delete(socketId);

      removed.push({
        streamId,
        role: "viewer",
        userId: viewer.userId,
        name: viewer.name,
        email: viewer.email,
        peerId: viewer.peerId
      });
    }

    if (!room.host && room.viewers.size === 0) {
      streamRegistry.delete(streamId);
    }
  }

  return removed;
}