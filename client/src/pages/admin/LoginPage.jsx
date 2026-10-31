import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from '../../components/UI';

const LoginPage = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/admin/dashboard';

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(form.email, form.password);
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#fdf8f5', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', padding: '32px 16px' }} className="font-sans">
      <div style={{ width: '100%', maxWidth: 420, margin: 'auto' }} className="animate-fade-in">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-block group" style={{ textDecoration: 'none' }}>
            <div style={{ width: 56, height: 56, background: 'linear-gradient(135deg, #d85d85 0%, #b83a65 100%)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 12px', boxShadow: '0 8px 24px rgba(216,93,133,0.3)' }}>
              🌸
            </div>
          </Link>
          <h1 className="font-serif" style={{ fontSize: 26, fontWeight: 800, color: '#1e293b', letterSpacing: '-0.02em' }}>
            Aromatic Admin Portal
          </h1>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
            Sign in to manage table reservations, party halls, and cafe orders
          </p>
        </div>

        {/* Login Card */}
        <div style={{ background: '#ffffff', borderRadius: 24, border: '1.5px solid #f3d7df', padding: '32px 28px', boxShadow: '0 8px 30px rgba(216,93,133,0.06)' }}>
          {error && (
            <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'start', gap: 8 }}>
              <span style={{ fontSize: 16 }}>⚠️</span>
              <p style={{ color: '#e11d48', fontSize: 12, fontWeight: 600, lineHeight: 1.5, margin: 0 }}>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="Enter admin email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="form-input"
                  style={{ paddingRight: 40 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 15 }}
                  tabIndex={-1}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '13px 0', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="border-t-white" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign In to Admin Console →</span>
              )}
            </button>
          </form>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to="/" style={{ fontSize: 13, color: '#b83a65', fontWeight: 600, textDecoration: 'none' }}>
            ← Back to Customer Cafe Experience
          </Link>
        </div>
      </div>

      <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 12 }}>
        Aromatic Management System · Secure Access 🌸
      </p>
    </div>
  );
};

export default LoginPage;
