import { api } from './client';
import type { Customer, CreateCustomer } from '../types';

export const customersApi = {
  getAll: () => api.get<Customer[]>('/customers'),
  getById: (id: string) => api.get<Customer>(`/customers/${id}`),
  create: (data: CreateCustomer) => api.post<Customer>('/customers', data),
  update: (id: string, data: CreateCustomer) => api.put<Customer>(`/customers/${id}`, data),
  delete: (id: string) => api.delete(`/customers/${id}`),
};
