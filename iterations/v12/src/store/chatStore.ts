import { create } from 'zustand';
import type { ChatMessage } from './types';

interface ChatState {
  messages: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
  toggleDeleted: (id: string) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],

  addMessage: (msg) =>
    set((s) => ({ messages: [...s.messages, msg] })),

  toggleDeleted: (id) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, deleted: !m.deleted } : m
      ),
    })),

  clearMessages: () => set({ messages: [] }),
}));
