import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import styles from './AdminLayout.module.css';

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/admin');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className={styles.adminLayout}>
      <AdminSidebar 
        isOpen={sidebarOpen}
        currentPath={location.pathname}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className={`${styles.mainContent} ${!sidebarOpen ? styles.sidebarClosed : ''}`}>
        <AdminHeader 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          onLogout={handleLogout}
        />
        
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
