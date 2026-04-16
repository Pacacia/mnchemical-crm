import { api } from './client';
import type { Order, CreateOrder, OrderStatus } from '../types';

export const ordersApi = {
  getAll: () => api.get<Order[]>('/orders'),
  getById: (id: string) => api.get<Order>(`/orders/${id}`),
  create: (data: CreateOrder) => api.post<Order>('/orders', data),
  update: (id: string, data: CreateOrder) => api.put<Order>(`/orders/${id}`, data),
  updateStatus: (id: string, status: OrderStatus) =>
    api.patch<Order>(`/orders/${id}/status`, { status }),
  delete: (id: string) => api.delete(`/orders/${id}`),
};
