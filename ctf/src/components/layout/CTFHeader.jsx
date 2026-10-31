import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './CTFHeader.css';

const ChevronDownIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
    <path d="M7 10l5 5 5-5H7z" fill="currentColor" />
  </svg>
);

export default function CTFHeader() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className={`ctf-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="ctf-header-inner">
        <div className="ctf-left">
          <Link to="/" className="brand-link" aria-label="Go to homepage">
            <span className="brand-text">Kollywood CTF</span>
          </Link>
        </div>

        <nav className="ctf-nav" aria-label="Primary">
          <Link to="/" className="nav-link">
            <span>← Home</span>
          </Link>
          <Link to="/challenge" className="nav-link has-chevron">
            <span>Challenges</span>
            <ChevronDownIcon />
          </Link>
          <Link to="/leaderboard" className="nav-link">
            <span>Scoreboard</span>
          </Link>
        </nav>

        <div className="ctf-actions">
          <div className="user-menu" style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
            {user?.team_name && (
              <span style={{ 
                color: '#facc15', 
                fontSize: '13px', 
                fontWeight: 600,
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}>
                {user.team_name}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="logout-btn"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
