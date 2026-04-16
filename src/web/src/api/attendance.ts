import { api } from './client';
import type { AttendanceRecord, TodayAttendanceSummary, MonthlyEmployeeSummary, CsvImportResult } from '../types';

export const attendanceApi = {
  getToday: () => api.get<TodayAttendanceSummary>('/attendance/today'),
  getByDateRange: (from: string, to: string, employeeId?: string) => {
    let url = `/attendance?from=${from}&to=${to}`;
    if (employeeId) url += `&employeeId=${employeeId}`;
    return api.get<AttendanceRecord[]>(url);
  },
  getMonthlySummary: (year: number, month: number) =>
    api.get<MonthlyEmployeeSummary[]>(`/attendance/monthly?year=${year}&month=${month}`),
  manualOverride: (id: string, data: { clockIn: string; clockOut: string; managerComment: string }) =>
    api.patch<AttendanceRecord>(`/attendance/${id}/override`, data),
  importCsv: async (file: File): Promise<CsvImportResult> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/attendance/import', { method: 'POST', body: formData });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.json();
  },
};
