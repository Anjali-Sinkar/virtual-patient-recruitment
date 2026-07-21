import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiLock, FiEye, FiEyeOff, FiActivity, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { login } from '../services/api';

const Login = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const data = await login(form.username.trim(), form.password);
      setUser({
        username: data.username,
        user_type: data.user_type,
        user_id: data.user_id,
      });
      toast.success(`Welcome back, ${data.username}!`);
      navigate('/dashboard');
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'Invalid credentials. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Left Panel */}
      <div style={styles.leftPanel}>
        <div style={styles.leftContent}>
          <div style={styles.logoWrap}>
            <div style={styles.logoIcon}>
              <FiActivity size={28} color="#fff" />
            </div>
            <span style={styles.logoText}>VPR<span style={{ color: '#22d3ee' }}>System</span></span>
          </div>

          <div style={styles.heroSection}>
            <h1 style={styles.heroTitle}>Virtual Patient Recruitment</h1>
            <p style={styles.heroSubtitle}>
              A next-generation platform connecting patients to clinical trials with AI-powered eligibility screening.
            </p>
          </div>

          <div style={styles.featureList}>
            {[
              { emoji: '🔬', title: 'Smart Matching', desc: 'AI-powered trial eligibility assessment' },
              { emoji: '📊', title: 'Real-time Analytics', desc: 'Track recruitment metrics live' },
              { emoji: '🛡️', title: 'Secure & Compliant', desc: 'HIPAA-compliant data handling' },
            ].map((f) => (
              <div key={f.title} style={styles.featureItem}>
                <span style={styles.featureEmoji}>{f.emoji}</span>
                <div>
                  <div style={styles.featureTitle}>{f.title}</div>
                  <div style={styles.featureDesc}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={styles.statsRow}>
            {[
              { value: '4', label: 'Active Trials' },
              { value: '500+', label: 'Patients Enrolled' },
              { value: '94%', label: 'Match Accuracy' },
            ].map((s) => (
              <div key={s.label} style={styles.statItem}>
                <div style={styles.statValue}>{s.value}</div>
                <div style={styles.statLabel}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div style={styles.rightPanel}>
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Welcome back</h2>
            <p style={styles.formSubtitle}>Sign in to your account to continue</p>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: 20 }}>
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <div style={styles.inputWrap}>
                <FiUser style={styles.inputIcon} />
                <input
                  name="username"
                  type="text"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                  className="input-field"
                  style={styles.inputWithIcon}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={styles.inputWrap}>
                <FiLock style={styles.inputIcon} />
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="input-field"
                  style={{ ...styles.inputWithIcon, paddingRight: '48px' }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary btn-full"
              disabled={loading}
              style={{ marginTop: '8px', padding: '14px 28px', fontSize: '16px' }}
            >
              {loading ? (
                <>
                  <span className="spinner spinner-sm" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                  <FiArrowRight />
                </>
              )}
            </button>
          </form>

          <div style={styles.divider}>
            <span style={styles.dividerLine} />
            <span style={styles.dividerText}>or</span>
            <span style={styles.dividerLine} />
          </div>

          <p style={styles.registerLink}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#6366f1', fontWeight: 600 }}>
              Create one now →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
  },
  leftPanel: {
    flex: '1',
    background: 'linear-gradient(135deg, #0d1a3a 0%, #1a0a3e 50%, #0a1a2e 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 48px',
    position: 'relative',
    overflow: 'hidden',
  },
  leftContent: {
    maxWidth: '420px',
    width: '100%',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '40px',
  },
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoIcon: {
    width: '48px',
    height: '48px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 25px rgba(99, 102, 241, 0.45)',
  },
  logoText: {
    fontSize: '22px',
    fontWeight: '800',
    color: '#f1f5f9',
  },
  heroSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  heroTitle: {
    fontSize: '36px',
    fontWeight: '800',
    color: '#f1f5f9',
    lineHeight: '1.2',
    background: 'linear-gradient(135deg, #f1f5f9, #a5b4fc)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  heroSubtitle: {
    fontSize: '16px',
    color: '#94a3b8',
    lineHeight: '1.7',
  },
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
    padding: '16px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    backdropFilter: 'blur(10px)',
  },
  featureEmoji: {
    fontSize: '24px',
    flexShrink: 0,
    marginTop: '2px',
  },
  featureTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: '2px',
  },
  featureDesc: {
    fontSize: '13px',
    color: '#64748b',
  },
  statsRow: {
    display: 'flex',
    gap: '0',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  statItem: {
    flex: 1,
    padding: '20px',
    textAlign: 'center',
    borderRight: '1px solid rgba(255, 255, 255, 0.06)',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#a5b4fc',
    lineHeight: '1',
    marginBottom: '4px',
  },
  statLabel: {
    fontSize: '12px',
    color: '#64748b',
    fontWeight: '500',
  },
  rightPanel: {
    width: '480px',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 48px',
    background: 'rgba(10, 15, 30, 0.6)',
    backdropFilter: 'blur(20px)',
    borderLeft: '1px solid rgba(255, 255, 255, 0.07)',
  },
  formCard: {
    width: '100%',
    maxWidth: '360px',
    animation: 'fadeIn 0.5s ease',
  },
  formHeader: {
    marginBottom: '32px',
  },
  formTitle: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#f1f5f9',
    marginBottom: '6px',
  },
  formSubtitle: {
    fontSize: '15px',
    color: '#64748b',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    color: '#64748b',
    fontSize: '16px',
    zIndex: 1,
    pointerEvents: 'none',
  },
  inputWithIcon: {
    paddingLeft: '42px',
  },
  eyeBtn: {
    position: 'absolute',
    right: '14px',
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '4px',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '24px 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: 'rgba(255, 255, 255, 0.08)',
  },
  dividerText: {
    fontSize: '13px',
    color: '#475569',
    fontWeight: '500',
  },
  registerLink: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#64748b',
  },
};

export default Login;
