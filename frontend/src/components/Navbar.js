import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FiGrid,
  FiClipboard,
  FiBarChart2,
  FiShield,
  FiLogOut,
  FiFileText,
  FiActivity,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const Navbar = ({ user, setUser }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    setUser(null);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: <FiGrid /> },
    { to: '/apply/hypertension', label: 'Apply for Trial', icon: <FiClipboard /> },
    { to: '/analytics', label: 'Analytics', icon: <FiBarChart2 /> },
    { to: '/my-applications', label: 'My Applications', icon: <FiFileText /> },
  ];

  return (
    <nav style={styles.nav}>
      <div style={styles.navInner}>
        {/* Logo */}
        <Link to="/dashboard" style={styles.logo}>
          <div style={styles.logoIcon}>
            <FiActivity size={20} color="#fff" />
          </div>
          <span style={styles.logoText}>VPR<span style={styles.logoAccent}>System</span></span>
        </Link>

        {/* Nav Links */}
        <div style={styles.navLinks}>
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                ...styles.navLink,
                ...(isActive(link.to) ? styles.navLinkActive : {}),
              }}
            >
              <span style={styles.navIcon}>{link.icon}</span>
              {link.label}
            </Link>
          ))}
          {user?.user_type === 'admin' && (
            <Link
              to="/admin"
              style={{
                ...styles.navLink,
                ...(isActive('/admin') ? styles.navLinkActive : {}),
              }}
            >
              <span style={styles.navIcon}><FiShield /></span>
              Admin
            </Link>
          )}
        </div>

        {/* Right Side */}
        <div style={styles.navRight}>
          <div style={styles.userBadge}>
            <div style={styles.avatar}>
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div style={styles.userInfo}>
              <span style={styles.username}>{user?.username}</span>
              <span style={styles.userType}>{user?.user_type}</span>
            </div>
          </div>
          <button onClick={handleLogout} style={styles.logoutBtn} title="Logout">
            <FiLogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'rgba(10, 15, 30, 0.85)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.3)',
  },
  navInner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 32px',
    height: '64px',
    gap: '32px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    textDecoration: 'none',
    flexShrink: 0,
  },
  logoIcon: {
    width: '36px',
    height: '36px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
  },
  logoText: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#f1f5f9',
    letterSpacing: '-0.3px',
  },
  logoAccent: {
    color: '#22d3ee',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    flex: 1,
    justifyContent: 'center',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    padding: '8px 14px',
    borderRadius: '8px',
    color: '#94a3b8',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  },
  navLinkActive: {
    background: 'rgba(99, 102, 241, 0.15)',
    color: '#a5b4fc',
    fontWeight: '600',
    border: '1px solid rgba(99, 102, 241, 0.3)',
  },
  navIcon: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '15px',
  },
  navRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexShrink: 0,
  },
  userBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '6px 14px 6px 6px',
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '99px',
  },
  avatar: {
    width: '30px',
    height: '30px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    fontWeight: '700',
    color: '#fff',
    flexShrink: 0,
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
  },
  username: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#f1f5f9',
    lineHeight: '1',
  },
  userType: {
    fontSize: '11px',
    color: '#6366f1',
    textTransform: 'capitalize',
    fontWeight: '500',
    lineHeight: '1',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#ef4444',
    border: '1px solid rgba(239, 68, 68, 0.25)',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    fontFamily: 'Inter, sans-serif',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
};

export default Navbar;
