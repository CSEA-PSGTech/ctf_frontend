import { useState, useEffect } from 'react';
import {
	getCategoriesAdmin,
	deleteCategoryAdmin,
	getQuestionsAdmin,
	deleteQuestionAdmin
} from '../../api';

function ViewPage({ onEditCategory, onEditQuestion, categories: propCategories, questions: propQuestions, refreshData }) {
	const [categories, setCategories] = useState(propCategories || []);
	const [questionsByCategory, setQuestionsByCategory] = useState({});
	const [selectedCategory, setSelectedCategory] = useState('');
	const [loading, setLoading] = useState(false);
	const [actionMessage, setActionMessage] = useState('');
	const [actionError, setActionError] = useState('');

	const groupQuestions = (ques) => {
		const grouped = {};
		ques.forEach(q => {
			const catName = q.categoryId?.name || q.category || 'Uncategorized';
			if (!grouped[catName]) grouped[catName] = [];
			grouped[catName].push(q);
		});
		return grouped;
	};

	useEffect(() => {
		if (propCategories && propCategories.length > 0) {
			setCategories(propCategories);
			if (!selectedCategory) {
				setSelectedCategory(propCategories[0].name);
			}
		}
		if (propQuestions) {
			setQuestionsByCategory(groupQuestions(propQuestions));
		}
	}, [propCategories, propQuestions]);

	const loadData = async () => {
		try {
			setLoading(true);
			const [catRes, quesRes] = await Promise.all([
				getCategoriesAdmin(),
				getQuestionsAdmin()
			]);
			const cats = catRes?.data || catRes || [];
			const ques = quesRes?.data || quesRes || [];

			setCategories(cats);
			if (!selectedCategory && cats.length > 0) {
				setSelectedCategory(cats[0].name);
			}
			setQuestionsByCategory(groupQuestions(ques));
		} catch (err) {
			// Silent fail
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteCategory = async (category) => {
		const catObj = categories.find(c => c.name === category);
		if (!catObj) return;

		const count = questionsByCategory[category]?.length || 0;
		if (count > 0) {
			if (!window.confirm(`Category "${category}" has ${count} challenges linked to it. Are you sure you want to delete it?`)) {
				return;
			}
		} else {
			if (!window.confirm(`Delete category "${category}"?`)) return;
		}

		try {
			await deleteCategoryAdmin(catObj._id);
			setActionMessage(`Category "${category}" deleted successfully.`);
			if (refreshData) refreshData();
			else loadData();
			setTimeout(() => setActionMessage(''), 3000);
		} catch (err) {
			setActionError(err.response?.data?.message || 'Failed to delete category (questions exist).');
			setTimeout(() => setActionError(''), 4000);
		}
	};

	const handleDeleteQuestion = async (question) => {
		if (window.confirm(`Delete challenge "${question.title}"? This cannot be undone.`)) {
			try {
				await deleteQuestionAdmin(question._id);
				setActionMessage(`Challenge "${question.title}" deleted successfully.`);
				if (refreshData) refreshData();
				else loadData();
				setTimeout(() => setActionMessage(''), 3000);
			} catch (err) {
				setActionError(err.response?.data?.message || 'Failed to delete challenge.');
				setTimeout(() => setActionError(''), 4000);
			}
		}
	};

	const totalQuestions = Object.values(questionsByCategory).reduce((acc, list) => acc + list.length, 0);

	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
			{/* Overview Quick Stats Card */}
			<div className="golden-admin-card">
				<div className="card-heading-row">
					<div>
						<h2>ARENA OVERVIEW & METRICS</h2>
						<p>Current distribution of categories and live challenges in the CTF arena.</p>
					</div>
					<span className="cinema-badge badge-gold">STAGE STATUS: LIVE</span>
				</div>

				<div className="admin-grid-3">
					<div className="cinema-list-item" style={{ padding: '20px' }}>
						<div>
							<span style={{ fontSize: '11px', color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '2px', display: 'block' }}>
								Total Genres
							</span>
							<span style={{ fontSize: '28px', fontWeight: '800', color: '#facc15', fontFamily: 'Cinzel, serif' }}>
								{categories.length}
							</span>
						</div>
						<span style={{ fontSize: '28px' }}></span>
					</div>

					<div className="cinema-list-item" style={{ padding: '20px' }}>
						<div>
							<span style={{ fontSize: '11px', color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '2px', display: 'block' }}>
								Total Challenges
							</span>
							<span style={{ fontSize: '28px', fontWeight: '800', color: '#facc15', fontFamily: 'Cinzel, serif' }}>
								{totalQuestions}
							</span>
						</div>
						<span style={{ fontSize: '28px' }}></span>
					</div>

					<div className="cinema-list-item" style={{ padding: '20px' }}>
						<div>
							<span style={{ fontSize: '11px', color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '2px', display: 'block' }}>
								Difficulty Model
							</span>
							<span style={{ fontSize: '16px', fontWeight: '700', color: '#4ade80', display: 'block', marginTop: '4px' }}>
								Universal Questions
							</span>
							<span style={{ fontSize: '11px', color: '#78716c' }}>
								Split Leaderboards (Beg / Int)
							</span>
						</div>
						<span style={{ fontSize: '28px' }}></span>
					</div>
				</div>

				{actionMessage && (
					<div className="admin-banner success" style={{ marginTop: '20px' }}>
						
						<span>{actionMessage}</span>
					</div>
				)}

				{actionError && (
					<div className="admin-banner error" style={{ marginTop: '20px' }}>
						
						<span>{actionError}</span>
					</div>
				)}
			</div>

			{/* Questions by Category Section */}
			<div className="golden-admin-card">
				<div className="card-heading-row">
					<div>
						<h2>CHALLENGES BY CATEGORY</h2>
						<p>Inspect, update, or remove challenges in each genre.</p>
					</div>
					<div style={{ minWidth: '220px' }}>
						<select
							className="admin-select"
							value={selectedCategory}
							onChange={(e) => setSelectedCategory(e.target.value)}
						>
							{categories.map((cat) => (
								<option key={cat._id} value={cat.name}>
									{cat.name} ({questionsByCategory[cat.name]?.length || 0})
								</option>
							))}
						</select>
					</div>
				</div>

				{!selectedCategory || !questionsByCategory[selectedCategory] || questionsByCategory[selectedCategory].length === 0 ? (
					<div className="cinema-empty-state">
						<span></span>
						<p>No challenges uploaded in "{selectedCategory}" yet.</p>
					</div>
				) : (
					<div className="cinema-list-wrapper">
						{questionsByCategory[selectedCategory].map((question) => (
							<div key={question._id} className="cinema-list-item">
								<div className="cinema-item-info">
									<span className="cinema-badge badge-gold">{question.point || question.points || 0} PTS</span>
									<span className="cinema-badge badge-year">YR {question.year}</span>
									<span className="cinema-badge badge-cat">{(question.level || 'easy').toUpperCase()}</span>
									<span className="cinema-item-title">{question.title}</span>
								</div>

								<div className="cinema-item-actions">
									<button
										className="cinema-action-icon-btn edit"
										onClick={() => onEditQuestion(selectedCategory, question)}
										title="Edit Challenge"
									>
										Edit
									</button>
									<button
										className="cinema-action-icon-btn delete"
										onClick={() => handleDeleteQuestion(question)}
										title="Delete Challenge"
									>
										Delete
									</button>
								</div>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Categories Quick List Card */}
			<div className="golden-admin-card">
				<div className="card-heading-row">
					<div>
						<h2>ACTIVE GENRES / CATEGORIES ({categories.length})</h2>
						<p>Quick management for CTF categories.</p>
					</div>
				</div>

				{categories.length === 0 ? (
					<div className="cinema-empty-state">
						<span></span>
						<p>No categories found.</p>
					</div>
				) : (
					<div className="cinema-list-wrapper">
						{categories.map((cat) => (
							<div key={cat._id} className="cinema-list-item">
								<div className="cinema-item-info">
									<span className="cinema-badge badge-cat">GENRE</span>
									<span className="cinema-item-title">{cat.name}</span>
									<span style={{ fontSize: '12px', color: '#a8a29e' }}>
										({questionsByCategory[cat.name]?.length || 0} questions)
									</span>
								</div>
								<div className="cinema-item-actions">
									<button
										className="cinema-action-icon-btn edit"
										onClick={() => onEditCategory(cat)}
										title="Edit Category"
									>
										Edit
									</button>
									<button
										className="cinema-action-icon-btn delete"
										onClick={() => handleDeleteCategory(cat.name)}
										title="Delete Category"
									>
										Delete
									</button>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

export default ViewPage;
