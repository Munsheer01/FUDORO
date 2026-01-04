import React from 'react';
import styles from './AdminHeader.module.css';

const AdminHeader = ({ onMenuClick, onLogout }) => {
  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <button className={styles.menuButton} onClick={onMenuClick}>
          ☰
        </button>
        <h1 className={styles.title}>FUDORO Admin</h1>
      </div>
      
      <div className={styles.headerRight}>
        <div className={styles.adminInfo}>
          <span className={styles.adminName}>Admin User</span>
          <span className={styles.adminRole}>Administrator</span>
        </div>
        <button className={styles.logoutButton} onClick={onLogout}>
          🚪 Logout
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;
