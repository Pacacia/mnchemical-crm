import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shipmentsApi } from '../api/shipments';
import { ordersApi } from '../api/orders';
import type { CreateShipment } from '../types';

export default function ShipmentList() {
  const queryClient = useQueryClient();
  const { data: shipments, isLoading } = useQuery({ queryKey: ['shipments'], queryFn: shipmentsApi.getAll });
  const { data: orders } = useQuery({ queryKey: ['orders'], queryFn: ordersApi.getAll });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateShipment>({
    batchNumber: '', containerNumber: '', netWeightKg: 0, grossWeightKg: 0,
    bigBagCount: 0, smallBagCount: 0, palletCount: 0, orderId: '',
  });

  const createMutation = useMutation({
    mutationFn: () => shipmentsApi.create(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      setShowForm(false);
      setForm({ batchNumber: '', containerNumber: '', netWeightKg: 0, grossWeightKg: 0, bigBagCount: 0, smallBagCount: 0, palletCount: 0, orderId: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: shipmentsApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shipments'] }),
  });

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Shipments</h1>
        <button onClick={() => setShowForm(!showForm)} style={btnStyle}>{showForm ? 'Cancel' : '+ New Shipment'}</button>
      </div>

      {showForm && (
        <form onSubmit={e => { e.preventDefault(); createMutation.mutate(); }}
          style={{ background: '#fff', borderRadius: 8, padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={labelStyle}>Order *</label>
              <select required value={form.orderId} onChange={e => setForm(f => ({ ...f, orderId: e.target.value }))} style={inputStyle}>
                <option value="">Select order...</option>
                {orders?.map(o => <option key={o.id} value={o.id}>#{o.invoiceNumber} - {o.customerName}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Container # *</label>
              <input required value={form.containerNumber} onChange={e => setForm(f => ({ ...f, containerNumber: e.target.value }))} style={inputStyle} placeholder="e.g. TCLU 2664460" />
            </div>
            <div>
              <label style={labelStyle}>Batch # *</label>
              <input required value={form.batchNumber} onChange={e => setForm(f => ({ ...f, batchNumber: e.target.value }))} style={inputStyle} placeholder="e.g. 1040326" />
            </div>
            <div>
              <label style={labelStyle}>Net Weight (kg)</label>
              <input type="number" value={form.netWeightKg || ''} onChange={e => setForm(f => ({ ...f, netWeightKg: Number(e.target.value) }))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Gross Weight (kg)</label>
              <input type="number" value={form.grossWeightKg || ''} onChange={e => setForm(f => ({ ...f, grossWeightKg: Number(e.target.value) }))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Shipment Date</label>
              <input type="date" value={form.shipmentDate ?? ''} onChange={e => setForm(f => ({ ...f, shipmentDate: e.target.value || undefined }))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Big Bags</label>
              <input type="number" value={form.bigBagCount || ''} onChange={e => setForm(f => ({ ...f, bigBagCount: Number(e.target.value) }))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>25kg Bags</label>
              <input type="number" value={form.smallBagCount || ''} onChange={e => setForm(f => ({ ...f, smallBagCount: Number(e.target.value) }))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Pallets</label>
              <input type="number" value={form.palletCount || ''} onChange={e => setForm(f => ({ ...f, palletCount: Number(e.target.value) }))} style={inputStyle} />
            </div>
          </div>
          <button type="submit" disabled={createMutation.isPending} style={{ ...btnStyle, marginTop: '1rem' }}>
            {createMutation.isPending ? 'Creating...' : 'Create Shipment'}
          </button>
        </form>
      )}

      <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: '#f8f9fb', borderBottom: '2px solid #eee' }}>
              <th style={thStyle}>Container #</th>
              <th style={thStyle}>Batch #</th>
              <th style={thStyle}>Order</th>
              <th style={thStyle}>Customer</th>
              <th style={thStyle}>Destination</th>
              <th style={thStyle}>Net (kg)</th>
              <th style={thStyle}>Bags</th>
              <th style={thStyle}>Transport</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {shipments?.length === 0 && (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>No shipments yet.</td></tr>
            )}
            {shipments?.map(s => (
              <tr key={s.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={tdStyle}>{s.containerNumber}</td>
                <td style={tdStyle}>{s.batchNumber}</td>
                <td style={tdStyle}>#{s.orderInvoiceNumber}</td>
                <td style={tdStyle}>{s.customerName}</td>
                <td style={tdStyle}>{s.destination}</td>
                <td style={tdStyle}>{s.netWeightKg.toLocaleString()}</td>
                <td style={tdStyle}>{s.bigBagCount > 0 ? `${s.bigBagCount} big` : ''}{s.smallBagCount > 0 ? ` ${s.smallBagCount} small` : ''}</td>
                <td style={tdStyle}>
                  {s.hasTransportInvoice
                    ? <span style={{ color: '#198754', fontWeight: 600, fontSize: '0.8rem' }}>${s.totalTransportCostUsd.toLocaleString()}</span>
                    : <span style={{ color: '#dc3545', fontSize: '0.8rem' }}>No invoice</span>}
                </td>
                <td style={tdStyle}>
                  <button onClick={() => { if (confirm('Delete shipment?')) deleteMutation.mutate(s.id); }}
                    style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#555', marginBottom: 4 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: 6, fontSize: '0.9rem', boxSizing: 'border-box' };
const thStyle: React.CSSProperties = { textAlign: 'left', padding: '0.6rem 0.75rem', fontWeight: 600, color: '#555' };
const tdStyle: React.CSSProperties = { padding: '0.6rem 0.75rem' };
const btnStyle: React.CSSProperties = { background: '#4361ee', color: '#fff', padding: '0.5rem 1rem', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 };
