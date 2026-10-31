import { useState, useEffect } from 'react';
import { getUsersAdmin, updateUserAdmin, deleteUserAdmin, resetUserScoreAdmin } from '../../api.js';

function UsersPage() {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [difficultyFilter, setDifficultyFilter] = useState('all');
	const [status, setStatus] = useState('');
	const [error, setError] = useState('');

	// Edit state
	const [editingUser, setEditingUser] = useState(null);
	const [editFormData, setEditFormData] = useState({
		email: '',
		team_name: '',
		year: 1,
		difficulty: 'beginner',
		point: 0,
		solved_no: 0
	});
	const [actionLoading, setActionLoading] = useState(false);

	const fetchUsers = async () => {
		try {
			setLoading(true);
			setError('');
			const res = await getUsersAdmin();
			if (res?.data) {
				setUsers(Array.isArray(res.data) ? res.data : []);
			}
		} catch (err) {
			setError(err.response?.data?.message || err.message || 'Failed to fetch users');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers();
	}, []);

	const handleStartEdit = (user) => {
		setEditingUser(user);
		setEditFormData({
			email: user.email || '',
			team_name: user.team_name || '',
			year: user.year || 1,
			difficulty: user.difficulty || 'beginner',
			point: user.point || 0,
			solved_no: user.solved_no || 0
		});
		setStatus('');
		setError('');
	};

	const handleCancelEdit = () => {
		setEditingUser(null);
	};

	const handleSaveEdit = async (e) => {
		e.preventDefault();
		if (!editingUser) return;
		setActionLoading(true);
		setStatus('');
		setError('');

		try {
			const res = await updateUserAdmin(editingUser._id, editFormData);
			if (res?.data || res?.success || res?.statusCode === 200) {
				setStatus(`User "${editFormData.team_name}" updated successfully!`);
				setEditingUser(null);
				fetchUsers();
			} else {
				setError(res?.message || 'Failed to update user');
			}
		} catch (err) {
			setError(err.response?.data?.message || err.message || 'Error updating user');
		} finally {
			setActionLoading(false);
		}
	};

	const handleDeleteUser = async (user) => {
		if (window.confirm(`Are you sure you want to delete team "${user.team_name}" (${user.email})? This action cannot be undone.`)) {
			setActionLoading(true);
			setStatus('');
			setError('');
			try {
				await deleteUserAdmin(user._id);
				setStatus(`Team "${user.team_name}" deleted.`);
				fetchUsers();
			} catch (err) {
				setError(err.response?.data?.message || err.message || 'Failed to delete user');
			} finally {
				setActionLoading(false);
			}
		}
	};

	const handleResetScore = async (user) => {
		if (window.confirm(`Reset score and solved count to 0 for "${user.team_name}"?`)) {
			setActionLoading(true);
			setStatus('');
			setError('');
			try {
				await resetUserScoreAdmin(user._id);
				setStatus(`Score reset for "${user.team_name}".`);
				fetchUsers();
			} catch (err) {
				setError(err.response?.data?.message || err.message || 'Failed to reset score');
			} finally {
				setActionLoading(false);
			}
		}
	};

	// Filter users
	const filteredUsers = users.filter((user) => {
		const matchesSearch =
			(user.team_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
			(user.email || '').toLowerCase().includes(searchTerm.toLowerCase());
		const matchesDiff =
			difficultyFilter === 'all' || user.difficulty === difficultyFilter;
		return matchesSearch && matchesDiff;
	});

	// Quick metrics
	const totalUsers = users.length;
	const beginnerCount = users.filter((u) => u.difficulty === 'beginner').length;
	const intermediateCount = users.filter((u) => u.difficulty === 'intermediate').length;
	const totalSolves = users.reduce((acc, u) => acc + (u.solved_no || 0), 0);

	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
			{/* Overview / Stats Card */}
			<div className="golden-admin-card">
				<div className="card-heading-row">
					<div>
						<h2>PARTICIPANT USER MANAGEMENT</h2>
						<p>View, update, adjust scores, or remove registered CTF participants.</p>
					</div>
					<span className="cinema-badge badge-gold">REGISTRATION CONTROL</span>
				</div>

				<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginTop: '16px' }}>
					<div style={{ background: 'rgba(234, 179, 8, 0.06)', border: '1px solid rgba(234, 179, 8, 0.2)', borderRadius: '8px', padding: '16px' }}>
						<div style={{ color: '#a8a29e', fontSize: '12px', fontWeight: 600, letterSpacing: '1px' }}>TOTAL PARTICIPANTS</div>
						<div style={{ color: '#facc15', fontSize: '28px', fontWeight: 800, marginTop: '6px' }}>{totalUsers}</div>
					</div>
					<div style={{ background: 'rgba(59, 130, 246, 0.06)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '8px', padding: '16px' }}>
						<div style={{ color: '#93c5fd', fontSize: '12px', fontWeight: 600, letterSpacing: '1px' }}>BEGINNER LEAGUE</div>
						<div style={{ color: '#60a5fa', fontSize: '28px', fontWeight: 800, marginTop: '6px' }}>{beginnerCount}</div>
					</div>
					<div style={{ background: 'rgba(234, 88, 12, 0.06)', border: '1px solid rgba(234, 88, 12, 0.2)', borderRadius: '8px', padding: '16px' }}>
						<div style={{ color: '#fdba74', fontSize: '12px', fontWeight: 600, letterSpacing: '1px' }}>INTERMEDIATE LEAGUE</div>
						<div style={{ color: '#f97316', fontSize: '28px', fontWeight: 800, marginTop: '6px' }}>{intermediateCount}</div>
					</div>
					<div style={{ background: 'rgba(34, 197, 94, 0.06)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: '8px', padding: '16px' }}>
						<div style={{ color: '#86efac', fontSize: '12px', fontWeight: 600, letterSpacing: '1px' }}>TOTAL SOLVES LOGGED</div>
						<div style={{ color: '#4ade80', fontSize: '28px', fontWeight: 800, marginTop: '6px' }}>{totalSolves}</div>
					</div>
				</div>

				{status && (
					<div className="admin-banner success" style={{ marginTop: '20px' }}>
						<span>{status}</span>
					</div>
				)}

				{error && (
					<div className="admin-banner error" style={{ marginTop: '20px' }}>
						<span>{error}</span>
					</div>
				)}
			</div>

			{/* Edit User Modal / Card */}
			{editingUser && (
				<div className="golden-admin-card" style={{ border: '1px solid rgba(234, 179, 8, 0.6)' }}>
					<div className="card-heading-row">
						<div>
							<h2>EDIT USER: {editingUser.team_name}</h2>
							<p>Update credentials, score, solved questions counter, or assign difficulty league.</p>
						</div>
						<button
							className="cinema-action-icon-btn"
							onClick={handleCancelEdit}
							style={{ padding: '6px 14px' }}
						>
							Cancel
						</button>
					</div>

					<form className="admin-form" onSubmit={handleSaveEdit} style={{ marginTop: '16px' }}>
						<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
							<div className="admin-field">
								<label className="admin-label">TEAM NAME *</label>
								<input
									type="text"
									className="admin-input"
									value={editFormData.team_name}
									onChange={(e) => setEditFormData({ ...editFormData, team_name: e.target.value })}
									required
								/>
							</div>

							<div className="admin-field">
								<label className="admin-label">EMAIL *</label>
								<input
									type="email"
									className="admin-input"
									value={editFormData.email}
									onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
									required
								/>
							</div>

							<div className="admin-field">
								<label className="admin-label">YEAR *</label>
								<select
									className="admin-select"
									value={editFormData.year}
									onChange={(e) => setEditFormData({ ...editFormData, year: parseInt(e.target.value) })}
								>
									<option value={1}>Year 1</option>
									<option value={2}>Year 2</option>
									<option value={3}>Year 3</option>
									<option value={4}>Year 4</option>
								</select>
							</div>

							<div className="admin-field">
								<label className="admin-label">DIFFICULTY LEAGUE *</label>
								<select
									className="admin-select"
									value={editFormData.difficulty}
									onChange={(e) => setEditFormData({ ...editFormData, difficulty: e.target.value })}
								>
									<option value="beginner">Beginner</option>
									<option value="intermediate">Intermediate</option>
								</select>
							</div>

							<div className="admin-field">
								<label className="admin-label">POINTS (SCORE)</label>
								<input
									type="number"
									className="admin-input"
									value={editFormData.point}
									onChange={(e) => setEditFormData({ ...editFormData, point: parseInt(e.target.value) || 0 })}
								/>
							</div>

							<div className="admin-field">
								<label className="admin-label">QUESTIONS SOLVED</label>
								<input
									type="number"
									className="admin-input"
									value={editFormData.solved_no}
									onChange={(e) => setEditFormData({ ...editFormData, solved_no: parseInt(e.target.value) || 0 })}
								/>
							</div>
						</div>

						<div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
							<button type="submit" className="admin-gold-btn" disabled={actionLoading}>
								{actionLoading ? 'Saving Changes...' : 'Save User Changes'}
							</button>
							<button
								type="button"
								className="cinema-action-icon-btn"
								onClick={handleCancelEdit}
								style={{ padding: '10px 20px' }}
							>
								Cancel
							</button>
						</div>
					</form>
				</div>
			)}

			{/* User Table Card */}
			<div className="golden-admin-card">
				<div className="card-heading-row">
					<div>
						<h2>ALL REGISTERED PARTICIPANTS ({filteredUsers.length})</h2>
						<p>Search by team or email, filter by league, adjust scores, or manage accounts.</p>
					</div>
					<button
						className="cinema-action-icon-btn"
						onClick={fetchUsers}
						disabled={loading}
						style={{ padding: '6px 14px' }}
					>
						{loading ? 'Refreshing...' : '↻ Refresh List'}
					</button>
				</div>

				{/* Search & Filter Controls */}
				<div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', margin: '20px 0' }}>
					<div style={{ flex: '1 1 280px' }}>
						<input
							type="text"
							className="admin-input"
							placeholder="Search by team name or email..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
					<div style={{ width: '200px' }}>
						<select
							className="admin-select"
							value={difficultyFilter}
							onChange={(e) => setDifficultyFilter(e.target.value)}
						>
							<option value="all">All Leagues</option>
							<option value="beginner">Beginner Only</option>
							<option value="intermediate">Intermediate Only</option>
						</select>
					</div>
				</div>

				{loading ? (
					<div className="cinema-empty-state">
						<p>Loading participants list...</p>
					</div>
				) : filteredUsers.length === 0 ? (
					<div className="cinema-empty-state">
						<p>No participants matched your search criteria.</p>
					</div>
				) : (
					<div style={{ overflowX: 'auto', marginTop: '10px' }}>
						<table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
							<thead>
								<tr style={{ borderBottom: '1px solid rgba(234, 179, 8, 0.25)', color: '#d6d3d1' }}>
									<th style={{ padding: '12px 14px', fontWeight: 600 }}>TEAM NAME</th>
									<th style={{ padding: '12px 14px', fontWeight: 600 }}>EMAIL</th>
									<th style={{ padding: '12px 14px', fontWeight: 600 }}>YEAR</th>
									<th style={{ padding: '12px 14px', fontWeight: 600 }}>LEAGUE</th>
									<th style={{ padding: '12px 14px', fontWeight: 600 }}>POINTS</th>
									<th style={{ padding: '12px 14px', fontWeight: 600 }}>SOLVED</th>
									<th style={{ padding: '12px 14px', fontWeight: 600, textAlign: 'right' }}>ACTIONS</th>
								</tr>
							</thead>
							<tbody>
								{filteredUsers.map((user) => (
									<tr
										key={user._id}
										style={{
											borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
											transition: 'background 0.2s ease'
										}}
									>
										<td style={{ padding: '14px', fontWeight: 700, color: '#fef08a' }}>
											{user.team_name}
										</td>
										<td style={{ padding: '14px', color: '#e5e7eb' }}>
											{user.email}
										</td>
										<td style={{ padding: '14px', color: '#9ca3af' }}>
											Year {user.year}
										</td>
										<td style={{ padding: '14px' }}>
											<span
												className={`cinema-badge ${
													user.difficulty === 'intermediate' ? 'badge-gold' : 'badge-cat'
												}`}
											>
												{user.difficulty?.toUpperCase()}
											</span>
										</td>
										<td style={{ padding: '14px', fontWeight: 700, color: '#facc15' }}>
											{user.point || 0}
										</td>
										<td style={{ padding: '14px', fontWeight: 600, color: '#4ade80' }}>
											{user.solved_no || 0}
										</td>
										<td style={{ padding: '14px', textAlign: 'right' }}>
											<div style={{ display: 'inline-flex', gap: '8px' }}>
												<button
													className="cinema-action-icon-btn edit"
													onClick={() => handleStartEdit(user)}
													title="Edit User"
												>
													Edit
												</button>
												<button
													className="cinema-action-icon-btn"
													onClick={() => handleResetScore(user)}
													title="Reset Points and Solved Count"
													style={{ color: '#fb923c', borderColor: 'rgba(251, 146, 60, 0.3)' }}
												>
													Reset
												</button>
												<button
													className="cinema-action-icon-btn delete"
													onClick={() => handleDeleteUser(user)}
													title="Delete User"
												>
													Delete
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
}

export default UsersPage;

