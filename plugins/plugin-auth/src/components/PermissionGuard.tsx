import { useEffect, type ReactNode } from 'react';
import { useNavigate }               from 'react-router';
import { useAppStore }               from '@gasi/core-starter';

interface PermissionGuardProps {
  permission?: string;
  children:    ReactNode;
}

/**
 * Wrapper untuk protected routes.
 * - Kalau session belum ada → redirect ke /login
 * - Kalau session ada tapi tidak punya permission → redirect ke /403
 * - Kalau permission tidak di-define (undefined) → bebas diakses asal sudah login
 */
export function PermissionGuard({ permission, children }: PermissionGuardProps) {
  const navigate       = useNavigate();
  const session        = useAppStore((s) => s.session);
  const hasPermission  = useAppStore((s) => s.hasPermission);

  useEffect(() => {
    // Belum login
    if (!session) {
      navigate('/login', { replace: true });
      return;
    }

    // Ada permission requirement tapi tidak punya
    if (permission && !hasPermission(permission)) {
      navigate('/403', { replace: true });
    }
  }, [session, permission, navigate, hasPermission]);

  // Belum login atau tidak punya permission → jangan render apapun
  if (!session) return null;
  if (permission && !hasPermission(permission)) return null;

  return <>{children}</>;
}
