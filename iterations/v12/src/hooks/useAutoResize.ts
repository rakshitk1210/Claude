import { useCallback } from 'react';

export function useAutoResize(maxHeight: number = 180) {
  return useCallback(
    (el: HTMLTextAreaElement | null) => {
      if (!el) return;
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, maxHeight) + 'px';
    },
    [maxHeight]
  );
}
