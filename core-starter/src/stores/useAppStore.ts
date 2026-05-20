import { create } from 'zustand';

export interface AppUser {
  id:       string;
  username: string;
  fullName: string;
}

export interface MenuItem {
  code:      string;
  label:     string;
  path:      string;
  icon?:     string;
  platform:  string;
  order?:    number;
  children?: MenuItem[];
}

export interface AppSession {
  user:        AppUser;
  roles:       string[];
  permissions: string[];
  menus:       MenuItem[];
}

interface AppStore {
  session:       AppSession | null;
  setSession:    (session: AppSession) => void;
  clearSession:  () => void;
  hasPermission: (permission: string) => boolean;
}

/**
 * Global app session store.
 *
 * Diisi oleh plugin-auth setelah login atau saat restore session.
 * Kalau plugin-auth tidak terpasang → session tetap null:
 *   - Sidebar kosong (tidak ada menu)
 *   - hasPermission selalu return false
 *   - Route tidak di-guard
 */
export const useAppStore = create<AppStore>((set, get) => ({
  session: null,

  setSession: (session) => set({ session }),

  clearSession: () => set({ session: null }),

  hasPermission: (permission) => {
    const { session } = get();
    if (!session) return false;
    return session.permissions.includes(permission);
  },
}));
