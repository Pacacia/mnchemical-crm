import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transportApi } from '../api/transport';
import { shipmentsApi } from '../api/shipments';
import type { CreateTransportRecord } from '../types';

export default function TransportList() {
  const queryClient = useQueryClient();
  const { data: records, isLoading } = useQuery({ queryKey: ['transport'], queryFn: transportApi.getAll });
  const { data: shipments } = useQuery({ queryKey: ['shipments'], queryFn: shipmentsApi.getAll });
  const { data: unmatched } = useQuery({ queryKey: ['unmatched-shipments'], queryFn: transportApi.getUnmatchedShipments });
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateTransportRecord>({
    carrierInvoiceNumber: '', invoiceDate: new Date().toISOString().split('T')[0],
    carrierName: '', routeLeg: '', costUsd: 0, costGel: 0, exchangeRate: 2.72, vatRate: 18, shipmentId: '',
  });

  const createMutation = useMutation({
    mutationFn: () => transportApi.create(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transport'] });
      queryClient.invalidateQueries({ queryKey: ['unmatched-shipments'] });
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      setShowForm(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: transportApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transport'] });
      queryClient.invalidateQueries({ queryKey: ['unmatched-shipments'] });
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
    },
  });

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Transport Costs</h1>
        <button onClick={() => setShowForm(!showForm)} style={btnStyle}>{showForm ? 'Cancel' : '+ New Transport Invoice'}</button>
      </div>

      {unmatched && unmatched.length > 0 && (
        <div style={{ background: '#fff3cd', borderRadius: 8, padding: '1rem', marginBottom: '1rem', fontSize: '0.85rem', border: '1px solid #ffc107' }}>
          <strong>{unmatched.length} shipment(s) without transport invoice:</strong>{' '}
          {unmatched.map(s => `${s.containerNumber} (${s.orderInvoiceNumber})`).join(', ')}
        </div>
      )}

      {showForm && (
        <form onSubmit={e => { e.preventDefault(); createMutation.mutate(); }}
          style={{ background: '#fff', borderRadius: 8, padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1rem' }}>New Transport Invoice</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={labelStyle}>Shipment (Container) *</label>
              <select required value={form.shipmentId} onChange={e => setForm(f => ({ ...f, shipmentId: e.target.value }))} style={inputStyle}>
                <option value="">Select shipment...</option>
                {shipments?.map(s => <option key={s.id} value={s.id}>{s.containerNumber} — #{s.orderInvoiceNumber}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Carrier Invoice # *</label>
              <input required value={form.carrierInvoiceNumber} onChange={e => setForm(f => ({ ...f, carrierInvoiceNumber: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Invoice Date *</label>
              <input type="date" required value={form.invoiceDate} onChange={e => setForm(f => ({ ...f, invoiceDate: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Carrier Name *</label>
              <input required value={form.carrierName} onChange={e => setForm(f => ({ ...f, carrierName: e.target.value }))} style={inputStyle} placeholder="e.g. Pera Express LTD" />
            </div>
            <div>
              <label style={labelStyle}>Route Leg *</label>
              <input required value={form.routeLeg} onChange={e => setForm(f => ({ ...f, routeLeg: e.target.value }))} style={inputStyle} placeholder="e.g. Rustavi → Poti → Koper" />
            </div>
            <div>
              <label style={labelStyle}>Cost (USD) *</label>
              <input type="number" step="0.01" required value={form.costUsd || ''} onChange={e => setForm(f => ({ ...f, costUsd: Number(e.target.value) }))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Cost (GEL)</label>
              <input type="number" step="0.01" value={form.costGel || ''} onChange={e => setForm(f => ({ ...f, costGel: Number(e.target.value) }))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Exchange Rate</label>
              <input type="number" step="0.0001" value={form.exchangeRate} onChange={e => setForm(f => ({ ...f, exchangeRate: Number(e.target.value) }))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>VAT Rate (%)</label>
              <input type="number" step="0.01" value={form.vatRate} onChange={e => setForm(f => ({ ...f, vatRate: Number(e.target.value) }))} style={inputStyle} />
            </div>
          </div>
          <button type="submit" disabled={createMutation.isPending} style={{ ...btnStyle, marginTop: '1rem' }}>
            {createMutation.isPending ? 'Creating...' : 'Create'}
          </button>
        </form>
      )}

      {(() => {
        let list = records ?? [];
        if (search) { const q = search.toLowerCase(); list = list.filter(r => r.carrierInvoiceNumber.toLowerCase().includes(q) || r.carrierName.toLowerCase().includes(q) || (r.containerNumber ?? '').toLowerCase().includes(q) || r.routeLeg.toLowerCase().includes(q)); }
        return <>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 200 }}><input placeholder="Search invoice, carrier, container, route..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: 6, fontSize: '0.9rem', boxSizing: 'border-box' as const }} /></div>
        <span style={{ fontSize: '0.8rem', color: '#888' }}>{list.length} records</span>
      </div>
      <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ background: '#f8f9fb', borderBottom: '2px solid #eee' }}>
              <th style={thStyle}>Invoice #</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Carrier</th>
              <th style={thStyle}>Route</th>
              <th style={thStyle}>Container</th>
              <th style={thStyle}>Order</th>
              <th style={thStyle}>Cost (USD)</th>
              <th style={thStyle}>VAT</th>
              <th style={thStyle}>Total</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr><td colSpan={10} style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>{records?.length ? 'No matching records.' : 'No transport invoices yet.'}</td></tr>
            )}
            {list.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={tdStyle}>{r.carrierInvoiceNumber}</td>
                <td style={tdStyle}>{new Date(r.invoiceDate).toLocaleDateString()}</td>
                <td style={tdStyle}>{r.carrierName}</td>
                <td style={tdStyle}>{r.routeLeg}</td>
                <td style={tdStyle}>{r.containerNumber}</td>
                <td style={tdStyle}>#{r.orderInvoiceNumber}</td>
                <td style={tdStyle}>${r.costUsd.toLocaleString()}</td>
                <td style={tdStyle}>${r.vatAmountUsd.toLocaleString()}</td>
                <td style={tdStyle} >${r.totalWithVatUsd.toLocaleString()}</td>
                <td style={tdStyle}>
                  <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(r.id); }}
                    style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </>;
      })()}
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#555', marginBottom: 4 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: 6, fontSize: '0.9rem', boxSizing: 'border-box' };
const thStyle: React.CSSProperties = { textAlign: 'left', padding: '0.6rem 0.75rem', fontWeight: 600, color: '#555' };
const tdStyle: React.CSSProperties = { padding: '0.6rem 0.75rem' };
const btnStyle: React.CSSProperties = { background: '#4361ee', color: '#fff', padding: '0.5rem 1rem', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 };
