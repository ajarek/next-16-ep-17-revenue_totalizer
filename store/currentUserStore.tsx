import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { User } from "@/types/typeUser"

type UserState = {
  currentUser: User | null
  setCurrentUser: (user: User) => void
}

export const useCurrentUserStore = create<UserState>()(
  persist(
    (set) => ({
      currentUser: null,

      setCurrentUser: (user: User) =>
        set({
          currentUser: user,
        }),
    }),

    {
      name: "currentUserStore",
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
