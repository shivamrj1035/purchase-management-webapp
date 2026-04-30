import { create } from 'zustand';
import type { PaymentRow } from '@/lib/google-sheets/schema';

interface PaymentStore {
  payments: PaymentRow[];
  loading: boolean;
  error: string | null;
  loadPayments: () => Promise<void>;
  addPayment: (p: Omit<PaymentRow, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePayment: (p: PaymentRow) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  getTotalPayments: () => number;
}

export const usePaymentStore = create<PaymentStore>()((set, get) => ({
  payments: [],
  loading: false,
  error: null,

  loadPayments: async () => {
    try {
      set({ loading: true, error: null });
      const res = await fetch('/api/sheets/payments');
      if (!res.ok) throw new Error('Failed to fetch payments');
      const data = await res.json();
      set({ payments: data.payments || [] });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  addPayment: async (payment) => {
    try {
      set({ loading: true, error: null });
      const res = await fetch('/api/sheets/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payment),
      });
      if (!res.ok) throw new Error('Failed to add payment');
      await get().loadPayments();
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  updatePayment: async (payment) => {
    try {
      set({ loading: true, error: null });
      const res = await fetch('/api/sheets/payments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payment),
      });
      if (!res.ok) throw new Error('Failed to update payment');
      await get().loadPayments();
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  deletePayment: async (id) => {
    try {
      set({ loading: true, error: null });
      const res = await fetch(`/api/sheets/payments?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete payment');
      await get().loadPayments();
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  getTotalPayments: () => get().payments.reduce((sum, p) => sum + p.amount, 0),
}));
