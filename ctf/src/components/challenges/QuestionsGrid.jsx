import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';

const QuestionCard = memo(({ question, solvedFilter, categoryFilter, onClick }) => {
  return (
    <div 
      className="challenge-card"
      onClick={onClick}
      style={{ 
        cursor: 'pointer',
        border: solvedFilter === 'Solved' ? '2px solid #10b981' : undefined,
        position: 'relative'
      }}
    >
      {solvedFilter === 'Solved' && (
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: '#10b981',
          color: '#fff',
          padding: '4px 10px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          Solved
        </div>
      )}
      {solvedFilter === 'Unsolved' && question.status === 'attempted_incorrect' && (
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: '#ef4444',
          color: '#fff',
          padding: '4px 10px',
          borderRadius: '6px',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          Attempted
        </div>
      )}
      <div className="card-header">
        <h3 className="challenge-title">{question.title}</h3>
      </div>

      <div className="card-stats">
        <div className="stat">
          <span className="stat-value">{question.point}</span>
          <span className="stat-label">points</span>
        </div>
        <div className="stat" style={{ marginLeft: 'auto' }}>
          <span style={{
            background: (question.level || 'easy') === 'medium' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(34, 197, 94, 0.15)',
            color: (question.level || 'easy') === 'medium' ? '#facc15' : '#4ade80',
            border: `1px solid ${(question.level || 'easy') === 'medium' ? 'rgba(234, 179, 8, 0.4)' : 'rgba(34, 197, 94, 0.4)'}`,
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: '700',
            textTransform: 'uppercase'
          }}>
            {question.level || 'easy'}
          </span>
        </div>
      </div>

      <p style={{ 
        color: '#aaa', 
        fontSize: '14px', 
        margin: '12px 0',
        lineHeight: '1.5',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical'
      }}>
        {question.description}
      </p>

      <div className="card-footer">
        <div className="challenge-meta">
          <span className="category">{question.categoryId?.name || categoryFilter}</span>
        </div>
      </div>
    </div>
  );
});

QuestionCard.displayName = 'QuestionCard';

const QuestionsGrid = memo(({ 
  questions, 
  solvedFilter, 
  categoryFilter,
  onQuestionClick 
}) => {
  if (questions.length === 0) {
    return (
      <div className="challenges-grid">
        <div style={{ 
          gridColumn: '1 / -1',
          textAlign: 'center',
          padding: '60px 20px',
          color: '#888',
          fontSize: '18px'
        }}>
          No challenges found matching your criteria
        </div>
      </div>
    );
  }

  return (
    <div className="challenges-grid">
      {questions.map((question) => (
        <QuestionCard
          key={question._id}
          question={question}
          solvedFilter={solvedFilter}
          categoryFilter={categoryFilter}
          onClick={() => onQuestionClick(question)}
        />
      ))}
    </div>
  );
});

QuestionsGrid.displayName = 'QuestionsGrid';

export default QuestionsGrid;
