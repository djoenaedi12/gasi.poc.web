import { Routes, Route, Navigate } from 'react-router';
import { useExtensions }            from '@gasi/core-starter';
import { ExtensionPoints, resolvePermission } from '@gasi/core-api';
import { DashboardLayout }          from '../layouts/DashboardLayout';
import { DashboardPage }            from '../features/dashboard/pages/DashboardPage';

function NotFoundPage() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">404</h1>
        <p className="mt-2 text-muted-foreground">Halaman tidak ditemukan</p>
      </div>
    </div>
  );
}

function ForbiddenPage() {
  return (
    <div className="flex min-h-svh items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">403</h1>
        <p className="mt-2 text-muted-foreground">Anda tidak memiliki akses ke halaman ini</p>
      </div>
    </div>
  );
}

export function AppRoutes() {
  const routeExts = useExtensions(ExtensionPoints.ROUTE);
  const guardExts = useExtensions(ExtensionPoints.AUTH_GUARD);

  const pluginRoutes = routeExts.flatMap((ext) => ext.routes ?? []);
  const authGuard    = guardExts[0]?.guard ?? null;
  const Guard        = authGuard?.component ?? null;

  // Pisah auth routes (login, dll) dari protected routes
  const authRoutes      = pluginRoutes.filter((r) => r.path === '/login' || r.path.startsWith('/auth'));
  const protectedRoutes = pluginRoutes.filter((r) => r.path !== '/login' && !r.path.startsWith('/auth'));

  const renderProtectedRoute = (route: typeof pluginRoutes[0]) => {
    const Comp       = route.component;
    const permission = resolvePermission(route);

    if (!Guard) {
      // Tidak ada plugin-auth → render bebas
      return <Route key={route.path} path={route.path} element={<Comp />} />;
    }

    return (
      <Route
        key={route.path}
        path={route.path}
        element={
          <Guard permission={permission}>
            <Comp />
          </Guard>
        }
      />
    );
  };

  return (
    <Routes>
      {/* Auth routes — tidak perlu guard */}
      {authRoutes.map((r) => (
        <Route key={r.path} path={r.path} element={<r.component />} />
      ))}

      {/* Error pages */}
      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="/404" element={<NotFoundPage />} />

      {/* Protected routes dalam DashboardLayout */}
      <Route element={<DashboardLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        {protectedRoutes.map(renderProtectedRoute)}
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
