// src/admin/pages/orders/OrderQueue.js (Updated)
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '../../../firebase';
import OrderCard from './components/OrderCard';
import styles from './OrderQueue.module.css';

const OrderQueue = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    console.log('📋 Setting up orders listener...');

    // Real-time orders subscription
    const ordersQuery = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate()
      }));
      
      console.log(`📋 Loaded ${ordersData.length} orders`);
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching orders:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Apply status filter
    if (statusFilter === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status === statusFilter));
    }
  }, [orders, statusFilter]);

  const handleStatusUpdate = (orderId, newStatus) => {
    console.log(`✅ Order ${orderId} status updated to ${newStatus}`);
    // The real-time listener will automatically update the UI
  };

  const getStatusCounts = () => {
    return {
      all: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      preparing: orders.filter(o => o.status === 'preparing').length,
      ready: orders.filter(o => o.status === 'ready').length,
      dispatched: orders.filter(o => o.status === 'dispatched').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length
    };
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  const statusCounts = getStatusCounts();

  return (
    <div className={styles.orderQueue}>
      <div className={styles.queueHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>📋 Order Management</h1>
          <p className={styles.pageDescription}>
            Manage customer orders and update their status in real-time
          </p>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className={styles.statusTabs}>
        {Object.entries(statusCounts).map(([status, count]) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`${styles.statusTab} ${statusFilter === status ? styles.active : ''}`}
          >
            <span className={styles.statusLabel}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
            <span className={styles.statusCount}>{count}</span>
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className={styles.ordersContainer}>
        {filteredOrders.length === 0 ? (
          <div className={styles.noOrders}>
            <div className={styles.emptyIcon}>📋</div>
            <h3>No orders found</h3>
            <p>
              {statusFilter === 'all' 
                ? 'No orders have been placed yet.' 
                : `No ${statusFilter} orders found.`
              }
            </p>
          </div>
        ) : (
          <div className={styles.ordersList}>
            {filteredOrders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onStatusUpdate={handleStatusUpdate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderQueue;
