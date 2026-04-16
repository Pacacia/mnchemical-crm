import { api } from './client';
import type { LeaveRequest, LeaveType, LeaveStatus } from '../types';

export const leaveApi = {
  getAll: (employeeId?: string, status?: LeaveStatus) => {
    const params = new URLSearchParams();
    if (employeeId) params.set('employeeId', employeeId);
    if (status !== undefined) params.set('status', String(status));
    return api.get<LeaveRequest[]>(`/leave?${params}`);
  },
  getById: (id: string) => api.get<LeaveRequest>(`/leave/${id}`),
  create: (data: { employeeId: string; type: LeaveType; startDate: string; endDate: string; reason?: string }) =>
    api.post<LeaveRequest>('/leave', data),
  review: (id: string, data: { status: LeaveStatus; approvedBy: string; reviewComment?: string }) =>
    api.patch<LeaveRequest>(`/leave/${id}/review`, data),
  delete: (id: string) => api.delete(`/leave/${id}`),
};
