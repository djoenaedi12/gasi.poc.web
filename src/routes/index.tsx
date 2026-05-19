import { createBrowserRouter } from 'react-router';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';

export const router = createBrowserRouter([
    { path: '/login', element: <LoginPage /> },
    { path: '/forgot-password', element: <ForgotPasswordPage /> },
    {
        path: '/',
        element: <DashboardLayout />,
        children: [
            { index: true, element: <DashboardPage /> },
        ],
    },
]);
