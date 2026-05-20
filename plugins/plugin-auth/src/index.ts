import { pluginRegistry, ExtensionPoints } from '@gasi/core-api';
import { useAppStore }                     from '@gasi/core-starter';
import { authService, tokenStore }         from './features/auth/services/authService';
import { authRoutes }                      from './features/auth/routes';
import { PermissionGuard }                 from './components/PermissionGuard';

// Pasang axios interceptor untuk attach Bearer token ke setiap request
// dan handle refresh token saat 401
import { api } from '@gasi/core-ui';

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

api.interceptors.request.use((config) => {
  const token = tokenStore.access;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Kalau 401 dan bukan dari endpoint auth sendiri
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/')
    ) {
      const refresh = tokenStore.refresh;

      if (!refresh) {
        // Tidak ada refresh token → logout
        useAppStore.getState().clearSession();
        tokenStore.clear();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Antri request yang sedang menunggu token baru
        return new Promise((resolve) => {
          refreshQueue.push((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const tokens = await authService.refresh({ refreshToken: refresh });
        tokenStore.set(tokens.accessToken, tokens.refreshToken);

        // Eksekusi semua request yang antri
        refreshQueue.forEach((cb) => cb(tokens.accessToken));
        refreshQueue = [];

        originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
        return api(originalRequest);
      } catch {
        // Refresh gagal → logout
        useAppStore.getState().clearSession();
        tokenStore.clear();
        refreshQueue = [];
        window.location.href = '/login';
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// Register plugin
pluginRegistry.register({
  id:          'plugin.auth',
  name:        'Auth Plugin',
  version:     '1.0.0',
  description: 'Authentication, authorization, dan session management',
  extensions: [
    // Route: login page
    {
      point:  ExtensionPoints.ROUTE,
      routes: authRoutes,
    },
    // Auth guard: protect routes dan check permission
    {
      point: ExtensionPoints.AUTH_GUARD,
      guard: {
        component:     PermissionGuard,
        hasPermission: (permission) => useAppStore.getState().hasPermission(permission),
      },
    },
  ],

  async onStart() {
    console.info('[plugin.auth] started');
    try {
      // Restore session saat refresh page
      await authService.validate();           // Cek token masih valid (200/401)
      const session = await authService.me(); // Ambil full session data
      useAppStore.getState().setSession(session);
    } catch {
      // Token tidak ada atau expired → biarkan, PermissionGuard akan redirect ke /login
    }
  },

  onStop() {
    console.info('[plugin.auth] stopped');
    useAppStore.getState().clearSession();
    tokenStore.clear();
  },
});
