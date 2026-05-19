import { pluginRegistry, ExtensionPoints } from '@gasi/core-api';
import { ExampleWidget } from './ExampleWidget';

// Plugin auto-register saat UMD script di-load oleh platform-app
// Mirip dengan @Plugin annotation di PF4J
pluginRegistry.register({
  id: 'plugin.example',
  name: 'Example Plugin',
  version: '1.0.0',
  description: 'Contoh plugin untuk demonstrasi plugin system',
  extensions: [
    {
      point: ExtensionPoints.WIDGET,
      component: ExampleWidget,
    },
  ],
  onStart() {
    console.info('[plugin.example] Plugin started');
  },
  onStop() {
    console.info('[plugin.example] Plugin stopped');
  },
});
