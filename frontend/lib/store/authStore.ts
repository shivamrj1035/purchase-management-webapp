import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types/auth'
import Cookies from 'js-cookie'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      
      login: (user, token) => {
        // Set cookie for middleware
        Cookies.set('auth-token', token, { expires: 7 }) // 7 days
        
        set({ 
          user, 
          token, 
          isAuthenticated: true 
        })
      },
      
      logout: () => {
        // Remove cookie
        Cookies.remove('auth-token')
        
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false 
        })
      },
      
      updateUser: (userData) => set((state) => ({
        user: state.user ? { ...state.user, ...userData } : null
      })),
    }),
    {
      name: 'auth-storage',
    }
  )
)
