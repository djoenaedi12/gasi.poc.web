import { Actions } from '@gasi/core-api';
import type { RouteDefinition } from '@gasi/core-api';
import { ExampleListPage, ExampleFormPage } from '../../ExampleWidget';

export const exampleRoutes: RouteDefinition[] = [
  { path: '/example',      component: ExampleListPage, resource: 'example', action: Actions.READ   },
  { path: '/example/new',  component: ExampleFormPage, resource: 'example', action: Actions.CREATE },
  { path: '/example/:id',  component: ExampleFormPage, resource: 'example', action: Actions.UPDATE },
];
