import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ReplyIcon, EditIcon } from '../shared/Icons';
import { InlinePromptCard } from './InlinePromptCard';
import { useAppStore } from '../../store/appStore';
import { useStreamText } from '../../hooks/useStreamText';
import { useVersionStore } from '../../store/versionStore';
import { inlineEdit } from '../../api/inlineEdit';
import styles from './SelectionToolbar.module.css';

const ANCHOR_CLASS = 'inline-edit-anchor';

/** Wraps the range in <mark> so highlight persists after focus moves to the prompt. */
function wrapRangeInAnchorMark(range: Range): HTMLElement | null {
  const mark = document.createElement('mark');
  mark.className = ANCHOR_CLASS;
  try {
    range.surroundContents(mark);
    return mark;
  } catch {
    try {
      const frag = range.extractContents();
      mark.appendChild(frag);
      range.insertNode(mark);
      return mark;
    } catch {
      return null;
    }
  }
}

export const SelectionToolbar: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ left: 0, top: 0 });
  const [promptVisible, setPromptVisible] = useState(false);
  const [promptPos, setPromptPos] = useState({ left: 0, top: 0 });
  const rangeRectRef = useRef<DOMRect | null>(null);
  const selTargetRef = useRef<HTMLElement | null>(null);
  const selModeRef = useRef<'ask' | 'iterate' | null>(null);
  const anchorMarkRef = useRef<HTMLElement | null>(null);
  const { setStreaming } = useAppStore();
  const { stream } = useStreamText();
  const addRevision = useVersionStore((s) => s.addRevision);

  const clearIterateHighlight = useCallback(() => {
    const mark = anchorMarkRef.current;
    anchorMarkRef.current = null;
    if (!mark || !mark.isConnected) return;
    const parent = mark.parentNode;
    if (!parent) return;
    while (mark.firstChild) {
      parent.insertBefore(mark.firstChild, mark);
    }
    parent.removeChild(mark);
  }, []);

  useEffect(() => {
    if (!promptVisible) {
      clearIterateHighlight();
    }
  }, [promptVisible, clearIterateHighlight]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (
      (e.target as HTMLElement).closest('[data-selection-toolbar]') ||
      (e.target as HTMLElement).closest('[data-inline-prompt]')
    )
      return;

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

      let left = rect.left + rect.width / 2 - 103;
      let top = rect.bottom + 8;
      left = Math.max(8, Math.min(left, window.innerWidth - 215));
      top = Math.min(top, window.innerHeight - 60);

      setPos({ left, top });
      setVisible(true);
    }, 20);
  }, [promptVisible]);

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('[data-selection-toolbar]')) return;
      if (!(e.target as HTMLElement).closest('[data-inline-prompt]')) {
        setPromptVisible(false);
      }
      if (
        !(e.target as HTMLElement).closest('[data-selection-toolbar]') &&
        !(e.target as HTMLElement).closest('[data-inline-prompt]')
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
    clearIterateHighlight();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return;
    if (!rangeRectRef.current) return;

    const range = sel.getRangeAt(0).cloneRange();
    selectedTextRef.current = sel.toString().trim() || '';

    const mark = wrapRangeInAnchorMark(range);
    anchorMarkRef.current = mark;

    sel.removeAllRanges();

    setVisible(false);
    const rect = rangeRectRef.current;
    let left = rect.left;
    let top = rect.bottom + 48;
    left = Math.max(8, Math.min(left, window.innerWidth - 328));
    top = Math.min(top, window.innerHeight - 64);
    setPromptPos({ left, top });
    setPromptVisible(true);
  }, [clearIterateHighlight]);

  const selectedTextRef = useRef<string>('');

  const handleInlineSubmit = useCallback((instruction: string) => {
    const target = selTargetRef.current;
    if (!target || !instruction) return;
    clearIterateHighlight();
    setPromptVisible(false);

    const selectedText = selectedTextRef.current || target.innerText;
    const container = selModeRef.current === 'ask'
      ? target.closest('[class*="content"][contenteditable]')
      : target.closest('[class*="body"]');
    const surroundingContext = container?.textContent?.slice(0, 500) || '';

    const skelHtml = '<div class="inline-skel"><div class="skel" style="width:92%"></div><div class="skel" style="width:86%"></div><div class="skel" style="width:78%"></div></div>';
    target.innerHTML = skelHtml;

    if (selModeRef.current === 'ask') {
      setStreaming(true);
    }

    inlineEdit(selectedText, instruction, surroundingContext)
      .then((html) => {
        target.innerHTML = '';
        stream(target, html, () => {
          if (selModeRef.current === 'ask') {
            const { versions, viewingVersion } = useVersionStore.getState();
            const docContent = target.closest('[class*="content"][contenteditable]');
            if (docContent && versions[viewingVersion]) {
              addRevision(viewingVersion, docContent.innerHTML);
            }
            setStreaming(false);
          } else {
            const { versions } = useVersionStore.getState();
            const bodyEl = target.closest('[class*="body"]');
            if (bodyEl) {
              const panelEl = bodyEl.closest('[id^="sb-"]');
              if (panelEl) {
                const raw = panelEl.getAttribute('data-ver-idx');
                if (raw != null && raw !== '') {
                  const verIdx = parseInt(raw, 10);
                  if (!Number.isNaN(verIdx) && versions[verIdx]) {
                    addRevision(verIdx, bodyEl.innerHTML);
                  }
                }
              }
            }
          }
        });
      })
      .catch(() => {
        target.innerHTML = '<p>Failed to edit. Please try again.</p>';
        if (selModeRef.current === 'ask') {
          setStreaming(false);
        }
      });
  }, [setStreaming, stream, addRevision, clearIterateHighlight]);

  return (
    <>
      <div
        className={`${styles.toolbar} ${visible ? styles.show : ''}`}
        style={{ left: pos.left, top: pos.top }}
        data-selection-toolbar
      >
        <button type="button" className={styles.btn} onClick={handleReply}>
          <ReplyIcon size={16} />
          Reply
        </button>
        <button type="button" className={`${styles.btn} ${styles.primary}`} onClick={handleIterate}>
          <EditIcon size={16} />
          Iterate
        </button>
      </div>

      {promptVisible && (
        <InlinePromptCard
          pos={promptPos}
          onClose={() => {
            setPromptVisible(false);
          }}
          onSubmit={handleInlineSubmit}
        />
      )}
    </>
  );
};
