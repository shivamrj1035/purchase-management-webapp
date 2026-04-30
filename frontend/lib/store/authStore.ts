/**
 * Auth Store - Clerk compatibility layer
 * Provides the same useAuthStore() interface that existing components expect,
 * but backed by Clerk instead of Firebase/cookies.
 */
import { create } from 'zustand';

interface User {
  userId: string;
  email: string;
  username: string;
  phoneNumber?: string;
  homeAddress?: string;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setClerkUser: (clerkUser: { id: string; emailAddresses: { emailAddress: string }[]; firstName?: string | null; lastName?: string | null }) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setClerkUser: (clerkUser) => {
    const user: User = {
      userId: clerkUser.id,
      email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
      username: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') || 'User',
      isEmailVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  updateUser: (userData) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...userData } : null,
    })),
}));
