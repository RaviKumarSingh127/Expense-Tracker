import { create } from "zustand";

export const useTransactionStore = create((set) => ({
  filters: {
    type: "",
    category: [],
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
    paymentMethod: "",
    search: "",
    page: 1,
    limit: 20,
    sortBy: "date",
    sortOrder: "desc",
  },
  selectedIds: [],

  setFilter: (key, value) =>
    set((state) => ({ filters: { ...state.filters, [key]: value, page: 1 } })),

  setPage: (page) => set((state) => ({ filters: { ...state.filters, page } })),

  resetFilters: () =>
    set({
      filters: {
        type: "", category: [], startDate: "", endDate: "",
        minAmount: "", maxAmount: "", paymentMethod: "", search: "",
        page: 1, limit: 20, sortBy: "date", sortOrder: "desc",
      },
    }),

  toggleSelect: (id) =>
    set((state) => ({
      selectedIds: state.selectedIds.includes(id)
        ? state.selectedIds.filter((x) => x !== id)
        : [...state.selectedIds, id],
    })),

  clearSelected: () => set({ selectedIds: [] }),
}));
