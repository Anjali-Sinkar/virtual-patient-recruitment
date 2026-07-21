import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiActivity,
  FiUsers,
  FiCheckCircle,
  FiArrowRight,
  FiTrendingUp,
  FiZap,
  FiBarChart2,
  FiClipboard,
} from 'react-icons/fi';
import Navbar from './Navbar';
import { getAnalytics, getTrials } from '../services/api';

const TRIAL_COLORS = {
  hypertension: { gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)', light: 'rgba(99,102,241,0.15)', icon: '❤️' },
  arthritis: { gradient: 'linear-gradient(135deg, #22d3ee, #6366f1)', light: 'rgba(34,211,238,0.15)', icon: '🦴' },
  migraine: { gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)', light: 'rgba(245,158,11,0.15)', icon: '🧠' },
  phase1: { gradient: 'linear-gradient(135deg, #10b981, #22d3ee)', light: 'rgba(16,185,129,0.15)', icon: '🔬' },
};

const TRIAL_DESCRIPTIONS = {
  hypertension: 'Advanced blood pressure management study targeting cardiovascular health outcomes.',
  arthritis: 'Innovative joint inflammation treatment trial with promising early results.',
  migraine: 'Next-generation migraine prevention therapy — reducing frequency and severity.',
  phase1: 'First-in-human safety and pharmacokinetics study for a novel compound.',
};

const Dashboard = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [trials, setTrials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [analyticsData, trialsData] = await Promise.all([
          getAnalytics(),
          getTrials(),
        ]);
        setAnalytics(analyticsData);
        setTrials(trialsData);
      } catch (err) {
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalApps = analytics?.summary?.reduce((s, t) => s + (t.total_applications || 0), 0) || 0;
  const totalEligible = analytics?.summary?.reduce((s, t) => s + (t.eligible || 0), 0) || 0;
  
  const eligRate = totalApps > 0 ? ((totalEligible / totalApps) * 100).toFixed(1) : 0;

  const statCards = [
    {
      label: 'Active Trials',
      value: trials.length || 4,
      icon: <FiActivity />,
      gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      bg: 'rgba(99,102,241,0.12)',
    },
    {
      label: 'Total Applications',
      value: loading ? '...' : totalApps,
      icon: <FiClipboard />,
      gradient: 'linear-gradient(135deg, #22d3ee, #6366f1)',
      bg: 'rgba(34,211,238,0.1)',
    },
    {
      label: 'Eligible Patients',
      value: loading ? '...' : totalEligible,
      icon: <FiCheckCircle />,
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      bg: 'rgba(16,185,129,0.1)',
    },
    {
      label: 'Eligibility Rate',
      value: loading ? '...' : `${eligRate}%`,
      icon: <FiTrendingUp />,
      gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
      bg: 'rgba(245,158,11,0.1)',
    },
  ];

  const displayTrials = trials.length > 0 ? trials : [
    { id: 1, name: 'Hypertension Study', description: TRIAL_DESCRIPTIONS.hypertension, type: 'hypertension' },
    { id: 2, name: 'Arthritis Trial', description: TRIAL_DESCRIPTIONS.arthritis, type: 'arthritis' },
    { id: 3, name: 'Migraine Prevention', description: TRIAL_DESCRIPTIONS.migraine, type: 'migraine' },
    { id: 4, name: 'Phase 1 Safety Study', description: TRIAL_DESCRIPTIONS.phase1, type: 'phase1' },
  ];

  const getTrialType = (trial) => {
    if (trial.type) return trial.type;
    const name = trial.name?.toLowerCase() || '';
    if (name.includes('hypertension')) return 'hypertension';
    if (name.includes('arthritis')) return 'arthritis';
    if (name.includes('migraine')) return 'migraine';
    if (name.includes('phase')) return 'phase1';
    return trial.id?.toString() || 'hypertension';
  };

  return (
    <div className="page-wrapper">
      <Navbar user={user} setUser={setUser} />

      <div className="page-content" style={{ paddingTop: '36px' }}>
        {/* Welcome Header */}
        <div style={styles.welcomeSection}>
          <div>
            <h1 style={styles.welcomeTitle}>
              Welcome back, <span className="gradient-text">{user?.username}</span> 👋
            </h1>
            <p style={styles.welcomeSubtitle}>
              Here's an overview of your clinical trial recruitment platform.
            </p>
          </div>
          <div style={styles.welcomeBadge}>
            <div style={styles.welcomeDot} />
            <span style={{ fontSize: '13px', color: '#10b981', fontWeight: 600 }}>
              Platform Active
            </span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid-4" style={{ marginBottom: '36px' }}>
          {statCards.map((card, i) => (
            <div
              key={card.label}
              className="stat-card animate-fadeIn"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div style={{ ...styles.statIconWrap, background: card.bg }}>
                <span style={{ ...styles.statIcon, background: card.gradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  {card.icon}
                </span>
              </div>
              <div style={styles.statValue}>{card.value}</div>
              <div style={styles.statLabel}>{card.label}</div>
            </div>
          ))}
        </div>

        {/* Trial Cards */}
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>Available Clinical Trials</h2>
            <p style={styles.sectionSubtitle}>Select a trial to check your eligibility and apply</p>
          </div>
        </div>

        <div className="grid-2" style={{ marginBottom: '36px' }}>
          {displayTrials.map((trial, i) => {
            const trialType = getTrialType(trial);
            const colors = TRIAL_COLORS[trialType] || TRIAL_COLORS.hypertension;
            const desc = trial.description || TRIAL_DESCRIPTIONS[trialType] || '';
            const trialAnalytics = analytics?.summary?.find(
              (s) => s.trial_type === trialType
            );

            return (
              <div
                key={trial.id || i}
                className="card"
                style={{ ...styles.trialCard, animationDelay: `${i * 0.1}s` }}
              >
                {/* Card header */}
                <div style={styles.trialCardHeader}>
                  <div style={{ ...styles.trialIconWrap, background: colors.light }}>
                    <span style={{ fontSize: '28px' }}>{colors.icon}</span>
                  </div>
                  <div style={styles.trialMeta}>
                    <span style={styles.trialBadge}>Phase {i < 3 ? 'II' : 'I'}</span>
                    <span style={styles.trialStatus}>Recruiting</span>
                  </div>
                </div>

                {/* Card body */}
                <div style={styles.trialBody}>
                  <h3 style={styles.trialName}>{trial.name}</h3>
                  <p style={styles.trialDesc}>{desc}</p>
                </div>

                {/* Stats */}
                {trialAnalytics && (
                  <div style={styles.trialStats}>
                    <div style={styles.trialStat}>
                      <span style={{ color: '#94a3b8', fontSize: '12px' }}>Applied</span>
                      <span style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '15px' }}>
                        {trialAnalytics.total_applications}
                      </span>
                    </div>
                    <div style={styles.trialStat}>
                      <span style={{ color: '#94a3b8', fontSize: '12px' }}>Eligible</span>
                      <span style={{ color: '#10b981', fontWeight: '700', fontSize: '15px' }}>
                        {trialAnalytics.eligible}
                      </span>
                    </div>
                    <div style={styles.trialStat}>
                      <span style={{ color: '#94a3b8', fontSize: '12px' }}>Ineligible</span>
                      <span style={{ color: '#ef4444', fontWeight: '700', fontSize: '15px' }}>
                        {trialAnalytics.ineligible}
                      </span>
                    </div>
                  </div>
                )}

                {/* Action */}
                <button
                  className="btn-primary btn-full"
                  onClick={() => navigate(`/apply/${trialType}`)}
                  style={{ marginTop: '20px', borderRadius: '10px' }}
                >
                  Apply Now
                  <FiArrowRight />
                </button>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div style={styles.quickActionsSection}>
          <h2 style={styles.sectionTitle}>Quick Actions</h2>
          <div style={styles.quickActions}>
            {[
              {
                icon: <FiBarChart2 size={22} />,
                label: 'View Analytics',
                desc: 'Explore recruitment trends',
                color: '#6366f1',
                path: '/analytics',
              },
              {
                icon: <FiClipboard size={22} />,
                label: 'My Applications',
                desc: 'Track your applications',
                color: '#22d3ee',
                path: '/my-applications',
              },
              {
                icon: <FiZap size={22} />,
                label: 'Quick Apply',
                desc: 'Apply to hypertension trial',
                color: '#10b981',
                path: '/apply/hypertension',
              },
              ...(user?.user_type === 'admin'
                ? [
                    {
                      icon: <FiUsers size={22} />,
                      label: 'Admin Panel',
                      desc: 'Manage users and records',
                      color: '#f59e0b',
                      path: '/admin',
                    },
                  ]
                : []),
            ].map((action) => (
              <div
                key={action.label}
                style={{ ...styles.quickAction }}
                onClick={() => navigate(action.path)}
              >
                <div
                  style={{
                    ...styles.quickActionIcon,
                    background: `${action.color}20`,
                    color: action.color,
                    boxShadow: `0 4px 15px ${action.color}25`,
                  }}
                >
                  {action.icon}
                </div>
                <div>
                  <div style={styles.quickActionLabel}>{action.label}</div>
                  <div style={styles.quickActionDesc}>{action.desc}</div>
                </div>
                <FiArrowRight style={{ marginLeft: 'auto', color: '#475569' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  welcomeSection: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  welcomeTitle: {
    fontSize: '30px',
    fontWeight: '800',
    color: '#f1f5f9',
    marginBottom: '6px',
  },
  welcomeSubtitle: {
    fontSize: '15px',
    color: '#64748b',
  },
  welcomeBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    background: 'rgba(16,185,129,0.1)',
    border: '1px solid rgba(16,185,129,0.25)',
    borderRadius: '99px',
    alignSelf: 'flex-start',
  },
  welcomeDot: {
    width: '8px',
    height: '8px',
    background: '#10b981',
    borderRadius: '50%',
    boxShadow: '0 0 8px #10b981',
    animation: 'pulse 2s infinite',
  },
  statIconWrap: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
    fontSize: '20px',
  },
  statIcon: {
    fontSize: '20px',
  },
  statValue: {
    fontSize: '34px',
    fontWeight: '800',
    color: '#f1f5f9',
    lineHeight: '1',
    marginBottom: '6px',
  },
  statLabel: {
    fontSize: '13px',
    color: '#64748b',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: '4px',
  },
  sectionSubtitle: {
    fontSize: '14px',
    color: '#64748b',
  },
  trialCard: {
    padding: '28px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
    cursor: 'default',
    overflow: 'hidden',
  },
  trialCardHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  trialIconWrap: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trialMeta: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '6px',
  },
  trialBadge: {
    padding: '3px 10px',
    background: 'rgba(99,102,241,0.15)',
    border: '1px solid rgba(99,102,241,0.3)',
    borderRadius: '99px',
    fontSize: '11px',
    fontWeight: '700',
    color: '#a5b4fc',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  trialStatus: {
    padding: '3px 10px',
    background: 'rgba(16,185,129,0.12)',
    border: '1px solid rgba(16,185,129,0.25)',
    borderRadius: '99px',
    fontSize: '11px',
    fontWeight: '700',
    color: '#34d399',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  trialBody: {
    flex: 1,
    marginBottom: '20px',
  },
  trialName: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#f1f5f9',
    marginBottom: '8px',
  },
  trialDesc: {
    fontSize: '14px',
    color: '#64748b',
    lineHeight: '1.6',
  },
  trialStats: {
    display: 'flex',
    gap: '0',
    background: 'rgba(255,255,255,0.04)',
    borderRadius: '10px',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.06)',
  },
  trialStat: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '12px 8px',
    gap: '3px',
    borderRight: '1px solid rgba(255,255,255,0.06)',
  },
  quickActionsSection: {
    marginBottom: '16px',
  },
  quickActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '16px',
  },
  quickAction: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '16px 20px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  quickActionIcon: {
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  quickActionLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#f1f5f9',
    marginBottom: '2px',
  },
  quickActionDesc: {
    fontSize: '13px',
    color: '#64748b',
  },
};

export default Dashboard;
