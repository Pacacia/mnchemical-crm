import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { customersApi } from '../api/customers';

export default function CustomerList() {
  const queryClient = useQueryClient();
  const { data: customers, isLoading } = useQuery({ queryKey: ['customers'], queryFn: customersApi.getAll });

  const deleteMutation = useMutation({
    mutationFn: customersApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  });

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Customers</h1>
        <Link to="/customers/new" style={btnStyle}>+ New Customer</Link>
      </div>

      <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#f8f9fb', borderBottom: '2px solid #eee' }}>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Country</th>
              <th style={thStyle}>City</th>
              <th style={thStyle}>Contact</th>
              <th style={thStyle}>Orders</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers?.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>No customers yet. Add your first customer.</td></tr>
            )}
            {customers?.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={tdStyle}><Link to={`/customers/${c.id}`} style={{ color: '#4361ee', textDecoration: 'none', fontWeight: 500 }}>{c.name}</Link></td>
                <td style={tdStyle}>{c.country ?? '-'}</td>
                <td style={tdStyle}>{c.city ?? '-'}</td>
                <td style={tdStyle}>{c.contactPerson ?? '-'}</td>
                <td style={tdStyle}>{c.orderCount}</td>
                <td style={tdStyle}>
                  <Link to={`/customers/${c.id}/edit`} style={{ color: '#4361ee', marginRight: 12, textDecoration: 'none', fontSize: '0.85rem' }}>Edit</Link>
                  <button
                    onClick={() => { if (confirm(`Delete "${c.name}"?`)) deleteMutation.mutate(c.id); }}
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
