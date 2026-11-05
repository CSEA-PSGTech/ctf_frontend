import { useState } from 'react';
import { createCategoryAdmin, deleteCategoryAdmin } from '../../api.js';

function CategoriesPage({ categories = [], refreshData, onEditCategory }) {
	const [categoryName, setCategoryName] = useState('');
	const [loading, setLoading] = useState(false);
	const [status, setStatus] = useState('');
	const [error, setError] = useState('');

	const handleCreate = async (e) => {
		e.preventDefault();
		setStatus('');
		setError('');

		if (!categoryName.trim()) {
			setError('Please enter a category name');
			return;
		}

		try {
			setLoading(true);
			const res = await createCategoryAdmin({ 
				name: categoryName.trim()
			});

			if (res?.status === 201 || res?.statusCode === 201 || res?.success || res?.data) {
				setStatus(`Category "${categoryName.trim()}" created successfully!`);
				setCategoryName('');
				if (refreshData) refreshData();
			} else {
				setError(res?.data?.message || res?.message || 'Cannot create category');
			}
		} catch (err) {
			setError(err.response?.data?.message || err.message || 'Failed to create category');
		} finally {
			setLoading(false);
		}
	};

	const handleDelete = async (category) => {
		if (window.confirm(`Are you sure you want to delete the category "${category.name}"? This cannot be undone.`)) {
			try {
				await deleteCategoryAdmin(category._id);
				setStatus(`Category "${category.name}" deleted.`);
				if (refreshData) refreshData();
			} catch (err) {
				setError(err.response?.data?.message || 'Failed to delete category (it may still have questions attached).');
			}
		}
	};

	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
			{/* Create Category Card */}
			<div className="golden-admin-card">
				<div className="card-heading-row">
					<div>
						<h2>CREATE NEW CATEGORY</h2>
						<p>Define genres for challenges (e.g. Cryptography, Web Exploitation, Reverse Engineering, Forensics).</p>
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
					<div className="admin-field">
						<label className="admin-label" htmlFor="categoryName">
							CATEGORY NAME *
							<span className="label-tag">Universal across all difficulty levels</span>
						</label>
						<input
							type="text"
							id="categoryName"
							name="categoryName"
							className="admin-input"
							value={categoryName}
							onChange={(e) => setCategoryName(e.target.value)}
							placeholder="e.g. Binary Exploitation, OSINT, Steganography"
							disabled={loading}
							required
						/>
					</div>

					<div style={{ marginTop: '10px' }}>
						<button type="submit" className="admin-gold-btn" disabled={loading || !categoryName.trim()}>
							{loading ? 'Creating Category...' : '+ Create Category'}
						</button>
					</div>
				</form>
			</div>

			{/* Existing Categories Card */}
			<div className="golden-admin-card">
				<div className="card-heading-row">
					<div>
						<h2>EXISTING CATEGORIES ({categories.length})</h2>
						<p>All categories currently available in the CTF arena.</p>
					</div>
					<span className="cinema-badge badge-cat">ACTIVE GENRES</span>
				</div>

				{categories.length === 0 ? (
					<div className="cinema-empty-state">
						<span></span>
						<p>No categories created yet. Use the form above to add your first category.</p>
					</div>
				) : (
					<div className="cinema-list-wrapper">
						{categories.map((cat) => (
							<div key={cat._id} className="cinema-list-item">
								<div className="cinema-item-info">
									<span className="cinema-badge badge-cat">GENRE</span>
									<span className="cinema-item-title">{cat.name}</span>
								</div>
								<div className="cinema-item-actions">
									{onEditCategory && (
										<button
											className="cinema-action-icon-btn edit"
											onClick={() => onEditCategory(cat)}
											title="Edit Category"
										>
											Edit
										</button>
									)}
									<button
										className="cinema-action-icon-btn delete"
										onClick={() => handleDelete(cat)}
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

export default CategoriesPage;
