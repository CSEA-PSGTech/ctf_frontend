import { io } from 'socket.io-client';

const LOG_PREFIX = '[Leaderboard WebSocket]';

// Extract the host origin and socket.io path from the backend URL
const getSocketConfig = () => {
  const rawUrl = 'http://10.1.10.162:6506/cybersec/ctf/';

  let hostOrigin = rawUrl;
  let socketPath = '/cybersec/ctf/socket.io';

  try {
    const parsed = new URL(rawUrl);
    hostOrigin = parsed.origin;
    // If backend path already contains a subpath, adjust socketPath
    if (parsed.pathname && parsed.pathname !== '/') {
      const cleanPath = parsed.pathname.replace(/\/+$/, '');
      socketPath = `${cleanPath}/socket.io`;
    }
  } catch (e) {
    console.warn(`${LOG_PREFIX} Could not parse backend URL "${rawUrl}", falling back to defaults.`, e);
  }

  return { hostOrigin, socketPath, rawUrl };
};


let socket = null;
const leaderboardListeners = new Set();
const userRankListeners = new Set();
const newSolveListeners = new Set();

const handleLeaderboardEvent = (difficulty, payload) => {
  console.log(`${LOG_PREFIX} 📊 Received "${difficulty}" leaderboard update:`, {
    difficulty,
    count: payload?.leaderboard?.length || payload?.data?.length || 0,
    timestamp: payload?.timestamp || new Date().toISOString(),
    updated_user: payload?.updated_user || null
  });

  const normalized = {
    difficulty: payload?.difficulty || difficulty,
    data: payload?.leaderboard || payload?.data || payload || [],
    timestamp: payload?.timestamp || null,
    updated_user: payload?.updated_user || null
  };

  leaderboardListeners.forEach((cb) => {
    try {
      cb(normalized);
    } catch (e) {
      console.error(`${LOG_PREFIX} Error in leaderboard listener callback:`, e);
    }
  });
};

const handleUserRank = (payload) => {
  console.log(`${LOG_PREFIX} 🏆 User rank change:`, payload);
  userRankListeners.forEach((cb) => {
    try {
      cb(payload);
    } catch (e) {
      console.error(`${LOG_PREFIX} Error in userRank callback:`, e);
    }
  });
};

const handleNewSolve = (payload) => {
  console.log(`${LOG_PREFIX} 🎉 New solve event:`, payload);
  newSolveListeners.forEach((cb) => {
    try {
      cb(payload);
    } catch (e) {
      console.error(`${LOG_PREFIX} Error in newSolve callback:`, e);
    }
  });
};

export const connectLeaderboardSocket = (onConnect = () => {}, options = {}) => {
  const { hostOrigin, socketPath, rawUrl } = getSocketConfig();

  if (socket && socket.connected) {
    console.log(`${LOG_PREFIX} Already connected (Socket ID: ${socket.id})`);
    return socket;
  }

  if (socket && !socket.connected) {
    console.log(`${LOG_PREFIX} Reconnecting existing socket...`);
    socket.connect();
    return socket;
  }

  console.log(`${LOG_PREFIX} 🔌 Connecting to host: "${hostOrigin}" with path: "${socketPath}" (raw: "${rawUrl}")...`);

  try {
    socket = io(hostOrigin, {
      path: socketPath,
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
      timeout: 20000,
      ...options
    });

    // Connection lifecycle events
    socket.on('connect', () => {
      const transportName = socket.io?.engine?.transport?.name || 'unknown';
      console.log(`${LOG_PREFIX} ✅ Connected successfully! Socket ID: ${socket.id} (Transport: ${transportName})`);
      if (typeof onConnect === 'function') {
        onConnect(socket);
      }
    });

    socket.on('welcome', (data) => {
      console.log(`${LOG_PREFIX} 📩 Server welcome message:`, data);
    });

    socket.on('connect_error', (err) => {
      console.error(`${LOG_PREFIX} ❌ Connection Error:`, {
        message: err.message,
        description: err.description || null,
        type: err.type || null,
        targetHost: hostOrigin,
        targetPath: socketPath,
        rawUrl
      });
    });

    socket.on('connect_timeout', () => {
      console.error(`${LOG_PREFIX} ⏱️ Connection timed out after 20s. Check if server is running and accessible.`);
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.warn(`${LOG_PREFIX} 🔄 Reconnection attempt #${attemptNumber}...`);
    });

    socket.on('reconnect_error', (err) => {
      console.error(`${LOG_PREFIX} ❌ Reconnection error:`, err.message);
    });

    socket.on('reconnect_failed', () => {
      console.error(`${LOG_PREFIX} 🚫 Reconnection failed after all attempts. Falling back to REST API.`);
    });

    socket.on('disconnect', (reason) => {
      console.warn(`${LOG_PREFIX} 🔌 Disconnected. Reason: "${reason}"`);
    });

    socket.on('error', (err) => {
      console.error(`${LOG_PREFIX} ⚠️ Socket general error:`, err);
    });

    // Custom CTF leaderboard events from backend
    socket.on('leaderboard_update_beginner', (payload) => {
      handleLeaderboardEvent('beginner', payload);
    });

    socket.on('leaderboard_update_intermediate', (payload) => {
      handleLeaderboardEvent('intermediate', payload);
    });

    socket.on('user_rank_change', handleUserRank);
    socket.on('new_solve', handleNewSolve);

    return socket;
  } catch (err) {
    console.error(`${LOG_PREFIX} ❌ Failed to initialize socket.io client:`, err);
    return null;
  }
};

export const onLeaderboardUpdate = (cb) => {
  leaderboardListeners.add(cb);
  return () => leaderboardListeners.delete(cb);
};

export const onUserRankChange = (cb) => {
  userRankListeners.add(cb);
  return () => userRankListeners.delete(cb);
};

export const onNewSolve = (cb) => {
  newSolveListeners.add(cb);
  return () => newSolveListeners.delete(cb);
};

export const disconnectLeaderboardSocket = () => {
  if (!socket) return;
  console.log(`${LOG_PREFIX} Disconnecting socket...`);
  socket.off('leaderboard_update_beginner');
  socket.off('leaderboard_update_intermediate');
  socket.off('user_rank_change');
  socket.off('new_solve');
  socket.disconnect();
  socket = null;
  leaderboardListeners.clear();
  userRankListeners.clear();
  newSolveListeners.clear();
};

export const getSocketStatus = () => {
  return {
    initialized: !!socket,
    connected: socket ? socket.connected : false,
    id: socket ? socket.id : null,
    transport: socket?.io?.engine?.transport?.name || null
  };
};

export default {
  connectLeaderboardSocket,
  onLeaderboardUpdate,
  onUserRankChange,
  onNewSolve,
  disconnectLeaderboardSocket,
  getSocketStatus
};
