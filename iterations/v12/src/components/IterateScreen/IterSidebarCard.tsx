import React, { useRef, useEffect, useCallback } from 'react';
import { VersionNav } from '../shared/VersionNav';
import { useVersionStore } from '../../store/versionStore';
import { useAppStore } from '../../store/appStore';
import { useCanvasStore } from '../../store/canvasStore';
import { useDraggable } from '../../hooks/useDraggable';
import type { IterSidebarPanel } from '../../store/types';
import styles from './IterSidebarCard.module.css';

const SKEL_BLOCK =
  '<div class="skel-group"><div class="skel" style="width:92%"></div><div class="skel" style="width:86%"></div><div class="skel" style="width:78%"></div><div class="skel" style="width:90%"></div><div class="skel" style="width:70%"></div></div>';

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

interface IterSidebarCardProps {
  panel: IterSidebarPanel;
  onContextMenu?: (panelId: string, x: number, y: number) => void;
}

export const IterSidebarCard: React.FC<IterSidebarCardProps> = ({
  panel,
  onContextMenu,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const renderedRef = useRef(false);
  const { versions, navigateRevision } = useVersionStore();
  const { setStreaming } = useAppStore();
  const { toggleCardSelection, selectedCards } = useCanvasStore();

  useDraggable(cardRef, panel.id, undefined, '[data-drag-handle]');

  const isPending = panel.verIdx === null;
  const verIdx = panel.verIdx;
  const version = verIdx !== null ? versions[verIdx] : undefined;
  const isSelected = selectedCards.has(panel.id);

  useEffect(() => {
    const body = bodyRef.current;
    if (!body || !isPending) return;
    body.contentEditable = 'false';
    body.innerHTML = SKEL_BLOCK.repeat(3);
  }, [isPending]);

  useEffect(() => {
    const body = bodyRef.current;
    if (!body || isPending || !version || renderedRef.current) return;
    renderedRef.current = true;

    const html = version.revisions[version.currentRevision];
    let cancelStream: (() => void) | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;

    if (panel.needsStream) {
      body.contentEditable = 'false';
      body.innerHTML = SKEL_BLOCK.repeat(3);

      timer = setTimeout(() => {
        cancelStream = streamInto(body, html, () => {
          setStreaming(false);
          body.contentEditable = 'true';
        });
      }, 140 + Math.random() * 80);
    } else {
      body.innerHTML = html;
      body.contentEditable = 'true';
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (cancelStream) cancelStream();
      renderedRef.current = false;
    };
  }, [isPending, version, panel.needsStream, setStreaming]);

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('button, textarea, [contenteditable="true"], input, a, [data-drag-handle]'))
        return;
      toggleCardSelection(panel.id);
    },
    [toggleCardSelection, panel.id]
  );

  return (
    <div
      ref={cardRef}
      id={panel.id}
      {...(verIdx !== null ? { 'data-ver-idx': String(verIdx) } : {})}
      className={`${styles.wrapper} ${isSelected ? styles.selected : ''}`}
      style={{ left: panel.x, top: 0 }}
      onClick={handleClick}
      onContextMenu={(e) => {
        e.preventDefault();
        onContextMenu?.(panel.id, e.clientX, e.clientY);
      }}
    >
      <div className={styles.prompt}>{panel.prompt}</div>
      <div className={styles.sidebar}>
        <div className={styles.titleBar}>
          <div className={styles.titleLeft} data-drag-handle>
            <div className={styles.dragHandle}>
              <svg width="6" height="10" viewBox="0 0 6 10" fill="none">
                <circle cx="1" cy="1" r="1" fill="currentColor"/>
                <circle cx="5" cy="1" r="1" fill="currentColor"/>
                <circle cx="1" cy="5" r="1" fill="currentColor"/>
                <circle cx="5" cy="5" r="1" fill="currentColor"/>
                <circle cx="1" cy="9" r="1" fill="currentColor"/>
                <circle cx="5" cy="9" r="1" fill="currentColor"/>
              </svg>
            </div>
            <span className={styles.versionTitle}>
              {isPending ? 'Generating…' : version?.label}
            </span>
          </div>
          {!isPending && version && version.revisions.length > 1 && (
            <VersionNav
              current={version.currentRevision + 1}
              total={version.revisions.length}
              onPrev={() => navigateRevision(verIdx!, -1)}
              onNext={() => navigateRevision(verIdx!, 1)}
              size="sm"
            />
          )}
        </div>
        <div className={styles.content}>
          <div
            ref={bodyRef}
            className={styles.body}
            suppressContentEditableWarning
          />
        </div>
      </div>
    </div>
  );
};
