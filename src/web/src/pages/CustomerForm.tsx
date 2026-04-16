import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { customersApi } from '../api/customers';
import type { CreateCustomer } from '../types';

const empty: CreateCustomer = {
  name: '', country: '', city: '', address: '',
  vatNumber: '', registrationNumber: '',
  contactPerson: '', phone: '', email: '',
};

export default function CustomerForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CreateCustomer>(empty);

  const { data: existing } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => customersApi.getById(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existing) {
      setForm({
        name: existing.name,
        country: existing.country ?? '',
        city: existing.city ?? '',
        address: existing.address ?? '',
        vatNumber: existing.vatNumber ?? '',
        registrationNumber: existing.registrationNumber ?? '',
        contactPerson: existing.contactPerson ?? '',
        phone: existing.phone ?? '',
        email: existing.email ?? '',
      });
    }
  }, [existing]);

  const mutation = useMutation({
    mutationFn: () => isEdit ? customersApi.update(id!, form) : customersApi.create(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      navigate('/customers');
    },
  });

  const set = (field: keyof CreateCustomer, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div>
      <h1 style={{ margin: '0 0 1.5rem', fontSize: '1.5rem' }}>{isEdit ? 'Edit Customer' : 'New Customer'}</h1>

      <form onSubmit={e => { e.preventDefault(); mutation.mutate(); }}
        style={{ background: '#fff', borderRadius: 8, padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', maxWidth: 600 }}>

        <Field label="Company Name *" value={form.name} onChange={v => set('name', v)} required />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Field label="Country" value={form.country ?? ''} onChange={v => set('country', v)} />
          <Field label="City" value={form.city ?? ''} onChange={v => set('city', v)} />
        </div>

        <Field label="Address" value={form.address ?? ''} onChange={v => set('address', v)} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Field label="VAT Number" value={form.vatNumber ?? ''} onChange={v => set('vatNumber', v)} />
          <Field label="Registration Number" value={form.registrationNumber ?? ''} onChange={v => set('registrationNumber', v)} />
        </div>

        <Field label="Contact Person" value={form.contactPerson ?? ''} onChange={v => set('contactPerson', v)} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Field label="Phone" value={form.phone ?? ''} onChange={v => set('phone', v)} />
          <Field label="Email" value={form.email ?? ''} onChange={v => set('email', v)} type="email" />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button type="submit" disabled={mutation.isPending} style={submitBtn}>
            {mutation.isPending ? 'Saving...' : isEdit ? 'Update' : 'Create'}
          </button>
          <button type="button" onClick={() => navigate('/customers')} style={cancelBtn}>Cancel</button>
        </div>

        {mutation.isError && <p style={{ color: '#e74c3c', marginTop: '0.75rem' }}>Error: {mutation.error.message}</p>}
      </form>
    </div>
  );
}

function Field({ label, value, onChange, required, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void; required?: boolean; type?: string;
}) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#555', marginBottom: 4 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        style={{ width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: 6, fontSize: '0.9rem', boxSizing: 'border-box' }}
      />
    </div>
  );
}

const submitBtn: React.CSSProperties = {
  background: '#4361ee', color: '#fff', border: 'none', padding: '0.6rem 1.5rem',
  borderRadius: 6, cursor: 'pointer', fontWeight: 500, fontSize: '0.9rem',
};
const cancelBtn: React.CSSProperties = {
  background: '#f0f0f0', color: '#333', border: 'none', padding: '0.6rem 1.5rem',
  borderRadius: 6, cursor: 'pointer', fontWeight: 500, fontSize: '0.9rem',
};
