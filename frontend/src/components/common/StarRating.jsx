import React from 'react';

const StarRating = ({ rating, maxRating = 5, size = 'md', readOnly = false, onRatingChange }) => {
  const sizes = {
    sm: 'var(--font-size-base)',
    md: 'var(--font-size-xl)', 
    lg: 'var(--font-size-3xl)'
  };

  const handleClick = (value) => {
    if (!readOnly && onRatingChange) {
      onRatingChange(value);
    }
  };

  return (
    <div className="star-rating" style={{ display: 'flex', gap: 'var(--space-4)' }}>
      {[...Array(maxRating)].map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= rating;
        
        return (
          <span
            key={index}
            className={`star ${isFilled ? 'filled' : 'empty'} ${!readOnly ? 'interactive' : ''}`}
            style={{
              fontSize: sizes[size],
              color: isFilled ? 'var(--color-warning)' : 'var(--color-border)',
              cursor: !readOnly ? 'pointer' : 'default',
              transition: 'color var(--duration-fast) var(--ease-standard)'
            }}
            onClick={() => handleClick(starValue)}
            onMouseEnter={() => !readOnly && handleClick(starValue)}
          >
            ★
          </span>
        );
      })}
      {rating > 0 && (
        <span style={{ 
          marginLeft: 'var(--space-8)', 
          color: 'var(--color-text-secondary)',
          fontSize: 'var(--font-size-sm)',
          fontWeight: 'var(--font-weight-medium)'
        }}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating;
