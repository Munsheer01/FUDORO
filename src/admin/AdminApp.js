// src/admin/AdminApp.js (Updated with Admin Role Check)
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

// Admin Components
import AdminLogin from './auth/AdminLogin';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import OrderQueue from './pages/orders/OrderQueue';
import AdminLayout from './layout/AdminLayout';
import LoadingScreen from './components/LoadingScreen';

// Placeholder components for other routes
const MenuManagement = () => <div>Menu Management - Coming Soon</div>;
const InventoryDashboard = () => <div>Inventory Dashboard - Coming Soon</div>;

// Access Denied Component
const AccessDenied = () => (
  <div style={{ 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: '100vh',
    padding: '2rem',
    textAlign: 'center'
  }}>
    <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚫</h1>
    <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Access Denied</h2>
    <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
      You don't have permission to access the admin panel.
    </p>
    <button 
      onClick={() => auth.signOut()}
      style={{
        padding: '0.75rem 1.5rem',
        background: '#0A5247',
        color: 'white',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        fontWeight: '600'
      }}
    >
      Sign Out
    </button>
  </div>
);

const AdminApp = () => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      if (user) {
        try {
          // Check if user has admin role in Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          const userData = userDoc.data();
          
          // Also check custom claims
          const tokenResult = await user.getIdTokenResult();
          
          const hasAdminRole = userData?.isAdmin === true || tokenResult.claims.admin === true;
          setIsAdmin(hasAdminRole);
          
          if (!hasAdminRole) {
            console.warn('⚠️ User is not an admin:', user.email);
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <AdminLogin />;
  }

  if (!isAdmin) {
    return <AccessDenied />;
  }

  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/orders" element={<OrderQueue />} />
        <Route path="/menu" element={<MenuManagement />} />
        <Route path="/inventory" element={<InventoryDashboard />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </AdminLayout>
  );

};

export default AdminApp;
