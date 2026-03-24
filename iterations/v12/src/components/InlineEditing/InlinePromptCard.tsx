import React, { useRef, useCallback, useEffect } from 'react';
import { PlusIcon, ArrowUp } from '../shared/Icons';
import styles from './InlinePromptCard.module.css';

interface InlinePromptCardProps {
  pos: { left: number; top: number };
  onClose: () => void;
  onSubmit: (text: string) => void;
}

export const InlinePromptCard: React.FC<InlinePromptCardProps> = ({
  pos,
  onClose,
  onSubmit,
}) => {
  const fieldRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setTimeout(() => fieldRef.current?.focus(), 60);
  }, []);

  const handleSubmit = useCallback(() => {
    const text = fieldRef.current?.value.trim();
    if (!text) return;
    onSubmit(text);
  }, [onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
      if (e.key === 'Escape') onClose();
    },
    [handleSubmit, onClose]
  );

  return (
    <div className={styles.card} style={{ left: pos.left, top: pos.top }}>
      <textarea
        ref={fieldRef}
        className={styles.field}
        placeholder="I don't like this part can you fix it?"
        rows={1}
        onKeyDown={handleKeyDown}
      />
      <div className={styles.row}>
        <button className={styles.plusBtn}>
          <PlusIcon size={16} />
        </button>
        <button className={styles.sendBtn} onClick={handleSubmit}>
          <ArrowUp size={16} />
        </button>
      </div>
    </div>
  );
};
