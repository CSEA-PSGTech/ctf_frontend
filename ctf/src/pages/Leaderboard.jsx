import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './scoreboard.css';
import CTFHeader from '../components/layout/CTFHeader';
import { useAuth } from '../context/AuthContext';
import {
  connectLeaderboardSocket,
  onLeaderboardUpdate,
  onNewSolve,
  disconnectLeaderboardSocket
} from '../leaderboardSocket';
import { fetchLeaderboardByDifficulty } from '../api';

export default function Scoreboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Active division tab: 'beginner' or 'intermediate'
  const [activeTab, setActiveTab] = useState(
    user?.difficulty?.toLowerCase() === 'intermediate' ? 'intermediate' : 'beginner'
  );

  const [beginnerList, setBeginnerList] = useState([]);
  const [intermediateList, setIntermediateList] = useState([]);
  const [loading, setLoading] = useState(true);

  const normalizeList = (list) => {
    return (Array.isArray(list) ? list : []).map((p, idx) => ({
      rank: p.rank ?? idx + 1,
      username: p.team_name || p.username || p.name || p.handle || 'unknown',
      points: p.points ?? p.point ?? p.score ?? 0,
      solved_count: p.solved_count ?? p.solved_no ?? 0,
      difficulty: p.difficulty || '',
      verified: p.verified || false,
      user_id: p.user_id || p._id || null
    }));
  };

  const loadLeaderboards = useCallback(async () => {
    try {
      setLoading(true);

      const [beginnerRes, intermediateRes] = await Promise.allSettled([
        fetchLeaderboardByDifficulty('beginner'),
        fetchLeaderboardByDifficulty('intermediate')
      ]);

      if (beginnerRes.status === 'fulfilled') {
        const raw = beginnerRes.value?.data || beginnerRes.value?.leaderboard || beginnerRes.value || [];
        setBeginnerList(normalizeList(raw));
      } else {
        console.error('[Leaderboard Page] ❌ REST Error fetching Beginner board:', beginnerRes.reason);
      }

      if (intermediateRes.status === 'fulfilled') {
        const raw = intermediateRes.value?.data || intermediateRes.value?.leaderboard || intermediateRes.value || [];
        setIntermediateList(normalizeList(raw));
      } else {
        console.error('[Leaderboard Page] ❌ REST Error fetching Intermediate board:', intermediateRes.reason);
      }
    } catch (err) {
      console.error('[Leaderboard Page] ❌ Failed to load leaderboards:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('[Leaderboard Page] Mounting: connecting to WebSocket...');
    connectLeaderboardSocket(() => {
      console.log('[Leaderboard Page] WebSocket connected callback executed');
    }, { auth: { token } });

    // Handle real-time leaderboard update from socket
    const unsub = onLeaderboardUpdate((payload) => {
      const difficulty = payload?.difficulty?.toLowerCase();
      const raw = payload?.data || payload?.leaderboard || [];
      const normalized = normalizeList(raw);
      console.log(`[Leaderboard Page] 🔄 Live update applied for "${difficulty}" (${normalized.length} teams)`);

      if (difficulty === 'intermediate') {
        setIntermediateList(normalized);
      } else if (difficulty === 'beginner') {
        setBeginnerList(normalized);
      } else {
        // Fallback: reload both
        loadLeaderboards();
      }
    });

    // Listen to new solve and refresh
    const unsubSolve = onNewSolve((data) => {
      console.log('[Leaderboard Page] 🎉 Live solve notification received:', data);
      loadLeaderboards();
    });

    loadLeaderboards();

    return () => {
      if (typeof unsub === 'function') unsub();
      if (typeof unsubSolve === 'function') unsubSolve();
    };
  }, [loadLeaderboards]);

  const currentList = activeTab === 'intermediate' ? intermediateList : beginnerList;

  return (
    <div className="scoreboard-page">
      <CTFHeader />
      <div className="scoreboard-container">
        {/* Header Row */}
        <div className="scoreboard-header-row">
          <div className="scoreboard-title-group">
            <h1>Kollywood Hall of Fame</h1>
            <p>Separate division rankings for Beginner and Intermediate contenders</p>
          </div>
          <button
            onClick={() => navigate('/challenge')}
            className="cinematic-back-btn"
          >
            ← Back to Challenges
          </button>
        </div>

        {/* Division Switcher Tabs */}
        <div className="difficulty-tabs-wrapper">
          <button
            type="button"
            className={`difficulty-tab-btn ${activeTab === 'beginner' ? 'active' : ''}`}
            onClick={() => setActiveTab('beginner')}
          >
            <span>Beginner Division</span>
            <span className="tab-badge">{beginnerList.length}</span>
          </button>

          <button
            type="button"
            className={`difficulty-tab-btn ${activeTab === 'intermediate' ? 'active' : ''}`}
            onClick={() => setActiveTab('intermediate')}
          >
            <span>Intermediate Division</span>
            <span className="tab-badge">{intermediateList.length}</span>
          </button>
        </div>

        {/* Leaderboard Table Card */}
        <div className="leaderboard-section">
          {loading && currentList.length === 0 ? (
            <div className="scoreboard-empty">
              <h3>Buffering Hall of Fame...</h3>
              <p>Fetching division rankings from the arena server</p>
            </div>
          ) : currentList.length === 0 ? (
            <div className="scoreboard-empty">
              <h3>No Records in {activeTab.toUpperCase()} Division</h3>
              <p>Solves submitted by {activeTab} teams will appear here</p>
            </div>
          ) : (
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th className="th-rank">Rank</th>
                  <th className="th-user">Team Name</th>
                  <th style={{ width: '20%', textAlign: 'center' }}>Solves</th>
                  <th className="th-points">Score</th>
                </tr>
              </thead>
              <tbody>
                {currentList.map((player, index) => {
                  const isMyTeam = user?.team_name && player.username?.toLowerCase() === user.team_name.toLowerCase();

                  return (
                    <tr
                      key={player.user_id || index}
                      className={`leaderboard-row ${isMyTeam ? 'user-team-row' : ''}`}
                    >
                      <td className="td-rank">
                        <span style={{ color: player.rank <= 3 ? '#facc15' : '#a8a29e' }}>
                          #{player.rank}
                        </span>
                      </td>
                      <td className="td-user">
                        <span style={{ fontWeight: isMyTeam ? 800 : 600 }}>{player.username}</span>
                        {isMyTeam && <span className="my-team-pill">Your Team</span>}
                        {player.verified && <span className="verified-badge">verified</span>}
                      </td>
                      <td style={{ textAlign: 'center', color: '#d6d3d1', fontWeight: 600 }}>
                        {player.solved_count} solved
                      </td>
                      <td className="td-points">
                        {player.points} PTS
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
