import { api } from './client';

export interface Payment { id: string; amountUsd: number; paymentDate: string; reference: string | null; notes: string | null; orderId: string; orderInvoiceNumber: string; customerName: string; createdAt: string; }
export interface ReceivableSummary { orderId: string; invoiceNumber: string; customerName: string; destination: string; totalAmountUsd: number; totalPaidUsd: number; outstandingUsd: number; status: string; }
export interface CashFlowEntry { date: string; description: string; type: string; amountUsd: number; }

export const accountingApi = {
  getPayments: () => api.get<Payment[]>('/accounting/payments'),
  getPaymentsByOrder: (orderId: string) => api.get<Payment[]>(`/accounting/payments/by-order/${orderId}`),
  recordPayment: (data: { orderId: string; amountUsd: number; paymentDate: string; reference?: string; notes?: string }) =>
    api.post<Payment>('/accounting/payments', data),
  deletePayment: (id: string) => api.delete(`/accounting/payments/${id}`),
  getReceivables: () => api.get<ReceivableSummary[]>('/accounting/receivables'),
  getCashFlow: (from: string, to: string) => api.get<CashFlowEntry[]>(`/accounting/cashflow?from=${from}&to=${to}`),
};
