import { useEffect, useRef } from 'react';
import { useCanvasStore } from '../store/canvasStore';

export function useDraggable(
  cardRef: React.RefObject<HTMLElement | null>,
  cardId: string,
  onPositionChange?: (x: number, y: number) => void,
  handleSelector?: string
) {
  const dragging = useRef(false);
  const startMouse = useRef({ x: 0, y: 0 });
  const startPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const onMouseDown = (e: MouseEvent) => {
      if (
        e.button !== 0 ||
        (e.target as HTMLElement).closest('textarea, [contenteditable="true"], button, input, a')
      )
        return;

      if (handleSelector) {
        const target = e.target as HTMLElement;
        if (!target.closest(handleSelector)) return;
      }

      e.stopPropagation();
      e.preventDefault();
      if (document.activeElement && document.activeElement !== document.body) {
        (document.activeElement as HTMLElement).blur();
      }

      dragging.current = true;
      startMouse.current = { x: e.clientX, y: e.clientY };
      startPos.current = {
        x: parseFloat(el.style.left) || 0,
        y: parseFloat(el.style.top) || 0,
      };
      el.classList.add('is-dragging');
      el.style.zIndex = '30';
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const { camScale } = useCanvasStore.getState();
      const dx = (e.clientX - startMouse.current.x) / camScale;
      const dy = (e.clientY - startMouse.current.y) / camScale;
      const nx = startPos.current.x + dx;
      const ny = startPos.current.y + dy;
      el.style.left = nx + 'px';
      el.style.top = ny + 'px';
    };

    const onMouseUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      el.classList.remove('is-dragging');
      el.style.zIndex = '';
      if (onPositionChange) {
        onPositionChange(
          parseFloat(el.style.left) || 0,
          parseFloat(el.style.top) || 0
        );
      }
    };

    el.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [cardRef, cardId, onPositionChange, handleSelector]);
}
