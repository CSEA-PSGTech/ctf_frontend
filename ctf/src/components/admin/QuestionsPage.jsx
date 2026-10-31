import { useState, useEffect } from 'react';
import { getCategoriesAdmin, createQuestionAdmin } from '../../api.js';

function QuestionsPage({ categories: propCategories, refreshData }) {
	const [categories, setCategories] = useState(propCategories || []);
	const [formData, setFormData] = useState({
		category: '',
		title: '',
		link: '',
		description: '',
		answer: 'cyberseige{}',
		point: '100',
		year: '1',
		level: 'easy',
		hint: ''
	});
	const [loading, setLoading] = useState(false);
	const [status, setStatus] = useState('');
	const [error, setError] = useState('');

	// Fetch categories from backend if not passed as prop
	const fetchCategories = async () => {
		try {
			const res = await getCategoriesAdmin();
			const cats = res?.data || res || [];
			if (Array.isArray(cats)) {
				setCategories(cats);
				if (!formData.category && cats.length > 0) {
					setFormData(prev => ({ ...prev, category: cats[0].name }));
				}
			}
		} catch (err) {
			// Silent fail
		}
	};

	useEffect(() => {
		if (propCategories && propCategories.length > 0) {
			setCategories(propCategories);
			if (!formData.category) {
				setFormData(prev => ({ ...prev, category: propCategories[0].name }));
			}
		} else {
			fetchCategories();
		}
	}, [propCategories]);

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
	};

	const handleCreate = async (e) => {
		e.preventDefault();
		setStatus('');
		setError('');

		const { category, title, description, answer, point, year } = formData;
		let formattedAnswer = (answer || '').trim();
		// If user entered or pasted without cyberseige{...}, wrap it automatically
		if (!/^cyberseige\{.*\}$/i.test(formattedAnswer)) {
			const inner = formattedAnswer.replace(/^cyberseige\{?/i, '').replace(/\}$/, '').trim();
			formattedAnswer = `cyberseige{${inner}}`;
		}

		if (!category || !title || !description || !formattedAnswer || formattedAnswer === 'cyberseige{}' || !point || !year) {
			setError('Please fill all required challenge fields and provide the secret flag inside cyberseige{...}.');
			return;
		}

		const payload = {
			category: category.trim(),
			title: title.trim(),
			description: description.trim(),
			answer: formattedAnswer,
			point: Number(point),
			link: (formData.link || '').trim(),
			year: Number(year),
			level: formData.level || 'easy',
			hint: (formData.hint || '').trim()
		};

		try {
			setLoading(true);
			const res = await createQuestionAdmin(payload);
			if (res?.status === 201 || res?.statusCode === 201 || res?.success || res?.data) {
				setStatus(`🎬 Challenge "${payload.title}" (${(payload.level).toUpperCase()}) published successfully with flag "${formattedAnswer}"!`);
				setFormData({
					category: categories[0]?.name || '',
					title: '',
					link: '',
					description: '',
					answer: 'cyberseige{}',
					point: '100',
					year: '1',
					level: 'easy',
					hint: ''
				});
				if (refreshData) refreshData();
			} else {
				setError(res?.data?.message || res?.message || 'Failed to upload question.');
			}
		} catch (err) {
			setError(err.response?.data?.message || err.message || 'Failed to upload question.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="golden-admin-card">
			<div className="card-heading-row">
				<div>
					<h2>UPLOAD CTF CHALLENGE</h2>
					<p>Craft and publish challenges for all contestants across both leagues.</p>
				</div>
				<span className="cinema-badge badge-gold">DIRECTOR STUDIO</span>
			</div>

			{status && (
				<div className="admin-banner success">
					
					<span>{status}</span>
				</div>
			)}

			{error && (
				<div className="admin-banner error">
					
					<span>{error}</span>
				</div>
			)}

			<form className="admin-form" onSubmit={handleCreate}>
				{/* Row 1: Category & Title */}
				<div className="admin-grid-2">
					<div className="admin-field">
						<label className="admin-label" htmlFor="category">
							CATEGORY *
							<span className="label-tag">Challenge Genre</span>
						</label>
						<select
							id="category"
							name="category"
							className="admin-select"
							value={formData.category}
							onChange={handleInputChange}
							disabled={loading}
							required
						>
							{categories.length === 0 && <option value="">No categories found (Create one first)</option>}
							{categories.map((cat) => (
								<option key={cat._id} value={cat.name}>
									{cat.name}
								</option>
							))}
						</select>
					</div>

					<div className="admin-field">
						<label className="admin-label" htmlFor="title">
							CHALLENGE TITLE *
							<span className="label-tag">e.g. Master's Secret Cipher</span>
						</label>
						<input
							type="text"
							id="title"
							name="title"
							className="admin-input"
							value={formData.title}
							onChange={handleInputChange}
							placeholder="Enter challenge title"
							disabled={loading}
							required
						/>
					</div>
				</div>

				{/* Row 2: Points, Year & Level */}
				<div className="admin-grid-3">
					<div className="admin-field">
						<label className="admin-label" htmlFor="point">
							POINTS *
							<span className="label-tag">Score value</span>
						</label>
						<input
							type="number"
							id="point"
							name="point"
							className="admin-input"
							value={formData.point}
							onChange={handleInputChange}
							placeholder="e.g. 100"
							min="10"
							disabled={loading}
							required
						/>
					</div>

					<div className="admin-field">
						<label className="admin-label" htmlFor="year">
							TARGET YEAR *
							<span className="label-tag">1 to 4</span>
						</label>
						<select
							id="year"
							name="year"
							className="admin-select"
							value={formData.year}
							onChange={handleInputChange}
							disabled={loading}
							required
						>
							<option value="1">Year 1</option>
							<option value="2">Year 2</option>
							<option value="3">Year 3</option>
							<option value="4">Year 4</option>
						</select>
					</div>

					<div className="admin-field">
						<label className="admin-label" htmlFor="level">
							QUESTION LEVEL *
							<span className="label-tag">Easy or Medium</span>
						</label>
						<select
							id="level"
							name="level"
							className="admin-select"
							value={formData.level}
							onChange={handleInputChange}
							disabled={loading}
							required
						>
							<option value="easy">Easy</option>
							<option value="medium">Medium</option>
						</select>
					</div>
				</div>

				{/* Row 3: Flag / Answer */}
				<div className="admin-field">
					<label className="admin-label" htmlFor="answer">
						SECRET FLAG / CORRECT ANSWER *
						<span className="label-tag">Default wrapper: cyberseige&#123;flag&#125;</span>
					</label>
					<input
						type="text"
						id="answer"
						name="answer"
						className="admin-input admin-flag-input"
						value={formData.answer}
						onChange={handleInputChange}
						placeholder="cyberseige{your_flag_here}"
						disabled={loading}
						required
					/>
				</div>

				{/* Row 4: External Resource Link */}
				<div className="admin-field">
					<label className="admin-label" htmlFor="link">
						EXTERNAL ASSET / DRIVE / WEB LINK (OPTIONAL)
						<span className="label-tag">Downloadable file or challenge URL</span>
					</label>
					<input
						type="url"
						id="link"
						name="link"
						className="admin-input"
						value={formData.link}
						onChange={handleInputChange}
						placeholder="https://drive.google.com/... or https://target-challenge.com"
						disabled={loading}
					/>
				</div>

				{/* Row 5: Challenge Description */}
				<div className="admin-field">
					<label className="admin-label" htmlFor="description">
						CHALLENGE DESCRIPTION & BRIEF *
						<span className="label-tag">Instructions for competitors</span>
					</label>
					<textarea
						id="description"
						name="description"
						className="admin-textarea"
						value={formData.description}
						onChange={handleInputChange}
						placeholder="Describe the objective, scenario, or encrypted ciphertext..."
						rows="4"
						disabled={loading}
						required
					/>
				</div>

				{/* Row 6: Hint */}
				<div className="admin-field">
					<label className="admin-label" htmlFor="hint">
						DIRECTOR'S HINT (OPTIONAL)
						<span className="label-tag">Shown when player requests a clue</span>
					</label>
					<input
						type="text"
						id="hint"
						name="hint"
						className="admin-input"
						value={formData.hint}
						onChange={handleInputChange}
						placeholder="e.g. Look closely at the image headers or base64 padding."
						disabled={loading}
					/>
				</div>

				{/* Submit Button */}
				<div style={{ marginTop: '10px' }}>
					<button type="submit" className="admin-gold-btn" disabled={loading}>
						{loading ? 'Publishing Challenge...' : 'Publish Challenge to Arena'}
					</button>
				</div>
			</form>
		</div>
	);
}

export default QuestionsPage;
