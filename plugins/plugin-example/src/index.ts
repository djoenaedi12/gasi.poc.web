import { pluginRegistry, ExtensionPoints } from '@gasi/core-api';
import { exampleRoutes } from './features/example/routes';

pluginRegistry.register({
  id:          'plugin.example',
  name:        'Example Plugin',
  version:     '1.0.0',
  description: 'Contoh plugin untuk demonstrasi plugin system',
  extensions: [
    {
      point:  ExtensionPoints.ROUTE,
      routes: exampleRoutes,
    },
  ],
  onStart() { console.info('[plugin.example] started'); },
  onStop()  { console.info('[plugin.example] stopped'); },
});
