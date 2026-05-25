import { Actions, type Action } from '@gasi/core-api';
import { useAppStore } from '../stores/useAppStore';

export type ResourcePermissions = {
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canDownload: boolean;
  canUpload: boolean;
  hasAction: (action: Action) => boolean;
};

export function resourcePermission(resource: string, action: Action): string {
  return `${resource}:${action}`;
}

export function useResourcePermissions(resource: string): ResourcePermissions {
  const hasPermission = useAppStore((state) => state.hasPermission);
  const hasAction = (action: Action) => hasPermission(resourcePermission(resource, action));

  return {
    canRead: hasAction(Actions.READ),
    canCreate: hasAction(Actions.CREATE),
    canUpdate: hasAction(Actions.UPDATE),
    canDelete: hasAction(Actions.DELETE),
    canDownload: hasAction(Actions.DOWNLOAD),
    canUpload: hasAction(Actions.UPLOAD),
    hasAction,
  };
}
