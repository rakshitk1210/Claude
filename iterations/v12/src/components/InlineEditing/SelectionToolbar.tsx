import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ReplyIcon, EditIcon } from '../shared/Icons';
import { InlinePromptCard } from './InlinePromptCard';
import { useAppStore } from '../../store/appStore';
import { useStreamText } from '../../hooks/useStreamText';
import { useVersionStore } from '../../store/versionStore';
import styles from './SelectionToolbar.module.css';

export const SelectionToolbar: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ left: 0, top: 0 });
  const [promptVisible, setPromptVisible] = useState(false);
  const [promptPos, setPromptPos] = useState({ left: 0, top: 0 });
  const rangeRectRef = useRef<DOMRect | null>(null);
  const selTargetRef = useRef<HTMLElement | null>(null);
  const selModeRef = useRef<'ask' | 'iterate' | null>(null);
  const { setStreaming } = useAppStore();
  const { stream } = useStreamText();
  const addRevision = useVersionStore((s) => s.addRevision);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if ((e.target as HTMLElement).closest(`.${styles.toolbar}, .${styles.promptCard}`)) return;

    setTimeout(() => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.toString().trim() || sel.toString().trim().length < 5) {
        if (!promptVisible) setVisible(false);
        return;
      }

      const anchor = sel.anchorNode;
      const iterBody = anchor?.nodeType === Node.TEXT_NODE
        ? anchor.parentElement?.closest('[class*="body"]')
        : (anchor as HTMLElement)?.closest?.('[class*="body"]');
      const askDoc = anchor?.nodeType === Node.TEXT_NODE
        ? anchor.parentElement?.closest('[class*="content"][contenteditable]')
        : (anchor as HTMLElement)?.closest?.('[class*="content"][contenteditable]');

      if (!iterBody && !askDoc) {
        if (!promptVisible) setVisible(false);
        return;
      }

      selModeRef.current = iterBody ? 'iterate' : 'ask';

      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      rangeRectRef.current = rect;

      let selTarget = range.commonAncestorContainer;
      if (selTarget.nodeType === Node.TEXT_NODE) selTarget = selTarget.parentElement!;
      selTargetRef.current = (selTarget as HTMLElement).closest('p') || (selTarget as HTMLElement);

      let left = rect.left + rect.width / 2 - 100;
      let top = rect.bottom + 8;
      left = Math.max(8, Math.min(left, window.innerWidth - 220));
      top = Math.min(top, window.innerHeight - 60);

      setPos({ left, top });
      setVisible(true);
    }, 20);
  }, [promptVisible]);

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest(`.${styles.toolbar}`)) return;
      if (!(e.target as HTMLElement).closest(`.${styles.promptCard}`)) {
        setPromptVisible(false);
      }
      if (
        !(e.target as HTMLElement).closest(`.${styles.toolbar}`) &&
        !(e.target as HTMLElement).closest(`.${styles.promptCard}`)
      ) {
        setVisible(false);
      }
    },
    []
  );

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [handleMouseUp, handleMouseDown]);

  const handleReply = useCallback(() => {
    const sel = window.getSelection();
    if (sel && sel.toString().trim()) {
      const text = sel.toString().trim();
      if (selModeRef.current === 'iterate') {
        const canvasInput = document.querySelector<HTMLTextAreaElement>(
          '[class*="iterScreen"] textarea, [class*="IterateScreen"] textarea'
        );
        if (canvasInput) {
          canvasInput.value = '> ' + text + '\n';
          canvasInput.dispatchEvent(new Event('input', { bubbles: true }));
          canvasInput.focus();
        }
      } else {
        const askInput = document.querySelector<HTMLTextAreaElement>(
          '[class*="replyBar"] textarea, [class*="chatPanel"] textarea'
        );
        if (askInput) {
          askInput.value = '> ' + text + '\n';
          askInput.dispatchEvent(new Event('input', { bubbles: true }));
          askInput.focus();
        }
      }
    }
    setVisible(false);
  }, []);

  const handleIterate = useCallback(() => {
    setVisible(false);
    if (rangeRectRef.current) {
      const rect = rangeRectRef.current;
      let left = rect.left;
      let top = rect.bottom + 52;
      left = Math.max(8, Math.min(left, window.innerWidth - 380));
      top = Math.min(top, window.innerHeight - 120);
      setPromptPos({ left, top });
      setPromptVisible(true);
    }
  }, []);

  const handleInlineSubmit = useCallback((instruction: string) => {
    const target = selTargetRef.current;
    if (!target || !instruction) return;
    setPromptVisible(false);

    const newText = '<p>I\u2019ve refined this section based on your feedback, emphasizing specific skills and experiences aligned with Anthropic\u2019s mission while maintaining authentic voice.</p>';

    if (selModeRef.current === 'ask') {
      setStreaming(true);
      target.innerHTML = '<div class="inline-skel"><div class="skel" style="width:92%"></div><div class="skel" style="width:86%"></div><div class="skel" style="width:78%"></div></div>';

      setTimeout(() => {
        target.innerHTML = '';
        stream(target, newText, () => {
          const { versions, viewingVersion } = useVersionStore.getState();
          const docContent = target.closest('[class*="content"][contenteditable]');
          if (docContent && versions[viewingVersion]) {
            addRevision(viewingVersion, docContent.innerHTML);
          }
          setStreaming(false);
        });
      }, 900 + Math.random() * 400);
    } else {
      target.innerHTML = '<div class="inline-skel"><div class="skel" style="width:92%"></div><div class="skel" style="width:86%"></div><div class="skel" style="width:78%"></div></div>';

      setTimeout(() => {
        target.innerHTML = '';
        stream(target, newText, () => {
          const { versions } = useVersionStore.getState();
          const bodyEl = target.closest('[class*="body"]');
          if (bodyEl) {
            const panelEl = bodyEl.closest('[id^="sb-"]');
            if (panelEl) {
              const verIdx = parseInt(panelEl.getAttribute('data-ver-idx') || '0', 10);
              if (versions[verIdx]) {
                addRevision(verIdx, bodyEl.innerHTML);
              }
            }
          }
        });
      }, 900 + Math.random() * 400);
    }
  }, [setStreaming, stream, addRevision]);

  return (
    <>
      <div
        className={`${styles.toolbar} ${visible ? styles.show : ''}`}
        style={{ left: pos.left, top: pos.top }}
      >
        <button className={styles.btn} onClick={handleReply}>
          <ReplyIcon />
          Reply
        </button>
        <button className={`${styles.btn} ${styles.primary}`} onClick={handleIterate}>
          <EditIcon />
          Iterate
        </button>
      </div>

      {promptVisible && (
        <InlinePromptCard
          pos={promptPos}
          onClose={() => setPromptVisible(false)}
          onSubmit={handleInlineSubmit}
        />
      )}
    </>
  );
};
