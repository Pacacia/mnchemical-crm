import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { employeesApi } from '../api/employees';
import { WorkScheduleLabels } from '../types';

export default function EmployeeList() {
  const [showInactive, setShowInactive] = useState(false);
  const queryClient = useQueryClient();
  const { data: employees, isLoading } = useQuery({
    queryKey: ['employees', showInactive],
    queryFn: () => employeesApi.getAll(showInactive),
  });

  const deleteMutation = useMutation({
    mutationFn: employeesApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  });

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Employees</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label style={{ fontSize: '0.85rem', color: '#666' }}>
            <input type="checkbox" checked={showInactive} onChange={e => setShowInactive(e.target.checked)} style={{ marginRight: 4 }} />
            Show inactive
          </label>
          <Link to="/employees/new" style={btnStyle}>+ New Employee</Link>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#f8f9fb', borderBottom: '2px solid #eee' }}>
              <th style={thStyle}>Badge ID</th>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Department</th>
              <th style={thStyle}>Position</th>
              <th style={thStyle}>Schedule</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees?.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>No employees yet. Import from CSV or add manually.</td></tr>
            )}
            {employees?.map(e => (
              <tr key={e.id} style={{ borderBottom: '1px solid #f0f0f0', opacity: e.isActive ? 1 : 0.5 }}>
                <td style={tdStyle}>{e.badgeId}</td>
                <td style={tdStyle} >{e.fullName}</td>
                <td style={tdStyle}>{e.department ?? '-'}</td>
                <td style={tdStyle}>{e.position ?? '-'}</td>
                <td style={tdStyle}>{WorkScheduleLabels[e.schedule]}</td>
                <td style={tdStyle}>
                  <span style={{
                    padding: '2px 8px', borderRadius: 4, fontSize: '0.8rem', fontWeight: 600,
                    background: e.isActive ? '#19875420' : '#dc354520',
                    color: e.isActive ? '#198754' : '#dc3545',
                  }}>{e.isActive ? 'Active' : 'Inactive'}</span>
                </td>
                <td style={tdStyle}>
                  <Link to={`/employees/${e.id}/edit`} style={{ color: '#4361ee', marginRight: 12, textDecoration: 'none', fontSize: '0.85rem' }}>Edit</Link>
                  <button
                    onClick={() => { if (confirm(`Delete "${e.fullName}"?`)) deleteMutation.mutate(e.id); }}
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
