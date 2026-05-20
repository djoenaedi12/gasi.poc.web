# @gasi/plugin-auth

Plugin autentikasi dan otorisasi untuk GASI platform.

## Fitur

- Login dengan username & password (OAuth2 password grant)
- Logout
- Restore session saat refresh page (`/auth/validate` + `/auth/me`)
- Axios interceptor — attach Bearer token ke setiap request
- Auto refresh token saat 401
- Permission guard untuk protected routes
- Sidebar dan menu dari session (`/auth/me`)

## Struktur

```
plugin-auth/
└── src/
    ├── features/
    │   └── auth/
    │       ├── hooks/
    │       │   └── useLogin.ts
    │       ├── pages/
    │       │   └── LoginPage.tsx
    │       ├── schemas/
    │       │   └── loginSchema.ts
    │       ├── services/
    │       │   └── authService.ts   ← tokenStore, login, logout, validate, me, refresh
    │       ├── types/
    │       │   └── auth.types.ts
    │       └── routes.tsx
    ├── components/
    │   └── PermissionGuard.tsx      ← wrap protected routes
    └── index.ts                     ← register plugin + axios interceptors
```

## Environment variables

```env
VITE_AUTH_CLIENT_ID=gasi-web
VITE_AUTH_CLIENT_SECRET=your-client-secret
```

## Endpoints

| Method | URL | Keterangan |
|---|---|---|
| `POST` | `/api/v1/auth/login` | Login, return access + refresh token |
| `POST` | `/api/v1/auth/logout` | Logout, invalidate token di BE |
| `GET`  | `/auth/validate` | Cek token masih valid (200/401) |
| `GET`  | `/auth/me?platform=WEB` | Ambil session data lengkap |
| `POST` | `/api/v1/auth/refresh` | Refresh access token |

## Behaviour

**Tanpa plugin-auth terpasang:**
- Sidebar kosong (session null)
- Semua route bisa diakses bebas
- Tidak ada login page

**Dengan plugin-auth terpasang:**
- Semua route protected → redirect `/login` kalau belum login
- Menu di sidebar dari `/auth/me`
- Permission check per route (`resource:action`)
- Auto refresh token saat expired
- Redirect `/403` kalau tidak punya permission

## Flow

```
App load / refresh
    ↓
plugin-auth onStart()
    ↓
GET /auth/validate → 200?
    ↓ ya
GET /auth/me → setSession()
    ↓
App render dengan session

Login:
POST /api/v1/auth/login → token
GET  /auth/me → session
setSession() → redirect /
```
