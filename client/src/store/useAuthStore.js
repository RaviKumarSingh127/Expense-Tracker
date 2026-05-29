import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi } from "@/api/authApi";
import toast from "react-hot-toast";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.login(credentials);
          const { user, accessToken } = data.data;
          localStorage.setItem("accessToken", accessToken);
          set({ user, accessToken, isAuthenticated: true, isLoading: false });
          toast.success(`Welcome back, ${user.name.split(" ")[0]}!`);
          return { success: true };
        } catch (err) {
          set({ isLoading: false });
          return { success: false, message: err.response?.data?.message };
        }
      },

      register: async (userData) => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.register(userData);
          const { user, accessToken } = data.data;
          localStorage.setItem("accessToken", accessToken);
          set({ user, accessToken, isAuthenticated: true, isLoading: false });
          toast.success("Account created! Welcome to FlowFin 🎉");
          return { success: true };
        } catch (err) {
          set({ isLoading: false });
          return { success: false, message: err.response?.data?.message };
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
        } finally {
          localStorage.removeItem("accessToken");
          set({ user: null, accessToken: null, isAuthenticated: false });
        }
      },

      updateUser: (updates) => set((state) => ({ user: { ...state.user, ...updates } })),

      refreshUser: async () => {
        try {
          const { data } = await authApi.getMe();
          set({ user: data.data.user });
        } catch {
          get().logout();
        }
      },
    }),
    {
      name: "flowfin-auth",
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
