import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiLock, FiEye, FiEyeOff, FiActivity, FiArrowRight, FiShield } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { register } from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    user_type: 'patient',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password || !form.confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (form.username.trim().length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register(form.username.trim(), form.password, form.user_type);
      toast.success('Account created successfully! Please log in.');
      navigate('/login');
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        'Registration failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return null;
    if (p.length < 6) return { level: 'Weak', color: '#ef4444', width: '33%' };
    if (p.length < 10 || !/[A-Z]/.test(p) || !/[0-9]/.test(p))
      return { level: 'Medium', color: '#f59e0b', width: '66%' };
    return { level: 'Strong', color: '#10b981', width: '100%' };
  };
  const strength = passwordStrength();

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
            <h1 style={styles.heroTitle}>Join Our Clinical Trial Platform</h1>
            <p style={styles.heroSubtitle}>
              Register as a patient to explore trials or as an administrator to manage the recruitment process.
            </p>
          </div>

          <div style={styles.roleCards}>
            <div
              style={{
                ...styles.roleCard,
                ...(form.user_type === 'patient' ? styles.roleCardActive : {}),
              }}
              onClick={() => setForm((p) => ({ ...p, user_type: 'patient' }))}
            >
              <span style={styles.roleEmoji}>🏥</span>
              <div>
                <div style={styles.roleTitle}>Patient</div>
                <div style={styles.roleDesc}>Apply for clinical trials and track your applications</div>
              </div>
            </div>
            <div
              style={{
                ...styles.roleCard,
                ...(form.user_type === 'admin' ? styles.roleCardActive : {}),
              }}
              onClick={() => setForm((p) => ({ ...p, user_type: 'admin' }))}
            >
              <span style={styles.roleEmoji}>🛡️</span>
              <div>
                <div style={styles.roleTitle}>Administrator</div>
                <div style={styles.roleDesc}>Manage users, trials, and recruitment analytics</div>
              </div>
            </div>
          </div>

          <div style={styles.securityNote}>
            <FiShield size={16} color="#6366f1" />
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              Your data is encrypted and HIPAA compliant
            </span>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div style={styles.rightPanel}>
        <div style={styles.formCard}>
          <div style={styles.formHeader}>
            <h2 style={styles.formTitle}>Create account</h2>
            <p style={styles.formSubtitle}>Fill in the details to get started</p>
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
                  placeholder="Choose a username"
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
                  placeholder="Create a password"
                  className="input-field"
                  style={{ ...styles.inputWithIcon, paddingRight: '48px' }}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {strength && (
                <div style={styles.strengthWrap}>
                  <div style={styles.strengthBar}>
                    <div style={{ ...styles.strengthFill, width: strength.width, background: strength.color }} />
                  </div>
                  <span style={{ ...styles.strengthLabel, color: strength.color }}>{strength.level}</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div style={styles.inputWrap}>
                <FiLock style={styles.inputIcon} />
                <input
                  name="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  className="input-field"
                  style={{ ...styles.inputWithIcon, paddingRight: '48px' }}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  style={styles.eyeBtn}
                >
                  {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
              {form.confirmPassword && form.password !== form.confirmPassword && (
                <span style={{ fontSize: '12px', color: '#ef4444' }}>Passwords don't match</span>
              )}
              {form.confirmPassword && form.password === form.confirmPassword && (
                <span style={{ fontSize: '12px', color: '#10b981' }}>✓ Passwords match</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Account Type</label>
              <select
                name="user_type"
                value={form.user_type}
                onChange={handleChange}
                className="input-field select-field"
              >
                <option value="patient">Patient</option>
                <option value="admin">Administrator</option>
              </select>
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
                  Creating account...
                </>
              ) : (
                <>
                  Create Account
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

          <p style={styles.loginLink}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#6366f1', fontWeight: 600 }}>
              Sign in →
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
    gap: '36px',
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
    fontSize: '32px',
    fontWeight: '800',
    color: '#f1f5f9',
    lineHeight: '1.2',
    background: 'linear-gradient(135deg, #f1f5f9, #a5b4fc)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  heroSubtitle: {
    fontSize: '15px',
    color: '#94a3b8',
    lineHeight: '1.7',
  },
  roleCards: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  roleCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
    padding: '16px',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1.5px solid rgba(255, 255, 255, 0.07)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  roleCardActive: {
    background: 'rgba(99, 102, 241, 0.12)',
    border: '1.5px solid rgba(99, 102, 241, 0.4)',
  },
  roleEmoji: {
    fontSize: '24px',
    flexShrink: 0,
    marginTop: '2px',
  },
  roleTitle: {
    fontSize: '14px',
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: '3px',
  },
  roleDesc: {
    fontSize: '13px',
    color: '#64748b',
  },
  securityNote: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
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
    overflowY: 'auto',
  },
  formCard: {
    width: '100%',
    maxWidth: '360px',
    animation: 'fadeIn 0.5s ease',
    paddingBlock: '20px',
  },
  formHeader: {
    marginBottom: '28px',
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
    gap: '18px',
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
  strengthWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '6px',
  },
  strengthBar: {
    flex: 1,
    height: '4px',
    background: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  strengthFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'all 0.3s ease',
  },
  strengthLabel: {
    fontSize: '12px',
    fontWeight: '600',
    minWidth: '44px',
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
  loginLink: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#64748b',
  },
};

export default Register;
