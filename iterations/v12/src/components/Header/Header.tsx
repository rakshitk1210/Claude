import React from 'react';
import { ChevronDown } from '../shared/Icons';
import { useAppStore } from '../../store/appStore';
import styles from './Header.module.css';

interface HeaderProps {
  onModeChange?: (mode: 'ask' | 'iterate') => void;
}

export const Header: React.FC<HeaderProps> = ({ onModeChange }) => {
  const { screenMode, docTitle } = useAppStore();

  return (
    <header className={styles.docHeader}>
      <div className={styles.titleWrap}>
        <span className={styles.titleText}>{docTitle}</span>
        <ChevronDown size={16} style={{ color: 'var(--text-sec)', flexShrink: 0 }} />
      </div>
      <div className={styles.center}>
        <div className={styles.pillGroup}>
          <button
            className={`${styles.pill} ${screenMode === 'ask' ? styles.active : ''}`}
            onClick={() => onModeChange?.('ask')}
          >
            Ask
          </button>
          <button
            className={`${styles.pill} ${screenMode === 'iterate' ? styles.active : ''}`}
            onClick={() => onModeChange?.('iterate')}
          >
            Iterate
          </button>
        </div>
      </div>
      <div className={styles.right}>
        <button className={styles.shareBtn}>Share</button>
      </div>
    </header>
  );
};
