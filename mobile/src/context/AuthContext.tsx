import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { create } from 'zustand';
import apiService from '../services/api';
import { User, AuthState } from '../types';

interface AuthStore extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,

  signIn: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await apiService.signIn(email, password);
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  signUp: async (name: string, email: string, password: string) => {
    set({ isLoading: true });
    try {
      await apiService.signUp(name, email, password);
      // After signup, sign in automatically
      await get().signIn(email, password);
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  signOut: async () => {
    set({ isLoading: true });
    try {
      await apiService.signOut();
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const hasToken = await apiService.hasToken();
      if (hasToken) {
        const user = await apiService.getCurrentUser();
        if (user) {
          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }
      }
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },
}));

// Context provider for React Navigation integration
interface AuthContextValue {
  authState: AuthState;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const store = useAuthStore();

  useEffect(() => {
    store.checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        authState: {
          user: store.user,
          token: store.token,
          isLoading: store.isLoading,
          isAuthenticated: store.isAuthenticated,
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
