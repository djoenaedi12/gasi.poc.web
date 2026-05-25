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

  const blankRoutes = pluginRoutes.filter((r) => r.public || r.layout === 'blank');
  const dashboardRoutes = pluginRoutes.filter((r) => !r.public && r.layout !== 'blank');

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
      {/* Blank/public routes — tidak perlu dashboard layout atau guard */}
      {blankRoutes.map((route) => {
        const Comp = route.component;
        return <Route key={route.path} path={route.path} element={<Comp />} />;
      })}

      {/* Error pages */}
      <Route path="/403" element={<ForbiddenPage />} />
      <Route path="/404" element={<NotFoundPage />} />

      {/* Protected routes dalam DashboardLayout */}
      <Route element={<DashboardLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        {dashboardRoutes.map(renderProtectedRoute)}
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
