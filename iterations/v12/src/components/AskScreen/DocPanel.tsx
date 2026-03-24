import React, { useRef, useEffect, useCallback } from 'react';
import { VersionNav } from '../shared/VersionNav';
import { RefreshIcon, XIcon, ChevronDown } from '../shared/Icons';
import { useVersionStore } from '../../store/versionStore';
import { useAppStore } from '../../store/appStore';
import styles from './DocPanel.module.css';

function streamInto(container: HTMLElement, html: string, onDone?: () => void) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  const paras = Array.from(tmp.querySelectorAll('p'));
  const chunks: (string | null)[] = [];
  paras.forEach((p, i) => {
    if (i > 0) chunks.push(null);
    p.innerHTML.split(/(\s+)/).forEach((w) => {
      if (w) chunks.push(w);
    });
  });

  container.innerHTML = '';
  const cursor = document.createElement('span');
  cursor.className = 'streaming-cursor';
  container.appendChild(cursor);

  let idx = 0;
  let curP: HTMLElement | null = null;
  let cancelled = false;

  function next() {
    if (cancelled) { cursor.remove(); return; }
    if (idx >= chunks.length) { cursor.remove(); onDone?.(); return; }
    const ch = chunks[idx++];
    if (ch === null) { curP = null; setTimeout(next, 46); return; }
    if (!curP) { curP = document.createElement('p'); container.insertBefore(curP, cursor); }
    const s = document.createElement('span'); s.innerHTML = ch; curP.appendChild(s);
    setTimeout(next, 7 + Math.random() * 12);
  }
  next();
  return () => { cancelled = true; };
}

export const DocPanel: React.FC = () => {
  const { versions, viewingVersion, setViewingVersion, navigateRevision } =
    useVersionStore();
  const { isStreaming, setStreaming } = useAppStore();
  const contentRef = useRef<HTMLDivElement>(null);
  const renderedHtml = useRef<string>('');

  const currentVersion = versions[viewingVersion];
  const currentHtml = currentVersion
    ? currentVersion.revisions[currentVersion.currentRevision]
    : '';

  useEffect(() => {
    const el = contentRef.current;
    if (!el || !currentHtml) return;
    if (renderedHtml.current === currentHtml) return;

    const htmlToRender = currentHtml;
    let cancelStream: (() => void) | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;

    if (isStreaming) {
      renderedHtml.current = htmlToRender;
      el.contentEditable = 'false';
      const skelHtml = '<div class="skel-group"><div class="skel" style="width:92%"></div><div class="skel" style="width:86%"></div><div class="skel" style="width:78%"></div><div class="skel" style="width:90%"></div><div class="skel" style="width:70%"></div></div>';
      el.innerHTML = skelHtml.repeat(3);

      timer = setTimeout(() => {
        cancelStream = streamInto(el, htmlToRender, () => {
          setStreaming(false);
          el.contentEditable = 'true';
        });
      }, 1000 + Math.random() * 300);
    } else {
      renderedHtml.current = htmlToRender;
      el.innerHTML = htmlToRender;
      el.contentEditable = 'true';
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (cancelStream) cancelStream();
    };
  }, [currentHtml, isStreaming, setStreaming]);

  const handleCopy = useCallback(() => {
    const text = contentRef.current?.innerText || '';
    navigator.clipboard.writeText(text).catch(() => {});
  }, []);

  return (
    <>
      <div className={styles.hdr}>
        <div className={styles.versionTabs}>
          {versions.map((v, i) => (
            <button
              key={i}
              className={`${styles.versionTab} ${i === viewingVersion ? styles.active : ''}`}
              onClick={() => !isStreaming && setViewingVersion(i)}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          {currentVersion && (
            <>
              <VersionNav
                current={currentVersion.currentRevision + 1}
                total={currentVersion.revisions.length}
                onPrev={() => navigateRevision(viewingVersion, -1)}
                onNext={() => navigateRevision(viewingVersion, 1)}
                size="sm"
              />
              <span className={styles.verInfo}>
                Version {viewingVersion + 1} &bull; PDF
              </span>
            </>
          )}
        </div>
        <div className={styles.toolbarRight}>
          <div className={styles.copyGroup}>
            <button className={styles.copyBtn} onClick={handleCopy}>
              Copy
            </button>
            <button className={styles.copyChevron}>
              <ChevronDown size={16} />
            </button>
          </div>
          <button className={styles.toolbarIconBtn} title="Refresh">
            <RefreshIcon size={20} />
          </button>
          <button className={styles.toolbarIconBtn} title="Close">
            <XIcon size={20} />
          </button>
        </div>
      </div>

      <div className={styles.docScroll}>
        <h1 className={styles.heading}>Cover letter for Anthropic</h1>
        <div
          ref={contentRef}
          className={styles.content}
          spellCheck={false}
          suppressContentEditableWarning
        />
      </div>
    </>
  );
};
