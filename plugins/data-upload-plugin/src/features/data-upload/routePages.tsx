import { useI18n } from '@gasi/core-ui';
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router';
import { DataUploadHistoryPage } from './pages/DataUploadHistoryPage';
import { DataUploadPage } from './pages/DataUploadPage';
import { DataUploadRowDetailPage } from './pages/DataUploadRowDetailPage';
import { DataUploadRowsPage } from './pages/DataUploadRowsPage';

type UploadNavState = { context?: 'upload' | 'history'; backTo?: string } | null;

function buildUploadQuery(backTo: string, entityLabel: string, resource?: string, uploadId?: string) {
  const params = new URLSearchParams({
    backTo,
    label: entityLabel,
  });

  if (resource) {
    params.set('resource', resource);
  }

  if (uploadId) {
    params.set('uploadId', uploadId);
  }

  return params.toString();
}

function kebabToCamel(value: string) {
  return value.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

function singularizeSegment(value: string) {
  if (value.endsWith('ies')) return `${value.slice(0, -3)}y`;
  if (value.endsWith('ses') || value.endsWith('xes') || value.endsWith('zes') || value.endsWith('ches') || value.endsWith('shes')) {
    return value.slice(0, -2);
  }
  if (value.endsWith('s')) return value.slice(0, -1);
  return value;
}

function getUploadRoot(pathname: string) {
  if (pathname.startsWith('/data-upload/')) {
    const [base] = pathname.split('/history');
    return base;
  }

  if (pathname.includes('/upload/history')) {
    return `${pathname.split('/upload/history')[0]}/upload`;
  }

  if (pathname.includes('/upload')) {
    return `${pathname.split('/upload')[0]}/upload`;
  }

  return pathname;
}

function useUploadRouteContext() {
  const { resource: legacyResource = '', resourcePath = '' } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const routeResourcePath = resourcePath || legacyResource;
  const resource = searchParams.get('resource') || legacyResource || kebabToCamel(singularizeSegment(routeResourcePath));
  const basePath = getUploadRoot(location.pathname);
  const historyPath = `${basePath}/history`;
  const backTo = searchParams.get('backTo') || '/';
  const entityLabel = searchParams.get('label') || routeResourcePath || resource;
  const templateFileName = `${resource}-template.csv`;
  const uploadId = searchParams.get('uploadId') ?? undefined;
  const routeQuery = buildUploadQuery(backTo, entityLabel, resource);

  return {
    resource,
    basePath,
    historyPath,
    backTo,
    entityLabel,
    templateFileName,
    uploadId,
    routeQuery,
  };
}

export function DataUploadRoutePage() {
  const navigate = useNavigate();
  const { resource, basePath, historyPath, backTo, entityLabel, templateFileName, uploadId, routeQuery } = useUploadRouteContext();
  const { t } = useI18n();

  if (!resource) return null;

  return (
    <DataUploadPage
      resource={resource}
      breadcrumbs={[
        { label: entityLabel, href: backTo },
        { label: t('dataUpload.routes.upload') },
      ]}
      templateFileName={templateFileName}
      onBack={() => navigate(backTo)}
      initialUploadId={uploadId}
      onHistory={() => navigate(`${historyPath}?${routeQuery}`)}
      onViewRow={(uid, rowId) =>
        navigate(`${historyPath}/${uid}/rows/${rowId}`, {
          state: { context: 'upload', backTo: `${basePath}?${buildUploadQuery(backTo, entityLabel, resource, uid)}` } satisfies UploadNavState,
        })
      }
    />
  );
}

export function DataUploadHistoryRoutePage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { resource, basePath, historyPath, backTo, entityLabel, routeQuery } = useUploadRouteContext();

  if (!resource) return null;

  return (
    <DataUploadHistoryPage
      resource={resource}
      breadcrumbs={[
        { label: entityLabel, href: backTo },
        { label: t('dataUpload.routes.upload'), href: basePath },
        { label: t('dataUpload.routes.history') },
      ]}
      onViewUpload={(nextUploadId) => navigate(`${historyPath}/${nextUploadId}?${routeQuery}`)}
      onContinueUpload={(nextUploadId) => navigate(`${basePath}?${buildUploadQuery(backTo, entityLabel, resource, nextUploadId)}`)}
    />
  );
}

export function DataUploadRowsRoutePage() {
  const navigate = useNavigate();
  const { uploadId } = useParams();
  const { t } = useI18n();
  const { resource, basePath, historyPath, backTo, entityLabel, routeQuery } = useUploadRouteContext();

  if (!resource || !uploadId) return null;

  return (
    <DataUploadRowsPage
      resource={resource}
      uploadId={uploadId}
      breadcrumbs={[
        { label: entityLabel, href: backTo },
        { label: t('dataUpload.routes.upload'), href: basePath },
        { label: t('dataUpload.routes.history'), href: historyPath },
        { label: uploadId },
      ]}
      onViewRow={(rowId) =>
        navigate(`${historyPath}/${uploadId}/rows/${rowId}`, {
          state: { context: 'history', backTo: `${historyPath}/${uploadId}?${routeQuery}` } satisfies UploadNavState,
        })
      }
    />
  );
}

export function DataUploadRowDetailRoutePage() {
  const location = useLocation();
  const { uploadId, rowId } = useParams();
  const state = location.state as UploadNavState;
  const { t } = useI18n();
  const { resource, basePath, historyPath, backTo, entityLabel, routeQuery } = useUploadRouteContext();

  if (!resource || !uploadId || !rowId) return null;

  const breadcrumbs =
    state?.context === 'upload'
      ? [
          { label: entityLabel, href: backTo },
          { label: t('dataUpload.routes.upload'), href: state.backTo },
          { label: rowId },
        ]
      : [
          { label: entityLabel, href: backTo },
          { label: t('dataUpload.routes.upload'), href: basePath },
          { label: t('dataUpload.routes.history'), href: historyPath },
          { label: uploadId, href: `${historyPath}/${uploadId}?${routeQuery}` },
          { label: rowId },
        ];

  return <DataUploadRowDetailPage resource={resource} uploadId={uploadId} rowId={rowId} breadcrumbs={breadcrumbs} />;
}
