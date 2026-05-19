import React from 'react';
import { useExtensions } from '../hooks/useExtensions';
import type { ExtensionPoint } from '@gasi/core-api';

interface PluginSlotProps {
  /** Extension point yang ingin di-render */
  point: ExtensionPoint;
  /** Props tambahan yang akan di-pass ke setiap component plugin */
  componentProps?: Record<string, any>;
  /** Fallback jika tidak ada plugin aktif */
  fallback?: React.ReactNode;
}

/**
 * Render semua component plugin yang terdaftar pada extension point tertentu.
 *
 * @example
 * <PluginSlot point={ExtensionPoints.WIDGET} />
 */
export function PluginSlot({ point, componentProps = {}, fallback = null }: PluginSlotProps) {
  const extensions = useExtensions(point);

  if (extensions.length === 0) return <>{fallback}</>;

  return (
    <>
      {extensions.map((ext, index) => {
        if (!ext.component) return null;
        const Component = ext.component;
        return <Component key={`${point}-${index}`} {...componentProps} />;
      })}
    </>
  );
}
