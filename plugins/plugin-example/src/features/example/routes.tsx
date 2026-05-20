import type { RouteDefinition } from '@gasi/core-api';
import { ExampleListPage, ExampleFormPage } from '../../ExampleWidget';

export const exampleRoutes: RouteDefinition[] = [
  { path: '/example',      component: ExampleListPage },
  { path: '/example/new',  component: ExampleFormPage },
  { path: '/example/:id',  component: ExampleFormPage },
];
