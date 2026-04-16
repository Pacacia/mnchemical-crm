import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '../api/attendance';
import type { CsvImportResult } from '../types';

export default function AttendanceToday() {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importResult, setImportResult] = useState<CsvImportResult | null>(null);
  const { data, isLoading } = useQuery({ queryKey: ['attendance-today'], queryFn: attendanceApi.getToday });

  const importMutation = useMutation({
    mutationFn: (file: File) => attendanceApi.importCsv(file),
    onSuccess: (result) => {
      setImportResult(result);
      queryClient.invalidateQueries({ queryKey: ['attendance-today'] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });

  const handleImport = () => {
    const file = fileRef.current?.files?.[0];
    if (file) importMutation.mutate(file);
  };

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Today's Attendance</h1>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input ref={fileRef} type="file" accept=".csv" style={{ fontSize: '0.85rem' }} />
          <button onClick={handleImport} disabled={importMutation.isPending} style={btnStyle}>
            {importMutation.isPending ? 'Importing...' : 'Import CSV'}
          </button>
        </div>
      </div>

      {importResult && (
        <div style={{ background: '#d1e7dd', borderRadius: 8, padding: '1rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
          Imported {importResult.recordsImported} records, {importResult.employeesCreated} new employees, {importResult.duplicatesSkipped} duplicates skipped.
          {importResult.warnings.length > 0 && (
            <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.5rem' }}>
              {importResult.warnings.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          )}
        </div>
      )}

      {data && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          <StatCard label="Total Employees" value={data.totalEmployees} />
          <StatCard label="Present" value={data.presentCount} color="#198754" />
          <StatCard label="Late" value={data.lateCount} color="#fd7e14" />
          <StatCard label="Absent" value={data.absentCount} color="#dc3545" />
          <StatCard label="Missing Clock-Out" value={data.missingClockOutCount} color="#6f42c1" />
        </div>
      )}

      <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ background: '#f8f9fb', borderBottom: '2px solid #eee' }}>
              <th style={thStyle}>Employee</th>
              <th style={thStyle}>Department</th>
              <th style={thStyle}>Clock In</th>
              <th style={thStyle}>Clock Out</th>
              <th style={thStyle}>Work Time</th>
              <th style={thStyle}>Status</th>
            </tr>
          </thead>
          <tbody>
            {(!data || data.records.length === 0) && (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>No attendance records for today. Import a CSV to get started.</td></tr>
            )}
            {data?.records.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={tdStyle}>{r.employeeName}</td>
                <td style={tdStyle}>{r.department ?? '-'}</td>
                <td style={tdStyle}>{r.clockIn ?? '-'}</td>
                <td style={tdStyle}>{r.clockOut ?? <span style={{ color: '#6f42c1' }}>Missing</span>}</td>
                <td style={tdStyle}>{r.workTime ?? '-'}</td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {r.isLateArrival && <Tag color="#fd7e14">Late</Tag>}
                    {r.isMissingClockOut && <Tag color="#6f42c1">No clock-out</Tag>}
                    {r.isManualOverride && <Tag color="#0d6efd">Manual</Tag>}
                    {!r.isLateArrival && !r.isMissingClockOut && <Tag color="#198754">OK</Tag>}
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

function StatCard({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <div style={{ background: '#fff', borderRadius: 8, padding: '1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
      <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: color ?? '#333' }}>{value}</div>
    </div>
  );
}

function Tag({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span style={{ background: color + '20', color, padding: '1px 6px', borderRadius: 4, fontSize: '0.75rem', fontWeight: 600 }}>
      {children}
    </span>
  );
}

const thStyle: React.CSSProperties = { textAlign: 'left', padding: '0.75rem 1rem', fontWeight: 600, color: '#555' };
const tdStyle: React.CSSProperties = { padding: '0.75rem 1rem' };
const btnStyle: React.CSSProperties = { background: '#4361ee', color: '#fff', padding: '0.5rem 1rem', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 };
