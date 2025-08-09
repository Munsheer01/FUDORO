// src/admin/AdminApp.js (Updated routing)
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';

// Admin Components
import AdminLogin from './auth/AdminLogin';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import OrderQueue from './pages/orders/OrderQueue'; // ✅ Import OrderQueue
import AdminLayout from './layout/AdminLayout';
import LoadingScreen from './components/LoadingScreen';

// Placeholder components for other routes
const MenuManagement = () => <div>Menu Management - Coming Soon</div>;
const InventoryDashboard = () => <div>Inventory Dashboard - Coming Soon</div>;

const AdminApp = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
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

  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Navigate to="dashboard" replace />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/orders" element={<OrderQueue />} />  {/* ✅ Orders route */}
        <Route path="/menu" element={<MenuManagement />} />
        <Route path="/inventory" element={<InventoryDashboard />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminApp;
