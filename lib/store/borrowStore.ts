import { create } from 'zustand';
import type { BorrowRow } from '@/lib/google-sheets/schema';

interface BorrowStore {
  borrows: BorrowRow[];
  loading: boolean;
  error: string | null;
  loadBorrows: () => Promise<void>;
  addBorrow: (borrow: Omit<BorrowRow, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateBorrow: (borrow: BorrowRow) => Promise<void>;
  deleteBorrow: (id: string) => Promise<void>;
  getTotalFunding: () => number;
}

export const useBorrowStore = create<BorrowStore>()((set, get) => ({
  borrows: [],
  loading: false,
  error: null,

  loadBorrows: async () => {
    try {
      set({ loading: true, error: null });
      const res = await fetch('/api/sheets/borrows');
      if (!res.ok) throw new Error('Failed to fetch borrows');
      const data = await res.json();
      set({ borrows: data.borrows || [] });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  addBorrow: async (borrow) => {
    try {
      set({ loading: true, error: null });
      const res = await fetch('/api/sheets/borrows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(borrow),
      });
      if (!res.ok) throw new Error('Failed to add borrow');
      await get().loadBorrows();
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  updateBorrow: async (borrow) => {
    try {
      set({ loading: true, error: null });
      const res = await fetch('/api/sheets/borrows', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(borrow),
      });
      if (!res.ok) throw new Error('Failed to update borrow');
      await get().loadBorrows();
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  deleteBorrow: async (id) => {
    try {
      set({ loading: true, error: null });
      const res = await fetch(`/api/sheets/borrows?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete borrow');
      await get().loadBorrows();
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  getTotalFunding: () => get().borrows.reduce((sum, b) => sum + b.principalAmount, 0),
}));
