import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './CTFHeader.css';

function Header() {

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
    <header className="header">
      <div className="header-content">
        <div className="header-logo">
          <h1>Cyber CTF</h1>
        </div>
        <nav className="header-nav">
          <a href="challenge" className="nav-link">Problems</a>
          <a href="leaderboard" className="nav-link">Leaderboard</a>
          <button
              onClick={handleLogout}
              className="logout-btn"
              style={{
                padding: '8px 16px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid #ef4444',
                borderRadius: '8px',
                color: '#ef4444',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#ef4444';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                e.target.style.color = '#ef4444';
              }}
            >
              Logout
            </button>
        </nav>
      </div>
    </header>
  );
}

export default Header;
