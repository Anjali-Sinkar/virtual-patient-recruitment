import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { FiTrendingUp, FiUsers, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import Navbar from './Navbar';
import { getAnalytics } from '../services/api';

const COLORS = {
  total: '#6366f1',
  eligible: '#10b981',
  ineligible: '#ef4444',
};

const PIE_COLORS = ['#10b981', '#ef4444'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(13,21,48,0.97)',
        border: '1px solid rgba(99,102,241,0.3)',
        borderRadius: '10px',
        padding: '12px 16px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
        fontFamily: 'Inter, sans-serif',
      }}>
        <p style={{ color: '#94a3b8', marginBottom: '8px', fontSize: '13px', fontWeight: 600, textTransform: 'capitalize' }}>
          {label}
        </p>
        {payload.map((entry) => (
          <p key={entry.name} style={{ color: entry.color, fontSize: '13px', marginBottom: '2px' }}>
            <span style={{ fontWeight: 700 }}>{entry.name}:</span> {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(13,21,48,0.97)',
        border: '1px solid rgba(99,102,241,0.3)',
        borderRadius: '10px',
        padding: '10px 14px',
        fontFamily: 'Inter, sans-serif',
      }}>
        <p style={{ color: payload[0].fill, fontSize: '13px', fontWeight: 700 }}>
          {payload[0].name}: {payload[0].value} ({payload[0].payload.percent}%)
        </p>
      </div>
    );
  }
  return null;
};

const Analytics = ({ user, setUser }) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getAnalytics();
        setAnalytics(data);
      } catch (err) {
        setError('Failed to load analytics data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const summary = analytics?.summary || [];

  const totalApps = summary.reduce((s, t) => s + (t.total_applications || 0), 0);
  const totalEligible = summary.reduce((s, t) => s + (t.eligible || 0), 0);
  const totalIneligible = summary.reduce((s, t) => s + (t.ineligible || 0), 0);
  const eligRate = totalApps > 0 ? ((totalEligible / totalApps) * 100).toFixed(1) : 0;

  const barData = summary.map((t) => ({
    name: t.trial_type.charAt(0).toUpperCase() + t.trial_type.slice(1),
    'Total': t.total_applications || 0,
    'Eligible': t.eligible || 0,
    'Ineligible': t.ineligible || 0,
  }));

  const pieData = [
    { name: 'Eligible', value: totalEligible, percent: totalApps > 0 ? ((totalEligible / totalApps) * 100).toFixed(1) : 0 },
    { name: 'Ineligible', value: totalIneligible, percent: totalApps > 0 ? ((totalIneligible / totalApps) * 100).toFixed(1) : 0 },
  ];

  const statCards = [
    {
      label: 'Total Applications',
      value: totalApps,
      icon: <FiUsers />,
      gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      bg: 'rgba(99,102,241,0.12)',
      color: '#a5b4fc',
    },
    {
      label: 'Total Eligible',
      value: totalEligible,
      icon: <FiCheckCircle />,
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      bg: 'rgba(16,185,129,0.12)',
      color: '#6ee7b7',
    },
    {
      label: 'Total Ineligible',
      value: totalIneligible,
      icon: <FiXCircle />,
      gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
      bg: 'rgba(239,68,68,0.12)',
      color: '#fca5a5',
    },
    {
      label: 'Eligibility Rate',
      value: `${eligRate}%`,
      icon: <FiTrendingUp />,
      gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
      bg: 'rgba(245,158,11,0.12)',
      color: '#fcd34d',
    },
  ];

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return percent > 0.05 ? (
      <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={700} fontFamily="Inter, sans-serif">
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    ) : null;
  };

  return (
    <div className="page-wrapper">
      <Navbar user={user} setUser={setUser} />

      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title">Analytics Dashboard</h1>
          <p className="page-subtitle">
            Real-time recruitment metrics across all active clinical trials
          </p>
        </div>

        {loading ? (
          <div className="spinner-container">
            <div className="spinner" />
            <p style={{ color: '#64748b' }}>Loading analytics...</p>
          </div>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid-4" style={{ marginBottom: '32px' }}>
              {statCards.map((card, i) => (
                <div
                  key={card.label}
                  className="stat-card animate-fadeIn"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div style={{ ...styles.iconWrap, background: card.bg }}>
                    <span style={{ ...styles.icon, color: card.color, fontSize: '22px' }}>
                      {card.icon}
                    </span>
                  </div>
                  <div style={{ ...styles.statVal, color: card.color }}>{card.value}</div>
                  <div className="stat-label">{card.label}</div>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid-2" style={{ marginBottom: '32px' }}>
              {/* Bar Chart */}
              <div className="card" style={{ padding: '28px' }}>
                <h3 style={styles.chartTitle}>Applications by Trial Type</h3>
                <p style={styles.chartSubtitle}>Total, eligible, and ineligible breakdown</p>
                <div style={{ marginTop: '24px' }}>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={barData} barGap={4}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'Inter' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'Inter' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        wrapperStyle={{ fontSize: '13px', fontFamily: 'Inter', color: '#94a3b8', paddingTop: '16px' }}
                      />
                      <Bar dataKey="Total" fill={COLORS.total} radius={[5, 5, 0, 0]} maxBarSize={30} />
                      <Bar dataKey="Eligible" fill={COLORS.eligible} radius={[5, 5, 0, 0]} maxBarSize={30} />
                      <Bar dataKey="Ineligible" fill={COLORS.ineligible} radius={[5, 5, 0, 0]} maxBarSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="card" style={{ padding: '28px' }}>
                <h3 style={styles.chartTitle}>Eligibility Distribution</h3>
                <p style={styles.chartSubtitle}>Overall eligible vs. ineligible ratio</p>
                <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '24px' }}>
                  <div style={{ flex: 1 }}>
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={4}
                          dataKey="value"
                          labelLine={false}
                          label={renderCustomLabel}
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={index} fill={PIE_COLORS[index]} stroke="transparent" />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomPieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={styles.pieLegend}>
                    {pieData.map((entry, i) => (
                      <div key={entry.name} style={styles.pieLegendItem}>
                        <div style={{ ...styles.pieDot, background: PIE_COLORS[i] }} />
                        <div>
                          <div style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '14px' }}>
                            {entry.name}
                          </div>
                          <div style={{ color: PIE_COLORS[i], fontWeight: 700, fontSize: '20px' }}>
                            {entry.value}
                          </div>
                          <div style={{ color: '#64748b', fontSize: '12px' }}>
                            {entry.percent}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Breakdown Table */}
            <div className="card" style={{ padding: '28px' }}>
              <h3 style={{ ...styles.chartTitle, marginBottom: '6px' }}>Trial-by-Trial Breakdown</h3>
              <p style={{ ...styles.chartSubtitle, marginBottom: '24px' }}>
                Detailed metrics for each trial type
              </p>
              <div className="table-wrapper" style={{ border: 'none', background: 'transparent', borderRadius: 0 }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Trial Type</th>
                      <th>Total Applications</th>
                      <th>Eligible</th>
                      <th>Ineligible</th>
                      <th>Eligibility Rate</th>
                      <th>Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                          No data available
                        </td>
                      </tr>
                    ) : (
                      summary.map((row) => {
                        const rate = row.total_applications > 0
                          ? ((row.eligible / row.total_applications) * 100).toFixed(1)
                          : 0;
                        return (
                          <tr key={row.trial_type}>
                            <td>
                              <span style={{
                                fontWeight: 600,
                                color: '#f1f5f9',
                                textTransform: 'capitalize',
                              }}>
                                {row.trial_type}
                              </span>
                            </td>
                            <td style={{ fontWeight: 600, color: '#a5b4fc' }}>
                              {row.total_applications}
                            </td>
                            <td>
                              <span className="badge badge-eligible">{row.eligible}</span>
                            </td>
                            <td>
                              <span className="badge badge-ineligible">{row.ineligible}</span>
                            </td>
                            <td style={{ fontWeight: 700, color: rate >= 50 ? '#10b981' : '#ef4444' }}>
                              {rate}%
                            </td>
                            <td>
                              <div style={styles.progressBar}>
                                <div
                                  style={{
                                    ...styles.progressFill,
                                    width: `${rate}%`,
                                    background: rate >= 50
                                      ? 'linear-gradient(90deg, #10b981, #059669)'
                                      : 'linear-gradient(90deg, #ef4444, #dc2626)',
                                  }}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const styles = {
  iconWrap: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
  },
  statVal: {
    fontSize: '34px',
    fontWeight: '800',
    lineHeight: '1',
    marginBottom: '6px',
  },
  chartTitle: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#f1f5f9',
  },
  chartSubtitle: {
    fontSize: '13px',
    color: '#64748b',
    marginTop: '4px',
  },
  pieLegend: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    padding: '16px',
    minWidth: '130px',
  },
  pieLegendItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },
  pieDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    marginTop: '5px',
    flexShrink: 0,
  },
  progressBar: {
    height: '6px',
    background: 'rgba(255,255,255,0.06)',
    borderRadius: '4px',
    overflow: 'hidden',
    width: '120px',
  },
  progressFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.8s ease',
  },
};

export default Analytics;
