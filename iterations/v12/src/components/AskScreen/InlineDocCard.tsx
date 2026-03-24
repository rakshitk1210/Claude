import React from 'react';
import { DocIcon, CopyIcon, RefreshIcon, TrashIcon } from '../shared/Icons';
import { VersionNav } from '../shared/VersionNav';
import { useVersionStore } from '../../store/versionStore';
import styles from './InlineDocCard.module.css';

interface InlineDocCardProps {
  label: string;
  versionIdx: number;
  onNavigate: (idx: number) => void;
  onDelete?: () => void;
}

export const InlineDocCard: React.FC<InlineDocCardProps> = ({
  label,
  onNavigate,
  onDelete,
}) => {
  const { versions, viewingVersion } = useVersionStore();

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.left}>
          <div className={styles.icon}>
            <DocIcon />
          </div>
          <div>
            <div className={styles.title}>{label}</div>
            <div className={styles.type}>Document &bull; PDF</div>
          </div>
        </div>
        <button className={styles.downloadBtn}>Download</button>
      </div>
      {versions.length > 1 && (
        <div className={styles.actionsRow}>
          <div className={styles.actionsLeft}>
            <VersionNav
              current={viewingVersion + 1}
              total={versions.length}
              onPrev={() => onNavigate(Math.max(0, viewingVersion - 1))}
              onNext={() =>
                onNavigate(Math.min(versions.length - 1, viewingVersion + 1))
              }
              size="sm"
            />
          </div>
          <div className={styles.actionsRight}>
            <button className={styles.actionBtn} title="Copy">
              <CopyIcon size={20} />
            </button>
            <button className={styles.actionBtn} title="Refresh">
              <RefreshIcon size={20} />
            </button>
            <button
              className={`${styles.actionBtn} ${styles.danger}`}
              title="Delete"
              onClick={onDelete}
            >
              <TrashIcon size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
