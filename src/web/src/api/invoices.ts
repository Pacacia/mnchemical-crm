import { getToken } from './auth';

export const invoicesApi = {
  downloadInvoice: (orderId: string) =>
    downloadPdf(`/api/invoice/${orderId}/invoice`, `invoice-${orderId}.pdf`),
  downloadPackingList: (orderId: string) =>
    downloadPdf(`/api/invoice/${orderId}/packing-list`, `packing-list-${orderId}.pdf`),
};

async function downloadPdf(url: string, filename: string) {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  const blob = await res.blob();
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
