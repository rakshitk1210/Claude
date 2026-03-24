import { create } from 'zustand';
import type { ScreenMode } from './types';

interface AppState {
  screenMode: ScreenMode;
  isStreaming: boolean;
  docTitle: string;
  setScreenMode: (mode: ScreenMode) => void;
  setStreaming: (v: boolean) => void;
  setDocTitle: (t: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  screenMode: 'home',
  isStreaming: false,
  docTitle: 'Cover letter for anthropic',

  setScreenMode: (mode) => set({ screenMode: mode }),
  setStreaming: (v) => set({ isStreaming: v }),
  setDocTitle: (t) => set({ docTitle: t }),
}));
