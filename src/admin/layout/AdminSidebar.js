import React from 'react';
import { Link } from 'react-router-dom';
import styles from './AdminSidebar.module.css';

const AdminSidebar = ({ isOpen, currentPath, onToggle }) => {
  const menuItems = [
    {
      path: '/admin/dashboard',
      icon: '📊',
      label: 'Dashboard',
      description: 'Overview & Metrics'
    },
    {
      path: '/admin/orders',
      icon: '📋',
      label: 'Order Queue',
      description: 'Manage Orders'
    },
    {
      path: '/admin/menu',
      icon: '🍽️',
      label: 'Menu',
      description: 'Manage Platters'
    },
    {
      path: '/admin/inventory',
      icon: '📦',
      label: 'Inventory',
      description: 'Stock Management'
    }
  ];

  return (
    <div className={`${styles.sidebar} ${!isOpen ? styles.closed : ''}`}>
      <div className={styles.sidebarHeader}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🍽️</span>
          {isOpen && (
            <div className={styles.logoText}>
              <h2>FUDORO</h2>
              <p>Admin Panel</p>
            </div>
          )}
        </div>
      </div>

      <nav className={styles.nav}>
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`${styles.navItem} ${currentPath === item.path ? styles.active : ''}`}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            {isOpen && (
              <div className={styles.navContent}>
                <span className={styles.navLabel}>{item.label}</span>
                <span className={styles.navDescription}>{item.description}</span>
              </div>
            )}
          </Link>
        ))}
      </nav>

      <div className={styles.sidebarFooter}>
        <button 
          className={styles.toggleButton}
          onClick={onToggle}
          title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isOpen ? '◀' : '▶'}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
