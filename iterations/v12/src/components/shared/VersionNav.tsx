import React from 'react';
import { ChevronLeft, ChevronRight } from './Icons';
import styles from './VersionNav.module.css';

interface VersionNavProps {
  current: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  size?: 'sm' | 'md';
}

export const VersionNav: React.FC<VersionNavProps> = ({
  current,
  total,
  onPrev,
  onNext,
  size = 'md',
}) => {
  const iconSize = size === 'sm' ? 16 : 20;
  return (
    <div className={styles.nav}>
      <button
        className={`${styles.verBtn} ${current <= 1 ? styles.disabled : ''}`}
        onClick={onPrev}
        disabled={current <= 1}
      >
        <ChevronLeft size={iconSize} />
      </button>
      <span className={`${styles.verLabel} ${size === 'sm' ? styles.sm : ''}`}>
        {current} / {total}
      </span>
      <button
        className={`${styles.verBtn} ${current >= total ? styles.disabled : ''}`}
        onClick={onNext}
        disabled={current >= total}
      >
        <ChevronRight size={iconSize} />
      </button>
    </div>
  );
};
