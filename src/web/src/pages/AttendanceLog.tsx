import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '../api/attendance';
import { employeesApi } from '../api/employees';

function getToday() { return new Date().toISOString().split('T')[0]; }
function getWeekAgo() { return new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]; }

export default function AttendanceLog() {
  const queryClient = useQueryClient();
  const [from, setFrom] = useState(getWeekAgo);
  const [to, setTo] = useState(getToday);
  const [employeeFilter, setEmployeeFilter] = useState('');
  const [overrideId, setOverrideId] = useState<string | null>(null);
  const [overrideForm, setOverrideForm] = useState({ clockIn: '', clockOut: '', managerComment: '' });

  const { data: employees } = useQuery({ queryKey: ['employees'], queryFn: () => employeesApi.getAll() });
  const { data: records, isLoading } = useQuery({
    queryKey: ['attendance-log', from, to, employeeFilter],
    queryFn: () => attendanceApi.getByDateRange(from, to, employeeFilter || undefined),
  });

  const overrideMutation = useMutation({
    mutationFn: () => attendanceApi.manualOverride(overrideId!, overrideForm),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-log'] });
      setOverrideId(null);
      setOverrideForm({ clockIn: '', clockOut: '', managerComment: '' });
    },
  });

  return (
    <div>
      <h1 style={{ margin: '0 0 1.5rem', fontSize: '1.5rem' }}>Attendance Log</h1>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'end', flexWrap: 'wrap' }}>
        <div>
          <label style={labelStyle}>From</label>
          <input type="date" value={from} onChange={e => setFrom(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>To</label>
          <input type="date" value={to} onChange={e => setTo(e.target.value)} style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Employee</label>
          <select value={employeeFilter} onChange={e => setEmployeeFilter(e.target.value)} style={inputStyle}>
            <option value="">All employees</option>
            {employees?.map(emp => <option key={emp.id} value={emp.id}>{emp.fullName}</option>)}
          </select>
        </div>
      </div>

      {isLoading ? <p>Loading...</p> : (
        <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f8f9fb', borderBottom: '2px solid #eee' }}>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Employee</th>
                <th style={thStyle}>Dept</th>
                <th style={thStyle}>In</th>
                <th style={thStyle}>Out</th>
                <th style={thStyle}>Work</th>
                <th style={thStyle}>OT</th>
                <th style={thStyle}>Flags</th>
                <th style={thStyle}>Comment</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records?.length === 0 && (
                <tr><td colSpan={10} style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>No records found for this period.</td></tr>
              )}
              {records?.map(r => (
                <tr key={r.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={tdStyle}>{r.date}</td>
                  <td style={tdStyle}>{r.employeeName}</td>
                  <td style={tdStyle}>{r.department ?? '-'}</td>
                  <td style={tdStyle}>{r.clockIn ?? '-'}</td>
                  <td style={tdStyle}>{r.clockOut ?? <span style={{ color: '#6f42c1' }}>-</span>}</td>
                  <td style={tdStyle}>{r.workTime ?? '-'}</td>
                  <td style={tdStyle}>{r.overtime ?? '-'}</td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                      {r.isLateArrival && <Tag color="#fd7e14">Late</Tag>}
                      {r.isMissingClockOut && <Tag color="#6f42c1">No out</Tag>}
                      {r.isManualOverride && <Tag color="#0d6efd">Manual</Tag>}
                    </div>
                  </td>
                  <td style={tdStyle}><span style={{ fontSize: '0.8rem', color: '#666' }}>{r.managerComment ?? ''}</span></td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => { setOverrideId(r.id); setOverrideForm({ clockIn: r.clockIn ?? '', clockOut: r.clockOut ?? '', managerComment: '' }); }}
                      style={{ background: 'none', border: 'none', color: '#4361ee', cursor: 'pointer', fontSize: '0.8rem' }}
                    >Override</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {overrideId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: '1.5rem', width: 400, boxShadow: '0 8px 30px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin: '0 0 1rem' }}>Manual Override</h3>
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={labelStyle}>Clock In</label>
              <input type="time" value={overrideForm.clockIn} onChange={e => setOverrideForm(f => ({ ...f, clockIn: e.target.value }))} style={inputStyle} />
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={labelStyle}>Clock Out</label>
              <input type="time" value={overrideForm.clockOut} onChange={e => setOverrideForm(f => ({ ...f, clockOut: e.target.value }))} style={inputStyle} />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>Comment (required) *</label>
              <textarea
                value={overrideForm.managerComment}
                onChange={e => setOverrideForm(f => ({ ...f, managerComment: e.target.value }))}
                style={{ ...inputStyle, height: 60, resize: 'vertical' }}
                placeholder="Why is this being overridden?"
                required
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => { if (overrideForm.managerComment) overrideMutation.mutate(); }}
                disabled={!overrideForm.managerComment || overrideMutation.isPending}
                style={{ ...btnPrimary, opacity: overrideForm.managerComment ? 1 : 0.5 }}
              >Save</button>
              <button onClick={() => setOverrideId(null)} style={btnCancel}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Tag({ color, children }: { color: string; children: React.ReactNode }) {
  return <span style={{ background: color + '20', color, padding: '1px 5px', borderRadius: 3, fontSize: '0.7rem', fontWeight: 600 }}>{children}</span>;
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#555', marginBottom: 4 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: 6, fontSize: '0.9rem', boxSizing: 'border-box' };
const thStyle: React.CSSProperties = { textAlign: 'left', padding: '0.6rem 0.75rem', fontWeight: 600, color: '#555' };
const tdStyle: React.CSSProperties = { padding: '0.6rem 0.75rem' };
const btnPrimary: React.CSSProperties = { background: '#4361ee', color: '#fff', border: 'none', padding: '0.5rem 1.25rem', borderRadius: 6, cursor: 'pointer', fontWeight: 500 };
const btnCancel: React.CSSProperties = { background: '#f0f0f0', color: '#333', border: 'none', padding: '0.5rem 1.25rem', borderRadius: 6, cursor: 'pointer', fontWeight: 500 };
