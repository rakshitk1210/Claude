import React from 'react';
import styles from './Canvas.module.css';

interface CanvasProps {
  camX: number;
  camY: number;
  camScale: number;
  children: React.ReactNode;
}

export const Canvas: React.FC<CanvasProps> = ({ camX, camY, camScale, children }) => {
  return (
    <div
      className={styles.canvasWorld}
      style={{
        transform: `translate(${camX}px, ${camY}px) scale(${camScale})`,
      }}
    >
      <div className={styles.canvasLayout}>{children}</div>
    </div>
  );
};
