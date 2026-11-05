import { io } from 'socket.io-client';

// Read backend url from Vite env or fallback
const BACKEND_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_BACKEND_URL) || process.env.BACKEND_URL;

let socket = null;
const leaderboardListeners = new Set();
const userRankListeners = new Set();
const newSolveListeners = new Set();

const handleLeaderboardEvent = (payload) => {
  // payload shape from backend: { leaderboard, difficulty, timestamp, updated_user }
  const normalized = {
    difficulty: payload?.difficulty || null,
    data: payload?.leaderboard || payload?.data || payload || [],
    timestamp: payload?.timestamp || null,
    updated_user: payload?.updated_user || null
  };
  
  leaderboardListeners.forEach(cb => {
    try { 
      cb(normalized); 
    } catch (e) { 
      // Silent fail for leaderboard listeners
    }
  });
};

const handleUserRank = (payload) => {
  userRankListeners.forEach(cb => {
    try { cb(payload); } catch (e) { /* Silent fail */ }
  });
};

const handleNewSolve = (payload) => {
  newSolveListeners.forEach(cb => {
    try { cb(payload); } catch (e) { /* Silent fail */ }
  });
};

export const connectLeaderboardSocket = (onConnect = () => {}, options = {}) => {
  if (socket && socket.connected) {
    onConnect(socket);
    return socket;
  }

  // Allow auth token from options or fallback to localStorage
  const token = options?.auth?.token || localStorage.getItem('token') || null;

  socket = io(BACKEND_URL, {
    path: '/socket.io',
    // prefer websocket but allow polling fallback for strict proxies
    transports: options.transports || ['websocket', 'polling'],
    withCredentials: true,
    reconnection: true,
    reconnectionAttempts: options.reconnectionAttempts ?? Infinity,
    reconnectionDelay: options.reconnectionDelay ?? 1000,
    timeout: options.timeout ?? 20000,
    auth: { token },
    ...options
  });

  socket.on('connect', () => {
    onConnect(socket);
  });

  socket.on('disconnect', (reason) => {
    // Socket disconnected
  });

  socket.on('connect_error', (err) => {
    // Connection error
  });

  socket.on('reconnect_attempt', (attempt) => {
    // Reconnection attempt
  });

  socket.on('reconnect', (attempt) => {
    // Reconnected successfully
  });

  socket.on('reconnect_failed', () => {
    // Failed to reconnect
  });

  // Backend emits difficulty-specific events
  socket.on('leaderboard_update_beginner', (payload) => {
    handleLeaderboardEvent(payload);
  });
  socket.on('leaderboard_update_intermediate', (payload) => {
    handleLeaderboardEvent(payload);
  });

  // Other events
  socket.on('user_rank_change', (payload) => {
    handleUserRank(payload);
  });
  socket.on('new_solve', (payload) => {
    handleNewSolve(payload);
  });

  return socket;
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
  socket.off('leaderboard_update_beginner', handleLeaderboardEvent);
  socket.off('leaderboard_update_intermediate', handleLeaderboardEvent);
  socket.off('user_rank_change', handleUserRank);
  socket.off('new_solve', handleNewSolve);
  socket.disconnect();
  socket = null;
  leaderboardListeners.clear();
  userRankListeners.clear();
  newSolveListeners.clear();
};

export default {
  connectLeaderboardSocket,
  onLeaderboardUpdate,
  onUserRankChange,
  onNewSolve,
  disconnectLeaderboardSocket
};
