import { api } from './client';
import type { TransportRecord, CreateTransportRecord, Shipment } from '../types';

export const transportApi = {
  getAll: () => api.get<TransportRecord[]>('/transport'),
  getByShipment: (shipmentId: string) => api.get<TransportRecord[]>(`/transport/by-shipment/${shipmentId}`),
  getById: (id: string) => api.get<TransportRecord>(`/transport/${id}`),
  create: (data: CreateTransportRecord) => api.post<TransportRecord>('/transport', data),
  update: (id: string, data: CreateTransportRecord) => api.put<TransportRecord>(`/transport/${id}`, data),
  delete: (id: string) => api.delete(`/transport/${id}`),
  getUnmatchedShipments: () => api.get<Shipment[]>('/transport/unmatched-shipments'),
};
