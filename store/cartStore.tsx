import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { Record } from "@/types/typeRecord"

type RecordState = {
  items: Record[]
  addItemToRecords: (item: Record) => void
  removeItemFromRecords: (id: number) => void
  removeAllFromRecords: () => void
}

export const useRecordsStore = create<RecordState>()(
  persist(
    (set, get) => ({
      items: [],

      addItemToRecords: (item: Record) =>
        set((state) => ({
          items: [item, ...state.items],
        })),

      removeItemFromRecords: (id) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        })),

      removeAllFromRecords: () => set({ items: [] }),
    }),

    { name: "recordsStore", storage: createJSONStorage(() => localStorage) },
  ),
)
