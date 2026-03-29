import { create } from 'zustand';
import type { ScreenMode } from './types';

interface AppState {
  screenMode: ScreenMode;
  isStreaming: boolean;
  docTitle: string;
  /** Full text from the home screen submit (Ask panel + chat seed context). */
  homePrompt: string;
  setScreenMode: (mode: ScreenMode) => void;
  setStreaming: (v: boolean) => void;
  setDocTitle: (t: string) => void;
  setHomePrompt: (p: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  screenMode: 'home',
  isStreaming: false,
  docTitle: 'Untitled',
  homePrompt: '',

  setScreenMode: (mode) => set({ screenMode: mode }),
  setStreaming: (v) => set({ isStreaming: v }),
  setDocTitle: (t) => set({ docTitle: t }),
  setHomePrompt: (p) => set({ homePrompt: p }),
}));
