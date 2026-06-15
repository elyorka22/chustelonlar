import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FilterState {
  search: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  district: string;
  sort: string;
  setSearch: (search: string) => void;
  setCategory: (category: string) => void;
  setMinPrice: (price: string) => void;
  setMaxPrice: (price: string) => void;
  setDistrict: (district: string) => void;
  setSort: (sort: string) => void;
  reset: () => void;
}

const initialState = {
  search: "",
  category: "",
  minPrice: "",
  maxPrice: "",
  district: "",
  sort: "newest",
};

export const useFilterStore = create<FilterState>()((set) => ({
  ...initialState,
  setSearch: (search) => set({ search }),
  setCategory: (category) => set({ category }),
  setMinPrice: (minPrice) => set({ minPrice }),
  setMaxPrice: (maxPrice) => set({ maxPrice }),
  setDistrict: (district) => set({ district }),
  setSort: (sort) => set({ sort }),
  reset: () => set(initialState),
}));

interface ThemeState {
  theme: "light" | "dark";
  toggleTheme: () => void;
  setTheme: (theme: "light" | "dark") => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "light",
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === "light" ? "dark" : "light",
        })),
      setTheme: (theme) => set({ theme }),
    }),
    { name: "chustelon-theme" }
  )
);
