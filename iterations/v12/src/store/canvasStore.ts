import { create } from 'zustand';
import type { CanvasTool, CanvasCardData, IterSidebarPanel } from './types';

interface CanvasState {
  camX: number;
  camY: number;
  camScale: number;
  activeTool: CanvasTool;
  selectedCards: Set<string>;
  cards: CanvasCardData[];
  deletedCardsHistory: CanvasCardData[][];
  sidebarPanels: IterSidebarPanel[];
  iterCanvasReady: boolean;

  setCam: (x: number, y: number, scale: number) => void;
  setActiveTool: (tool: CanvasTool) => void;
  toggleCardSelection: (id: string) => void;
  clearSelections: () => void;
  selectCards: (ids: string[]) => void;
  addCard: (card: CanvasCardData) => void;
  updateCardPosition: (id: string, x: number, y: number) => void;
  pushDeleteHistory: (ids: string[]) => void;
  removeCards: (ids: string[]) => void;
  undoDelete: () => void;
  addSidebarPanel: (panel: IterSidebarPanel) => void;
  updateSidebarPanel: (id: string, patch: Partial<Omit<IterSidebarPanel, 'id'>>) => void;
  removeSidebarPanel: (id: string) => void;
  setIterCanvasReady: (v: boolean) => void;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  camX: 48,
  camY: 48,
  camScale: 1,
  activeTool: 'select',
  selectedCards: new Set<string>(),
  cards: [],
  deletedCardsHistory: [],
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

  pushDeleteHistory: (ids) => {
    const idSet = new Set(ids);
    const deleted = get().cards.filter((c) => idSet.has(c.id));
    if (deleted.length === 0) return;
    set((s) => ({
      deletedCardsHistory: [...s.deletedCardsHistory.slice(-19), deleted],
    }));
  },

  removeCards: (ids) => {
    const idSet = new Set(ids);
    set((s) => ({
      cards: s.cards.filter((c) => !idSet.has(c.id)),
      selectedCards: new Set([...s.selectedCards].filter((id) => !idSet.has(id))),
    }));
  },

  undoDelete: () => {
    const { deletedCardsHistory } = get();
    if (deletedCardsHistory.length === 0) return;
    const last = deletedCardsHistory[deletedCardsHistory.length - 1];
    set((s) => ({
      deletedCardsHistory: s.deletedCardsHistory.slice(0, -1),
      cards: [...s.cards, ...last],
    }));
  },

  addSidebarPanel: (panel) =>
    set((s) => ({ sidebarPanels: [...s.sidebarPanels, panel] })),

  updateSidebarPanel: (id, patch) =>
    set((s) => ({
      sidebarPanels: s.sidebarPanels.map((p) =>
        p.id === id ? { ...p, ...patch } : p
      ),
    })),

  removeSidebarPanel: (id) =>
    set((s) => ({
      sidebarPanels: s.sidebarPanels.filter((p) => p.id !== id),
      selectedCards: new Set([...s.selectedCards].filter((sid) => sid !== id)),
    })),

  setIterCanvasReady: (v) => set({ iterCanvasReady: v }),
}));
