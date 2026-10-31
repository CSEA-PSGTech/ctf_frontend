import { useState } from 'react';
import { updateCategoryAdmin } from '../../api.js';

function EditCategory({ category, onBack, refreshData }) {
  const [categoryName, setCategoryName] = useState(category.name || '');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    setError('');

    if (!categoryName.trim()) {
      setError('Category name cannot be empty');
      return;
    }

    try {
      setLoading(true);
      await updateCategoryAdmin(category._id, { 
        name: categoryName.trim()
      });
      setStatus('Category updated successfully!');
      if (refreshData) refreshData();
      setTimeout(() => {
        setStatus('');
        onBack();
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="golden-admin-card">
      <button className="admin-back-btn" onClick={onBack}>
        <span>←</span>
        <span>Back to Overview</span>
      </button>

      <div className="card-heading-row">
        <div>
          <h2>EDIT CATEGORY</h2>
          <p>Rename category. Questions assigned to this category will reflect the updated name.</p>
        </div>
        <span className="cinema-badge badge-gold">DIRECTOR SUITE</span>
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

      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="admin-field">
          <label className="admin-label" htmlFor="categoryName">
            CATEGORY NAME *
          </label>
          <input
            type="text"
            id="categoryName"
            className="admin-input"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Enter category name"
            disabled={loading}
            required
          />
        </div>

        <div style={{ marginTop: '10px' }}>
          <button type="submit" className="admin-gold-btn" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditCategory;
