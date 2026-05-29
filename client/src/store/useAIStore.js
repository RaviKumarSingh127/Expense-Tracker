import { create } from "zustand";

export const useAIStore = create((set) => ({
  isChatOpen: false,
  messages: [],
  isTyping: false,

  openChat: () => set({ isChatOpen: true }),
  closeChat: () => set({ isChatOpen: false }),
  toggleChat: () => set((state) => ({ isChatOpen: !state.isChatOpen })),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, { ...message, id: Date.now() }] })),

  setTyping: (isTyping) => set({ isTyping }),

  clearMessages: () => set({ messages: [] }),
}));
