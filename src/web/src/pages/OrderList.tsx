import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ordersApi } from '../api/orders';
import { OrderStatus, OrderStatusLabels } from '../types';

const statusColors: Record<OrderStatus, string> = {
  [OrderStatus.New]: '#6c757d',
  [OrderStatus.Confirmed]: '#0d6efd',
  [OrderStatus.InProduction]: '#fd7e14',
  [OrderStatus.Shipped]: '#6f42c1',
  [OrderStatus.Delivered]: '#20c997',
  [OrderStatus.Paid]: '#198754',
  [OrderStatus.Cancelled]: '#dc3545',
};

export default function OrderList() {
  const queryClient = useQueryClient();
  const { data: orders, isLoading } = useQuery({ queryKey: ['orders'], queryFn: ordersApi.getAll });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) => ordersApi.updateStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: ordersApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  });

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Orders</h1>
        <Link to="/orders/new" style={btnStyle}>+ New Order</Link>
      </div>

      <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#f8f9fb', borderBottom: '2px solid #eee' }}>
              <th style={thStyle}>Invoice #</th>
              <th style={thStyle}>Customer</th>
              <th style={thStyle}>Destination</th>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Amount</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders?.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>No orders yet. Create your first order.</td></tr>
            )}
            {orders?.map(o => (
              <tr key={o.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={tdStyle}>
                  <Link to={`/orders/${o.id}`} style={{ color: '#4361ee', textDecoration: 'none', fontWeight: 500 }}>{o.invoiceNumber}</Link>
                </td>
                <td style={tdStyle}>{o.customerName}</td>
                <td style={tdStyle}>{o.destination}</td>
                <td style={tdStyle}>{new Date(o.orderDate).toLocaleDateString()}</td>
                <td style={tdStyle}>${o.totalAmountUsd.toLocaleString()}</td>
                <td style={tdStyle}>
                  <select
                    value={o.status}
                    onChange={e => statusMutation.mutate({ id: o.id, status: Number(e.target.value) as OrderStatus })}
                    style={{
                      background: statusColors[o.status] + '20',
                      color: statusColors[o.status],
                      border: `1px solid ${statusColors[o.status]}40`,
                      borderRadius: 4,
                      padding: '2px 6px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {Object.entries(OrderStatusLabels).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </td>
                <td style={tdStyle}>
                  <Link to={`/orders/${o.id}/edit`} style={{ color: '#4361ee', marginRight: 12, textDecoration: 'none', fontSize: '0.85rem' }}>Edit</Link>
                  <button
                    onClick={() => { if (confirm(`Delete order "${o.invoiceNumber}"?`)) deleteMutation.mutate(o.id); }}
                    style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '0.85rem' }}
                  >Delete</button>
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
const btnStyle: React.CSSProperties = {
  background: '#4361ee', color: '#fff', padding: '0.5rem 1rem', borderRadius: 6,
  textDecoration: 'none', fontSize: '0.85rem', fontWeight: 500,
};
