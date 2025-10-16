// src/pages/MyOrders.js - FUDORO My Orders Page
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { GlobalHeader, GlobalFooter } from '../components/GlobalHeader&Footer';
import styles from './MyOrders.module.css';

const MyOrders = () => {
  const navigate = useNavigate();
  const [user, loading, error] = useAuthState(auth);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState(null);
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Fetch user orders with real-time updates - simplified to use customerId only
  useEffect(() => {
    if (!user) return;

    let unsubscribe;

    const fetchOrders = async () => {
      try {
        setLoadingOrders(true);
        setOrdersError(null);
        
        console.log('Setting up orders listener for user:', user.uid);
        
        // Simple query using customerId (which contains the user's uid)
        const ordersQuery = query(
          collection(db, 'orders'),
          where('customerId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        
        unsubscribe = onSnapshot(
          ordersQuery,
          (snapshot) => {
            console.log('Orders snapshot received:', snapshot.size, 'orders');
            const ordersData = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                ...data,
                // Convert Firestore timestamps to JS dates for sorting/display
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt),
                updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt)
              };
            });
            
            setOrders(ordersData);
            setLoadingOrders(false);
          },
          (error) => {
            console.error('Error fetching orders:', error);
            setOrdersError('Failed to load orders. Please try again.');
            setLoadingOrders(false);
          }
        );
      } catch (error) {
        console.error('Error setting up orders listener:', error);
        setOrdersError('Failed to load orders. Please try again.');
        setLoadingOrders(false);
      }
    };

    fetchOrders();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  const tabs = useMemo(() => [
    { key: 'all', label: 'All', count: orders.length },
    { key: 'active', label: 'Active', count: orders.filter(o => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)).length },
    { key: 'completed', label: 'Completed', count: orders.filter(o => o.status === 'delivered').length },
    { key: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length }
  ], [orders]);

  const filteredOrders = useMemo(() => {
    switch (selectedTab) {
      case 'active':
        return orders.filter(o => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status));
      case 'completed':
        return orders.filter(o => o.status === 'delivered');
      case 'cancelled':
        return orders.filter(o => o.status === 'cancelled');
      default:
        return orders;
    }
  }, [orders, selectedTab]);

  const getStatusColor = useCallback((status) => {
    const colors = {
      pending: '#f59e0b',
      confirmed: '#3b82f6', 
      preparing: '#8b5cf6',
      ready: '#10b981',
      delivered: '#22c55e',
      cancelled: '#ef4444'
    };
    return colors[status] || '#6b7280';
  }, []);

  const getStatusLabel = useCallback((status) => {
    const labels = {
      pending: 'Order Placed',
      confirmed: 'Confirmed',
      preparing: 'Being Prepared',
      ready: 'Ready for Pickup',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    };
    return labels[status] || status;
  }, []);

  const handleOrderClick = useCallback((order) => {
    setSelectedOrder(order);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedOrder(null);
  }, []);

  const handleReorder = useCallback((order) => {
    try {
      const cartItems = Array.isArray(order.items) ? order.items : [];
      localStorage.setItem('cart', JSON.stringify(cartItems));
      navigate('/cart');
    } catch (error) {
      alert('Failed to add items to cart. Please try again.');
    }
  }, [navigate]);

  // Loading state
  if (loading || loadingOrders) {
    return (
      <div className={styles.wrapper}>
        <GlobalHeader />
        <main className={styles.main}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Fetching your FUDORO order history</p>
            {ordersError && (
              <button 
                className={styles.retryButton} 
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            )}
          </div>
        </main>
        <GlobalFooter />
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <GlobalHeader />
      
      <header className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>My Orders</h1>
          <p className={styles.heroDescription}>
            Track and manage your meal boxes and catering orders in one place.
          </p>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>{orders.length}</span>
              <span className={styles.statLabel}>Total Orders</span>
            </div>
          </div>
        </div>
      </header>

      <section className={styles.filtersSection}>
        <div className={styles.filtersContainer}>
          <div className={styles.filterGroups}>
            {tabs.map(tab => (
              <button
                key={tab.key}
                className={`${styles.filterTab} ${selectedTab === tab.key ? styles.active : ''}`}
                onClick={() => setSelectedTab(tab.key)}
              >
                <span>{tab.label}</span>
                <span className={styles.tabCount}>{tab.count}</span>
              </button>
            ))}
          </div>
          <div className={styles.resultsCount}>
            Showing {filteredOrders.length} of {orders.length}
          </div>
        </div>
      </section>

      <section className={styles.ordersSection}>
        <div className={styles.ordersContainer}>
          {filteredOrders.length === 0 ? (
            <div className={styles.noResults}>
              <div className={styles.noResultsIcon}>🍽️</div>
              <h3>
                {selectedTab === 'all' 
                  ? "You haven't placed any orders yet. Start exploring our delicious options!" 
                  : `No ${selectedTab} orders at the moment.`}
              </h3>
              <button 
                className={styles.exploreButton}
                onClick={() => navigate('/')}
              >
                Explore Menu
              </button>
            </div>
          ) : (
            <div className={styles.ordersGrid}>
              {filteredOrders.map((order) => {
                const orderDate = order.createdAt ? order.createdAt.toLocaleString('en-IN') : 'Unknown date';
                const firstItem = Array.isArray(order.items) && order.items.length > 0 ? order.items[0] : null;
                const itemName = firstItem?.mealBoxName || firstItem?.platterName || firstItem?.name || 'Items';
                const quantity = order.totalQuantity || firstItem?.quantity || 0;
                const amount = order.totalAmount || 0;

                return (
                  <article 
                    key={order.id} 
                    className={styles.orderCard}
                    onClick={() => handleOrderClick(order)}
                  >
                    <div className={styles.orderHeader}>
                      <div className={styles.orderInfo}>
                        <h3>Order #{order.id.slice(-6).toUpperCase()}</h3>
                        <div className={styles.orderDate}>Placed on {orderDate}</div>
                      </div>
                      <span 
                        className={styles.statusBadge}
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </div>

                    <div className={styles.orderItems}>
                      <div className={styles.orderItem}>
                        <span className={styles.itemName}>{itemName}</span>
                        <span className={styles.itemQuantity}>x{quantity}</span>
                      </div>
                      {Array.isArray(order.items) && order.items.length > 1 && (
                        <div className={styles.moreItems}>
                          +{order.items.length - 1} more item(s)
                        </div>
                      )}
                    </div>

                    <div className={styles.orderSummary}>
                      <div className={styles.summaryRow}>
                        <span>Order type</span>
                        <strong className={styles.orderType}>{order.orderType || 'meal-box'}</strong>
                      </div>
                      <div className={styles.summaryRow}>
                        <span>Total paid</span>
                        <strong>₹{amount}</strong>
                      </div>
                    </div>

                    <div className={styles.orderActions}>
                      <button
                        type="button"
                        className={styles.viewDetailsBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOrderClick(order);
                        }}
                      >
                        View details
                      </button>
                      <button
                        type="button"
                        className={styles.reorderBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReorder(order);
                        }}
                      >
                        Reorder
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Order #{selectedOrder.id.slice(-6).toUpperCase()}</h2>
              <button className={styles.modalCloseBtn} onClick={closeModal}>×</button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.modalSection}>
                <span 
                  className={styles.modalStatusBadge}
                  style={{ backgroundColor: getStatusColor(selectedOrder.status) }}
                >
                  {getStatusLabel(selectedOrder.status)}
                </span>
                <div>
                  Placed on {selectedOrder.createdAt ? selectedOrder.createdAt.toLocaleString('en-IN') : 'Unknown'}
                </div>
              </div>

              <div className={styles.modalSection}>
                <h3>Items</h3>
                <div className={styles.modalItemsList}>
                  {(selectedOrder.items || []).map((item, index) => (
                    <div key={index} className={styles.modalItem}>
                      <div className={styles.modalItemInfo}>
                        <div className={styles.modalItemName}>
                          {item.mealBoxName || item.platterName || item.name || `Item ${index + 1}`}
                        </div>
                        <div className={styles.modalItemQuantity}>
                          Qty: {item.quantity || 1}
                        </div>
                      </div>
                      <div className={styles.modalItemPrice}>
                        {typeof item.totalPrice === 'number' ? `₹${item.totalPrice}` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.modalSection}>
                <h3>Delivery Details</h3>
                <div className={styles.deliveryInfo}>
                  <p>Name: {selectedOrder.customerInfo?.name || '—'}</p>
                  <p>Phone: {selectedOrder.customerInfo?.phone || selectedOrder.customerPhone || '—'}</p>
                  <p>Address: {selectedOrder.customerInfo?.address || selectedOrder.deliveryAddress || '—'}</p>
                  <p>Event Date: {selectedOrder.eventDate || selectedOrder.deliveryDate || '—'}</p>
                  <p>Event Time: {selectedOrder.eventTime || '—'}</p>
                </div>
              </div>

              <div className={styles.modalSection}>
                <div className={styles.modalTotal}>
                  <span>Total</span>
                  <strong>₹{selectedOrder.totalAmount || 0}</strong>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button 
                className={styles.modalReorderBtn}
                onClick={() => handleReorder(selectedOrder)}
              >
                Reorder
              </button>
              <button 
                className={styles.modalCloseBtn2}
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <GlobalFooter />
    </div>
  );
};

export default MyOrders;
