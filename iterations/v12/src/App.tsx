import React, { useState, useCallback } from 'react';
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
  const { screenMode, setScreenMode, setStreaming, setDocTitle } = useAppStore();
  const { addVersion } = useVersionStore();
  const [homeHiding, setHomeHiding] = useState(false);
  const [generatingDoc, setGeneratingDoc] = useState(false);

  const handleHomeSubmit = useCallback(
    (text: string) => {
      const short = text.length > 40 ? text.slice(0, 38) + '\u2026' : text;
      setDocTitle(short);

      void (async () => {
        setGeneratingDoc(true);
        let html: string;
        try {
          html = await generateDocument(text);
        } catch {
          html = V2_HTML;
        } finally {
          setGeneratingDoc(false);
        }

        const label = 'Version 1';
        addVersion(html, label);
        setStreaming(true);
        setHomeHiding(true);

        setTimeout(() => {
          setScreenMode('ask');
        }, 220);
      })();
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
            inputBusy={generatingDoc}
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
