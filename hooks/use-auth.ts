"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types/product";

interface AuthStore {
  user: User | null;
  admin: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
}

// Mock user data
const mockUser: User = {
  id: "1",
  firstName: "Donald",
  lastName: "Trump",
  email: "donald@example.com",
  addresses: [
    {
      id: "1",
      name: "Home",
      street: "123 Main St",
      city: "New York",
      state: "NY",
      zipCode: "10001",
      country: "USA",
      isDefault: true,
    },
  ],
  orders: [],
};

const mockAdmin: User = {
  id: "1",
  firstName: "Narendra",
  lastName: "Modi",
  email: "admin@example.com",
  addresses: [
    {
      id: "1",
      name: "Work",
      street: "123 Main St",
      city: "San Francisco",
      state: "CA",
      zipCode: "10001",
      country: "USA",
      isDefault: true,
    },
  ],
  orders: [],
};

export const useAuth = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      admin: null,
      login: async (email, password) => {
        // Mock login - in real app, this would call your API
        if (email === "demo@example.com" && password === "demo123") {
          set({ user: mockUser });
          return true;
        }

        if (email === "admin@example.com" && password === "admin123") {
          set({ admin: mockAdmin });
          return true;
        }
        return false;
      },

      register: async (firstName, lastName, email, password) => {
        // Mock registration - in real app, this would call your API
        const newUser: User = {
          ...mockUser,
          id: Date.now().toString(),
          firstName,
          lastName,
          email,
          addresses: [],
          orders: [],
        };
        set({ user: newUser });
        return true;
      },

      logout: () => {
        set({ user: null, admin: null });
      },

      updateProfile: (updates) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...updates } });
        }
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
