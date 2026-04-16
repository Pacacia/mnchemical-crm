import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leaveApi } from '../api/leave';
import { employeesApi } from '../api/employees';
import { LeaveType, LeaveTypeLabels, LeaveStatus, LeaveStatusLabels } from '../types';

const statusColors: Record<number, string> = {
  [LeaveStatus.Pending]: '#fd7e14',
  [LeaveStatus.Approved]: '#198754',
  [LeaveStatus.Rejected]: '#dc3545',
};

export default function LeaveManagement() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ employeeId: '', type: LeaveType.Vacation as LeaveType, startDate: '', endDate: '', reason: '' });

  const { data: employees } = useQuery({ queryKey: ['employees'], queryFn: () => employeesApi.getAll() });
  const { data: leaves, isLoading } = useQuery({
    queryKey: ['leaves', statusFilter],
    queryFn: () => leaveApi.getAll(undefined, statusFilter !== '' ? Number(statusFilter) as LeaveStatus : undefined),
  });

  const createMutation = useMutation({
    mutationFn: () => leaveApi.create(form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['leaves'] }); setShowForm(false); setForm({ employeeId: '', type: LeaveType.Vacation, startDate: '', endDate: '', reason: '' }); },
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeaveStatus }) =>
      leaveApi.review(id, { status, approvedBy: 'Manager' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leaves'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: leaveApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leaves'] }),
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Leave Management</h1>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selectStyle}>
            <option value="">All statuses</option>
            {Object.entries(LeaveStatusLabels).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
          </select>
          <button onClick={() => setShowForm(true)} style={btnStyle}>+ New Request</button>
        </div>
      </div>

      {showForm && (
        <div style={{ background: '#fff', borderRadius: 8, padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', marginBottom: '1.5rem', maxWidth: 500 }}>
          <h3 style={{ margin: '0 0 1rem' }}>New Leave Request</h3>
          <form onSubmit={e => { e.preventDefault(); createMutation.mutate(); }}>
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={labelStyle}>Employee *</label>
              <select required value={form.employeeId} onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))} style={inputStyle}>
                <option value="">Select...</option>
                {employees?.map(emp => <option key={emp.id} value={emp.id}>{emp.fullName}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={labelStyle}>Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: Number(e.target.value) as LeaveType }))} style={inputStyle}>
                {Object.entries(LeaveTypeLabels).map(([val, label]) => <option key={val} value={val}>{label}</option>)}
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <div>
                <label style={labelStyle}>Start Date *</label>
                <input type="date" required value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>End Date *</label>
                <input type="date" required value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} style={inputStyle} />
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Reason</label>
              <textarea value={form.reason} onChange={e => setForm(f => ({ ...f, reason: e.target.value }))} style={{ ...inputStyle, height: 50, resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="submit" disabled={createMutation.isPending} style={btnPrimary}>Submit</button>
              <button type="button" onClick={() => setShowForm(false)} style={btnCancel}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? <p>Loading...</p> : (
        <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#f8f9fb', borderBottom: '2px solid #eee' }}>
                <th style={thStyle}>Employee</th>
                <th style={thStyle}>Department</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>From</th>
                <th style={thStyle}>To</th>
                <th style={thStyle}>Days</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves?.length === 0 && (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>No leave requests.</td></tr>
              )}
              {leaves?.map(l => (
                <tr key={l.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={tdStyle}>{l.employeeName}</td>
                  <td style={tdStyle}>{l.department ?? '-'}</td>
                  <td style={tdStyle}>{LeaveTypeLabels[l.type]}</td>
                  <td style={tdStyle}>{l.startDate}</td>
                  <td style={tdStyle}>{l.endDate}</td>
                  <td style={tdStyle}>{l.dayCount}</td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: '2px 8px', borderRadius: 4, fontSize: '0.8rem', fontWeight: 600,
                      background: (statusColors[l.status] ?? '#666') + '20',
                      color: statusColors[l.status] ?? '#666',
                    }}>{LeaveStatusLabels[l.status]}</span>
                  </td>
                  <td style={tdStyle}>
                    {l.status === LeaveStatus.Pending && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => reviewMutation.mutate({ id: l.id, status: LeaveStatus.Approved })}
                          style={{ background: 'none', border: 'none', color: '#198754', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>Approve</button>
                        <button onClick={() => reviewMutation.mutate({ id: l.id, status: LeaveStatus.Rejected })}
                          style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>Reject</button>
                      </div>
                    )}
                    <button onClick={() => { if (confirm('Delete this request?')) deleteMutation.mutate(l.id); }}
                      style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#555', marginBottom: 4 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: 6, fontSize: '0.9rem', boxSizing: 'border-box' };
const selectStyle: React.CSSProperties = { padding: '0.4rem 0.75rem', border: '1px solid #ddd', borderRadius: 6, fontSize: '0.85rem' };
const thStyle: React.CSSProperties = { textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 600, color: '#555' };
const tdStyle: React.CSSProperties = { padding: '0.75rem 1rem' };
const btnStyle: React.CSSProperties = { background: '#4361ee', color: '#fff', padding: '0.5rem 1rem', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 };
const btnPrimary: React.CSSProperties = { background: '#4361ee', color: '#fff', border: 'none', padding: '0.5rem 1.25rem', borderRadius: 6, cursor: 'pointer', fontWeight: 500 };
const btnCancel: React.CSSProperties = { background: '#f0f0f0', color: '#333', border: 'none', padding: '0.5rem 1.25rem', borderRadius: 6, cursor: 'pointer', fontWeight: 500 };
