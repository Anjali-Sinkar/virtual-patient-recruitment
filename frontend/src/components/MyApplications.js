import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiXCircle, FiCalendar, FiArrowRight, FiRefreshCw, FiClipboard } from 'react-icons/fi';
import Navbar from './Navbar';
import { getMyApplications } from '../services/api';

const TRIAL_LABELS = {
  hypertension: 'Hypertension Study',
  arthritis: 'Arthritis Trial',
  migraine: 'Migraine Prevention',
  phase1: 'Phase 1 Safety Study',
};

const TRIAL_ICONS = {
  hypertension: '❤️',
  arthritis: '🦴',
  migraine: '🧠',
  phase1: '🔬',
};

const TRIAL_COLORS = {
  hypertension: { gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)', bg: 'rgba(99,102,241,0.1)' },
  arthritis: { gradient: 'linear-gradient(135deg, #22d3ee, #6366f1)', bg: 'rgba(34,211,238,0.1)' },
  migraine: { gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)', bg: 'rgba(245,158,11,0.1)' },
  phase1: { gradient: 'linear-gradient(135deg, #10b981, #22d3ee)', bg: 'rgba(16,185,129,0.1)' },
};

const MyApplications = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchApplications = async () => {
    if (!user?.username) return;
    setLoading(true);
    setError('');
    try {
      const data = await getMyApplications(user.username);
      setApplications(data.applications || []);
    } catch (err) {
      setError('Failed to load applications. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line
  }, [user?.username]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  const eligibleCount = applications.filter((a) => a.eligibility === 'Eligible').length;
  const ineligibleCount = applications.filter((a) => a.eligibility !== 'Eligible').length;

  return (
    <div className="page-wrapper">
      <Navbar user={user} setUser={setUser} />

      <div className="page-content">
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 className="page-title">My Applications</h1>
            <p className="page-subtitle">
              Track the status of your clinical trial applications
            </p>
          </div>
          <button
            className="btn-secondary btn-sm"
            onClick={fetchApplications}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', alignSelf: 'flex-start' }}
          >
            <FiRefreshCw size={14} />
            Refresh
          </button>
        </div>

        {/* Summary Cards */}
        {!loading && applications.length > 0 && (
          <div style={styles.summaryCards}>
            <div style={{ ...styles.summaryCard, borderColor: 'rgba(99,102,241,0.3)' }}>
              <FiClipboard size={20} color="#6366f1" />
              <div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#a5b4fc' }}>
                  {applications.length}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Total
                </div>
              </div>
            </div>
            <div style={{ ...styles.summaryCard, borderColor: 'rgba(16,185,129,0.3)' }}>
              <FiCheckCircle size={20} color="#10b981" />
              <div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#6ee7b7' }}>
                  {eligibleCount}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Eligible
                </div>
              </div>
            </div>
            <div style={{ ...styles.summaryCard, borderColor: 'rgba(239,68,68,0.3)' }}>
              <FiXCircle size={20} color="#ef4444" />
              <div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#fca5a5' }}>
                  {ineligibleCount}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Ineligible
                </div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="spinner-container">
            <div className="spinner" />
            <p style={{ color: '#64748b' }}>Loading your applications...</p>
          </div>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : applications.length === 0 ? (
          <div className="card" style={{ textAlign: 'center' }}>
            <div className="empty-state">
              <div className="empty-state-icon">📋</div>
              <h3>No applications yet</h3>
              <p>
                You haven't applied to any clinical trials yet. Browse the available trials and submit your first application.
              </p>
              <button
                className="btn-primary"
                onClick={() => navigate('/dashboard')}
                style={{ marginTop: '8px' }}
              >
                Explore Trials
                <FiArrowRight />
              </button>
            </div>
          </div>
        ) : (
          <div style={styles.applicationsList}>
            {applications.map((app, i) => {
              const trialType = app.trial_type || '';
              const colors = TRIAL_COLORS[trialType] || TRIAL_COLORS.hypertension;
              const isEligible = app.eligibility === 'Eligible';

              return (
                <div
                  key={i}
                  className="card"
                  style={{
                    ...styles.appCard,
                    animationDelay: `${i * 0.06}s`,
                  }}
                >
                  {/* Left accent */}
                  <div style={{ ...styles.cardAccent, background: colors.gradient }} />

                  {/* Icon */}
                  <div style={{ ...styles.trialIcon, background: colors.bg }}>
                    <span style={{ fontSize: '26px' }}>
                      {TRIAL_ICONS[trialType] || '🔬'}
                    </span>
                  </div>

                  {/* Content */}
                  <div style={styles.appContent}>
                    <div style={styles.appHeader}>
                      <h3 style={styles.trialName}>
                        {TRIAL_LABELS[trialType] || trialType}
                      </h3>
                      <span
                        className={isEligible ? 'badge badge-eligible' : 'badge badge-ineligible'}
                      >
                        {isEligible ? (
                          <><FiCheckCircle size={11} />{app.eligibility}</>
                        ) : (
                          <><FiXCircle size={11} />{app.eligibility || 'Ineligible'}</>
                        )}
                      </span>
                    </div>

                    <div style={styles.appMeta}>
                      <div style={styles.metaItem}>
                        <FiCalendar size={13} color="#64748b" />
                        <span style={{ color: '#64748b', fontSize: '13px' }}>
                          {formatDate(app.created_at)}
                        </span>
                      </div>
                      <div style={styles.metaItem}>
                        <span style={{ color: '#64748b', fontSize: '13px' }}>
                          Trial:{' '}
                          <span style={{ color: '#94a3b8', fontWeight: 600, textTransform: 'capitalize' }}>
                            {trialType}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Result indicator */}
                  <div style={styles.resultIndicator}>
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: isEligible ? '#10b981' : '#ef4444',
                        boxShadow: isEligible
                          ? '0 0 8px rgba(16,185,129,0.6)'
                          : '0 0 8px rgba(239,68,68,0.6)',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA if has applications */}
        {!loading && applications.length > 0 && (
          <div style={styles.ctaSection}>
            <p style={{ color: '#64748b', fontSize: '14px' }}>
              Want to apply to more trials?
            </p>
            <button
              className="btn-primary btn-sm"
              onClick={() => navigate('/dashboard')}
            >
              Browse Trials
              <FiArrowRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '28px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  summaryCards: {
    display: 'flex',
    gap: '16px',
    marginBottom: '28px',
    flexWrap: 'wrap',
  },
  summaryCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '16px 24px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid',
    borderRadius: '12px',
    backdropFilter: 'blur(10px)',
    flex: '1',
    minWidth: '140px',
  },
  applicationsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  appCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '22px 24px',
    position: 'relative',
    overflow: 'hidden',
    cursor: 'default',
    animation: 'slideUp 0.4s ease forwards',
  },
  cardAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '4px',
    borderRadius: '4px 0 0 4px',
  },
  trialIcon: {
    width: '52px',
    height: '52px',
    borderRadius: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  appContent: {
    flex: 1,
    minWidth: 0,
  },
  appHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '8px',
  },
  trialName: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#f1f5f9',
  },
  appMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    flexWrap: 'wrap',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  resultIndicator: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
  },
  ctaSection: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    marginTop: '32px',
    padding: '20px',
    background: 'rgba(255,255,255,0.02)',
    border: '1px solid rgba(255,255,255,0.06)',
    borderRadius: '12px',
  },
};

export default MyApplications;
