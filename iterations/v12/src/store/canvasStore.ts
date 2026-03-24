import { create } from 'zustand';
import type { CanvasTool, CanvasCardData, IterSidebarPanel } from './types';

interface CanvasState {
  camX: number;
  camY: number;
  camScale: number;
  activeTool: CanvasTool;
  selectedCards: Set<string>;
  cards: CanvasCardData[];
  sidebarPanels: IterSidebarPanel[];
  iterCanvasReady: boolean;

  setCam: (x: number, y: number, scale: number) => void;
  setActiveTool: (tool: CanvasTool) => void;
  toggleCardSelection: (id: string) => void;
  clearSelections: () => void;
  selectCards: (ids: string[]) => void;
  addCard: (card: CanvasCardData) => void;
  updateCardPosition: (id: string, x: number, y: number) => void;
  removeCards: (ids: string[]) => void;
  addSidebarPanel: (panel: IterSidebarPanel) => void;
  setIterCanvasReady: (v: boolean) => void;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  camX: 48,
  camY: 48,
  camScale: 1,
  activeTool: 'select',
  selectedCards: new Set<string>(),
  cards: [],
  sidebarPanels: [],
  iterCanvasReady: false,

  setCam: (x, y, scale) => set({ camX: x, camY: y, camScale: scale }),

  setActiveTool: (tool) => set({ activeTool: tool }),

  toggleCardSelection: (id) => {
    const next = new Set(get().selectedCards);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    set({ selectedCards: next });
  },

  clearSelections: () => set({ selectedCards: new Set() }),

  selectCards: (ids) => {
    const next = new Set(get().selectedCards);
    ids.forEach((id) => next.add(id));
    set({ selectedCards: next });
  },

  addCard: (card) => set((s) => ({ cards: [...s.cards, card] })),

  updateCardPosition: (id, x, y) => {
    set((s) => ({
      cards: s.cards.map((c) => (c.id === id ? { ...c, x, y } : c)),
    }));
  },

  removeCards: (ids) => {
    const idSet = new Set(ids);
    set((s) => ({
      cards: s.cards.filter((c) => !idSet.has(c.id)),
      selectedCards: new Set([...s.selectedCards].filter((id) => !idSet.has(id))),
    }));
  },

  addSidebarPanel: (panel) =>
    set((s) => ({ sidebarPanels: [...s.sidebarPanels, panel] })),

  setIterCanvasReady: (v) => set({ iterCanvasReady: v }),
}));
