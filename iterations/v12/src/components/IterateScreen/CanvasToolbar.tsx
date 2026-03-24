import React from 'react';
import {
  CursorIcon, MarqueeIcon, HandIcon, NoteIcon, AttachIcon,
} from '../shared/Icons';
import { useCanvasStore } from '../../store/canvasStore';
import type { CanvasTool } from '../../store/types';
import styles from './CanvasToolbar.module.css';

interface CanvasToolbarProps {
  onAddNote: () => void;
  onAddFile: () => void;
}

const tools: { id: CanvasTool; icon: React.FC; label: string }[] = [
  { id: 'select', icon: CursorIcon, label: 'Select' },
  { id: 'marquee', icon: MarqueeIcon, label: 'Select area' },
  { id: 'hand', icon: HandIcon, label: 'Pan' },
];

export const CanvasToolbar: React.FC<CanvasToolbarProps> = ({
  onAddNote,
  onAddFile,
}) => {
  const { activeTool, setActiveTool } = useCanvasStore();

  return (
    <div className={styles.tools}>
      {tools.map((t) => (
        <button
          key={t.id}
          className={`${styles.toolBtn} ${activeTool === t.id ? styles.active : ''}`}
          onClick={() => setActiveTool(t.id)}
        >
          <t.icon />
          <span className={styles.toolTip}>{t.label}</span>
        </button>
      ))}
      <div className={styles.divider} />
      <button className={styles.toolBtn} onClick={onAddNote}>
        <NoteIcon />
        <span className={styles.toolTip}>Sticky note (S)</span>
      </button>
      <button className={styles.toolBtn} onClick={onAddFile}>
        <AttachIcon />
        <span className={styles.toolTip}>Attach</span>
      </button>
    </div>
  );
};
