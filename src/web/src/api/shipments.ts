import { api } from './client';
import type { Shipment, CreateShipment } from '../types';

export const shipmentsApi = {
  getAll: () => api.get<Shipment[]>('/shipments'),
  getByOrder: (orderId: string) => api.get<Shipment[]>(`/shipments/by-order/${orderId}`),
  getById: (id: string) => api.get<Shipment>(`/shipments/${id}`),
  create: (data: CreateShipment) => api.post<Shipment>('/shipments', data),
  update: (id: string, data: CreateShipment) => api.put<Shipment>(`/shipments/${id}`, data),
  delete: (id: string) => api.delete(`/shipments/${id}`),
};
