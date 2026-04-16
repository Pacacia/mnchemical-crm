import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { customersApi } from '../api/customers';

export default function CustomerList() {
  const queryClient = useQueryClient();
  const { data: customers, isLoading } = useQuery({ queryKey: ['customers'], queryFn: customersApi.getAll });
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const deleteMutation = useMutation({
    mutationFn: customersApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  });

  const filtered = useMemo(() => {
    if (!customers) return [];
    let result = customers;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(q) || (c.country ?? '').toLowerCase().includes(q) || (c.city ?? '').toLowerCase().includes(q));
    }
    return [...result].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortKey === 'country') cmp = (a.country ?? '').localeCompare(b.country ?? '');
      else if (sortKey === 'orders') cmp = a.orderCount - b.orderCount;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [customers, search, sortKey, sortDir]);

  const sort = (key: string) => { if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc'); else { setSortKey(key); setSortDir('asc'); } };
  const SH = ({ k, label }: { k: string; label: string }) => (
    <th onClick={() => sort(k)} style={{ ...thStyle, cursor: 'pointer', userSelect: 'none' }}>{label} {sortKey === k ? (sortDir === 'asc' ? '↑' : '↓') : ''}</th>
  );

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Customers</h1>
        <Link to="/customers/new" style={btnStyle}>+ New Customer</Link>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <input placeholder="Search name, country, city..." value={search} onChange={e => setSearch(e.target.value)} style={searchStyle} />
        </div>
        <span style={{ fontSize: '0.8rem', color: '#888' }}>{filtered.length} customers</span>
      </div>

      <div style={card}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead><tr style={headerRow}>
            <SH k="name" label="Name" /><SH k="country" label="Country" /><th style={thStyle}>City</th>
            <th style={thStyle}>Contact</th><SH k="orders" label="Orders" /><th style={thStyle}>Actions</th>
          </tr></thead>
          <tbody>
            {filtered.length === 0 && <tr><td colSpan={6} style={empty}>{customers?.length ? 'No matching customers.' : 'No customers yet.'}</td></tr>}
            {filtered.map(c => (
              <tr key={c.id} style={row}>
                <td style={tdStyle}><Link to={`/customers/${c.id}`} style={{ color: '#4361ee', textDecoration: 'none', fontWeight: 500 }}>{c.name}</Link></td>
                <td style={tdStyle}>{c.country ?? '-'}</td>
                <td style={tdStyle}>{c.city ?? '-'}</td>
                <td style={tdStyle}>{c.contactPerson ?? '-'}</td>
                <td style={tdStyle}>{c.orderCount}</td>
                <td style={tdStyle}>
                  <Link to={`/customers/${c.id}/edit`} style={{ color: '#4361ee', marginRight: 12, textDecoration: 'none', fontSize: '0.85rem' }}>Edit</Link>
                  <button onClick={() => { if (confirm(`Delete "${c.name}"?`)) deleteMutation.mutate(c.id); }}
                    style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '0.85rem' }}>Delete</button>
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
