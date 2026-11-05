import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import "./LoginPage.css"

export default function ArenaLogin() {
	const navigate = useNavigate();
	const { login, signup } = useAuth();
	const [isLogin, setIsLogin] = useState(true);
	const [formData, setFormData] = useState({
		team_name: '',
		email: '',
		password: '',
		confirmPassword: '',
		year: ''
	});
	const [isHovered, setIsHovered] = useState(false);
	const [error, setError] = useState('');

	const handleInputChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value
		});
	};

	const handleSubmit = async () => {
		setError('');
		
		if (isLogin) {
			// Login logic - backend expects: { team_name, password }
			if (!formData.team_name || !formData.password) {
				setError('Please enter team name and password');
				return;
			}

			const result = await login({ 
				team_name: formData.team_name, 
				password: formData.password 
			});

			if (result.success) {
				// Redirect based on user field
				navigate(result.user.field === 'admin' ? '/admin' : '/leaderboard');
			} else {
				setError(result.message || 'Login failed');
			}
		} else {
			// Signup logic - backend expects: { email, team_name, password, year, difficulty }
			if (!formData.email || !formData.team_name || !formData.password || !formData.confirmPassword || !formData.year) {
				setError('Please fill all fields');
				return;
			}

			// Validate email domain
			if (!formData.email.endsWith('@psgtech.ac.in')) {
				setError('Please use your official PSG Tech email (@psgtech.ac.in)');
				return;
			}

			if (formData.password !== formData.confirmPassword) {
				setError('Passwords do not match');
				return;
			}
			console.log('backend_url', import.meta.env.VITE_BACKEND_URL);
			const result = await signup({
				email: formData.email,
				team_name: formData.team_name,
				password: formData.password,
				year: parseInt(formData.year)
			});

			if (result.success) {
				navigate('/leaderboard');
			} else {
				setError(result.message || 'Registration failed');
			}
		}
	};

	const toggleMode = () => {
		setIsLogin(!isLogin);
		setFormData({ team_name: '', email: '', password: '', confirmPassword: '', year: ''});
		setError('');
	};

	return (
		<div className="arena-container">
			<div
				className={`login-card ${isHovered ? 'hovered' : ''}`}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
			>
				<h1 className="login-title">{isLogin ? 'Enter the Arena' : 'Join the Arena'}</h1>

				{error && (
					<div style={{
						background: 'rgba(239, 68, 68, 0.1)',
						border: '1px solid #ef4444',
						color: '#ef4444',
						padding: '12px',
						borderRadius: '8px',
						marginBottom: '16px',
						fontSize: '14px'
					}}>
						{error}
					</div>
				)}

				<div>
					{/* Team Name */}
					<div className="form-group">
						<label className="form-label">Team Name</label>
						<input
							type="text"
							name="team_name"
							value={formData.team_name}
							onChange={handleInputChange}
							placeholder="your_team_name"
							className="form-input"
						/>
					</div>

					{/* Email only for signup */}
					{!isLogin && (
						<div className="form-group">
							<label className="form-label">Email (@psgtech.ac.in)</label>
							<input
								type="email"
								name="email"
								value={formData.email}
								onChange={handleInputChange}
								placeholder="your.email@psgtech.ac.in"
								className="form-input"
							/>
						</div>
					)}

					{/* Year only for signup */}
					{!isLogin && (
						<>
							<div className="form-group">
								<label className="form-label">Year</label>
								<select
									name="year"
									value={formData.year}
									onChange={handleInputChange}
									className="form-input"
									style={{ cursor: 'pointer' }}
								>
									<option value="">Select Year</option>
									<option value="1">1st Year</option>
									<option value="2">2nd Year</option>
									<option value="3">3rd Year</option>
									<option value="4">4th Year</option>
								</select>
							</div>
						</>
					)}

					{/* Password */}
					<div className="form-group">
						<label className="form-label">Password</label>
						<input
							type="password"
							name="password"
							value={formData.password}
							onChange={handleInputChange}
							placeholder="Enter your password"
							className="form-input"
						/>
					</div>

					{/* Confirm Password for register */}
					{!isLogin && (
						<div className="form-group">
							<label className="form-label">Confirm Password</label>
							<input
								type="password"
								name="confirmPassword"
								value={formData.confirmPassword}
								onChange={handleInputChange}
								placeholder="••••••••"
								className="form-input"
							/>
						</div>
					)}

					{/* Submit Button */}
					<button onClick={handleSubmit} className="sign-in-btn">
						{isLogin ? 'Sign In' : 'Create Account'}
					</button>

					{/* Toggle Login/Register */}
					<p className="register-text">
						{isLogin ? "Don't have an account yet? " : "Already have an account? "}
						<span className="register-link" onClick={toggleMode}>
							{isLogin ? 'Register for free' : 'Sign in here'}
						</span>
					</p>
				</div>
			</div>
		</div>
	);
}
