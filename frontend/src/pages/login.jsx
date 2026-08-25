import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, me } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { loginUser, setUser } = useAuth();
  const navigate = useNavigate();

  function normalizeError(err) {
    const detail = err.response?.data?.detail;
    if (Array.isArray(detail)) {
      return detail
        .map((item) => {
          if (typeof item === 'string') return item;
          if (item && typeof item === 'object') {
            return item.msg || item.message || JSON.stringify(item);
          }
          return String(item);
        })
        .join(' | ');
    }
    if (typeof detail === 'string') {
      return detail;
    }
    if (detail && typeof detail === 'object') {
      return detail.msg || detail.message || JSON.stringify(detail);
    }
    return 'Authentication failed';
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await login({ email, password });
      loginUser(data.access_token);
      const profile = await me();
      setUser(profile);
      navigate('/');
    } catch (err) {
      setError(normalizeError(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center p-4">
      <form onSubmit={onSubmit} className="glass-card w-full max-w-md p-6 space-y-4">
        <h1 className="font-display text-3xl text-cyan">SentinelAI OS Login</h1>
        <input className="w-full p-3 bg-black/40 rounded border border-cyan/40" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="w-full p-3 bg-black/40 rounded border border-cyan/40" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <p className="text-danger text-sm">{error}</p>}
        <button disabled={loading} className="w-full p-3 rounded bg-cyan text-black font-semibold hover:opacity-90 disabled:opacity-60">
          {loading ? 'Establishing Secure Session...' : 'Login'}
        </button>
        <p className="text-sm text-white/70">
          No account? <Link className="text-cyan" to="/register">Register</Link>
        </p>
      </form>
    </div>
  );
}
