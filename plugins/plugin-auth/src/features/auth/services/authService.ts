import { api } from '@gasi/core-ui';
import type { ApiResponse } from '@gasi/core-ui';
import type { AppSession } from '@gasi/core-starter';
import type { LoginRequest, TokenResponse, RefreshRequest } from '../types/auth.types';

// Basic Auth header dari env — client credentials
const clientId     = import.meta.env.VITE_AUTH_CLIENT_ID     ?? '';
const clientSecret = import.meta.env.VITE_AUTH_CLIENT_SECRET ?? '';
const basicToken   = btoa(`${clientId}:${clientSecret}`);

// Token storage — in-memory saja, tidak ke localStorage
// httpOnly cookie handle session di BE, tapi access token tetap perlu
// disimpan untuk Authorization header karena BE masih pakai Bearer
let _accessToken:  string | null = null;
let _refreshToken: string | null = null;

export const tokenStore = {
  get access()  { return _accessToken; },
  get refresh() { return _refreshToken; },
  set: (access: string, refresh: string) => {
    _accessToken  = access;
    _refreshToken = refresh;
  },
  clear: () => {
    _accessToken  = null;
    _refreshToken = null;
  },
};

export const authService = {
  login: (data: LoginRequest) =>
    api
      .post<ApiResponse<TokenResponse>>('/api/v1/auth/login', data, {
        headers: { Authorization: `Basic ${basicToken}` },
      })
      .then((r) => r.data.data),

  logout: () =>
    api.post('/api/v1/auth/logout'),

  validate: () =>
    api.get('/auth/validate'),

  me: () =>
    api
      .get<ApiResponse<AppSession>>('/auth/me', {
        params: { platform: 'WEB' },
      })
      .then((r) => r.data.data),

  refresh: (data: RefreshRequest) =>
    api
      .post<ApiResponse<TokenResponse>>('/api/v1/auth/refresh', data)
      .then((r) => r.data.data),
};
