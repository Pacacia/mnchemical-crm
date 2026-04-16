import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ordersApi } from '../api/orders';
import { invoicesApi } from '../api/invoices';
import { OrderStatus, OrderStatusLabels } from '../types';

const statusColors: Record<OrderStatus, string> = {
  [OrderStatus.New]: '#6c757d', [OrderStatus.Confirmed]: '#0d6efd', [OrderStatus.InProduction]: '#fd7e14',
  [OrderStatus.Shipped]: '#6f42c1', [OrderStatus.Delivered]: '#20c997', [OrderStatus.Paid]: '#198754', [OrderStatus.Cancelled]: '#dc3545',
};

export default function OrderList() {
  const queryClient = useQueryClient();
  const { data: orders, isLoading } = useQuery({ queryKey: ['orders'], queryFn: ordersApi.getAll });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortKey, setSortKey] = useState('orderDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => ordersApi.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });
  const deleteMutation = useMutation({
    mutationFn: ordersApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });

  const filtered = useMemo(() => {
    if (!orders) return [];
    let result = orders;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(o => o.invoiceNumber.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) || o.destination.toLowerCase().includes(q));
    }
    if (statusFilter) result = result.filter(o => o.status === Number(statusFilter));
    return [...result].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'orderDate') cmp = a.orderDate.localeCompare(b.orderDate);
      else if (sortKey === 'amount') cmp = a.totalAmountUsd - b.totalAmountUsd;
      else if (sortKey === 'customer') cmp = a.customerName.localeCompare(b.customerName);
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [orders, search, statusFilter, sortKey, sortDir]);

  const sort = (key: string) => { if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortKey(key); setSortDir('asc'); } };
  const SH = ({ k, label }: { k: string; label: string }) => (
    <th onClick={() => sort(k)} style={{ ...thStyle, cursor: 'pointer', userSelect: 'none' }}>{label} {sortKey === k ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
  );

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Orders</h1>
        <Link to="/orders/new" style={btnStyle}>+ New Order</Link>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'end', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <input placeholder="Search invoice, customer, destination..." value={search} onChange={e => setSearch(e.target.value)} style={searchStyle} />
        </div>
        <div>
          <label style={filterLabel}>Status</label>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selectStyle}>
            <option value="">All</option>
            {Object.entries(OrderStatusLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <span style={{ fontSize: '0.8rem', color: '#888' }}>{filtered.length} orders</span>
      </div>

      <div style={card}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead><tr style={headerRow}>
            <th style={thStyle}>Invoice #</th><SH k="customer" label="Customer" /><th style={thStyle}>Destination</th>
            <SH k="orderDate" label="Date" /><SH k="amount" label="Amount" /><th style={thStyle}>Status</th><th style={thStyle}>Actions</th>
          </tr></thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={7} style={empty}>{orders?.length ? 'No matching orders.' : 'No orders yet.'}</td></tr>}
            {filtered.map(o => (
              <tr key={o.id} style={row}>
                <td style={tdStyle}><Link to={`/orders/${o.id}`} style={{ color: '#4361ee', textDecoration: 'none', fontWeight: 500 }}>{o.invoiceNumber}</Link></td>
                <td style={tdStyle}>{o.customerName}</td>
                <td style={tdStyle}>{o.destination}</td>
                <td style={tdStyle}>{new Date(o.orderDate).toLocaleDateString()}</td>
                <td style={tdStyle}>${o.totalAmountUsd.toLocaleString()}</td>
                <td style={tdStyle}>
                  <select value={o.status} onChange={e => statusMutation.mutate({ id: o.id, status: Number(e.target.value) as OrderStatus })}
                    style={{ background: statusColors[o.status] + '20', color: statusColors[o.status], border: `1px solid ${statusColors[o.status]}40`, borderRadius: 4, padding: '2px 6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
                    {Object.entries(OrderStatusLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                  </select>
                </td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <Link to={`/orders/${o.id}/edit`} style={{ color: '#4361ee', textDecoration: 'none', fontSize: '0.85rem' }}>Edit</Link>
                    <button onClick={() => invoicesApi.downloadInvoice(o.id)} style={act('#198754')}>Invoice</button>
                    <button onClick={() => invoicesApi.downloadPackingList(o.id)} style={act('#6f42c1')}>Packing</button>
                    <button onClick={() => { if (confirm(`Delete "${o.invoiceNumber}"?`)) deleteMutation.mutate(o.id); }} style={act('#e74c3c')}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = { textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 600, color: '#555' };
const tdStyle: React.CSSProperties = { padding: '0.75rem 1rem' };
const card: React.CSSProperties = { background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' };
const headerRow: React.CSSProperties = { background: '#f8f9fb', borderBottom: '2px solid #eee' };
const row: React.CSSProperties = { borderBottom: '1px solid #f0f0f0' };
const empty: React.CSSProperties = { textAlign: 'center', padding: '2rem', color: '#999' };
const btnStyle: React.CSSProperties = { background: '#4361ee', color: '#fff', padding: '0.5rem 1rem', borderRadius: 6, textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500 };
const searchStyle: React.CSSProperties = { width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: 6, fontSize: '0.9rem', boxSizing: 'border-box' };
const selectStyle: React.CSSProperties = { padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: 6, fontSize: '0.85rem' };
const filterLabel: React.CSSProperties = { display: 'block', fontSize: '0.7rem', fontWeight: 600, color: '#888', marginBottom: 2 };
const act = (c: string): React.CSSProperties => ({ background: 'none', border: 'none', color: c, cursor: 'pointer', fontSize: '0.85rem' });
