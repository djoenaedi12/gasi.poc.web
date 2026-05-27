import type { RouteDefinition } from '@gasi/core-api';
import { LoginPage } from './pages/LoginPage';

// Auth routes tidak perlu resource/action — bebas diakses
export const authRoutes: RouteDefinition[] = [
  { path: '/login', component: LoginPage, public: true, layout: 'blank', title: 'Login' },
];
