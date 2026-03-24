import { create } from 'zustand';
import type { Version } from './types';

interface VersionState {
  versions: Version[];
  viewingVersion: number;
  addVersion: (html: string, label: string) => number;
  setViewingVersion: (idx: number) => void;
  addRevision: (verIdx: number, html: string) => void;
  navigateRevision: (verIdx: number, direction: -1 | 1) => void;
}

export const useVersionStore = create<VersionState>((set, get) => ({
  versions: [],
  viewingVersion: 0,

  addVersion: (html, label) => {
    const { versions } = get();
    const newVersion: Version = {
      html,
      label,
      revisions: [html],
      currentRevision: 0,
    };
    const idx = versions.length;
    set({ versions: [...versions, newVersion], viewingVersion: idx });
    return idx;
  },

  setViewingVersion: (idx) => {
    const { versions } = get();
    if (idx >= 0 && idx < versions.length) {
      set({ viewingVersion: idx });
    }
  },

  addRevision: (verIdx, html) => {
    set((state) => {
      const versions = [...state.versions];
      const v = { ...versions[verIdx] };
      v.revisions = [...v.revisions, html];
      v.currentRevision = v.revisions.length - 1;
      versions[verIdx] = v;
      return { versions };
    });
  },

  navigateRevision: (verIdx, direction) => {
    set((state) => {
      const versions = [...state.versions];
      const v = { ...versions[verIdx] };
      const next = v.currentRevision + direction;
      if (next >= 0 && next < v.revisions.length) {
        v.currentRevision = next;
        versions[verIdx] = v;
        return { versions };
      }
      return state;
    });
  },
}));
