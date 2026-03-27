import React, { useRef, useCallback, useEffect, useState } from 'react';
import { Canvas } from './Canvas';
import { CanvasContextMenu } from './CanvasContextMenu';
import { CanvasToolbar } from './CanvasToolbar';
import { ZoomControls } from './ZoomControls';
import { IterSidebarCard } from './IterSidebarCard';
import { NoteCard } from './NoteCard';
import { FileCard } from './FileCard';
import { InputBar } from '../shared/InputBar';
import { usePanZoom } from '../../hooks/usePanZoom';
import { useCanvasStore } from '../../store/canvasStore';
import { useVersionStore } from '../../store/versionStore';
import { useAppStore } from '../../store/appStore';
import { useChatStore } from '../../store/chatStore';
import { useStreamText } from '../../hooks/useStreamText';
import { generateDocument } from '../../api/generateDocument';
import styles from './IterateScreen.module.css';

const PANEL_SPACING = 830;

interface IterateScreenProps {
  visible: boolean;
}

export const IterateScreen: React.FC<IterateScreenProps> = ({
  visible,
}) => {
  const paneRef = useRef<HTMLDivElement>(null);
  const { zoomIn, zoomOut, resetCamera } = usePanZoom(paneRef);

  const {
    camX, camY, camScale,
    iterCanvasReady, setIterCanvasReady,
    sidebarPanels, addSidebarPanel, updateSidebarPanel, removeSidebarPanel,
    cards, addCard, pushDeleteHistory, removeCards, undoDelete,
    selectedCards, clearSelections,
    setActiveTool,
  } = useCanvasStore();

  const [ctxMenu, setCtxMenu] = useState<{ cardId: string; x: number; y: number } | null>(null);

  const handleCardContextMenu = useCallback((cardId: string, x: number, y: number) => {
    setCtxMenu({ cardId, x, y });
  }, []);

  const { versions, addVersion } = useVersionStore();
  const { isStreaming, setStreaming, screenMode } = useAppStore();
  const { abort } = useStreamText();

  useEffect(() => {
    if (!visible || versions.length === 0) return;

    if (!iterCanvasReady) setIterCanvasReady(true);

    const panels = useCanvasStore.getState().sidebarPanels;
    const syncedIdxs = new Set(
      panels.filter((p) => p.verIdx !== null).map((p) => p.verIdx as number)
    );
    const chatMessages = useChatStore.getState().messages;

    let added = 0;
    versions.forEach((_, i) => {
      if (syncedIdxs.has(i)) return;

      let prompt = 'Cover letter iteration';
      if (i === 0) {
        prompt = 'Help me draft a cover letter for a role at Anthropic';
      } else {
        const docCard = chatMessages.find(
          (m) => m.role === 'doc-card' && m.versionIdx === i
        );
        if (docCard) {
          const dcIdx = chatMessages.indexOf(docCard);
          for (let j = dcIdx - 1; j >= 0; j--) {
            if (chatMessages[j].role === 'user' && !chatMessages[j].deleted) {
              prompt = chatMessages[j].content;
              break;
            }
          }
        }
      }

      addSidebarPanel({
        id: `sb-sync-${Date.now()}-${i}`,
        prompt,
        verIdx: i,
        x: 52 + (panels.length + added) * PANEL_SPACING,
      });
      added++;
    });
  }, [visible, versions, iterCanvasReady, setIterCanvasReady, addSidebarPanel]);

  const handleCanvasSubmit = useCallback(
    (text: string) => {
      if (isStreaming) return;
      setStreaming(true);

      if (!iterCanvasReady) setIterCanvasReady(true);

      const panelId = 'sb-' + Date.now();
      const panelsBefore = useCanvasStore.getState().sidebarPanels;
      const newX = 52 + panelsBefore.length * PANEL_SPACING;

      addSidebarPanel({
        id: panelId,
        prompt: text,
        verIdx: null,
        x: newX,
      });

      // Mirror the user prompt into chatStore so Ask mode sees it
      const userId = 'user-' + Date.now();
      useChatStore.getState().addMessage({ id: userId, role: 'user', content: text });

      if (panelsBefore.length > 0) {
        const paneW = paneRef.current?.clientWidth || 1200;
        const worldX = 48 + newX;
        const targetCamX = Math.round(paneW * 0.5 - worldX * camScale);

        const canvasEl = paneRef.current?.querySelector('[class*="canvasWorld"]') as HTMLElement | null;
        if (canvasEl) {
          canvasEl.style.transition = 'transform 600ms cubic-bezier(0.25, 1, 0.5, 1)';
          useCanvasStore.getState().setCam(targetCamX, camY, camScale);
          setTimeout(() => { canvasEl.style.transition = ''; }, 650);
        } else {
          useCanvasStore.getState().setCam(targetCamX, camY, camScale);
        }
      }

      void (async () => {
        const { versions: latestVersions } = useVersionStore.getState();
        const verNum = latestVersions.length + 1;
        const label = `Version ${verNum}`;

        let html: string;
        try {
          html = await generateDocument(text);
        } catch {
          removeSidebarPanel(panelId);
          useChatStore.getState().removeMessage(userId);
          setStreaming(false);
          return;
        }

        const verIdx = addVersion(html, label);
        updateSidebarPanel(panelId, {
          verIdx,
          needsStream: true,
        });

        // Mirror the resulting version into chatStore so Ask mode shows the doc card
        const docId = 'doc-' + Date.now();
        useChatStore.getState().addMessage({
          id: docId,
          role: 'doc-card',
          content: label,
          versionIdx: verIdx,
          label,
        });
      })();
    },
    [
      isStreaming,
      setStreaming,
      iterCanvasReady,
      setIterCanvasReady,
      addVersion,
      addSidebarPanel,
      updateSidebarPanel,
      removeSidebarPanel,
      camScale,
      camY,
    ]
  );

  const handleStop = useCallback(() => {
    abort();
    setStreaming(false);
  }, [abort, setStreaming]);

  const autoPanToCard = useCallback((el: HTMLElement) => {
    requestAnimationFrame(() => {
      const pane = paneRef.current;
      if (!pane) return;
      const cr = el.getBoundingClientRect();
      const pr = pane.getBoundingClientRect();
      const m = 80;
      const { camX: cx, camY: cy, camScale: cs, setCam } = useCanvasStore.getState();
      let tx = cx, ty = cy;
      let moved = false;
      if (cr.right > pr.right - m) { tx -= (cr.right - pr.right + m); moved = true; }
      if (cr.bottom > pr.bottom - 160 - m) { ty -= (cr.bottom - pr.bottom + 160 + m); moved = true; }
      if (cr.left < pr.left + m) { tx += (pr.left + m - cr.left); moved = true; }
      if (moved) setCam(tx, ty, cs);
    });
  }, []);

  const handleAddNote = useCallback(() => {
    const PANEL_W = 490;
    const cx = sidebarPanels.length > 0 ? 52 + PANEL_W + 40 : 570;
    const noteCount = cards.filter((c) => c.type === 'note').length;
    const colorNames = ['yellow', 'green', 'red'];
    const id = 'note-' + Date.now();
    const nextY = cards.length === 0
      ? 0
      : Math.max(...cards.map((c) => c.y + (c.type === 'note' ? 154 : 68))) + 16;
    addCard({
      id,
      type: 'note',
      x: cx,
      y: nextY,
      data: { color: colorNames[noteCount % 3] },
    });
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) autoPanToCard(el);
    }, 50);
  }, [addCard, cards, sidebarPanels.length, autoPanToCard]);

  const handleAddFile = useCallback(() => {
    const PANEL_W = 490;
    const cx = sidebarPanels.length > 0 ? 52 + PANEL_W + 40 : 570;
    const id = 'file-' + Date.now();
    const nextY = cards.length === 0
      ? 0
      : Math.max(...cards.map((c) => c.y + (c.type === 'note' ? 154 : 68))) + 16;
    addCard({
      id,
      type: 'file',
      x: cx,
      y: nextY,
      data: { name: "Rakshit's Resume", meta: 'Document \u00b7 PDF' },
    });
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) autoPanToCard(el);
    }, 50);
  }, [addCard, cards, sidebarPanels.length, autoPanToCard]);

  useEffect(() => {
    if (screenMode !== 'iterate') return;

    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.matches('textarea, input, [contenteditable="true"]')) return;

      if (e.key === 'Escape') {
        setCtxMenu(null);
        clearSelections();
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        undoDelete();
        return;
      }

      if (e.key === 'v' || e.key === 'V') {
        setActiveTool('select');
        return;
      }

      if (e.key === 's' || e.key === 'S') {
        handleAddNote();
        return;
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedCards.size > 0) {
        e.preventDefault();
        const ids = [...selectedCards];
        pushDeleteHistory(ids);
        ids.forEach(id => {
          const el = document.getElementById(id);
          if (el) {
            el.style.transition = 'opacity 180ms ease, transform 180ms ease';
            el.style.opacity = '0';
            el.style.transform = 'scale(0.93)';
          }
        });
        setTimeout(() => removeCards(ids), 180);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [screenMode, selectedCards, clearSelections, setActiveTool, handleAddNote, pushDeleteHistory, removeCards, undoDelete]);

  useEffect(() => {
    if (screenMode !== 'iterate') return;
    const pane = paneRef.current;
    if (!pane) return;

    let rbActive = false;
    let rbStartX = 0;
    let rbStartY = 0;
    const rubberBand = document.getElementById('rubber-band');

    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        e.button !== 0 ||
        useCanvasStore.getState().activeTool === 'hand' ||
        target.closest('.canvas-card, [class*="sidebar"], [class*="Sidebar"], [class*="wrapper"], [id^="sb-"]') ||
        target.closest('textarea, input, button, [contenteditable]') ||
        target.closest('[class*="inputBar"], [class*="InputBar"], [class*="canvasToolbar"], [class*="CanvasToolbar"], [class*="zoomControls"], [class*="ZoomControls"]')
      ) return;

      if (document.activeElement && document.activeElement !== document.body) {
        (document.activeElement as HTMLElement).blur();
      }
      clearSelections();
      rbActive = true;
      rbStartX = e.clientX;
      rbStartY = e.clientY;
      if (rubberBand) {
        rubberBand.style.display = 'block';
        rubberBand.style.left = e.clientX + 'px';
        rubberBand.style.top = e.clientY + 'px';
        rubberBand.style.width = '0px';
        rubberBand.style.height = '0px';
      }
      e.preventDefault();
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!rbActive || !rubberBand) return;
      rubberBand.style.left = Math.min(e.clientX, rbStartX) + 'px';
      rubberBand.style.top = Math.min(e.clientY, rbStartY) + 'px';
      rubberBand.style.width = Math.abs(e.clientX - rbStartX) + 'px';
      rubberBand.style.height = Math.abs(e.clientY - rbStartY) + 'px';
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!rbActive) return;
      rbActive = false;
      if (rubberBand) rubberBand.style.display = 'none';
      const r = {
        left: Math.min(e.clientX, rbStartX),
        top: Math.min(e.clientY, rbStartY),
        right: Math.max(e.clientX, rbStartX),
        bottom: Math.max(e.clientY, rbStartY),
      };
      if (r.right - r.left < 6 && r.bottom - r.top < 6) return;

      const allCards = pane.querySelectorAll('[id^="note-"], [id^="file-"], [id^="sb-"], [id^="iter-sb-"]');
      const toSelect: string[] = [];
      allCards.forEach(card => {
        const cr = card.getBoundingClientRect();
        if (cr.left < r.right && cr.right > r.left && cr.top < r.bottom && cr.bottom > r.top) {
          toSelect.push(card.id);
        }
      });
      if (toSelect.length > 0) {
        useCanvasStore.getState().selectCards(toSelect);
      }
    };

    pane.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      pane.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [screenMode, clearSelections]);

  return (
    <div className={`${styles.iterScreen} ${visible ? styles.visible : ''}`}>
      <div
        ref={paneRef}
        className={styles.canvasPane}
        style={iterCanvasReady ? {
          backgroundImage: 'radial-gradient(circle, var(--dot-color) 1.2px, transparent 1.2px)',
          backgroundSize: `${22 * camScale}px ${22 * camScale}px`,
          backgroundPosition: `${camX}px ${camY}px`,
        } : undefined}
      >
        <Canvas camX={camX} camY={camY} camScale={camScale}>
          {sidebarPanels.map((panel) => (
            <IterSidebarCard key={panel.id} panel={panel} />
          ))}
          {cards.map((card) => {
            if (card.type === 'note') {
              return <NoteCard key={card.id} card={card} onContextMenu={handleCardContextMenu} />;
            }
            if (card.type === 'file') {
              return <FileCard key={card.id} card={card} onContextMenu={handleCardContextMenu} />;
            }
            return null;
          })}
        </Canvas>

        {iterCanvasReady && (
          <>
            <CanvasToolbar
              onAddNote={handleAddNote}
              onAddFile={handleAddFile}
            />
            <ZoomControls
              onZoomIn={zoomIn}
              onZoomOut={zoomOut}
              onReset={resetCamera}
              zoom={Math.round(camScale * 100)}
            />
          </>
        )}

        <div className={styles.inputBar}>
          <div className={styles.inputWrap}>
            <InputBar
              variant="reply"
              placeholder="How can I help you?"
              onSubmit={handleCanvasSubmit}
              isStreaming={isStreaming}
              onStop={handleStop}
              selectionCount={selectedCards.size}
            />
          </div>
          <p className={styles.disclaimer}>
            Claude is AI and can make mistakes. Please double-check responses.
          </p>
        </div>
      </div>

      {ctxMenu && (
        <CanvasContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          onDelete={() => {
            const { selectedCards: sel } = useCanvasStore.getState();
            const ids = sel.size > 0 && sel.has(ctxMenu.cardId)
              ? [...sel]
              : [ctxMenu.cardId];
            pushDeleteHistory(ids);
            ids.forEach((id) => {
              const el = document.getElementById(id);
              if (el) {
                el.style.transition = 'opacity 180ms ease, transform 180ms ease';
                el.style.opacity = '0';
                el.style.transform = 'scale(0.93)';
              }
            });
            setTimeout(() => removeCards(ids), 180);
          }}
          onClose={() => setCtxMenu(null)}
        />
      )}
    </div>
  );
};
