import { api } from './client';
import type { Employee, CreateEmployee } from '../types';

export const employeesApi = {
  getAll: (includeInactive = false) =>
    api.get<Employee[]>(`/employees?includeInactive=${includeInactive}`),
  getById: (id: string) => api.get<Employee>(`/employees/${id}`),
  create: (data: CreateEmployee) => api.post<Employee>('/employees', data),
  update: (id: string, data: CreateEmployee & { isActive: boolean }) =>
    api.put<Employee>(`/employees/${id}`, data),
  delete: (id: string) => api.delete(`/employees/${id}`),
};
