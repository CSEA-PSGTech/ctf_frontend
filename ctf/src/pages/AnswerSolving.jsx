import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import CTFHeader from '../components/layout/CTFHeader';
import { useAuth } from '../context/AuthContext';
import { submitAnswer, fetchQuestionDetails, checkQuestionSolved, fetchLeaderboard, fetchLeaderboardByDifficulty } from '../api';
import { connectLeaderboardSocket, onLeaderboardUpdate, disconnectLeaderboardSocket } from '../leaderboardSocket';
import './AnswerSolving.css';


export default function AnswerSolving() {
  const { user } = useAuth();
  const location = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Get challenge data from navigation state or fetch from backend
  const passedChallenge = location.state?.challenge;
  
  const [challengeConfig, setChallengeConfig] = useState(null);
  const [flagInput, setFlagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [isSolved, setIsSolved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showHint, setShowHint] = useState(false);
  
  // Fetch question details and solved status on mount
  useEffect(() => {
    const loadQuestionData = async () => {
      try {
        setLoading(true);
        
        // Use passed challenge or fetch from backend
        if (passedChallenge) {
          
          // TEMPORARILY: Always fetch from backend to see console.log and verify hint data
          console.log('🔍 AnswerSolving: Also fetching from backend to verify hint data...');
          let backendData = null;
          try {
            const questionResponse = await fetchQuestionDetails(passedChallenge._id || id);
            console.log('🔍 AnswerSolving: Backend response for verification:', questionResponse);
            console.log('🔍 AnswerSolving: Backend response structure:', {
              success: questionResponse.success,
              data: questionResponse.data,
              dataKeys: questionResponse.data ? Object.keys(questionResponse.data) : 'no data',
              linkField: questionResponse.data?.link,
              linkType: typeof questionResponse.data?.link
            });
            backendData = questionResponse.data;
          } catch (err) {
            console.log('🔍 AnswerSolving: Backend fetch failed:', err);
          }
          
          // Ensure the passed challenge has the link fields properly mapped
          // Use backend data for link if available, fallback to navigation data
          const normalizedChallenge = {
            ...passedChallenge,
            linkText: (backendData?.link || passedChallenge.link) ? 'Challenge URL' : null,
            linkUrl: backendData?.link || passedChallenge.link || null,
            hint: backendData?.hint || passedChallenge.hint || null
          };
          
          console.log('🔍 AnswerSolving: Normalized challenge data:', {
            originalLink: passedChallenge.link,
            backendLink: backendData?.link,
            finalLinkText: normalizedChallenge.linkText,
            finalLinkUrl: normalizedChallenge.linkUrl,
            hint: normalizedChallenge.hint,
            passedChallengeKeys: Object.keys(passedChallenge),
            passedChallengeData: passedChallenge
          });
          
          setChallengeConfig(normalizedChallenge);
          
          // Check if question is solved
          const solvedResponse = await checkQuestionSolved(passedChallenge._id || id);
          setIsSolved(solvedResponse.data?.isSolved || false);
        } else if (id) {
          // Fetch question details from backend
          const questionResponse = await fetchQuestionDetails(id);
          console.log('🔍 AnswerSolving: Direct backend fetch response:', questionResponse);
          
          if (questionResponse.success) {
            const question = questionResponse.data;
            console.log('🔍 AnswerSolving: Question data from backend:', {
              questionKeys: Object.keys(question),
              link: question.link,
              linkType: typeof question.link,
              hint: question.hint,
              hintType: typeof question.hint,
              fullQuestion: question
            });
            
            const configObj = {
              _id: question._id,
              id: question._id,
              title: question.title,
              description: question.description,
              points: question.point,
              difficulty: question.difficulty,
              category: question.categoryId?.name || 'General',
              solves: question.solved_count || 0,
              year: question.year,
              linkText: question.link ? 'Challenge URL' : null,
              linkUrl: question.link,
              hint: question.hint || null
            };
            
            console.log('🔍 AnswerSolving: Configured object for backend data:', configObj);
            
            setChallengeConfig(configObj);
          }
          
          // Check if question is solved
          const solvedResponse = await checkQuestionSolved(id);
          setIsSolved(solvedResponse.data?.isSolved || false);
        }
      } catch (error) {
        setSubmitResult({ 
          success: false, 
          message: 'Failed to load question details' 
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadQuestionData();
  }, [id, passedChallenge]);
  
  const [top10, setTop10] = useState([]);
  const [sidebarDifficulty, setSidebarDifficulty] = useState('beginner');

  // Subscribe to leaderboard updates (top 10)
  useEffect(() => {
    const token = localStorage.getItem('token');
    connectLeaderboardSocket(() => {}, { auth: { token } });

    const unsub = onLeaderboardUpdate((payload) => {
      // If payload has difficulty and we have a challenge difficulty, only update matching difficulty
      if (payload?.difficulty && payload.difficulty !== sidebarDifficulty) return;

      console.log(`[AnswerSolving Top10] 🔄 Live update for "${sidebarDifficulty}"`);
      const list = payload?.data || payload?.top10 || payload || [];
      const normalized = (Array.isArray(list) ? list : []).slice(0, 10).map((p, idx) => ({
        rank: p.rank ?? idx + 1,
        username: p.team_name || p.username || p.name || p.handle || 'unknown',
        points: p.points ?? p.point ?? p.score ?? 0,
        verified: p.verified || false
      }));
      setTop10(normalized);
    });

    // fetch initial leaderboard for the challenge difficulty if available
    (async () => {
      try {
        const res = await fetchLeaderboardByDifficulty(sidebarDifficulty);
        const list = res?.data || res?.top10 || res || [];
        const normalized = (Array.isArray(list) ? list : []).slice(0, 10).map((p, idx) => ({
          rank: p.rank ?? idx + 1,
          username: p.team_name || p.username || p.name || p.handle || 'unknown',
          points: p.points ?? p.point ?? p.score ?? 0,
          verified: p.verified || false
        }));
        setTop10(normalized);
      } catch (err) {
        // Silent fail for initial leaderboard fetch
      }
    })();

    return () => {
      if (typeof unsub === 'function') unsub();
      // optional: disconnectLeaderboardSocket(); // keep connection for other pages
    };
  }, [sidebarDifficulty]);

  const handleSubmit = async () => {
    if (isSolved) {
      setSubmitResult({ success: false, message: 'You have already solved this question!' });
      return;
    }

    if (!flagInput.trim()) {
      setSubmitResult({ success: false, message: 'Please enter a flag' });
      return;
    }

    try {
      setSubmitting(true);
      setSubmitResult(null);
      
      const response = await submitAnswer({
        question_id: challengeConfig._id || challengeConfig.id,
        submitted_answer: flagInput.trim()
      });

      if (response.success) {
        setSubmitResult({
          success: response.isCorrect,
          message: response.message,
          pointsAwarded: response.pointsAwarded,
          totalScore: response.totalScore
        });
        
        if (response.isCorrect) {
          setFlagInput(''); // Clear input on correct answer
          setIsSolved(true); // Mark as solved
          // fetch latest leaderboard after a correct submission to get immediate update
          try {
            let lb;
            if (challengeConfig?.difficulty) {
              lb = await fetchLeaderboardByDifficulty(challengeConfig.difficulty);
            } else {
              lb = await fetchLeaderboard();
            }
            const list = lb?.data || lb?.top10 || lb || [];
            const normalized = (Array.isArray(list) ? list : []).slice(0, 10).map((p, idx) => ({
              rank: p.rank ?? idx + 1,
              username: p.team_name || p.username || p.name || p.handle || 'unknown',
              points: p.points ?? p.point ?? p.score ?? 0,
              verified: p.verified || false
            }));
            setTop10(normalized);
          } catch (err) {
            // Silent fail for leaderboard refresh after submission
          }
        }
      } else {
        setSubmitResult({ success: false, message: response.message });
      }
    } catch (error) {
      setSubmitResult({ 
        success: false, 
        message: error.response?.data?.message || 'Submission failed. Please try again.' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading state while fetching question
  if (loading) {
    return (
      <div style={{ background: '#0f0f0f', minHeight: '100vh' }}>
        <CTFHeader />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 'calc(100vh - 80px)',
          color: '#fff'
        }}>
          <div style={{ textAlign: 'center' }}>
            
            <p>Loading question...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if question not found
  if (!challengeConfig) {
    return (
      <div style={{ background: '#0f0f0f', minHeight: '100vh' }}>
        <CTFHeader />
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 'calc(100vh - 80px)',
          color: '#fff'
        }}>
          <div style={{ textAlign: 'center' }}>
            
            <p>Question not found</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="answer-page">
      <CTFHeader />
      <div className="answer-layout">
        {/* Main Challenge Card */}
        <div className="challenge-card">
          {/* Back Button to Challenges */}
          <button
            onClick={() => navigate('/challenge')}
            className="cinematic-back-btn"
            style={{ marginBottom: '24px', alignSelf: 'flex-start' }}
          >
            ← Back to Challenges
          </button>
          
          {/* Header with title, points, and difficulty */}
          <div className="challenge-header">
            <h1 className="challenge-title">
              {challengeConfig.title}
            </h1>
            <div className="challenge-meta">
              {challengeConfig.difficulty && (
                <span className="difficulty-pill">
                  {challengeConfig.difficulty}
                </span>
              )}
              <span className="points-meta">
                {challengeConfig.points} Points
              </span>
            </div>
          </div>

          {/* Silent Movie Description Card with Video Background */}
          <div className="movie-description-card">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="movie-description-video"
              src="/silent-film-bg.mp4"
            />
            <div className="movie-description-overlay" />
            <div className="movie-description-content">
              <div className="movie-card-header">
                <span className="movie-reel-marker">• SCENARIO REEL •</span>
              </div>
              <p className="movie-description-text">
                {challengeConfig.description}
              </p>
            </div>
          </div>

          <div style={{ flex: 1, marginBottom: '24px' }}>
            {challengeConfig.linkText && challengeConfig.linkUrl && (
              <a
                href={challengeConfig.linkUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="challenge-link"
              >
                <span>{challengeConfig.linkText}</span>
              </a>
            )}

            {/* Hint Button */}
            {challengeConfig.hint && (
              <button
                onClick={() => setShowHint(!showHint)}
                className={`hint-btn ${showHint ? 'active' : ''}`}
              >
                <span>{showHint ? 'Hide Hint' : 'Show Hint'}</span>
              </button>
            )}

            {/* Hint Modal/Display */}
            {showHint && challengeConfig.hint && (
              <div className="hint-box">
                <div style={{ 
                  fontSize: '13px', 
                  fontWeight: '700', 
                  marginBottom: '8px',
                  color: '#facc15',
                  letterSpacing: '1px',
                  textTransform: 'uppercase'
                }}>
                  Directive Hint
                </div>
                <div style={{ fontSize: '15px', lineHeight: '1.6', color: '#fef08a' }}>
                  {challengeConfig.hint}
                </div>
              </div>
            )}

            {challengeConfig.additionalInfo && (
              <p style={{ 
                color: '#a8a29e', 
                fontSize: '14px',
                marginTop: '16px'
              }}>
                {challengeConfig.additionalInfo}{' '}
                {challengeConfig.additionalLinkText && challengeConfig.additionalLinkUrl && (
                  <a
                    href={challengeConfig.additionalLinkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="challenge-link"
                    style={{ display: 'inline-flex', padding: '4px 10px', fontSize: '13px' }}
                  >
                    {challengeConfig.additionalLinkText}
                  </a>
                )}
              </p>
            )}
          </div>

          {/* Flag submission */}
          <div style={{ marginTop: 'auto' }}>
            <div className="flag-submission-row">
              <div className="flag-input-group" style={{ opacity: isSolved ? 0.6 : 1 }}>
                <div className="flag-label">
                  {isSolved ? 'Solved' : 'Flag'}
                </div>
                <input 
                  type="text"
                  value={flagInput}
                  onChange={(e) => !isSolved && setFlagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isSolved && handleSubmit()}
                  placeholder={isSolved ? "You have already solved this question!" : "cybersiege{your_answer_here}"}
                  disabled={isSolved}
                  className="flag-input"
                  style={{
                    cursor: isSolved ? 'not-allowed' : 'text',
                    textTransform: 'none',
                    fontStyle: 'normal'
                  }}
                />
              </div>
              <button 
                onClick={handleSubmit}
                disabled={submitting || isSolved}
                className="submit-btn"
              >
                {submitting ? 'Submitting...' : isSolved ? 'Solved' : 'Submit Flag'}
              </button>
            </div>

            {/* Submission Result */}
            {submitResult && (
              <div style={{
                padding: '16px 20px',
                borderRadius: '10px',
                marginBottom: '18px',
                background: submitResult.success ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                border: `1px solid ${submitResult.success ? '#10b981' : '#ef4444'}`,
                color: submitResult.success ? '#6ee7b7' : '#fca5a5',
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.5)'
              }}>
                <div style={{ fontWeight: '800', marginBottom: '6px', fontSize: '15px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {submitResult.success ? 'Access Granted • Correct' : 'Access Denied • Incorrect'}
                </div>
                <div style={{ fontSize: '14px', marginBottom: '6px' }}>
                  {submitResult.message}
                </div>
                {submitResult.success && submitResult.pointsAwarded && (
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#facc15' }}>
                    Points Awarded: +{submitResult.pointsAwarded} | Total Score: {submitResult.totalScore}
                  </div>
                )}
              </div>
            )}

            {/* Tags and solve count */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '18px',
              borderTop: '1px solid rgba(234, 179, 8, 0.15)'
            }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {challengeConfig.tags && challengeConfig.tags.length > 0 ? (
                  challengeConfig.tags.map((tag, i) => (
                    <span key={i} style={{
                      background: 'rgba(234, 179, 8, 0.12)',
                      border: '1px solid rgba(234, 179, 8, 0.3)',
                      color: '#fde047',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '700',
                      letterSpacing: '0.5px',
                      textTransform: 'uppercase'
                    }}>
                      {tag}
                    </span>
                  ))
                ) : (
                  <span style={{
                    background: 'rgba(234, 179, 8, 0.12)',
                    border: '1px solid rgba(234, 179, 8, 0.3)',
                    color: '#fde047',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '700',
                    letterSpacing: '0.5px',
                    textTransform: 'uppercase'
                  }}>
                    {challengeConfig.category}
                  </span>
                )}
              </div>
              <span style={{ 
                color: '#facc15', 
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.5px'
              }}>
                {(challengeConfig.solves || 0).toLocaleString()} solves recorded
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="answer-sidebar">
          {/* Top 10 */}
          <div className="sidebar-card">
            <h3 className="sidebar-card-title">
              Top 10 Hall of Fame
            </h3>

            {/* Division Switcher */}
            <div className="sidebar-tabs">
              <button
                type="button"
                className={`sidebar-tab-btn ${sidebarDifficulty === 'beginner' ? 'active' : ''}`}
                onClick={() => setSidebarDifficulty('beginner')}
              >
                Beginner
              </button>
              <button
                type="button"
                className={`sidebar-tab-btn ${sidebarDifficulty === 'intermediate' ? 'active' : ''}`}
                onClick={() => setSidebarDifficulty('intermediate')}
              >
                Intermediate
              </button>
            </div>

            <div style={{ 
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              {top10.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '16px 8px', color: '#a8a29e', fontSize: '13px' }}>
                  No solves in {sidebarDifficulty} division yet
                </div>
              ) : (
                top10.slice(0, 10).map((player, idx) => (
                  <div key={player.username || idx} className="sidebar-leaderboard-item">
                    <span style={{ fontWeight: '800', color: player.rank <= 3 ? '#facc15' : '#a8a29e', width: '28px' }}>
                      #{player.rank}
                    </span>
                    <span style={{ color: '#f3f4f6', fontWeight: 600 }}>{player.username}</span>
                    <span style={{ marginLeft: 'auto', color: '#fef08a', fontWeight: 700 }}>{player.points} PTS</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
