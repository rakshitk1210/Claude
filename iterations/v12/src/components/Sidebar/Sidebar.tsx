import React from 'react';
import { LayoutIcon, SearchIcon, FolderIcon, ChatIcon } from '../shared/Icons';
import styles from './Sidebar.module.css';

export const Sidebar: React.FC = () => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.top}>
        <button className={`${styles.btn} ${styles.active}`} title="Layout">
          <LayoutIcon />
        </button>
        <button className={styles.btn} title="Search">
          <SearchIcon />
        </button>
        <button className={styles.btn} title="Projects">
          <FolderIcon />
        </button>
        <button className={styles.btn} title="Conversations">
          <ChatIcon />
        </button>
      </div>
      <div className={styles.btm}>
        <div className={styles.userAv}>RK</div>
      </div>
    </aside>
  );
};
