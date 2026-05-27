import { Actions, type RouteDefinition } from '@gasi/core-api';
import { translate } from '@gasi/core-ui';
import {
  DataUploadHistoryRoutePage,
  DataUploadRowDetailRoutePage,
  DataUploadRowsRoutePage,
  DataUploadRoutePage,
} from './routePages';

const DATA_UPLOAD_ROUTE_ORDER = -100;

export const dataUploadRoutes: RouteDefinition[] = [
  {
    path: '/:resourcePath/upload',
    component: DataUploadRoutePage,
    action: Actions.UPLOAD,
    title: translate('dataUpload.routes.upload'),
    order: DATA_UPLOAD_ROUTE_ORDER,
  },
  {
    path: '/:resourcePath/upload/history',
    component: DataUploadHistoryRoutePage,
    action: Actions.READ,
    title: translate('dataUpload.titles.history'),
    order: DATA_UPLOAD_ROUTE_ORDER,
  },
  {
    path: '/:resourcePath/upload/history/:uploadId',
    component: DataUploadRowsRoutePage,
    action: Actions.READ,
    title: translate('dataUpload.titles.rows'),
    order: DATA_UPLOAD_ROUTE_ORDER,
  },
  {
    path: '/:resourcePath/upload/history/:uploadId/rows/:rowId',
    component: DataUploadRowDetailRoutePage,
    action: Actions.READ,
    title: translate('dataUpload.titles.rowDetail'),
    order: DATA_UPLOAD_ROUTE_ORDER,
  },
  {
    path: '/:parentResource/:parentId/:resourcePath/upload',
    component: DataUploadRoutePage,
    action: Actions.UPLOAD,
    title: translate('dataUpload.routes.upload'),
    order: DATA_UPLOAD_ROUTE_ORDER,
  },
  {
    path: '/:parentResource/:parentId/:resourcePath/upload/history',
    component: DataUploadHistoryRoutePage,
    action: Actions.READ,
    title: translate('dataUpload.titles.history'),
    order: DATA_UPLOAD_ROUTE_ORDER,
  },
  {
    path: '/:parentResource/:parentId/:resourcePath/upload/history/:uploadId',
    component: DataUploadRowsRoutePage,
    action: Actions.READ,
    title: translate('dataUpload.titles.rows'),
    order: DATA_UPLOAD_ROUTE_ORDER,
  },
  {
    path: '/:parentResource/:parentId/:resourcePath/upload/history/:uploadId/rows/:rowId',
    component: DataUploadRowDetailRoutePage,
    action: Actions.READ,
    title: translate('dataUpload.titles.rowDetail'),
    order: DATA_UPLOAD_ROUTE_ORDER,
  },
  {
    path: '/data-upload/:resource',
    component: DataUploadRoutePage,
    action: Actions.UPLOAD,
    title: translate('dataUpload.routes.upload'),
  },
  {
    path: '/data-upload/:resource/history',
    component: DataUploadHistoryRoutePage,
    action: Actions.READ,
    title: translate('dataUpload.titles.history'),
  },
  {
    path: '/data-upload/:resource/history/:uploadId',
    component: DataUploadRowsRoutePage,
    action: Actions.READ,
    title: translate('dataUpload.titles.rows'),
  },
  {
    path: '/data-upload/:resource/history/:uploadId/rows/:rowId',
    component: DataUploadRowDetailRoutePage,
    action: Actions.READ,
    title: translate('dataUpload.titles.rowDetail'),
  },
];
