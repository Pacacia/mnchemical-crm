import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { employeesApi } from '../api/employees';
import { WorkSchedule, WorkScheduleLabels } from '../types';
import type { CreateEmployee } from '../types';

const empty: CreateEmployee = { badgeId: '', fullName: '', schedule: WorkSchedule.Day9to18 };

export default function EmployeeForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CreateEmployee & { isActive: boolean }>({ ...empty, isActive: true });

  const { data: existing } = useQuery({
    queryKey: ['employee', id],
    queryFn: () => employeesApi.getById(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existing) {
      setForm({
        badgeId: existing.badgeId,
        fullName: existing.fullName,
        department: existing.department ?? '',
        position: existing.position ?? '',
        shift: existing.shift ?? '',
        schedule: existing.schedule,
        isActive: existing.isActive,
      });
    }
  }, [existing]);

  const mutation = useMutation({
    mutationFn: () => isEdit ? employeesApi.update(id!, form) : employeesApi.create(form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['employees'] }); navigate('/employees'); },
  });

  const set = (field: string, value: unknown) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div>
      <h1 style={{ margin: '0 0 1.5rem', fontSize: '1.5rem' }}>{isEdit ? 'Edit Employee' : 'New Employee'}</h1>
      <form onSubmit={e => { e.preventDefault(); mutation.mutate(); }}
        style={{ background: '#fff', borderRadius: 8, padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', maxWidth: 600 }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
          <Field label="Badge ID *" value={form.badgeId} onChange={v => set('badgeId', v)} required />
          <Field label="Full Name *" value={form.fullName} onChange={v => set('fullName', v)} required />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Field label="Department" value={form.department ?? ''} onChange={v => set('department', v)} />
          <Field label="Position" value={form.position ?? ''} onChange={v => set('position', v)} />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={labelStyle}>Work Schedule</label>
          <select style={inputStyle} value={form.schedule} onChange={e => set('schedule', Number(e.target.value))}>
            {Object.entries(WorkScheduleLabels).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        {isEdit && (
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 6 }}>
              <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} />
              Active
            </label>
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button type="submit" disabled={mutation.isPending} style={submitBtn}>
            {mutation.isPending ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </button>
          <button type="button" onClick={() => navigate('/employees')} style={cancelBtn}>Cancel</button>
        </div>
        {mutation.isError && <p style={{ color: '#e74c3c', marginTop: '0.75rem' }}>Error: {mutation.error.message}</p>}
      </form>
    </div>
  );
}

function Field({ label, value, onChange, required }: { label: string; value: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={labelStyle}>{label}</label>
      <input style={inputStyle} value={value} onChange={e => onChange(e.target.value)} required={required} />
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#555', marginBottom: 4 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: 6, fontSize: '0.9rem', boxSizing: 'border-box' };
const submitBtn: React.CSSProperties = { background: '#4361ee', color: '#fff', border: 'none', padding: '0.6rem 1.5rem', borderRadius: 6, cursor: 'pointer', fontWeight: 500 };
const cancelBtn: React.CSSProperties = { background: '#f0f0f0', color: '#333', border: 'none', padding: '0.6rem 1.5rem', borderRadius: 6, cursor: 'pointer', fontWeight: 500 };
