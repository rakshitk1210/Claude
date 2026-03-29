import React, { useState, useCallback, useRef } from 'react';
import { Sidebar } from './components/Sidebar/Sidebar';
import { Header } from './components/Header/Header';
import { HomeScreen } from './components/HomeScreen/HomeScreen';
import { AskScreen } from './components/AskScreen/AskScreen';
import { IterateScreen } from './components/IterateScreen/IterateScreen';
import { SelectionToolbar } from './components/InlineEditing/SelectionToolbar';
import { useAppStore } from './store/appStore';
import { useVersionStore } from './store/versionStore';
import { V2_HTML } from './data/sampleContent';
import { generateDocument } from './api/generateDocument';
import styles from './App.module.css';

const App: React.FC = () => {
  const { screenMode, setScreenMode, setStreaming, setDocTitle, setHomePrompt } =
    useAppStore();
  const { addVersion } = useVersionStore();
  const [homeHiding, setHomeHiding] = useState(false);
  const homeSubmitLock = useRef(false);

  const handleHomeSubmit = useCallback(
    (text: string) => {
      if (homeSubmitLock.current) return;
      homeSubmitLock.current = true;

      const short = text.length > 40 ? text.slice(0, 38) + '\u2026' : text;
      setDocTitle(short);
      setHomePrompt(text);

      setStreaming(true);
      setHomeHiding(true);
      setScreenMode('ask');

      void (async () => {
        let html: string;
        try {
          html = await generateDocument(text);
        } catch {
          html = V2_HTML;
        }
        addVersion(html, 'Version 1');
      })();
    },
    [setDocTitle, setHomePrompt, addVersion, setStreaming, setScreenMode]
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
