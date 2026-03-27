import { create } from 'zustand';
import type { ChatMessage } from './types';

interface ChatState {
  messages: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
  appendToMessage: (id: string, text: string) => void;
  updateMessage: (id: string, content: string) => void;
  removeMessage: (id: string) => void;
  toggleDeleted: (id: string) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],

  addMessage: (msg) =>
    set((s) => ({ messages: [...s.messages, msg] })),

  appendToMessage: (id, text) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, content: m.content + text } : m
      ),
    })),

  updateMessage: (id, content) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, content } : m
      ),
    })),

  removeMessage: (id) =>
    set((s) => ({ messages: s.messages.filter((m) => m.id !== id) })),

  toggleDeleted: (id) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === id ? { ...m, deleted: !m.deleted } : m
      ),
    })),

  clearMessages: () => set({ messages: [] }),
}));
