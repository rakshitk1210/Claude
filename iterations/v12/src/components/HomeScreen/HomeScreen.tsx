import React from 'react';
import { ClaudeLogo } from '../shared/Icons';
import { InputBar } from '../shared/InputBar';
import styles from './HomeScreen.module.css';

interface HomeScreenProps {
  hiding: boolean;
  onSubmit: (text: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ hiding, onSubmit }) => {
  return (
    <div className={`${styles.homeScreen} ${hiding ? styles.hiding : ''}`}>
      <div className={styles.greetingRow}>
        <span className={styles.greetingLogo}>
          <ClaudeLogo size={44} />
        </span>
        <span className={styles.greetingText}>Good afternoon, Rakshit</span>
      </div>
      <div className={styles.inputArea}>
        <InputBar
          placeholder="How can I help you today?"
          onSubmit={onSubmit}
        />
      </div>
    </div>
  );
};
