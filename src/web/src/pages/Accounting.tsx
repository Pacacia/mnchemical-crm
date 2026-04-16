import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountingApi } from '../api/accounting';
import { ordersApi } from '../api/orders';

const today = new Date().toISOString().split('T')[0];
const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];

export default function Accounting() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'receivables' | 'payments' | 'cashflow'>('receivables');
  const [cfFrom, setCfFrom] = useState(monthAgo);
  const [cfTo, setCfTo] = useState(today);
  const [showPayForm, setShowPayForm] = useState(false);
  const [payForm, setPayForm] = useState({ orderId: '', amountUsd: 0, paymentDate: today, reference: '', notes: '' });

  const { data: receivables } = useQuery({ queryKey: ['receivables'], queryFn: accountingApi.getReceivables });
  const { data: payments } = useQuery({ queryKey: ['payments'], queryFn: accountingApi.getPayments });
  const { data: cashflow } = useQuery({ queryKey: ['cashflow', cfFrom, cfTo], queryFn: () => accountingApi.getCashFlow(cfFrom, cfTo) });
  const { data: orders } = useQuery({ queryKey: ['orders'], queryFn: ordersApi.getAll });

  const payMutation = useMutation({
    mutationFn: () => accountingApi.recordPayment({ ...payForm, paymentDate: payForm.paymentDate + 'T00:00:00Z' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['receivables'] });
      queryClient.invalidateQueries({ queryKey: ['cashflow'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      setShowPayForm(false);
      setPayForm({ orderId: '', amountUsd: 0, paymentDate: today, reference: '', notes: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: accountingApi.deletePayment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['receivables'] });
      queryClient.invalidateQueries({ queryKey: ['cashflow'] });
    },
  });

  const totalOutstanding = receivables?.reduce((s, r) => s + Math.max(0, r.outstandingUsd), 0) ?? 0;
  const totalRevenue = receivables?.reduce((s, r) => s + r.totalAmountUsd, 0) ?? 0;
  const totalPaid = receivables?.reduce((s, r) => s + r.totalPaidUsd, 0) ?? 0;

  return (
    <div>
      <h1 style={{ margin: '0 0 1rem', fontSize: '1.5rem' }}>Accounting</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} />
        <StatCard label="Total Received" value={`$${totalPaid.toLocaleString()}`} color="#198754" />
        <StatCard label="Outstanding" value={`$${totalOutstanding.toLocaleString()}`} color="#dc3545" />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {(['receivables', 'payments', 'cashflow'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '0.5rem 1rem', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 500,
            background: tab === t ? '#4361ee' : '#e0e0e0', color: tab === t ? '#fff' : '#333', fontSize: '0.85rem',
          }}>{t === 'receivables' ? 'Receivables' : t === 'payments' ? 'Payments' : 'Cash Flow'}</button>
        ))}
      </div>

      {tab === 'receivables' && (
        <div style={cardStyle}>
          <table style={tableStyle}>
            <thead>
              <tr style={headerRow}>
                <th style={thStyle}>Invoice #</th><th style={thStyle}>Customer</th><th style={thStyle}>Destination</th>
                <th style={thStyle}>Total</th><th style={thStyle}>Paid</th><th style={thStyle}>Outstanding</th><th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {receivables?.map(r => (
                <tr key={r.orderId} style={rowStyle}>
                  <td style={tdStyle}>{r.invoiceNumber}</td><td style={tdStyle}>{r.customerName}</td><td style={tdStyle}>{r.destination}</td>
                  <td style={tdStyle}>${r.totalAmountUsd.toLocaleString()}</td><td style={tdStyle}>${r.totalPaidUsd.toLocaleString()}</td>
                  <td style={{ ...tdStyle, fontWeight: 600, color: r.outstandingUsd > 0 ? '#dc3545' : '#198754' }}>${Math.max(0, r.outstandingUsd).toLocaleString()}</td>
                  <td style={tdStyle}><Tag status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'payments' && (
        <>
          <button onClick={() => setShowPayForm(!showPayForm)} style={btnStyle}>{showPayForm ? 'Cancel' : '+ Record Payment'}</button>
          {showPayForm && (
            <form onSubmit={e => { e.preventDefault(); payMutation.mutate(); }}
              style={{ background: '#fff', borderRadius: 8, padding: '1.25rem', margin: '0.75rem 0', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem' }}>
                <div><label style={labelStyle}>Order *</label><select required value={payForm.orderId} onChange={e => setPayForm(f => ({ ...f, orderId: e.target.value }))} style={inputStyle}>
                  <option value="">Select...</option>{orders?.map(o => <option key={o.id} value={o.id}>#{o.invoiceNumber} — {o.customerName}</option>)}
                </select></div>
                <div><label style={labelStyle}>Amount (USD) *</label><input type="number" step="0.01" required value={payForm.amountUsd || ''} onChange={e => setPayForm(f => ({ ...f, amountUsd: Number(e.target.value) }))} style={inputStyle} /></div>
                <div><label style={labelStyle}>Date *</label><input type="date" required value={payForm.paymentDate} onChange={e => setPayForm(f => ({ ...f, paymentDate: e.target.value }))} style={inputStyle} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.75rem' }}>
                <div><label style={labelStyle}>Reference</label><input value={payForm.reference} onChange={e => setPayForm(f => ({ ...f, reference: e.target.value }))} style={inputStyle} /></div>
                <div><label style={labelStyle}>Notes</label><input value={payForm.notes} onChange={e => setPayForm(f => ({ ...f, notes: e.target.value }))} style={inputStyle} /></div>
              </div>
              <button type="submit" disabled={payMutation.isPending} style={{ ...btnStyle, marginTop: '0.75rem' }}>Save</button>
            </form>
          )}
          <div style={{ ...cardStyle, marginTop: '0.75rem' }}>
            <table style={tableStyle}>
              <thead><tr style={headerRow}>
                <th style={thStyle}>Date</th><th style={thStyle}>Order</th><th style={thStyle}>Customer</th>
                <th style={thStyle}>Amount</th><th style={thStyle}>Reference</th><th style={thStyle}>Actions</th>
              </tr></thead>
              <tbody>
                {payments?.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>No payments recorded.</td></tr>}
                {payments?.map(p => (
                  <tr key={p.id} style={rowStyle}>
                    <td style={tdStyle}>{new Date(p.paymentDate).toLocaleDateString()}</td>
                    <td style={tdStyle}>#{p.orderInvoiceNumber}</td><td style={tdStyle}>{p.customerName}</td>
                    <td style={{ ...tdStyle, fontWeight: 600, color: '#198754' }}>${p.amountUsd.toLocaleString()}</td>
                    <td style={tdStyle}>{p.reference ?? '-'}</td>
                    <td style={tdStyle}><button onClick={() => { if (confirm('Delete payment?')) deleteMutation.mutate(p.id); }}
                      style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'cashflow' && (
        <>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'end' }}>
            <div><label style={labelStyle}>From</label><input type="date" value={cfFrom} onChange={e => setCfFrom(e.target.value)} style={inputStyle} /></div>
            <div><label style={labelStyle}>To</label><input type="date" value={cfTo} onChange={e => setCfTo(e.target.value)} style={inputStyle} /></div>
          </div>
          <div style={cardStyle}>
            <table style={tableStyle}>
              <thead><tr style={headerRow}>
                <th style={thStyle}>Date</th><th style={thStyle}>Description</th><th style={thStyle}>Type</th><th style={thStyle}>Amount</th>
              </tr></thead>
              <tbody>
                {cashflow?.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>No entries for this period.</td></tr>}
                {cashflow?.map((e, i) => (
                  <tr key={i} style={rowStyle}>
                    <td style={tdStyle}>{new Date(e.date).toLocaleDateString()}</td>
                    <td style={tdStyle}>{e.description}</td>
                    <td style={tdStyle}><span style={{ color: e.type === 'Income' ? '#198754' : '#dc3545', fontWeight: 600, fontSize: '0.8rem' }}>{e.type}</span></td>
                    <td style={{ ...tdStyle, fontWeight: 600, color: e.amountUsd >= 0 ? '#198754' : '#dc3545' }}>${Math.abs(e.amountUsd).toLocaleString()}</td>
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

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return <div style={{ background: '#fff', borderRadius: 8, padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
    <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: 4 }}>{label}</div>
    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: color ?? '#333' }}>{value}</div>
  </div>;
}

function Tag({ status }: { status: string }) {
  const colors: Record<string, string> = { Paid: '#198754', Partial: '#fd7e14', Unpaid: '#dc3545' };
  return <span style={{ background: (colors[status] ?? '#666') + '20', color: colors[status] ?? '#666', padding: '2px 8px', borderRadius: 4, fontSize: '0.8rem', fontWeight: 600 }}>{status}</span>;
}

const cardStyle: React.CSSProperties = { background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' };
const tableStyle: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' };
const headerRow: React.CSSProperties = { background: '#f8f9fb', borderBottom: '2px solid #eee' };
const rowStyle: React.CSSProperties = { borderBottom: '1px solid #f0f0f0' };
const thStyle: React.CSSProperties = { textAlign: 'left', padding: '0.6rem 0.75rem', fontWeight: 600, color: '#555' };
const tdStyle: React.CSSProperties = { padding: '0.6rem 0.75rem' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#555', marginBottom: 4 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: 6, fontSize: '0.9rem', boxSizing: 'border-box' };
const btnStyle: React.CSSProperties = { background: '#4361ee', color: '#fff', padding: '0.5rem 1rem', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 };
