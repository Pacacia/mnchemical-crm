import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../api/orders';
import { customersApi } from '../api/customers';
import { ProductType } from '../types';
import type { CreateOrder } from '../types';

const emptyLine = () => ({
  productDescription: 'Manganese (II) Oxide (60-62% Mn)',
  productType: ProductType.MnO,
  quantityTons: 0,
  unitPriceUsd: 0,
  packagingType: '1000kg big bags',
});

export default function OrderForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<CreateOrder>({
    invoiceNumber: '',
    orderDate: new Date().toISOString().split('T')[0],
    destination: '',
    customerId: '',
    lines: [emptyLine()],
  });

  const { data: customers } = useQuery({ queryKey: ['customers'], queryFn: customersApi.getAll });
  const { data: existing } = useQuery({
    queryKey: ['order', id],
    queryFn: () => ordersApi.getById(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existing) {
      setForm({
        invoiceNumber: existing.invoiceNumber,
        orderDate: existing.orderDate.split('T')[0],
        deliveryDate: existing.deliveryDate?.split('T')[0],
        destination: existing.destination,
        incoterms: existing.incoterms ?? '',
        paymentTerms: existing.paymentTerms ?? '',
        customerId: existing.customerId,
        lines: existing.lines.map(l => ({
          productDescription: l.productDescription,
          productType: l.productType,
          quantityTons: l.quantityTons,
          unitPriceUsd: l.unitPriceUsd,
          packagingType: l.packagingType ?? '',
        })),
      });
    }
  }, [existing]);

  const mutation = useMutation({
    mutationFn: () => isEdit ? ordersApi.update(id!, form) : ordersApi.create(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      navigate('/orders');
    },
  });

  const updateLine = (index: number, field: string, value: unknown) => {
    setForm(prev => ({
      ...prev,
      lines: prev.lines.map((l, i) => i === index ? { ...l, [field]: value } : l),
    }));
  };

  const addLine = () => setForm(prev => ({ ...prev, lines: [...prev.lines, emptyLine()] }));
  const removeLine = (index: number) => setForm(prev => ({ ...prev, lines: prev.lines.filter((_, i) => i !== index) }));

  return (
    <div>
      <h1 style={{ margin: '0 0 1.5rem', fontSize: '1.5rem' }}>{isEdit ? 'Edit Order' : 'New Order'}</h1>

      <form onSubmit={e => { e.preventDefault(); mutation.mutate(); }}
        style={{ background: '#fff', borderRadius: 8, padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div style={fieldWrap}>
            <label style={labelStyle}>Invoice Number *</label>
            <input style={inputStyle} required value={form.invoiceNumber} onChange={e => setForm(p => ({ ...p, invoiceNumber: e.target.value }))} />
          </div>
          <div style={fieldWrap}>
            <label style={labelStyle}>Order Date *</label>
            <input style={inputStyle} type="date" required value={form.orderDate} onChange={e => setForm(p => ({ ...p, orderDate: e.target.value }))} />
          </div>
          <div style={fieldWrap}>
            <label style={labelStyle}>Delivery Date</label>
            <input style={inputStyle} type="date" value={form.deliveryDate ?? ''} onChange={e => setForm(p => ({ ...p, deliveryDate: e.target.value || undefined }))} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={fieldWrap}>
            <label style={labelStyle}>Customer *</label>
            <select style={inputStyle} required value={form.customerId} onChange={e => setForm(p => ({ ...p, customerId: e.target.value }))}>
              <option value="">Select customer...</option>
              {customers?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div style={fieldWrap}>
            <label style={labelStyle}>Destination *</label>
            <input style={inputStyle} required value={form.destination} onChange={e => setForm(p => ({ ...p, destination: e.target.value }))} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div style={fieldWrap}>
            <label style={labelStyle}>Incoterms</label>
            <input style={inputStyle} placeholder="e.g. CFR Rotterdam" value={form.incoterms ?? ''} onChange={e => setForm(p => ({ ...p, incoterms: e.target.value }))} />
          </div>
          <div style={fieldWrap}>
            <label style={labelStyle}>Payment Terms</label>
            <input style={inputStyle} placeholder="e.g. Nett cash" value={form.paymentTerms ?? ''} onChange={e => setForm(p => ({ ...p, paymentTerms: e.target.value }))} />
          </div>
        </div>

        <h3 style={{ margin: '1.5rem 0 0.75rem', fontSize: '1rem' }}>Line Items</h3>

        {form.lines.map((line, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1.5fr auto', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'end' }}>
            <div style={fieldWrap}>
              {i === 0 && <label style={labelStyle}>Product</label>}
              <input style={inputStyle} value={line.productDescription} onChange={e => updateLine(i, 'productDescription', e.target.value)} />
            </div>
            <div style={fieldWrap}>
              {i === 0 && <label style={labelStyle}>Type</label>}
              <select style={inputStyle} value={line.productType} onChange={e => updateLine(i, 'productType', Number(e.target.value))}>
                <option value={ProductType.MnO}>MnO</option>
                <option value={ProductType.MnO2}>MnO2</option>
              </select>
            </div>
            <div style={fieldWrap}>
              {i === 0 && <label style={labelStyle}>Qty (t)</label>}
              <input style={inputStyle} type="number" step="0.001" min="0" value={line.quantityTons || ''} onChange={e => updateLine(i, 'quantityTons', parseFloat(e.target.value) || 0)} />
            </div>
            <div style={fieldWrap}>
              {i === 0 && <label style={labelStyle}>Price/t ($)</label>}
              <input style={inputStyle} type="number" step="0.01" min="0" value={line.unitPriceUsd || ''} onChange={e => updateLine(i, 'unitPriceUsd', parseFloat(e.target.value) || 0)} />
            </div>
            <div style={fieldWrap}>
              {i === 0 && <label style={labelStyle}>Packaging</label>}
              <input style={inputStyle} value={line.packagingType ?? ''} onChange={e => updateLine(i, 'packagingType', e.target.value)} />
            </div>
            <button type="button" onClick={() => removeLine(i)} disabled={form.lines.length === 1}
              style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '1.1rem', padding: '0.5rem' }}>
              x
            </button>
          </div>
        ))}

        <button type="button" onClick={addLine} style={{ background: 'none', border: '1px dashed #ccc', borderRadius: 6, padding: '0.4rem 1rem', cursor: 'pointer', color: '#666', fontSize: '0.85rem', marginTop: '0.5rem' }}>
          + Add Line
        </button>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
          <button type="submit" disabled={mutation.isPending} style={submitBtn}>
            {mutation.isPending ? 'Saving...' : isEdit ? 'Update Order' : 'Create Order'}
          </button>
          <button type="button" onClick={() => navigate('/orders')} style={cancelBtn}>Cancel</button>
        </div>

        {mutation.isError && <p style={{ color: '#e74c3c', marginTop: '0.75rem' }}>Error: {mutation.error.message}</p>}
      </form>
    </div>
  );
}

const fieldWrap: React.CSSProperties = { marginBottom: '0.25rem' };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#555', marginBottom: 4 };
const inputStyle: React.CSSProperties = { width: '100%', padding: '0.5rem 0.75rem', border: '1px solid #ddd', borderRadius: 6, fontSize: '0.9rem', boxSizing: 'border-box' };
const submitBtn: React.CSSProperties = { background: '#4361ee', color: '#fff', border: 'none', padding: '0.6rem 1.5rem', borderRadius: 6, cursor: 'pointer', fontWeight: 500, fontSize: '0.9rem' };
const cancelBtn: React.CSSProperties = { background: '#f0f0f0', color: '#333', border: 'none', padding: '0.6rem 1.5rem', borderRadius: 6, cursor: 'pointer', fontWeight: 500, fontSize: '0.9rem' };
