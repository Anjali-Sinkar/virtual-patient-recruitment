import React, { useState, useEffect, useCallback } from 'react';
import { FiUsers, FiDatabase, FiSearch, FiDownload, FiChevronLeft, FiChevronRight, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Navbar from './Navbar';
import { getAdminUsers, getPatients } from '../services/api';

const TRIAL_TYPES = ['hypertension', 'arthritis', 'migraine', 'phase1'];

const AdminDashboard = ({ user, setUser }) => {
  const [activeTab, setActiveTab] = useState('users');

  // Users tab state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const USERS_PER_PAGE = 10;

  // Patients tab state
  const [selectedTrialType, setSelectedTrialType] = useState('hypertension');
  const [patients, setPatients] = useState([]);
  const [patientsLoading, setPatientsLoading] = useState(false);
  const [patientsError, setPatientsError] = useState('');

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError('');
    try {
      const data = await getAdminUsers(roleFilter, currentPage, searchQuery);
      setUsers(data.users || []);
      setTotalUsers(data.total || 0);
    } catch (err) {
      setUsersError('Failed to load users. Check admin privileges.');
      console.error(err);
    } finally {
      setUsersLoading(false);
    }
  }, [roleFilter, currentPage, searchQuery]);

  const fetchPatients = useCallback(async () => {
    setPatientsLoading(true);
    setPatientsError('');
    try {
      const data = await getPatients(selectedTrialType);
      setPatients(Array.isArray(data) ? data : []);
    } catch (err) {
      setPatientsError('Failed to load patient records.');
      console.error(err);
    } finally {
      setPatientsLoading(false);
    }
  }, [selectedTrialType]);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
  }, [activeTab, fetchUsers]);

  useEffect(() => {
    if (activeTab === 'patients') fetchPatients();
  }, [activeTab, fetchPatients]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleRoleFilter = (e) => {
    setRoleFilter(e.target.value);
    setCurrentPage(1);
  };

  const exportCSV = () => {
    if (!users.length) {
      toast.error('No users to export');
      return;
    }
    const headers = ['Username', 'User Type', 'Created At', 'Last Login'];
    const rows = users.map((u) => [
      u.username || '',
      u.user_type || u.role || '',
      u.created_at ? new Date(u.created_at).toLocaleDateString() : '',
      u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never',
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_export_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported successfully!');
  };

  const totalPages = Math.ceil(totalUsers / USERS_PER_PAGE);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
      });
    } catch { return dateStr; }
  };

  // Build patient columns dynamically
  const getPatientColumns = () => {
    if (!patients.length) return [];
    const sample = patients[0];
    return Object.keys(sample).filter((k) => k !== '__v');
  };

  return (
    <div className="page-wrapper">
      <Navbar user={user} setUser={setUser} />

      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title">Admin Dashboard</h1>
          <p className="page-subtitle">Manage users, view patient records, and oversee the recruitment platform</p>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <FiUsers style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            Users
          </button>
          <button
            className={`tab-btn ${activeTab === 'patients' ? 'active' : ''}`}
            onClick={() => setActiveTab('patients')}
          >
            <FiDatabase style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            Patient Records
          </button>
        </div>

        {/* ===================== USERS TAB ===================== */}
        {activeTab === 'users' && (
          <div className="animate-fadeIn">
            {/* Controls */}
            <div style={styles.controls}>
              <div style={styles.searchWrap}>
                <FiSearch style={styles.searchIcon} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder="Search by username..."
                  className="input-field"
                  style={{ paddingLeft: '40px', minWidth: '260px' }}
                />
              </div>
              <select
                value={roleFilter}
                onChange={handleRoleFilter}
                className="input-field select-field"
                style={{ width: '160px' }}
              >
                <option value="all">All Roles</option>
                <option value="patient">Patient</option>
                <option value="admin">Admin</option>
              </select>
              <button
                className="btn-secondary btn-sm"
                onClick={fetchUsers}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <FiRefreshCw size={14} />
                Refresh
              </button>
              <button
                className="btn-primary btn-sm"
                onClick={exportCSV}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <FiDownload size={14} />
                Export CSV
              </button>
            </div>

            {/* Summary */}
            <div style={styles.summaryRow}>
              <span style={{ color: '#64748b', fontSize: '14px' }}>
                Showing{' '}
                <strong style={{ color: '#f1f5f9' }}>{users.length}</strong> of{' '}
                <strong style={{ color: '#f1f5f9' }}>{totalUsers}</strong> users
              </span>
            </div>

            {usersError && (
              <div className="alert alert-error" style={{ marginBottom: '20px' }}>{usersError}</div>
            )}

            <div className="table-wrapper">
              {usersLoading ? (
                <div className="spinner-container" style={{ minHeight: '200px' }}>
                  <div className="spinner" />
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Username</th>
                      <th>Role</th>
                      <th>Created At</th>
                      <th>Last Login</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={5}>
                          <div className="empty-state" style={{ minHeight: '180px' }}>
                            <div className="empty-state-icon">👤</div>
                            <h3>No users found</h3>
                            <p>Try adjusting your search or filters</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      users.map((u, i) => (
                        <tr key={u.user_id || u._id || i}>
                          <td style={{ color: '#475569' }}>
                            {(currentPage - 1) * USERS_PER_PAGE + i + 1}
                          </td>
                          <td>
                            <div style={styles.userCell}>
                              <div style={styles.userAvatar}>
                                {(u.username || 'U').charAt(0).toUpperCase()}
                              </div>
                              <span style={{ color: '#f1f5f9', fontWeight: 600 }}>{u.username}</span>
                            </div>
                          </td>
                          <td>
                            <span className={u.user_type === 'admin' || u.role === 'admin' ? 'badge badge-info' : 'badge badge-warning'}>
                              {u.user_type || u.role || 'patient'}
                            </span>
                          </td>
                          <td>{formatDate(u.created_at)}</td>
                          <td>{u.last_login ? formatDate(u.last_login) : <span style={{ color: '#475569' }}>Never</span>}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <FiChevronLeft />
                </button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      className={`page-btn ${currentPage === page ? 'active' : ''}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  className="page-btn"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <FiChevronRight />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ===================== PATIENTS TAB ===================== */}
        {activeTab === 'patients' && (
          <div className="animate-fadeIn">
            {/* Trial Type Selector */}
            <div style={styles.controls}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label style={{ color: '#94a3b8', fontSize: '14px', fontWeight: 600 }}>
                  Select Trial:
                </label>
                <select
                  value={selectedTrialType}
                  onChange={(e) => setSelectedTrialType(e.target.value)}
                  className="input-field select-field"
                  style={{ width: '200px' }}
                >
                  {TRIAL_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="btn-secondary btn-sm"
                onClick={fetchPatients}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <FiRefreshCw size={14} />
                Refresh
              </button>
            </div>

            {patientsError && (
              <div className="alert alert-error" style={{ marginBottom: '20px' }}>{patientsError}</div>
            )}

            <div style={{ color: '#64748b', fontSize: '14px', marginBottom: '16px' }}>
              <strong style={{ color: '#f1f5f9' }}>{patients.length}</strong> patient records for{' '}
              <strong style={{ color: '#6366f1', textTransform: 'capitalize' }}>{selectedTrialType}</strong>
            </div>

            <div className="table-wrapper">
              {patientsLoading ? (
                <div className="spinner-container" style={{ minHeight: '200px' }}>
                  <div className="spinner" />
                </div>
              ) : patients.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">🔬</div>
                  <h3>No patient records</h3>
                  <p>No applications have been submitted for this trial yet.</p>
                </div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Username</th>
                      <th>Eligibility</th>
                      {getPatientColumns()
                        .filter((k) => !['_id', 'id', 'username', 'eligibility', 'trial_type', 'created_at'].includes(k))
                        .slice(0, 6)
                        .map((col) => (
                          <th key={col} style={{ textTransform: 'capitalize' }}>
                            {col.replace(/_/g, ' ')}
                          </th>
                        ))}
                      <th>Applied At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((p, i) => (
                      <tr key={p._id || p.id || i}>
                        <td style={{ color: '#475569' }}>{i + 1}</td>
                        <td style={{ color: '#f1f5f9', fontWeight: 600 }}>{p.username || '—'}</td>
                        <td>
                          <span className={p.eligibility === 'Eligible' ? 'badge badge-eligible' : 'badge badge-ineligible'}>
                            {p.eligibility || '—'}
                          </span>
                        </td>
                        {getPatientColumns()
                          .filter((k) => !['_id', 'id', 'username', 'eligibility', 'trial_type', 'created_at'].includes(k))
                          .slice(0, 6)
                          .map((col) => (
                            <td key={col}>{p[col] !== undefined ? String(p[col]) : '—'}</td>
                          ))}
                        <td>{formatDate(p.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

};

const styles = {
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  searchWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    color: '#64748b',
    fontSize: '15px',
    zIndex: 1,
    pointerEvents: 'none',
  },
  summaryRow: {
    marginBottom: '14px',
  },
  userCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  userAvatar: {
    width: '30px',
    height: '30px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '700',
    color: '#fff',
    flexShrink: 0,
  },
};

export default AdminDashboard;
