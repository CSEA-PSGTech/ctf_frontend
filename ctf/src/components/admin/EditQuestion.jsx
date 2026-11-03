import { useState, useEffect } from 'react';
import { updateQuestionAdmin, getCategoriesAdmin, fetchQuestionDetails } from '../../api.js';

function EditQuestion({ category, question, onBack, refreshData }) {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    category: category || '',
    title: question?.title || '',
    link: question?.link || '',
    description: question?.description || '',
    answer: question?.answer || '',
    points: question?.points || question?.point || '100',
    level: question?.level || 'easy',
    hint: question?.hint || ''
  });

  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchInitial = async () => {
      try {
        const res = await getCategoriesAdmin();
        const cats = (res && (res.data || res)) || [];
        if (!mounted) return;
        setCategories(cats);
        setFormData(prev => ({ ...prev, category: prev.category || cats[0]?.name || '' }));

        if (question && (!question.description || question.answer === undefined || question.link === undefined)) {
          try {
            const detailRes = await fetchQuestionDetails(question._id || question.question_id || question.id);
            const q = detailRes?.data || detailRes || {};
            if (!mounted) return;
            setFormData({
              category: q.category || q.categoryName || prev.category || cats[0]?.name || '',
              title: q.title || '',
              link: q.link || '',
              description: q.description || '',
              answer: q.answer || '',
              points: q.points || q.point || '100',
              level: q.level || 'easy',
              hint: q.hint || ''
            });
          } catch (err) {
            // fall back
          }
        }
      } catch (err) {
        // Failed to fetch categories
      }
    };

    fetchInitial();

    return () => { mounted = false; };
  }, [question]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    setError('');
    setLoading(true);

    try {
      let formattedAnswer = (formData.answer || '').trim();
      if (!/^cyberseige\{.*\}$/i.test(formattedAnswer)) {
        const inner = formattedAnswer.replace(/^cyberseige\{?/i, '').replace(/\}$/, '').trim();
        formattedAnswer = `cyberseige{${inner}}`;
      }

      const payload = {
        category: formData.category.trim(),
        title: formData.title.trim(),
        link: (formData.link || '').trim(),
        description: formData.description.trim(),
        answer: formattedAnswer,
        point: Number(formData.points || 0),
        level: formData.level || 'easy',
        hint: (formData.hint || '').trim()
      };

      const qId = question._id || question.question_id || question.id;
      const res = await updateQuestionAdmin(qId, payload);

      if (res && (res.statusCode === 200 || res.success || res.data)) {
        setStatus('Challenge updated successfully!');
        if (refreshData) refreshData();
        setTimeout(() => {
          setStatus('');
          onBack();
        }, 1200);
      } else {
        setError(res?.data?.message || res?.message || 'Failed to update challenge');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update challenge');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="golden-admin-card">
      <button className="admin-back-btn" onClick={onBack}>
        <span>←</span>
        <span>Back to Challenges Overview</span>
      </button>

      <div className="card-heading-row">
        <div>
          <h2>EDIT CHALLENGE</h2>
          <p>Modify details, points, descriptions, or answers for this challenge.</p>
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
        <div className="admin-grid-2">
          <div className="admin-field">
            <label className="admin-label" htmlFor="category">
              CATEGORY *
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
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-field">
            <label className="admin-label" htmlFor="title">
              TITLE *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              className="admin-input"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Challenge title"
              disabled={loading}
              required
            />
          </div>
        </div>

        <div className="admin-grid-2">
          <div className="admin-field">
            <label className="admin-label" htmlFor="points">
              POINTS *
            </label>
            <input
              type="number"
              id="points"
              name="points"
              className="admin-input"
              value={formData.points}
              onChange={handleInputChange}
              disabled={loading}
              required
            />
          </div>

          <div className="admin-field">
            <label className="admin-label" htmlFor="level">
              QUESTION LEVEL *
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

        <div className="admin-field">
          <label className="admin-label" htmlFor="answer">
            FLAG / CORRECT ANSWER *
          </label>
          <input
            type="text"
            id="answer"
            name="answer"
            className="admin-input admin-flag-input"
            value={formData.answer}
            onChange={handleInputChange}
            placeholder="cyberseige{...}"
            disabled={loading}
            required
          />
        </div>

        <div className="admin-field">
          <label className="admin-label" htmlFor="link">
            RESOURCE LINK (OPTIONAL)
          </label>
          <input
            type="url"
            id="link"
            name="link"
            className="admin-input"
            value={formData.link}
            onChange={handleInputChange}
            placeholder="Optional download / challenge URL"
            disabled={loading}
          />
        </div>

        <div className="admin-field">
          <label className="admin-label" htmlFor="description">
            DESCRIPTION *
          </label>
          <textarea
            id="description"
            name="description"
            className="admin-textarea"
            value={formData.description}
            onChange={handleInputChange}
            rows="4"
            disabled={loading}
            required
          />
        </div>

        <div className="admin-field">
          <label className="admin-label" htmlFor="hint">
            HINT (OPTIONAL)
          </label>
          <input
            type="text"
            id="hint"
            name="hint"
            className="admin-input"
            value={formData.hint}
            onChange={handleInputChange}
            placeholder="Optional hint for players"
            disabled={loading}
          />
        </div>

        <div style={{ marginTop: '10px' }}>
          <button type="submit" className="admin-gold-btn" disabled={loading}>
            {loading ? 'Saving Changes...' : 'Update Challenge'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditQuestion;
