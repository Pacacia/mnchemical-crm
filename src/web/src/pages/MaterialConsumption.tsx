import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { warehouseApi } from '../api/warehouse';
import { shipmentsApi } from '../api/shipments';

export default function MaterialConsumption() {
  const queryClient = useQueryClient();
  const { data: shipments } = useQuery({ queryKey: ['shipments'], queryFn: shipmentsApi.getAll });
  const { data: lots } = useQuery({ queryKey: ['lots'], queryFn: warehouseApi.getLots });
  const [selectedShipment, setSelectedShipment] = useState('');
  const { data: consumptions } = useQuery({
    queryKey: ['consumptions', selectedShipment],
    queryFn: () => warehouseApi.getConsumptionsByShipment(selectedShipment),
    enabled: !!selectedShipment,
  });

  const [form, setForm] = useState({ materialLotId: '', quantity: 0 });

  const addMutation = useMutation({
    mutationFn: () => warehouseApi.recordConsumption({ ...form, shipmentId: selectedShipment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consumptions', selectedShipment] });
      queryClient.invalidateQueries({ queryKey: ['lots'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setForm({ materialLotId: '', quantity: 0 });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: warehouseApi.deleteConsumption,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consumptions', selectedShipment] });
      queryClient.invalidateQueries({ queryKey: ['lots'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });

  return (
    <div>
      <h1 style={{ margin: '0 0 1.5rem', fontSize: '1.5rem' }}>Material Consumption</h1>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={labelStyle}>Select Shipment</label>
        <select value={selectedShipment} onChange={e => setSelectedShipment(e.target.value)} style={{ ...inputStyle, width: 400 }}>
          <option value="">Choose a shipment...</option>
          {shipments?.map(s => (
            <option key={s.id} value={s.id}>{s.containerNumber} — #{s.orderInvoiceNumber} → {s.destination}</option>
          ))}
        </select>
      </div>

      {selectedShipment && (
        <>
          <div style={{ background: '#fff', borderRadius: 8, padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem' }}>Add Material</h3>
            <form onSubmit={e => { e.preventDefault(); addMutation.mutate(); }}
              style={{ display: 'flex', gap: '0.75rem', alignItems: 'end' }}>
              <div style={{ flex: 2 }}>
                <label style={labelStyle}>Material Lot (shows purchase date + balance)</label>
                <select required value={form.materialLotId} onChange={e => setForm(f => ({ ...f, materialLotId: e.target.value }))} style={inputStyle}>
                  <option value="">Select lot...</option>
                  {lots?.map(l => (
                    <option key={l.id} value={l.id}>
                      [{l.materialCode}] {l.materialName} — Lot {l.lotCode} ({new Date(l.purchaseDate).toLocaleDateString()}) — Balance: {l.currentBalance} {l.unitOfMeasure}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 0.5 }}>
                <label style={labelStyle}>Quantity</label>
                <input type="number" required min="0.01" step="0.01" value={form.quantity || ''} onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))} style={inputStyle} />
              </div>
              <button type="submit" disabled={addMutation.isPending} style={btnStyle}>
                {addMutation.isPending ? 'Adding...' : 'Add'}
              </button>
            </form>
            {addMutation.isError && <p style={{ color: '#e74c3c', marginTop: '0.5rem', fontSize: '0.85rem' }}>
              {(addMutation.error as Error).message}
            </p>}
          </div>

          <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8f9fb', borderBottom: '2px solid #eee' }}>
                  <th style={thStyle}>Material</th>
                  <th style={thStyle}>Code</th>
                  <th style={thStyle}>Lot</th>
                  <th style={thStyle}>Quantity</th>
                  <th style={thStyle}>Unit</th>
                  <th style={thStyle}>Date</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {(!consumptions || consumptions.length === 0) && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>No materials recorded for this shipment yet.</td></tr>
                )}
                {consumptions?.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={tdStyle}>{c.materialName}</td>
                    <td style={tdStyle}>{c.materialCode}</td>
                    <td style={tdStyle}>{c.lotCode}</td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{c.quantity}</td>
                    <td style={tdStyle}>{c.unitOfMeasure}</td>
                    <td style={tdStyle}>{new Date(c.consumedDate).toLocaleDateString()}</td>
                    <td style={tdStyle}>
                      <button onClick={() => { if (confirm('Remove this consumption? Stock will be restored.')) deleteMutation.mutate(c.id); }}
                        style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '0.8rem' }}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#555', marginBottom: 4 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: 6, fontSize: '0.9rem', boxSizing: 'border-box' };
const thStyle: React.CSSProperties = { textAlign: 'left', padding: '0.6rem 0.75rem', fontWeight: 600, color: '#555' };
const tdStyle: React.CSSProperties = { padding: '0.6rem 0.75rem' };
const btnStyle: React.CSSProperties = { background: '#4361ee', color: '#fff', padding: '0.5rem 1rem', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 };
