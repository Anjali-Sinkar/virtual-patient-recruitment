import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiCheckCircle, FiXCircle, FiSend, FiInfo } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Navbar from './Navbar';
import { getTrialFields, submitApplication } from '../services/api';

const TRIAL_LABELS = {
  hypertension: 'Hypertension Study',
  arthritis: 'Arthritis Trial',
  migraine: 'Migraine Prevention',
  phase1: 'Phase 1 Safety Study',
};

const PatientForm = ({ user, setUser }) => {
  const { trialType } = useParams();
  const navigate = useNavigate();
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadFields = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getTrialFields(trialType);
        setFields(data);
        // Initialize form data with defaults
        const defaults = {};
        data.forEach((f) => {
          defaults[f.name] = f.type === 'number' ? (f.min !== undefined ? f.min : '') : '';
        });
        setFormData(defaults);
      } catch (err) {
        setError('Failed to load trial fields. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadFields();
  }, [trialType]);

  const handleChange = (fieldName, value) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    for (const field of fields) {
      if (field.required && (formData[field.name] === '' || formData[field.name] === undefined || formData[field.name] === null)) {
        setError(`Please fill in the required field: ${field.label || field.name}`);
        return;
      }
    }

    setSubmitting(true);
    try {
      // Convert number strings to numbers
      const processedData = { ...formData };
      fields.forEach((f) => {
        if (f.type === 'number' && processedData[f.name] !== '') {
          processedData[f.name] = Number(processedData[f.name]);
        }
      });

      const response = await submitApplication(trialType, processedData, user?.username);
      setResult(response);
      if (response.eligibility === 'Eligible') {
        toast.success('Application submitted! You are eligible!');
      } else {
        toast('Application submitted. See eligibility result.', { icon: '📋' });
      }
    } catch (err) {
      const msg = err?.response?.data?.error || err?.response?.data?.message || 'Submission failed. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field) => {
    const { name, type, label, min, max, options, required } = field;
    const value = formData[name] ?? '';

    if (type === 'select' && options) {
      const optList = options.map((o) => {
        if (typeof o === 'string') return { value: o, label: o };
        return o;
      });
      return (
        <div key={name} className="form-group">
          <label className="form-label">
            {label || name}
            {required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
          </label>
          <select
            value={value}
            onChange={(e) => handleChange(name, e.target.value)}
            className="input-field select-field"
            required={required}
          >
            <option value="">Select {label || name}</option>
            {optList.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div key={name} className="form-group">
        <label className="form-label">
          {label || name}
          {required && <span style={{ color: '#ef4444', marginLeft: '4px' }}>*</span>}
          {(min !== undefined || max !== undefined) && (
            <span style={{ color: '#475569', fontWeight: 400, textTransform: 'none', letterSpacing: 0, marginLeft: '6px', fontSize: '11px' }}>
              ({min !== undefined ? `min: ${min}` : ''}{min !== undefined && max !== undefined ? ', ' : ''}{max !== undefined ? `max: ${max}` : ''})
            </span>
          )}
        </label>
        <input
          type="number"
          value={value}
          onChange={(e) => handleChange(name, e.target.value)}
          min={min}
          max={max}
          step={field.step || 1}
          placeholder={`Enter ${label || name}`}
          className="input-field"
          required={required}
        />
      </div>
    );
  };

  // Group fields into sections of max 3
  const groupFields = (fields) => {
    const groups = [];
    for (let i = 0; i < fields.length; i += 3) {
      groups.push(fields.slice(i, i + 3));
    }
    return groups;
  };

  return (
    <div className="page-wrapper">
      <Navbar user={user} setUser={setUser} />

      <div className="page-content">
        {/* Header */}
        <div style={styles.header}>
          <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>
            <FiArrowLeft />
            Back to Dashboard
          </button>
          <div style={styles.headerInfo}>
            <h1 className="page-title">{TRIAL_LABELS[trialType] || trialType} — Application</h1>
            <p className="page-subtitle">
              Complete the form below. All fields marked with <span style={{ color: '#ef4444' }}>*</span> are required.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="spinner-container">
            <div className="spinner" />
            <p style={{ color: '#64748b' }}>Loading trial fields...</p>
          </div>
        ) : error && fields.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '48px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <p style={{ color: '#ef4444', marginBottom: '16px' }}>{error}</p>
            <button className="btn-primary" onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </button>
          </div>
        ) : (
          <div style={styles.formContainer}>
            <div className="card" style={styles.formCard}>
              {/* Trial Info Banner */}
              <div style={styles.infoBanner}>
                <FiInfo size={16} color="#22d3ee" />
                <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                  Your eligibility is assessed automatically based on the criteria for the{' '}
                  <strong style={{ color: '#22d3ee' }}>{TRIAL_LABELS[trialType] || trialType}</strong> trial.
                </span>
              </div>

              {error && (
                <div className="alert alert-error" style={{ marginBottom: '20px' }}>
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* Render fields in groups of 3 as columns */}
                {groupFields(fields).map((group, gi) => (
                  <div
                    key={gi}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: `repeat(${Math.min(group.length, 3)}, 1fr)`,
                      gap: '20px',
                      marginBottom: '20px',
                    }}
                  >
                    {group.map((field) => renderField(field))}
                  </div>
                ))}

                <div style={styles.submitRow}>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => navigate('/dashboard')}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={submitting}
                    style={{ minWidth: '160px' }}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner spinner-sm" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FiSend />
                        Submit Application
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Result Modal */}
        {result && (
          <div className="modal-overlay" onClick={() => setResult(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div style={styles.modalInner}>
                {result.eligibility === 'Eligible' ? (
                  <>
                    <div style={{ ...styles.resultIcon, background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.4)' }}>
                      <FiCheckCircle size={40} color="#10b981" />
                    </div>
                    <h2 style={{ ...styles.resultTitle, color: '#10b981' }}>
                      🎉 You're Eligible!
                    </h2>
                  </>
                ) : (
                  <>
                    <div style={{ ...styles.resultIcon, background: 'rgba(239,68,68,0.12)', border: '2px solid rgba(239,68,68,0.3)' }}>
                      <FiXCircle size={40} color="#ef4444" />
                    </div>
                    <h2 style={{ ...styles.resultTitle, color: '#ef4444' }}>
                      Not Eligible
                    </h2>
                  </>
                )}

                <p style={styles.resultMessage}>{result.message}</p>

                {result.patient_id && (
                  <div style={styles.patientIdBadge}>
                    <span style={{ color: '#64748b', fontSize: '12px' }}>Patient ID</span>
                    <span style={{ color: '#6366f1', fontWeight: '700', fontSize: '16px' }}>
                      #{result.patient_id}
                    </span>
                  </div>
                )}

                <div style={styles.modalActions}>
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      setResult(null);
                      setFormData({});
                    }}
                  >
                    Apply Again
                  </button>
                  <button
                    className="btn-primary"
                    onClick={() => navigate('/my-applications')}
                  >
                    View My Applications
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  header: {
    marginBottom: '28px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: '14px',
    fontFamily: 'Inter, sans-serif',
    cursor: 'pointer',
    padding: '0',
    transition: 'color 0.2s ease',
    width: 'fit-content',
  },
  headerInfo: {},
  formContainer: {
    maxWidth: '900px',
    margin: '0 auto',
  },
  formCard: {
    padding: '36px',
  },
  infoBanner: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
    padding: '14px 18px',
    background: 'rgba(34,211,238,0.06)',
    border: '1px solid rgba(34,211,238,0.2)',
    borderRadius: '10px',
    marginBottom: '28px',
  },
  submitRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '32px',
    paddingTop: '24px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },
  modalInner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    textAlign: 'center',
  },
  resultIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultTitle: {
    fontSize: '26px',
    fontWeight: '800',
  },
  resultMessage: {
    fontSize: '15px',
    color: '#94a3b8',
    lineHeight: '1.6',
    maxWidth: '360px',
  },
  patientIdBadge: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '16px 32px',
    background: 'rgba(99,102,241,0.1)',
    border: '1px solid rgba(99,102,241,0.25)',
    borderRadius: '12px',
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    width: '100%',
  },
};

export default PatientForm;
