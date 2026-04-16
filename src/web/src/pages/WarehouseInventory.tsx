import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { warehouseApi } from '../api/warehouse';

export default function WarehouseInventory() {
  const queryClient = useQueryClient();
  const { data: inventory, isLoading } = useQuery({ queryKey: ['inventory'], queryFn: warehouseApi.getInventory });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showLotForm, setShowLotForm] = useState<string | null>(null);
  const [lotForm, setLotForm] = useState({ lotCode: '', purchaseDate: new Date().toISOString().split('T')[0], initialQuantity: 0 });

  const createLotMutation = useMutation({
    mutationFn: () => warehouseApi.createLot({ ...lotForm, materialId: showLotForm! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setShowLotForm(null);
      setLotForm({ lotCode: '', purchaseDate: new Date().toISOString().split('T')[0], initialQuantity: 0 });
    },
  });

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <h1 style={{ margin: '0 0 1.5rem', fontSize: '1.5rem' }}>Warehouse Inventory</h1>

      <div style={{ display: 'grid', gap: '0.75rem' }}>
        {inventory?.map(m => (
          <div key={m.materialId} style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
            <div
              onClick={() => setExpandedId(expandedId === m.materialId ? null : m.materialId)}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.25rem', cursor: 'pointer' }}
            >
              <div>
                <span style={{ fontWeight: 600, marginRight: 8 }}>{m.materialCode}</span>
                <span>{m.materialName} — {m.subType}</span>
              </div>
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: m.totalBalance > 0 ? '#198754' : '#dc3545' }}>
                    {m.totalBalance.toLocaleString()} {m.unitOfMeasure}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#888' }}>{m.lots.length} lot(s)</div>
                </div>
                <span style={{ color: '#aaa' }}>{expandedId === m.materialId ? '▲' : '▼'}</span>
              </div>
            </div>

            {expandedId === m.materialId && (
              <div style={{ borderTop: '1px solid #eee', padding: '0.75rem 1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#555' }}>Lots</span>
                  <button onClick={() => setShowLotForm(m.materialId)} style={addBtn}>+ Add Lot</button>
                </div>

                {showLotForm === m.materialId && (
                  <form onSubmit={e => { e.preventDefault(); createLotMutation.mutate(); }}
                    style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', alignItems: 'end' }}>
                    <div>
                      <label style={labelStyle}>Lot Code</label>
                      <input required value={lotForm.lotCode} onChange={e => setLotForm(f => ({ ...f, lotCode: e.target.value }))} style={inputStyle} placeholder="e.g. 02117165" />
                    </div>
                    <div>
                      <label style={labelStyle}>Purchase Date</label>
                      <input type="date" required value={lotForm.purchaseDate} onChange={e => setLotForm(f => ({ ...f, purchaseDate: e.target.value }))} style={inputStyle} />
                    </div>
                    <div>
                      <label style={labelStyle}>Quantity</label>
                      <input type="number" required min="1" value={lotForm.initialQuantity || ''} onChange={e => setLotForm(f => ({ ...f, initialQuantity: Number(e.target.value) }))} style={inputStyle} />
                    </div>
                    <button type="submit" disabled={createLotMutation.isPending} style={addBtn}>Save</button>
                    <button type="button" onClick={() => setShowLotForm(null)} style={{ ...addBtn, background: '#f0f0f0', color: '#333' }}>Cancel</button>
                  </form>
                )}

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                      <th style={thStyle}>Lot Code</th>
                      <th style={thStyle}>Purchase Date</th>
                      <th style={thStyle}>Initial</th>
                      <th style={thStyle}>Consumed</th>
                      <th style={thStyle}>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {m.lots.length === 0 && (
                      <tr><td colSpan={5} style={{ padding: '0.75rem', color: '#999', textAlign: 'center' }}>No lots. Add one above.</td></tr>
                    )}
                    {m.lots.map(l => (
                      <tr key={l.lotId} style={{ borderBottom: '1px solid #f5f5f5' }}>
                        <td style={tdStyle}>{l.lotCode}</td>
                        <td style={tdStyle}>{new Date(l.purchaseDate).toLocaleDateString()}</td>
                        <td style={tdStyle}>{l.initialQuantity.toLocaleString()}</td>
                        <td style={tdStyle}>{l.totalConsumed.toLocaleString()}</td>
                        <td style={{ ...tdStyle, fontWeight: 600, color: l.currentBalance > 0 ? '#198754' : '#dc3545' }}>
                          {l.currentBalance.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#555', marginBottom: 2 };
const inputStyle: React.CSSProperties = { padding: '0.4rem 0.6rem', border: '1px solid #ddd', borderRadius: 5, fontSize: '0.85rem', width: 140 };
const thStyle: React.CSSProperties = { textAlign: 'left', padding: '0.5rem 0.75rem', fontWeight: 600, color: '#888', fontSize: '0.8rem' };
const tdStyle: React.CSSProperties = { padding: '0.5rem 0.75rem' };
const addBtn: React.CSSProperties = { background: '#4361ee', color: '#fff', border: 'none', padding: '0.4rem 0.75rem', borderRadius: 5, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500 };
