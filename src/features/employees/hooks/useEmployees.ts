import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { EmployeeParams } from '../types/employee.types';

export function useEmployees(params?: EmployeeParams) {
    return useQuery({
        queryKey: ['employees', params],
        queryFn: () => api.get('/employees', { params }).then(r => r.data),
    });
}