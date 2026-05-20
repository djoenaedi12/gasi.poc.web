import { Routes, Route, Navigate } from 'react-router';
import { useExtensions }           from '@gasi/core-starter';
import { ExtensionPoints, resolvePermission } from '@gasi/core-api';
import { DashboardLayout }         from '../layouts/DashboardLayout';
import { DashboardPage }           from '../features/dashboard/pages/DashboardPage';

export function AppRoutes() {
  const routeExts  = useExtensions(ExtensionPoints.ROUTE);
  const guardExts  = useExtensions(ExtensionPoints.AUTH_GUARD);

  // Ambil semua routes dari plugin yang aktif
  const pluginRoutes = routeExts.flatMap((ext) => ext.routes ?? []);

  // Ambil auth guard dari plugin-auth (kalau terpasang)
  const authGuard = guardExts[0]?.guard ?? null;
  const Guard     = authGuard?.component ?? null;

  const renderRoute = (route: typeof pluginRoutes[0]) => {
    const Comp       = route.component;
    const permission = resolvePermission(route);

    // Kalau plugin-auth tidak ada → render langsung tanpa guard
    if (!Guard) {
      return <Route key={route.path} path={route.path} element={<Comp />} />;
    }

    // Plugin-auth ada → wrap dengan guard + permission check
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
      {/* Route dari plugin-auth (login, forgot password, dll) */}
      {routeExts
        .flatMap((ext) => ext.routes ?? [])
        .filter((r) => r.path.startsWith('/auth') || r.path === '/login')
        .map((route) => (
          <Route key={route.path} path={route.path} element={<route.component />} />
        ))}

      {/* Protected routes dalam DashboardLayout */}
      <Route element={<DashboardLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Routes dari semua plugin (kecuali auth routes) */}
        {pluginRoutes
          .filter((r) => !r.path.startsWith('/auth') && r.path !== '/login')
          .map(renderRoute)}
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
