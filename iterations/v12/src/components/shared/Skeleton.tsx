import React from 'react';
import styles from './Skeleton.module.css';

interface SkeletonProps {
  groups?: number;
  linesPerGroup?: number;
  variant?: 'block' | 'inline';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  groups = 3,
  linesPerGroup = 5,
  variant = 'block',
}) => {
  return (
    <div className={variant === 'inline' ? styles.inlineSkel : undefined}>
      {Array.from({ length: groups }).map((_, g) => (
        <div className={styles.skelGroup} key={g}>
          {Array.from({ length: linesPerGroup }).map((_, l) => (
            <div
              className={styles.skel}
              key={l}
              style={{ width: `${80 + Math.floor(Math.random() * 18)}%` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export const SkeletonLines: React.FC<{ count?: number }> = ({ count = 5 }) => (
  <div>
    {Array.from({ length: count }).map((_, i) => (
      <div
        className={styles.skelLine}
        key={i}
        style={{ width: i === count - 1 ? '60%' : '100%' }}
      />
    ))}
  </div>
);
