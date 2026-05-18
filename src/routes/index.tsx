import { createBrowserRouter } from 'react-router';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { EmployeesPage } from '@/features/employees/pages/EmployeesPage';
import { EmployeeFormPage } from '@/features/employees/pages/EmployeeFormPage';

export const router = createBrowserRouter([
    { path: '/login', element: <LoginPage /> },
    { path: '/forgot-password', element: <ForgotPasswordPage /> },
    {
        path: '/',
        element: <DashboardLayout />,
        children: [
            { index: true, element: <DashboardPage /> },
            { path: 'employees', element: <EmployeesPage /> },
            { path: 'employees/create', element: <EmployeeFormPage mode="create" /> },
            { path: 'employees/:id/edit', element: <EmployeeFormPage mode="edit" /> },
            // Tambahkan route lain di sini
        ],
    },
]);
