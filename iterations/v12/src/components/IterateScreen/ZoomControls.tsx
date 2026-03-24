import React from 'react';
import { PlusIcon, MinusIcon, HelpIcon } from '../shared/Icons';
import styles from './ZoomControls.module.css';

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  zoom: number;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onReset,
  zoom,
}) => {
  return (
    <div className={styles.feedbackTb}>
      <div className={styles.stepper}>
        <button className={styles.stepperBtn} onClick={onZoomOut} title="Zoom out">
          <MinusIcon />
        </button>
        <button className={styles.zoomPct} onClick={onReset} title="Reset zoom">
          {zoom}
        </button>
        <button className={styles.stepperBtn} onClick={onZoomIn} title="Zoom in">
          <PlusIcon />
        </button>
      </div>
      <button className={styles.fbBtn} title="Help">
        <HelpIcon />
      </button>
    </div>
  );
};
