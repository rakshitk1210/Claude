import { useRef, useEffect, useCallback } from 'react';

export function useResizePane(
  handleRef: React.RefObject<HTMLDivElement | null>,
  leftRef: React.RefObject<HTMLDivElement | null>,
  splitRef: React.RefObject<HTMLDivElement | null>
) {
  const dragging = useRef(false);

  const onMouseDown = useCallback((e: MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    handleRef.current?.classList.add('dragging');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [handleRef]);

  useEffect(() => {
    const handle = handleRef.current;
    if (!handle) return;

    handle.addEventListener('mousedown', onMouseDown);

    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current || !splitRef.current || !leftRef.current) return;
      const rect = splitRef.current.getBoundingClientRect();
      const offset = e.clientX - rect.left;
      const pct = (offset / rect.width) * 100;
      const clamped = Math.min(Math.max(pct, 25), 75);
      leftRef.current.style.width = clamped + '%';
    };

    const onMouseUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      handleRef.current?.classList.remove('dragging');
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      handle.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [handleRef, leftRef, splitRef, onMouseDown]);
}
