import React, { useState, useCallback, useRef } from 'react';
import { Sidebar } from './components/Sidebar/Sidebar';
import { Header } from './components/Header/Header';
import { HomeScreen } from './components/HomeScreen/HomeScreen';
import { AskScreen } from './components/AskScreen/AskScreen';
import { IterateScreen } from './components/IterateScreen/IterateScreen';
import { SelectionToolbar } from './components/InlineEditing/SelectionToolbar';
import { useAppStore } from './store/appStore';
import { useVersionStore } from './store/versionStore';
import { V1_HTML } from './data/sampleContent';
import styles from './App.module.css';

const App: React.FC = () => {
  const { screenMode, setScreenMode, setStreaming, setDocTitle } = useAppStore();
  const { addVersion } = useVersionStore();
  const [homeHiding, setHomeHiding] = useState(false);
  const lastQueryRef = useRef('');

  const handleHomeSubmit = useCallback(
    (text: string) => {
      const short = text.length > 40 ? text.slice(0, 38) + '\u2026' : text;
      setDocTitle(short);
      setHomeHiding(true);
      lastQueryRef.current = text;

      const label = 'V1 \u2022 Cover letter for Anthropic';
      addVersion(V1_HTML, label);

      setStreaming(true);

      setTimeout(() => {
        setScreenMode('ask');
      }, 220);
    },
    [setDocTitle, addVersion, setStreaming, setScreenMode]
  );

  const handleModeChange = useCallback(
    (mode: 'ask' | 'iterate') => {
      setScreenMode(mode);
    },
    [setScreenMode]
  );

  const showHeader = screenMode !== 'home';

  return (
    <div className={styles.app}>
      <Sidebar />
      <div className={styles.mainWrap}>
        {showHeader && <Header onModeChange={handleModeChange} />}
        <div className={styles.screenArea}>
          <HomeScreen
            hiding={homeHiding || screenMode !== 'home'}
            onSubmit={handleHomeSubmit}
          />
          {screenMode === 'ask' && <AskScreen visible />}
          {screenMode === 'iterate' && <IterateScreen visible />}
        </div>
      </div>
      <SelectionToolbar />
      <div id="rubber-band" className="rubber-band" />
    </div>
  );
};

export default App;
