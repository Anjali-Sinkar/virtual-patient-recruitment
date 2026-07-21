import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import PatientForm from './components/PatientForm';
import Analytics from './components/Analytics';
import AdminDashboard from './components/AdminDashboard';
import MyApplications from './components/MyApplications';

const ProtectedRoute = ({ user, children }) => {
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ user, children }) => {
  if (!user) return <Navigate to="/login" replace />;
  if (user.user_type !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('vpr_user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('vpr_user');
      }
    }
  }, []);

  const handleSetUser = (userData) => {
    if (userData) {
      localStorage.setItem('vpr_user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('vpr_user');
    }
    setUser(userData);
  };

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: 'rgba(15,23,42,0.95)',
            color: '#f1f5f9',
            border: '1px solid rgba(99,102,241,0.4)',
            borderRadius: '12px',
            backdropFilter: 'blur(20px)',
            fontSize: '14px',
            fontFamily: 'Inter, sans-serif',
          },
          success: {
            iconTheme: { primary: '#10b981', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: '#fff' },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login user={user} setUser={handleSetUser} />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute user={user}>
              <Dashboard user={user} setUser={handleSetUser} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/apply/:trialType"
          element={
            <ProtectedRoute user={user}>
              <PatientForm user={user} setUser={handleSetUser} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute user={user}>
              <Analytics user={user} setUser={handleSetUser} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute user={user}>
              <AdminDashboard user={user} setUser={handleSetUser} />
            </AdminRoute>
          }
        />
        <Route
          path="/my-applications"
          element={
            <ProtectedRoute user={user}>
              <MyApplications user={user} setUser={handleSetUser} />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
