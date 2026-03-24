import { useRef, useCallback } from 'react';

export function useStreamText() {
  const abortRef = useRef(false);

  const showSkeleton = useCallback((container: HTMLElement, groups = 3) => {
    container.innerHTML = '';
    container.contentEditable = 'false';
    const skelHtml = '<div class="skel-group"><div class="skel" style="width:92%"></div><div class="skel" style="width:86%"></div><div class="skel" style="width:78%"></div><div class="skel" style="width:90%"></div><div class="skel" style="width:70%"></div></div>';
    container.innerHTML = skelHtml.repeat(groups);
  }, []);

  const stream = useCallback(
    (
      container: HTMLElement,
      html: string,
      onDone?: () => void
    ) => {
      abortRef.current = false;
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

      function next() {
        if (abortRef.current) {
          cursor.remove();
          onDone?.();
          return;
        }
        if (idx >= chunks.length) {
          cursor.remove();
          onDone?.();
          return;
        }
        const ch = chunks[idx++];
        if (ch === null) {
          curP = null;
          setTimeout(next, 46);
          return;
        }
        if (!curP) {
          curP = document.createElement('p');
          container.insertBefore(curP, cursor);
        }
        const s = document.createElement('span');
        s.innerHTML = ch;
        curP.appendChild(s);
        setTimeout(next, 7 + Math.random() * 12);
      }

      next();
    },
    []
  );

  const abort = useCallback(() => {
    abortRef.current = true;
  }, []);

  return { stream, showSkeleton, abort };
}
