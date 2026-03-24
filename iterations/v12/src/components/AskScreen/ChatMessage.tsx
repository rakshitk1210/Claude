import React from 'react';
import { CopyIcon, RefreshIcon, TrashIcon } from '../shared/Icons';
import styles from './ChatMessage.module.css';

interface ChatMessageProps {
  id: string;
  role: 'user' | 'ai';
  content: string;
  onDelete: () => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  role,
  content,
  onDelete,
}) => {
  if (role === 'user') {
    return (
      <div className={styles.userWrap}>
        <div className={styles.userBubble}>{content}</div>
        <div className={styles.hoverActions}>
          <button className={styles.iconBtn} title="Copy">
            <CopyIcon />
          </button>
          <button className={styles.iconBtn} title="Regenerate">
            <RefreshIcon />
          </button>
          <button
            className={`${styles.iconBtn} ${styles.danger}`}
            title="Delete"
            onClick={onDelete}
          >
            <TrashIcon />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.msgGroup}>
      <div className={styles.hoverDelete}>
        <button
          className={`${styles.iconBtn} ${styles.danger}`}
          title="Delete"
          onClick={onDelete}
        >
          <TrashIcon />
        </button>
      </div>
      <div className={styles.aiBubble}>{content}</div>
    </div>
  );
};
