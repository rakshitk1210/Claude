import React, { useRef } from 'react';
import { ChatPanel } from './ChatPanel';
import { DocPanel } from './DocPanel';
import { useResizePane } from '../../hooks/useResizePane';
import styles from './AskScreen.module.css';

interface AskScreenProps {
  visible: boolean;
}

export const AskScreen: React.FC<AskScreenProps> = ({ visible }) => {
  const splitRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const [docHidden, setDocHidden] = React.useState(false);

  useResizePane(handleRef, leftRef, splitRef);

  return (
    <div className={`${styles.askScreen} ${visible ? styles.visible : ''}`}>
      <div className={styles.askSplit} ref={splitRef}>
        <div
          ref={leftRef}
          className={`${styles.askLeft} ${docHidden ? styles.centered : ''}`}
        >
          <ChatPanel
            onDeleteDoc={() => setDocHidden(true)}
            onUndoDelete={() => setDocHidden(false)}
            docHidden={docHidden}
          />
        </div>
        <div ref={handleRef} className={styles.resizeHandle} />
        <div className={`${styles.askRight} ${docHidden ? styles.hidden : ''}`}>
          <DocPanel />
        </div>
      </div>
    </div>
  );
};
