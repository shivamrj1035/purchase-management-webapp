import { create } from 'zustand';
import type { EMIRow } from '@/lib/google-sheets/schema';

interface EMIStore {
  emis: EMIRow[];
  loading: boolean;
  error: string | null;
  loadEMIs: (borrowId?: string) => Promise<void>;
  addEMI: (emi: Omit<EMIRow, 'id' | 'createdAt'>) => Promise<void>;
  updateEMI: (emi: EMIRow) => Promise<void>;
  deleteEMI: (id: string) => Promise<void>;
  syncEMIs: () => Promise<{ created: number; updated: number; duplicatesRemoved: number }>;
}

export const useEMIStore = create<EMIStore>()((set, get) => ({
  emis: [],
  loading: false,
  error: null,

  loadEMIs: async (borrowId) => {
    try {
      set({ loading: true, error: null });
      const url = borrowId ? `/api/sheets/emis?borrowId=${borrowId}` : '/api/sheets/emis';
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch EMIs');
      const data = await res.json();
      set({ emis: data.emis || [] });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  addEMI: async (emi) => {
    try {
      set({ loading: true, error: null });
      const res = await fetch('/api/sheets/emis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emi),
      });
      if (!res.ok) throw new Error('Failed to add EMI');
      await get().loadEMIs();
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  updateEMI: async (emi) => {
    try {
      set({ loading: true, error: null });
      const res = await fetch('/api/sheets/emis', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emi),
      });
      if (!res.ok) throw new Error('Failed to update EMI');
      await get().loadEMIs();
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  deleteEMI: async (id) => {
    try {
      set({ loading: true, error: null });
      const res = await fetch(`/api/sheets/emis?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete EMI');
      await get().loadEMIs();
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  syncEMIs: async () => {
    try {
      set({ loading: true, error: null });
      const res = await fetch('/api/sheets/emis/sync', { method: 'POST' });
      if (!res.ok) throw new Error('Failed to sync EMIs');
      const data = await res.json();
      await get().loadEMIs();
      return {
        created: data.created || 0,
        updated: data.updated || 0,
        duplicatesRemoved: data.duplicatesRemoved || 0,
      };
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },
}));
