import { create } from "zustand";

export const useBudgetStore = create((set) => ({
  selectedMonth: new Date().getMonth() + 1,
  selectedYear: new Date().getFullYear(),

  setMonth: (month, year) => set({ selectedMonth: month, selectedYear: year }),
}));
