import { useQuery } from '@tanstack/react-query';
import { customersApi } from '../api/customers';
import { ordersApi } from '../api/orders';
import { OrderStatusLabels } from '../types';

export default function Dashboard() {
  const { data: customers, isError: custErr } = useQuery({ queryKey: ['customers'], queryFn: customersApi.getAll });
  const { data: orders, isError: ordErr } = useQuery({ queryKey: ['orders'], queryFn: ordersApi.getAll });

  const activeOrders = orders?.filter(o => o.status < 5) ?? [];
  const totalRevenue = orders?.reduce((sum, o) => sum + o.totalAmountUsd, 0) ?? 0;
  const totalPaid = orders?.reduce((sum, o) => sum + o.totalPaidUsd, 0) ?? 0;

  const statusCounts = activeOrders.reduce((acc, o) => {
    const label = OrderStatusLabels[o.status];
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
      <h1 style={{ margin: '0 0 1.5rem', fontSize: '1.5rem' }}>Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {(custErr || ordErr) && <div style={{ gridColumn: 'span 4', color: '#dc3545', fontSize: '0.85rem' }}>Failed to load some data. Check API connection.</div>}
        <StatCard label="Customers" value={customers?.length ?? 0} />
        <StatCard label="Active Orders" value={activeOrders.length} />
        <StatCard label="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} />
        <StatCard label="Outstanding" value={`$${(totalRevenue - totalPaid).toLocaleString()}`} />
      </div>

      {Object.keys(statusCounts).length > 0 && (
        <div style={{ background: '#fff', borderRadius: 8, padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <h3 style={{ margin: '0 0 1rem', fontSize: '1rem' }}>Order Pipeline</h3>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {Object.entries(statusCounts).map(([label, count]) => (
              <div key={label} style={{ textAlign: 'center', flex: 1, padding: '0.75rem', background: '#f0f4ff', borderRadius: 6 }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#4361ee' }}>{count}</div>
                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 8,
      padding: '1.25rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    }}>
      <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{value}</div>
    </div>
  );
}
