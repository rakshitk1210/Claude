import React from 'react';
import { ClaudeLogo } from '../shared/Icons';
import { InputBar } from '../shared/InputBar';
import { Skeleton } from '../shared/Skeleton';
import styles from './HomeScreen.module.css';

interface HomeScreenProps {
  hiding: boolean;
  onSubmit: (text: string) => void;
  inputBusy?: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  hiding,
  onSubmit,
  inputBusy = false,
}) => {
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
          disabled={inputBusy}
          isStreaming={inputBusy}
        />
        {inputBusy && (
          <div
            className={styles.previewSkel}
            aria-busy="true"
            aria-label="Generating document"
          >
            <div className={styles.previewSkelHeader}>
              <span className={styles.previewSkelLabel}>Your document</span>
            </div>
            <div className={styles.previewSkelBody}>
              <Skeleton groups={3} linesPerGroup={5} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
