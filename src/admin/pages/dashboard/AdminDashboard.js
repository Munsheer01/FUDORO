// src/admin/pages/dashboard/AdminDashboard.js (Enhanced with MealBoxes)
import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../../../firebase';
import MetricsCards from './components/MetricsCards';
import styles from './AdminDashboard.module.css';

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    activeOrders: 0,
    avgOrderValue: 0,
    // ✅ NEW: MealBoxes metrics
    totalMealBoxes: 0,
    activeMealBoxes: 0,
    loading: true
  });
  
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  // ✅ NEW: MealBoxes state
  const [mealBoxes, setMealBoxes] = useState([]);

  useEffect(() => {
    console.log('📊 Setting up dashboard listeners...');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Today's orders query
    const todayOrdersQuery = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc')
    );

    // Active orders query
    const activeOrdersQuery = query(
      collection(db, 'orders'),
      where('status', 'in', ['pending', 'confirmed', 'preparing', 'ready'])
    );

    // Recent orders query
    const recentOrdersQuery = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    // Low stock query (optional - only if inventory collection exists)
    const lowStockQuery = query(collection(db, 'inventory'));

    // ✅ NEW: MealBoxes query (optional - only if MealBoxes collection exists)
    const mealBoxesQuery = query(collection(db, 'MealBoxes'));

    const unsubscribeToday = onSnapshot(todayOrdersQuery, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const revenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      
      setMetrics(prev => ({
        ...prev,
        todayOrders: orders.length,
        todayRevenue: revenue,
        avgOrderValue: orders.length > 0 ? revenue / orders.length : 0,
        loading: false
      }));
    }, (error) => {
      console.error('Error fetching today orders:', error);
      setMetrics(prev => ({ ...prev, loading: false }));
    });

    const unsubscribeActive = onSnapshot(activeOrdersQuery, (snapshot) => {
      setMetrics(prev => ({
        ...prev,
        activeOrders: snapshot.docs.length
      }));
    }, (error) => {
      console.error('Error fetching active orders:', error);
    });

    const unsubscribeRecent = onSnapshot(recentOrdersQuery, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      setRecentOrders(orders);
    }, (error) => {
      console.error('Error fetching recent orders:', error);
    });

    const unsubscribeInventory = onSnapshot(lowStockQuery, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const lowStock = items.filter(item => 
        item.currentStock <= (item.minThreshold || 10)
      );
      setLowStockItems(lowStock);
    }, (error) => {
      console.error('Error fetching inventory:', error);
      setLowStockItems([]); // Set empty on error
    });

    // ✅ NEW: MealBoxes listener
    const unsubscribeMealBoxes = onSnapshot(mealBoxesQuery, (snapshot) => {
      const mealBoxesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMealBoxes(mealBoxesData);
      
      setMetrics(prev => ({
        ...prev,
        totalMealBoxes: mealBoxesData.length,
        activeMealBoxes: mealBoxesData.filter(mb => mb.availability?.isActive).length
      }));
    }, (error) => {
      console.error('Error fetching meal boxes:', error);
      setMealBoxes([]); // Set empty on error
    });

    return () => {
      unsubscribeToday();
      unsubscribeActive();
      unsubscribeRecent();
      unsubscribeInventory();
      unsubscribeMealBoxes(); // ✅ NEW: Cleanup MealBoxes listener
    };
  }, []);

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>📊 FUDORO Dashboard</h1>
          <p className={styles.pageDescription}>
            Welcome to your admin panel - {new Date().toLocaleDateString()}
          </p>
        </div>
        
        <div className={styles.quickActions}>
          <button className={styles.quickAction}>
            🔄 Refresh Data
          </button>
        </div>
      </div>

      {/* Enhanced Metrics Cards with MealBoxes */}
      <MetricsCards metrics={metrics} />

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <div className={styles.alertSection}>
          <h3>⚠️ Low Stock Alerts</h3>
          <div className={styles.alertList}>
            {lowStockItems.map(item => (
              <div key={item.id} className={styles.alertItem}>
                <strong>{item.name}</strong>: {item.currentStock} {item.unit} 
                (Min: {item.minThreshold} {item.unit})
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ✅ NEW: MealBoxes Overview Section */}
      {mealBoxes.length > 0 && (
        <div className={styles.mealBoxesSection}>
          <h3>🍱 MealBoxes Overview</h3>
          <div className={styles.mealBoxesList}>
            {mealBoxes.slice(0, 5).map(mealBox => (
              <div key={mealBox.id} className={styles.mealBoxItem}>
                <div className={styles.mealBoxHeader}>
                  <strong>{mealBox.name}</strong>
                  <span className={`${styles.mealBoxStatus} ${mealBox.availability?.isActive ? styles.active : styles.inactive}`}>
                    {mealBox.availability?.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className={styles.mealBoxDetails}>
                  <span>{mealBox.configuration?.totalCompartments} compartments</span>
                  <span>Veg: ₹{mealBox.pricing?.veg?.basePrice} | Non-Veg: ₹{mealBox.pricing?.nonVeg?.basePrice}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders */}
      {recentOrders.length > 0 && (
        <div className={styles.ordersSection}>
          <h3>📋 Recent Orders</h3>
          <div className={styles.ordersList}>
            {recentOrders.map(order => (
              <div key={order.id} className={styles.orderItem}>
                <div className={styles.orderHeader}>
                  <strong>#{order.id.slice(-6)}</strong>
                  <span className={styles.orderStatus}>{order.status}</span>
                </div>
                <div className={styles.orderDetails}>
                  <span>{order.customerInfo?.name}</span>
                  <span>₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
