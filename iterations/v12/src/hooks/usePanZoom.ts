import { useCallback, useRef, useEffect } from 'react';
import { useCanvasStore } from '../store/canvasStore';

const CAM_MIN = 0.1;
const CAM_MAX = 3;

export function usePanZoom(paneRef: React.RefObject<HTMLDivElement | null>) {
  const isPanning = useRef(false);
  const panOrigin = useRef({ x: 0, y: 0 });
  const spaceDown = useRef(false);

  const isHandTool = () => useCanvasStore.getState().activeTool === 'hand';

  const zoomAt = useCallback((cx: number, cy: number, factor: number) => {
    const { camX, camY, camScale, setCam } = useCanvasStore.getState();
    const ns = Math.min(CAM_MAX, Math.max(CAM_MIN, camScale * factor));
    const wx = (cx - camX) / camScale;
    const wy = (cy - camY) / camScale;
    setCam(cx - wx * ns, cy - wy * ns, ns);
  }, []);

  const resetCamera = useCallback(() => {
    useCanvasStore.getState().setCam(48, 48, 1);
  }, []);

  const zoomIn = useCallback(() => {
    const pane = paneRef.current;
    if (!pane) return;
    zoomAt(pane.clientWidth / 2, pane.clientHeight / 2, 1.25);
  }, [paneRef, zoomAt]);

  const zoomOut = useCallback(() => {
    const pane = paneRef.current;
    if (!pane) return;
    zoomAt(pane.clientWidth / 2, pane.clientHeight / 2, 1 / 1.25);
  }, [paneRef, zoomAt]);

  const activeTool = useCanvasStore((s) => s.activeTool);

  useEffect(() => {
    const pane = paneRef.current;
    if (!pane) return;

    pane.style.cursor = activeTool === 'hand' ? 'grab' : '';
  }, [activeTool, paneRef]);

  useEffect(() => {
    const pane = paneRef.current;
    if (!pane) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey) {
        // Pinch gesture — browser sets ctrlKey=true for trackpad pinch
        const r = pane.getBoundingClientRect();
        zoomAt(e.clientX - r.left, e.clientY - r.top, e.deltaY < 0 ? 1.098 : 1 / 1.098);
      } else {
        // Two-finger swipe — pan the canvas
        const { camX, camY, camScale, setCam } = useCanvasStore.getState();
        setCam(camX - e.deltaX, camY - e.deltaY, camScale);
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !(e.target as HTMLElement).matches?.('textarea,input,[contenteditable]')) {
        if (!spaceDown.current) {
          spaceDown.current = true;
          pane.style.cursor = 'grab';
        }
        e.preventDefault();
      }
      if (e.key === 'Escape') {
        useCanvasStore.getState().clearSelections();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        spaceDown.current = false;
        if (!isPanning.current) pane.style.cursor = isHandTool() ? 'grab' : '';
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      const { camX, camY } = useCanvasStore.getState();
      const shouldPan =
        e.button === 1 ||
        (e.button === 0 && spaceDown.current) ||
        (e.button === 0 && isHandTool());

      if (shouldPan) {
        isPanning.current = true;
        panOrigin.current = { x: e.clientX - camX, y: e.clientY - camY };
        pane.style.cursor = 'grabbing';
        e.preventDefault();
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isPanning.current) return;
      const { camScale, setCam } = useCanvasStore.getState();
      setCam(
        e.clientX - panOrigin.current.x,
        e.clientY - panOrigin.current.y,
        camScale
      );
    };

    const onMouseUp = () => {
      if (isPanning.current) {
        isPanning.current = false;
        pane.style.cursor = (spaceDown.current || isHandTool()) ? 'grab' : '';
      }
    };

    pane.addEventListener('wheel', onWheel, { passive: false });
    pane.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      pane.removeEventListener('wheel', onWheel);
      pane.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [paneRef, zoomAt]);

  return { zoomIn, zoomOut, resetCamera, spaceDown };
}
