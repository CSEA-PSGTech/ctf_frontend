import React, { useState, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Leaderboard from './pages/Leaderboard.jsx';
import ArenaLogin from './pages/LoginPage.jsx';
import Admin from './pages/Admin.jsx';
import AnswerSolving from './pages/AnswerSolving.jsx';
import ChallengesPage from './pages/Challenge.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LoadingScreen from './components/LoadingScreen.jsx';
import { useAuth } from './context/AuthContext.jsx';

function App() {
	const { isAuthenticated, isAdmin, isLoading } = useAuth();
	const [assetsReady, setAssetsReady] = useState(false);

	const handleLoadingFinished = useCallback(() => {
		setAssetsReady(true);
	}, []);

	// Show loading screen until all assets are preloaded
	if (!assetsReady) {
		return <LoadingScreen onFinished={handleLoadingFinished} />;
	}

	if (isLoading) {
		return <div style={{ minHeight: '100vh', background: '#0a0b10' }}></div>;
	}

	return (
		<Routes>
			{/* Root route → redirects based on login */}
			<Route
				path="/"
				element={
					isAuthenticated() ? (
					isAdmin() ? <Navigate to="/admin" replace /> : <Navigate to="/challenge" replace />
					) : (
					<Navigate to="/login" replace />
					)
					}/>

			{/* Dedicated login route - redirect if already authenticated */}
			<Route 
				path="/login" 
				element={
					isAuthenticated() ? (
						isAdmin() ? <Navigate to="/admin" replace /> : <Navigate to="/challenge" replace />
					) : (
						<ArenaLogin />
					)
				} 
			/>

			{/* User routes */}
			<Route
				path="/challenge"
				element={
					<ProtectedRoute>
						<ChallengesPage />
					</ProtectedRoute>
				}
			/>
			<Route
				path="/challenge/:id"
				element={
					<ProtectedRoute>
						<AnswerSolving />
					</ProtectedRoute>
				}
			/>
			<Route
				path="/leaderboard"
				element={
					<ProtectedRoute>
						<Leaderboard />
					</ProtectedRoute>
				}
			/>

			{/* Admin route (admin-only) */}
			<Route
				path="/admin"
				element={
					<ProtectedRoute adminOnly>
						<Admin />
					</ProtectedRoute>
				}
			/>

			{/* Fallback → redirect to root */}
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
}

export default App;
