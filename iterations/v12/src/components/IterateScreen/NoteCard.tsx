import React, { useRef, useCallback, useEffect } from 'react';
import { useDraggable } from '../../hooks/useDraggable';
import { useCanvasStore } from '../../store/canvasStore';
import type { CanvasCardData } from '../../store/types';
import styles from './NoteCard.module.css';

interface NoteCardProps {
  card: CanvasCardData;
}

const COLOR_MAP: Record<string, string> = {
  yellow: '',
  green: styles.green,
  red: styles.red,
};

export const NoteCard: React.FC<NoteCardProps> = ({ card }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { updateCardPosition, toggleCardSelection, selectedCards } = useCanvasStore();

  useDraggable(cardRef, card.id, (x, y) => updateCardPosition(card.id, x, y));

  const colorClass = COLOR_MAP[(card.data.color as string) || 'yellow'] || '';
  const isSelected = selectedCards.has(card.id);

  const now = new Date();
  const h = now.getHours();
  const m = String(now.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  const time = `${h12}:${m} ${ampm}`;

  const taRef = useRef<HTMLTextAreaElement>(null);

  const handleAutoResize = useCallback((e: React.FormEvent<HTMLTextAreaElement>) => {
    const ta = e.currentTarget;
    ta.style.height = 'auto';
    ta.style.height = ta.scrollHeight + 'px';
  }, []);

  useEffect(() => {
    const ta = taRef.current;
    if (ta && ta.value) {
      ta.style.height = 'auto';
      ta.style.height = ta.scrollHeight + 'px';
    }
  }, []);

  return (
    <div
      ref={cardRef}
      id={card.id}
      className={`${styles.noteCard} ${colorClass} ${isSelected ? styles.selected : ''}`}
      style={{ position: 'absolute', left: card.x, top: card.y }}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('textarea')) return;
        toggleCardSelection(card.id);
      }}
    >
      <textarea
        ref={taRef}
        className={styles.noteTa}
        placeholder="Write a note\u2026"
        defaultValue={(card.data.text as string) || ''}
        rows={2}
        onInput={handleAutoResize}
        onMouseDown={(e) => e.stopPropagation()}
      />
      <div className={styles.noteMeta}>Rakshit &middot; {time}</div>
    </div>
  );
};
