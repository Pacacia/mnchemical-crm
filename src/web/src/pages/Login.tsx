import { useState } from 'react';
import { authApi, setToken, setStoredUser } from '../api/auth';

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await authApi.login(username, password);
      setToken(result.token);
      setStoredUser(result.user);
      onLogin();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a2e' }}>
      <form onSubmit={handleSubmit} style={{
        background: '#fff', borderRadius: 12, padding: '2.5rem', width: 360,
        boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
      }}>
        <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.5rem', color: '#1a1a2e' }}>MN Chemical</h1>
        <p style={{ margin: '0 0 2rem', color: '#888', fontSize: '0.85rem' }}>CRM System — Sign in to continue</p>

        {error && (
          <div style={{ background: '#fde8e8', color: '#dc3545', padding: '0.6rem 0.75rem', borderRadius: 6, marginBottom: '1rem', fontSize: '0.85rem' }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#555', marginBottom: 4 }}>Username</label>
          <input
            value={username} onChange={e => setUsername(e.target.value)} required autoFocus
            style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #ddd', borderRadius: 6, fontSize: '0.95rem', boxSizing: 'border-box' }}
          />
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#555', marginBottom: 4 }}>Password</label>
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)} required
            style={{ width: '100%', padding: '0.6rem 0.75rem', border: '1px solid #ddd', borderRadius: 6, fontSize: '0.95rem', boxSizing: 'border-box' }}
          />
        </div>
        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '0.7rem', background: '#4361ee', color: '#fff', border: 'none',
          borderRadius: 6, fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer',
          opacity: loading ? 0.7 : 1,
        }}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <p style={{ marginTop: '1.5rem', color: '#aaa', fontSize: '0.75rem', textAlign: 'center' }}>
          Default: admin / admin123
        </p>
      </form>
    </div>
  );
}
