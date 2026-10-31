import React, { memo } from 'react';

const ChallengeFilters = memo(({ 
  categories,
  categoryFilter, 
  levelFilter = 'All',
  solvedFilter, 
  orderFilter, 
  searchQuery,
  onCategoryChange,
  onLevelFilterChange,
  onSolvedFilterChange,
  onOrderFilterChange,
  onSearchChange
}) => {
  return (
    <div className="filters-section">
      <div className="filter-row">
        <div className="filter-group">
          <label>Category</label>
          <select 
            value={categoryFilter} 
            onChange={(e) => onCategoryChange(e.target.value)}
            className="filter-select"
          >
            {categories.map(cat => (
              <option key={cat._id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Level</label>
          <select 
            value={levelFilter} 
            onChange={(e) => onLevelFilterChange(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Levels</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Solved</label>
          <select 
            value={solvedFilter} 
            onChange={(e) => onSolvedFilterChange(e.target.value)}
            className="filter-select"
          >
            <option>All</option>
            <option>Solved</option>
            <option>Unsolved</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Order By</label>
          <select 
            value={orderFilter} 
            onChange={(e) => onOrderFilterChange(e.target.value)}
            className="filter-select"
          >
            <option>Points</option>
            <option>Solves</option>
            <option>Newest</option>
            <option>Oldest</option>
          </select>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.categoryFilter === nextProps.categoryFilter &&
    prevProps.levelFilter === nextProps.levelFilter &&
    prevProps.solvedFilter === nextProps.solvedFilter &&
    prevProps.orderFilter === nextProps.orderFilter &&
    prevProps.searchQuery === nextProps.searchQuery &&
    prevProps.categories.length === nextProps.categories.length &&
    prevProps.onCategoryChange === nextProps.onCategoryChange &&
    prevProps.onLevelFilterChange === nextProps.onLevelFilterChange &&
    prevProps.onSolvedFilterChange === nextProps.onSolvedFilterChange &&
    prevProps.onOrderFilterChange === nextProps.onOrderFilterChange &&
    prevProps.onSearchChange === nextProps.onSearchChange
  );
});

ChallengeFilters.displayName = 'ChallengeFilters';

export default ChallengeFilters;
