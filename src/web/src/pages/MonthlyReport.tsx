import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { attendanceApi } from '../api/attendance';

const now = new Date();

export default function MonthlyReport() {
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const { data: summary, isLoading } = useQuery({
    queryKey: ['monthly-report', year, month],
    queryFn: () => attendanceApi.getMonthlySummary(year, month),
  });

  return (
    <div>
      <h1 style={{ margin: '0 0 1.5rem', fontSize: '1.5rem' }}>Monthly Report</h1>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'end' }}>
        <div>
          <label style={labelStyle}>Year</label>
          <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} style={{ ...inputStyle, width: 100 }} />
        </div>
        <div>
          <label style={labelStyle}>Month</label>
          <select value={month} onChange={e => setMonth(Number(e.target.value))} style={inputStyle}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>{new Date(2000, i).toLocaleString('en', { month: 'long' })}</option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? <p>Loading...</p> : (
        <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ background: '#f8f9fb', borderBottom: '2px solid #eee' }}>
                <th style={thStyle}>Employee</th>
                <th style={thStyle}>Department</th>
                <th style={thStyle}>Days Worked</th>
                <th style={thStyle}>Late</th>
                <th style={thStyle}>Absent</th>
                <th style={thStyle}>Total Hours</th>
                <th style={thStyle}>Overtime</th>
                <th style={thStyle}>Night Hours</th>
                <th style={thStyle}>Missing Out</th>
              </tr>
            </thead>
            <tbody>
              {(!summary || summary.length === 0) && (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>No data for this period.</td></tr>
              )}
              {summary?.map(s => (
                <tr key={s.employeeId} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={tdStyle}>{s.employeeName}</td>
                  <td style={tdStyle}>{s.department ?? '-'}</td>
                  <td style={tdStyle}>{s.daysWorked}</td>
                  <td style={{ ...tdStyle, color: s.lateCount > 0 ? '#fd7e14' : undefined }}>{s.lateCount}</td>
                  <td style={{ ...tdStyle, color: s.absentCount > 0 ? '#dc3545' : undefined }}>{s.absentCount}</td>
                  <td style={tdStyle}>{s.totalWorkTime}</td>
                  <td style={tdStyle}>{s.totalOvertime}</td>
                  <td style={tdStyle}>{s.totalNightHours}</td>
                  <td style={{ ...tdStyle, color: s.missingClockOutCount > 0 ? '#6f42c1' : undefined }}>{s.missingClockOutCount}</td>
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
const inputStyle: React.CSSProperties = { padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: 6, fontSize: '0.9rem', boxSizing: 'border-box' };
const thStyle: React.CSSProperties = { textAlign: 'left', padding: '0.6rem 0.75rem', fontWeight: 600, color: '#555' };
const tdStyle: React.CSSProperties = { padding: '0.6rem 0.75rem' };
