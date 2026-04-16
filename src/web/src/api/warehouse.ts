import { api } from './client';
import type { PackagingMaterial, MaterialLot, MaterialConsumption, WarehouseInventory, ShipmentMaterialsReport } from '../types';

export const warehouseApi = {
  // Materials
  getMaterials: () => api.get<PackagingMaterial[]>('/warehouse/materials'),
  createMaterial: (data: { code: string; name: string; subType: string; description?: string; unitOfMeasure: string }) =>
    api.post<PackagingMaterial>('/warehouse/materials', data),

  // Lots
  getLots: () => api.get<MaterialLot[]>('/warehouse/lots'),
  getLotsByMaterial: (materialId: string) => api.get<MaterialLot[]>(`/warehouse/lots/by-material/${materialId}`),
  createLot: (data: { lotCode: string; purchaseDate: string; initialQuantity: number; materialId: string }) =>
    api.post<MaterialLot>('/warehouse/lots', data),
  receiveStock: (lotId: string, quantity: number) =>
    api.patch<MaterialLot>(`/warehouse/lots/${lotId}/receive`, { quantity }),
  deleteLot: (id: string) => api.delete(`/warehouse/lots/${id}`),

  // Consumption
  getConsumptionsByShipment: (shipmentId: string) =>
    api.get<MaterialConsumption[]>(`/warehouse/consumption/by-shipment/${shipmentId}`),
  recordConsumption: (data: { quantity: number; shipmentId: string; materialLotId: string }) =>
    api.post<MaterialConsumption>('/warehouse/consumption', data),
  deleteConsumption: (id: string) => api.delete(`/warehouse/consumption/${id}`),

  // Reports
  getInventory: () => api.get<WarehouseInventory[]>('/warehouse/inventory'),
  getShipmentReport: (from: string, to: string) =>
    api.get<ShipmentMaterialsReport[]>(`/warehouse/shipment-report?from=${from}&to=${to}`),
};
