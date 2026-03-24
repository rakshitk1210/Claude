import React from 'react';

export const StreamingCursor: React.FC = () => (
  <span
    style={{
      display: 'inline-block',
      width: 2,
      height: 14,
      background: 'var(--text-sec)',
      borderRadius: 1,
      verticalAlign: 'text-bottom',
      marginLeft: 1,
      animation: 'blink .85s ease infinite',
    }}
  />
);
