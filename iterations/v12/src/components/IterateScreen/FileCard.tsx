import React, { useRef } from 'react';
import { FileDocIcon } from '../shared/Icons';
import { useDraggable } from '../../hooks/useDraggable';
import { useCanvasStore } from '../../store/canvasStore';
import type { CanvasCardData } from '../../store/types';
import styles from './FileCard.module.css';

interface FileCardProps {
  card: CanvasCardData;
  onContextMenu?: (cardId: string, x: number, y: number) => void;
}

export const FileCard: React.FC<FileCardProps> = ({ card, onContextMenu }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { updateCardPosition, toggleCardSelection, selectedCards } = useCanvasStore();

  useDraggable(cardRef, card.id, (x, y) => updateCardPosition(card.id, x, y));

  const isSelected = selectedCards.has(card.id);

  return (
    <div
      ref={cardRef}
      id={card.id}
      className={`${styles.fileCard} ${isSelected ? styles.selected : ''}`}
      style={{ position: 'absolute', left: card.x, top: card.y }}
      onClick={() => toggleCardSelection(card.id)}
      onContextMenu={(e) => {
        e.preventDefault();
        onContextMenu?.(card.id, e.clientX, e.clientY);
      }}
    >
      <div className={styles.fileRow}>
        <div className={styles.fileIcon}>
          <FileDocIcon />
        </div>
        <div className={styles.fileMeta}>
          <div className={styles.fileName}>{card.data.name as string}</div>
          <div className={styles.fileType}>{card.data.meta as string}</div>
        </div>
      </div>
    </div>
  );
};
