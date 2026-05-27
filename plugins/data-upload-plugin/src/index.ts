import { ExtensionPoints, pluginRegistry } from '@gasi/core-api';
import { dataUploadRoutes } from './features/data-upload/routes';
import './features/data-upload/i18n';

pluginRegistry.register({
  id: 'plugin.data-upload',
  name: 'Data Upload',
  version: '1.0.0',
  description: 'Reusable data upload workflow',
  extensions: [
    {
      point: ExtensionPoints.ROUTE,
      routes: dataUploadRoutes,
    },
  ],
  onStart() { console.info('[plugin.data-upload] started'); },
  onStop() { console.info('[plugin.data-upload] stopped'); },
});
