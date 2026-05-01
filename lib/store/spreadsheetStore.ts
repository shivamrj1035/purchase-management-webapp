import { create } from 'zustand';

interface SpreadsheetConfig {
  spreadsheetUrl: string;
  spreadsheetId: string;
  onboardedAt: string;
}

interface SpreadsheetStore {
  config: SpreadsheetConfig | null;
  configured: boolean;
  loading: boolean;
  error: string | null;
  loadConfig: () => Promise<void>;
  saveConfig: (url: string, id: string, email: string) => Promise<void>;
  clearConfig: () => void;
}

export const useSpreadsheetStore = create<SpreadsheetStore>()((set) => ({
  config: null,
  configured: false,
  loading: false,
  error: null,

  loadConfig: async () => {
    try {
      set({ loading: true, error: null });
      const res = await fetch('/api/user/config');
      const data = await res.json();
      if (data.configured) {
        set({ config: data.config, configured: true });
      } else {
        set({ config: null, configured: false });
      }
    } catch (err: any) {
      set({ error: err.message, config: null, configured: false });
    } finally {
      set({ loading: false });
    }
  },

  saveConfig: async (url, id, email) => {
    try {
      set({ loading: true, error: null });
      const res = await fetch('/api/user/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spreadsheetUrl: url, spreadsheetId: id, email }),
      });
      if (!res.ok) throw new Error('Failed to save config');
      set({ config: { spreadsheetUrl: url, spreadsheetId: id, onboardedAt: new Date().toISOString() }, configured: true });
    } catch (err: any) {
      set({ error: err.message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  clearConfig: () => set({ config: null, configured: false }),
}));
