import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LEFT_POSTERS, RIGHT_POSTERS } from '../postersData';
import './LoginPage.css';

export default function ArenaLogin() {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberTeam, setRememberTeam] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    team_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    year: '',
    difficulty: 'beginner'
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isLogin) {
        if (!formData.team_name || !formData.password) {
          setError('Please enter your team name and password.');
          setIsLoading(false);
          return;
        }

        const result = await login({
          team_name: formData.team_name.trim(),
          password: formData.password
        });

        if (result.success) {
          navigate(result.user.field === 'admin' ? '/admin' : '/challenge');
        } else {
          setError(result.message || 'Login failed. Please check credentials.');
        }
      } else {
        if (!formData.email || !formData.team_name || !formData.password || !formData.confirmPassword || !formData.year || !formData.difficulty) {
          setError('Please fill all required audition fields.');
          setIsLoading(false);
          return;
        }

        if (!formData.email.endsWith('@psgtech.ac.in')) {
          setError('Please use your official PSG Tech email (@psgtech.ac.in)');
          setIsLoading(false);
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match. Re-take your password cut!');
          setIsLoading(false);
          return;
        }

        const result = await signup({
          email: formData.email.trim(),
          team_name: formData.team_name.trim(),
          password: formData.password,
          year: parseInt(formData.year, 10),
          difficulty: formData.difficulty
        });

        if (result.success) {
          navigate('/challenge');
        } else {
          setError(result.message || 'Registration failed. Try a different team name.');
        }
      }
    } catch (err) {
      setError('Connection cut! Please check your network or try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ team_name: '', email: '', password: '', confirmPassword: '', year: '', difficulty: 'beginner' });
    setError('');
  };

  // Helper to render movie posters with real images in film reel
  const renderFilmFrames = (posters) => {
    return posters.map((p, idx) => (
      <div className="film-frame" key={`${p.title}-${idx}`}>
        <div className="sprocket-track left-sprocket">
          <span className="hole" />
          <span className="hole" />
          <span className="hole" />
        </div>
        <div className="poster-card">
          {p.image ? (
            <img
              src={p.image}
              alt={p.title}
              className="poster-real-img"
              loading="lazy"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ) : null}
          <div className="poster-overlay-gradient" />
          <div className="poster-badge" style={{ borderColor: p.accent, color: p.accent }}>
            {p.year}
          </div>
          <div className="poster-content">
            <h4 className="poster-title" style={{ textShadow: `0 0 10px ${p.accent}` }}>
              {p.title}
            </h4>
            <span className="poster-star">{p.star}</span>
          </div>
          <div className="film-strip-code">35MM • RAW</div>
        </div>
        <div className="sprocket-track right-sprocket">
          <span className="hole" />
          <span className="hole" />
          <span className="hole" />
        </div>
      </div>
    ));
  };

  return (
    <div className="cinema-arena">
      {/* Ambient Spotlight from Top Clapperboard */}
      <div className="spotlight-cone" />

      {/* LEFT FILM STRIP (Scrolls UP continuously) */}
      <aside className="film-reel-column reel-left" aria-hidden="true">
        <div className="film-strip-track track-scroll-up">
          {renderFilmFrames(LEFT_POSTERS)}
          {renderFilmFrames(LEFT_POSTERS)}
        </div>
      </aside>

      {/* MAIN CINEMA STAGE (Center Login Card) */}
      <main className="cinema-center-stage">
        {/* Animated Clapperboard Header */}
        <header className="cinema-branding">
          <div className="clapperboard-wrapper">
            <div className="clapper-stick top-stick">
              <span className="zebra-stripe" />
              <span className="zebra-stripe" />
              <span className="zebra-stripe" />
              <span className="zebra-stripe" />
              <span className="zebra-stripe" />
            </div>
            <div className="clapper-body">
              <div className="clapper-lines">
                <span className="clap-line" />
                <span className="clap-line" />
              </div>
            </div>
          </div>

          <h1 className="cinema-title">KOLLYWOOD CTF</h1>
        </header>

        {/* The Golden Box Card */}
        <section className="golden-cinema-card">
          <div className="card-top-header">
            <h2 className="card-title">{isLogin ? 'TEAM LOGIN' : 'TEAM REGISTRATION'}</h2>
            <div className="gold-accent-line" />
          </div>

          {error && (
            <div className="cinema-error-banner" role="alert">
              
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="cinema-form">
            {/* Team Name */}
            <div className="cinema-field">
              <label className="cinema-label" htmlFor="team_name">
                {isLogin ? 'TEAM NAME / EMAIL' : 'TEAM NAME'}
              </label>
              <input
                id="team_name"
                type="text"
                name="team_name"
                value={formData.team_name}
                onChange={handleInputChange}
                placeholder="e.g. team_mithran"
                className="cinema-input"
                autoComplete="username"
                required
              />
            </div>

            {/* Email (Signup only) */}
            {!isLogin && (
              <div className="cinema-field">
                <label className="cinema-label" htmlFor="email">
                  OFFICIAL EMAIL (@psgtech.ac.in)
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="e.g. 22l101@psgtech.ac.in"
                  className="cinema-input"
                  autoComplete="email"
                  required
                />
              </div>
            )}

            {/* Year Selection (Signup only) */}
            {!isLogin && (
              <div className="cinema-field">
                <label className="cinema-label" htmlFor="year">
                  COLLEGE YEAR
                </label>
                <select
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  className="cinema-input cinema-select"
                  required
                >
                  <option value="">Select Audition Year</option>
                  <option value="1">1st Year (Junior Casting)</option>
                  <option value="2">2nd Year (Cadet)</option>
                  <option value="3">3rd Year (Senior Protagonist)</option>
                  <option value="4">4th Year (Master Mind)</option>
                </select>
              </div>
            )}

            {/* Difficulty Level Selection (Signup only) */}
            {!isLogin && (
              <div className="cinema-field">
                <label className="cinema-label" htmlFor="difficulty">
                  COMPETITION LEAGUE / DIFFICULTY
                </label>
                <select
                  id="difficulty"
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  className="cinema-input cinema-select"
                  required
                >
                  <option value="beginner">Beginner (First-time CTF / Foundational)</option>
                  <option value="intermediate">Intermediate (Experienced CTF Challenger)</option>
                </select>
              </div>
            )}

            {/* Password */}
            <div className="cinema-field">
              <label className="cinema-label" htmlFor="password">
                PASSWORD
              </label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="cinema-input has-toggle"
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  required
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password (Signup only) */}
            {!isLogin && (
              <div className="cinema-field">
                <label className="cinema-label" htmlFor="confirmPassword">
                  CONFIRM PASSWORD
                </label>
                <div className="password-input-wrapper">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="cinema-input has-toggle"
                    autoComplete="new-password"
                    required
                  />
                  <button
                    type="button"
                    className="toggle-password-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Remember Me & Help links (Login mode) */}
            {isLogin && (
              <div className="cinema-options-row">
                <label className="cinema-checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberTeam}
                    onChange={(e) => setRememberTeam(e.target.checked)}
                    className="custom-checkbox"
                  />
                  <span className="checkbox-custom-box">✓</span>
                  <span>Remember this team</span>
                </label>
                <span className="forgot-password-link" title="Contact CTF Admins">
                  Forgot password?
                </span>
              </div>
            )}

            {/* ACTION! Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`action-btn-gold ${isLoading ? 'loading' : ''}`}
            >
              {isLoading ? (
                <span className="btn-spinner">ROLLING...</span>
              ) : isLogin ? (
                'ACTION!'
              ) : (
                'ROLL CAMERA! (REGISTER)'
              )}
            </button>

            {/* Divider */}
            <div className="cinema-divider">
              <span className="divider-dash" />
              <span className="divider-caption">{isLogin ? 'NEW HERE?' : 'ALREADY CASTED?'}</span>
              <span className="divider-dash" />
            </div>

            {/* Secondary Switch Mode Button */}
            <button
              type="button"
              onClick={toggleMode}
              className="outline-register-btn"
            >
              {isLogin ? 'Register your team' : 'Back to Team Login'}
            </button>
          </form>
        </section>

        {/* Footer Credit Tagline */}
        <footer className="cinema-footer">
          <span>Organised by Cybersecurity Club</span>
          <span className="footer-bullet">•</span>
          <span>Rated U for Unbreakable</span>
        </footer>
      </main>

      {/* RIGHT FILM STRIP (Scrolls DOWN continuously) */}
      <aside className="film-reel-column reel-right" aria-hidden="true">
        <div className="film-strip-track track-scroll-down">
          {renderFilmFrames(RIGHT_POSTERS)}
          {renderFilmFrames(RIGHT_POSTERS)}
        </div>
      </aside>
    </div>
  );
}
