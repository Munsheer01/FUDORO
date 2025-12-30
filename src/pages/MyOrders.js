// src/pages/MyOrders.js - FUDORO Production-Ready My Orders Page
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  startAfter,
  getDocs,
  doc,
  getDoc
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { GlobalHeader, GlobalFooter } from '../components/GlobalHeader&Footer';
import styles from './MyOrders.module.css';

// Constants
const ORDERS_PER_PAGE = 10;
const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff
const MAX_RETRIES = 3;

// Custom hook for order validation
const useOrderValidator = () => {
  return useCallback((order) => {
    if (!order || typeof order !== 'object') return false;
    
    const requiredFields = ['id', 'customerId', 'status', 'totalAmount'];
    const hasRequiredFields = requiredFields.every(field => order.hasOwnProperty(field));
    
    if (!hasRequiredFields) return false;
    
    // Validate status
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'];
    if (!validStatuses.includes(order.status)) return false;
    
    // Validate items array
    if (!Array.isArray(order.items) || order.items.length === 0) return false;
    
    return true;
  }, []);
};

// Custom hook for error logging
const useErrorLogger = () => {
  return useCallback((error, context) => {
    const errorLog = {
      timestamp: new Date().toISOString(),
      context,
      message: error.message,
      stack: error.stack,
      userId: auth.currentUser?.uid || 'anonymous'
    };
    
    // In production, send to logging service (e.g., Sentry, LogRocket)
    if (process.env.NODE_ENV === 'production') {
      // window.errorLogger?.log(errorLog);
      console.error('[PRODUCTION ERROR]', errorLog);
    } else {
      console.error('[DEV ERROR]', errorLog);
    }
  }, []);
};

const MyOrders = () => {
  const navigate = useNavigate();
  const [user, authLoading] = useAuthState(auth);
  const logError = useErrorLogger();
  const validateOrder = useOrderValidator();
  
  // State management
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [ordersError, setOrdersError] = useState(null);
  const [selectedTab, setSelectedTab] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [reorderLoading, setReorderLoading] = useState(false);
  
  // Refs
  const observerTarget = useRef(null);
  const abortControllerRef = useRef(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Safe timestamp conversion
  const convertTimestamp = useCallback((timestamp) => {
    try {
      if (!timestamp) return new Date();
      if (timestamp.toDate && typeof timestamp.toDate === 'function') {
        return timestamp.toDate();
      }
      if (timestamp instanceof Date) return timestamp;
      if (typeof timestamp === 'string' || typeof timestamp === 'number') {
        const date = new Date(timestamp);
        return isNaN(date.getTime()) ? new Date() : date;
      }
      return new Date();
    } catch (error) {
      logError(error, 'convertTimestamp');
      return new Date();
    }
  }, [logError]);

  // Fetch orders with pagination
  const fetchOrders = useCallback(async (isLoadMore = false) => {
    if (!user) return;
    
    // Cancel any pending requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    try {
      if (!isLoadMore) {
        setLoadingOrders(true);
      } else {
        setLoadingMore(true);
      }
      setOrdersError(null);

      // Build query
      let ordersQuery = query(
        collection(db, 'orders'),
        where('customerId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(ORDERS_PER_PAGE)
      );

      // Add pagination cursor if loading more
      if (isLoadMore && lastVisible) {
        ordersQuery = query(
          collection(db, 'orders'),
          where('customerId', '==', user.uid),
          orderBy('createdAt', 'desc'),
          startAfter(lastVisible),
          limit(ORDERS_PER_PAGE)
        );
      }

      const snapshot = await getDocs(ordersQuery);
      
      if (snapshot.empty) {
        setHasMore(false);
        if (!isLoadMore) {
          setOrders([]);
        }
        return;
      }

      // Process and validate orders
      const ordersData = snapshot.docs
        .map(doc => {
          const data = doc.data();
          const order = {
            id: doc.id,
            ...data,
            createdAt: convertTimestamp(data.createdAt),
            updatedAt: convertTimestamp(data.updatedAt),
            items: Array.isArray(data.items) ? data.items : []
          };
          return order;
        })
        .filter(validateOrder); // Validate each order

      // Update state
      if (isLoadMore) {
        setOrders(prev => [...prev, ...ordersData]);
      } else {
        setOrders(ordersData);
      }

      // Update pagination state
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === ORDERS_PER_PAGE);
      setRetryCount(0); // Reset retry count on success

    } catch (error) {
      if (error.name === 'AbortError') return;
      
      logError(error, 'fetchOrders');
      
      // Handle specific Firebase errors
      if (error.code === 'permission-denied') {
        setOrdersError('You do not have permission to view these orders. Please contact support.');
      } else if (error.code === 'unavailable') {
        setOrdersError('Unable to connect. Please check your internet connection.');
      } else {
        setOrdersError('Failed to load orders. Please try again.');
      }

      // Implement exponential backoff retry
      if (retryCount < MAX_RETRIES) {
        const delay = RETRY_DELAYS[retryCount] || RETRY_DELAYS[RETRY_DELAYS.length - 1];
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchOrders(isLoadMore);
        }, delay);
      }
    } finally {
      setLoadingOrders(false);
      setLoadingMore(false);
    }
  }, [user, lastVisible, retryCount, convertTimestamp, validateOrder, logError]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchOrders(false);
    }
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [user, fetchOrders]);

  // Infinite scroll observer
  useEffect(() => {
    const currentTarget = observerTarget.current;
    if (!currentTarget || !hasMore || loadingMore) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          fetchOrders(true);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(currentTarget);

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loadingMore, fetchOrders]);

  // Tab filtering (computed on-demand, not memoized)
  const getFilteredOrders = () => {
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
  };

  const filteredOrders = getFilteredOrders();

  // Tab configuration
  const tabs = [
    { key: 'all', label: 'All', count: orders.length },
    { 
      key: 'active', 
      label: 'Active', 
      count: orders.filter(o => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)).length 
    },
    { key: 'completed', label: 'Completed', count: orders.filter(o => o.status === 'delivered').length },
    { key: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length }
  ];

  // Status helpers
  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      confirmed: '#3b82f6',
      preparing: '#8b5cf6',
      ready: '#10b981',
      delivered: '#22c55e',
      cancelled: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Order Placed',
      confirmed: 'Confirmed',
      preparing: 'Being Prepared',
      ready: 'Ready for Pickup',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    };
    return labels[status] || status;
  };

  // Validate item availability before reorder
  const validateItemAvailability = async (items) => {
    try {
      const validItems = [];
      
      for (const item of items) {
        if (!item.id) continue;
        
        // Check if item still exists and is available
        const itemRef = doc(db, item.type === 'platter' ? 'platters' : 'mealboxes', item.id);
        const itemDoc = await getDoc(itemRef);
        
        if (itemDoc.exists()) {
          const itemData = itemDoc.data();
          
          // Check if item is still available
          if (itemData.isAvailable !== false) {
            validItems.push({
              ...item,
              currentPrice: itemData.price || item.price,
              priceChanged: itemData.price !== item.price
            });
          }
        }
      }
      
      return validItems;
    } catch (error) {
      logError(error, 'validateItemAvailability');
      return [];
    }
  };

  // Reorder handler with validation
  const handleReorder = async (order) => {
    try {
      setReorderLoading(true);
      
      if (!Array.isArray(order.items) || order.items.length === 0) {
        alert('This order has no items to reorder.');
        return;
      }

      // Validate item availability
      const validItems = await validateItemAvailability(order.items);
      
      if (validItems.length === 0) {
        alert('Sorry, none of the items from this order are currently available.');
        return;
      }

      // Check if any items were removed
      if (validItems.length < order.items.length) {
        const removedCount = order.items.length - validItems.length;
        const proceed = window.confirm(
          `${removedCount} item(s) from this order are no longer available. Do you want to continue with the available items?`
        );
        if (!proceed) return;
      }

      // Check for price changes
      const priceChanged = validItems.some(item => item.priceChanged);
      if (priceChanged) {
        const proceed = window.confirm(
          'Some prices have changed since your original order. Do you want to continue?'
        );
        if (!proceed) return;
      }

      // Add to cart
      localStorage.setItem('cart', JSON.stringify(validItems));
      navigate('/cart');
    } catch (error) {
      logError(error, 'handleReorder');
      alert('Failed to process reorder. Please try again or add items manually.');
    } finally {
      setReorderLoading(false);
    }
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    
    // Log analytics event (in production)
    if (process.env.NODE_ENV === 'production') {
      // window.analytics?.track('Order Details Viewed', { orderId: order.id });
    }
  };

  const closeModal = () => {
    setSelectedOrder(null);
  };

  // Keyboard navigation for modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && selectedOrder) {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [selectedOrder]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (selectedOrder) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedOrder]);

  const handleRetry = () => {
    setRetryCount(0);
    fetchOrders(false);
  };

  // Format date helper
  const formatDate = (date) => {
    try {
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Invalid date';
    }
  };

  // Loading state
  if (authLoading || (loadingOrders && orders.length === 0)) {
    return (
      <div className={styles.wrapper}>
        <GlobalHeader />
        <main className={styles.main}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner} role="status" aria-label="Loading orders"></div>
            <p>Loading your order history...</p>
          </div>
        </main>
        <GlobalFooter />
      </div>
    );
  }

  // Error state with retry
  if (ordersError && orders.length === 0) {
    return (
      <div className={styles.wrapper}>
        <GlobalHeader />
        <main className={styles.main}>
          <div className={styles.errorContainer} role="alert">
            <span className={styles.errorIcon}>⚠️</span>
            <p>{ordersError}</p>
            <button 
              className={styles.retryButton} 
              onClick={handleRetry}
              disabled={retryCount >= MAX_RETRIES}
            >
              {retryCount >= MAX_RETRIES ? 'Maximum retries reached' : 'Retry'}
            </button>
          </div>
        </main>
        <GlobalFooter />
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      {/* Skip to main content link for screen readers */}
      <a href="#main-content" className={styles.skipToMain}>
        Skip to main content
      </a>
      
      <GlobalHeader />
      
      <main className={styles.main} id="main-content" role="main">
        {/* Hero Section */}
        <section className={styles.heroSection} aria-labelledby="page-title">
          <div className={styles.heroContent}>
            <h1 id="page-title" className={styles.heroTitle}>My Orders</h1>
            <p className={styles.heroDescription}>
              Track your FUDORO orders and reorder your favorites
            </p>
            <div className={styles.heroStats} role="group" aria-label="Order statistics">
              <div className={styles.stat}>
                <span className={styles.statNumber}>{orders.length}</span>
                <span className={styles.statLabel}>Total Orders</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>
                  {orders.filter(o => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)).length}
                </span>
                <span className={styles.statLabel}>Active</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>
                  {orders.filter(o => o.status === 'delivered').length}
                </span>
                <span className={styles.statLabel}>Completed</span>
              </div>
            </div>
          </div>
        </section>

        {/* Filters Section */}
        <section className={styles.filtersSection} aria-label="Order filters">
          <div className={styles.filtersContainer}>
            <div className={styles.filterGroups} role="tablist" aria-label="Order filter tabs">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  role="tab"
                  className={`${styles.filterTab} ${selectedTab === tab.key ? styles.active : ''}`}
                  onClick={() => setSelectedTab(tab.key)}
                  aria-pressed={selectedTab === tab.key}
                  aria-selected={selectedTab === tab.key}
                  aria-label={`Filter by ${tab.label}, ${tab.count} ${tab.count === 1 ? 'order' : 'orders'}`}
                >
                  {tab.label}
                  <span className={styles.tabCount} aria-hidden="true">{tab.count}</span>
                </button>
              ))}
            </div>
            <div className={styles.resultsCount}>
              Showing {filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'}
            </div>
          </div>
        </section>

        {/* Orders Section */}
        <section className={styles.ordersSection} aria-labelledby="orders-heading">
          <div className={styles.ordersContainer}>
            {filteredOrders.length === 0 ? (
              <div className={styles.noResults} role="status" aria-live="polite">
                <span className={styles.noResultsIcon}>📦</span>
                <h3>No orders found</h3>
                <p>
                  {selectedTab === 'all' 
                    ? "You haven't placed any orders yet" 
                    : `No ${selectedTab} orders`}
                </p>
                <button 
                  className={styles.exploreButton} 
                  onClick={() => navigate('/meal-boxes')}
                  aria-label="Explore menu"
                >
                  Explore Menu
                </button>
              </div>
            ) : (
              <>
                <div className={styles.ordersGrid}>
                  {filteredOrders.map(order => (
                    <article key={order.id} className={styles.orderCard}>
                      <div className={styles.orderHeader}>
                        <div className={styles.orderInfo}>
                          <h3>Order #{order.id.slice(-6).toUpperCase()}</h3>
                          <p className={styles.orderDate}>{formatDate(order.createdAt)}</p>
                        </div>
                        <span 
                          className={styles.statusBadge}
                          style={{ backgroundColor: getStatusColor(order.status) }}
                          role="status"
                        >
                          {getStatusLabel(order.status)}
                        </span>
                      </div>

                      <div className={styles.orderItems}>
                        {order.items.slice(0, 3).map((item, index) => (
                          <div key={index} className={styles.orderItem}>
                            <span className={styles.itemName}>{item.name || 'Item'}</span>
                            <span className={styles.itemQuantity}>× {item.quantity || 1}</span>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <p className={styles.moreItems}>
                            +{order.items.length - 3} more {order.items.length - 3 === 1 ? 'item' : 'items'}
                          </p>
                        )}
                      </div>

                      <div className={styles.orderSummary}>
                        <div className={styles.summaryRow}>
                          <span>Order Type:</span>
                          <span className={styles.orderType}>{order.orderType || 'Standard'}</span>
                        </div>
                        <div className={styles.summaryRow}>
                          <span>Total Amount:</span>
                          <strong>₹{order.totalAmount?.toLocaleString('en-IN') || '0'}</strong>
                        </div>
                        
                        {/* Payment Status */}
                        <div className={styles.summaryRow}>
                          <span>Payment Status:</span>
                          <span className={`${styles.paymentBadge} ${styles[order.payment?.status || 'pending']}`}>
                            {(order.payment?.status || 'pending').replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        
                        {order.payment?.advanceAmount > 0 && (
                          <div className={styles.paymentDetails}>
                            <div className={styles.summaryRow}>
                              <span>Advance Paid:</span>
                              <strong className={styles.paidAmount}>
                                ₹{order.payment.advanceAmount?.toLocaleString('en-IN')}
                              </strong>
                            </div>
                            <div className={styles.summaryRow}>
                              <span>Remaining:</span>
                              <strong className={styles.remainingAmount}>
                                ₹{order.payment.remainingAmount?.toLocaleString('en-IN')}
                              </strong>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className={styles.orderActions}>
                        <button 
                          className={styles.viewDetailsBtn} 
                          onClick={() => handleOrderClick(order)}
                          aria-label={`View details for order ${order.id.slice(-6)}`}
                        >
                          View Details
                        </button>
                        <button 
                          className={styles.reorderBtn} 
                          onClick={() => handleReorder(order)}
                          disabled={reorderLoading || order.status === 'cancelled'}
                          aria-label={`Reorder items from order ${order.id.slice(-6)}`}
                        >
                          {reorderLoading ? 'Processing...' : 'Reorder'}
                        </button>
                      </div>
                    </article>
                  ))}
                </div>

                {/* Infinite scroll trigger */}
                {hasMore && (
                  <div ref={observerTarget} className={styles.loadMoreTrigger}>
                    {loadingMore && (
                      <div className={styles.loadingMore}>
                        <div className={styles.loadingSpinner}></div>
                        <p>Loading more orders...</p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <GlobalFooter />

      {/* Order Details Modal */}
      {selectedOrder && (
        <div 
          className={styles.modalOverlay} 
          onClick={closeModal}
          onKeyDown={(e) => e.key === 'Escape' && closeModal()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
        >
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 id="modal-title">Order #{selectedOrder.id.slice(-6).toUpperCase()}</h2>
              <button 
                className={styles.modalCloseBtn} 
                onClick={closeModal}
                aria-label="Close order details modal"
                title="Close (ESC)"
              >
                ×
              </button>
            </div>
            
            {/* Hidden description for screen readers */}
            <p id="modal-description" className={styles.srOnly}>
              Viewing details for order {selectedOrder.id.slice(-6).toUpperCase()}
            </p>

            <div className={styles.modalBody}>
              {/* Order Status */}
              <div className={styles.modalSection}>
                <h3>Order Status</h3>
                <span 
                  className={styles.modalStatusBadge}
                  style={{ backgroundColor: getStatusColor(selectedOrder.status) }}
                >
                  {getStatusLabel(selectedOrder.status)}
                </span>
                <p style={{ marginTop: '0.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
                  Placed on {formatDate(selectedOrder.createdAt)}
                </p>
              </div>

              {/* Order Items */}
              <div className={styles.modalSection}>
                <h3>Items Ordered</h3>
                <div className={styles.modalItemsList}>
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className={styles.modalItem}>
                      <div className={styles.modalItemInfo}>
                        <span className={styles.modalItemName}>{item.name || 'Item'}</span>
                        <span className={styles.modalItemQuantity}>Quantity: {item.quantity || 1}</span>
                      </div>
                      <span className={styles.modalItemPrice}>
                        ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Information */}
              <div className={styles.modalSection}>
                <h3>Delivery Information</h3>
                <div className={styles.deliveryInfo}>
                  <p><strong>Name:</strong> {selectedOrder.customerInfo?.name || selectedOrder.customerName || '—'}</p>
                  <p><strong>Phone:</strong> {selectedOrder.customerInfo?.phone || selectedOrder.customerPhone || '—'}</p>
                  <p><strong>Address:</strong> {selectedOrder.customerInfo?.address || selectedOrder.deliveryAddress || '—'}</p>
                  {selectedOrder.eventDate && (
                    <p><strong>Event Date:</strong> {selectedOrder.eventDate}</p>
                  )}
                  {selectedOrder.eventTime && (
                    <p><strong>Event Time:</strong> {selectedOrder.eventTime}</p>
                  )}
                </div>
              </div>

              {/* Payment Information */}
              <div className={styles.modalSection}>
                <h3>💰 Payment Details</h3>
                <div className={styles.paymentInfo}>
                  <div className={styles.paymentRow}>
                    <span>Status:</span>
                    <span className={`${styles.paymentBadge} ${styles[selectedOrder.payment?.status || 'pending']}`}>
                      {(selectedOrder.payment?.status || 'pending').replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <div className={styles.paymentRow}>
                    <span>Total Amount:</span>
                    <strong>₹{selectedOrder.totalAmount?.toLocaleString('en-IN') || '0'}</strong>
                  </div>
                  
                  {selectedOrder.payment?.advanceAmount > 0 && (
                    <>
                      <div className={styles.paymentRow}>
                        <span>Advance Paid:</span>
                        <strong className={styles.paidAmount}>
                          ₹{selectedOrder.payment.advanceAmount?.toLocaleString('en-IN')}
                        </strong>
                      </div>
                      
                      <div className={styles.paymentRow}>
                        <span>Remaining Balance:</span>
                        <strong className={styles.remainingAmount}>
                          ₹{selectedOrder.payment.remainingAmount?.toLocaleString('en-IN')}
                        </strong>
                      </div>
                      
                      <div className={styles.paymentRow}>
                        <span>Payment Method:</span>
                        <span>{(selectedOrder.payment.method || 'manual').toUpperCase()}</span>
                      </div>
                    </>
                  )}
                  
                  {selectedOrder.payment?.paymentNotes && (
                    <div className={styles.paymentNotes}>
                      <p><strong>Note:</strong> {selectedOrder.payment.paymentNotes}</p>
                    </div>
                  )}
                  
                  {selectedOrder.payment?.status === 'pending' && (
                    <div className={styles.paymentAlert}>
                      <p>ℹ️ Our team will contact you shortly to collect the advance payment and confirm your order.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Total */}
              <div className={styles.modalSection}>
                <div className={styles.modalTotal}>
                  <span>Total Amount:</span>
                  <strong>₹{selectedOrder.totalAmount?.toLocaleString('en-IN') || '0'}</strong>
                </div>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button 
                className={styles.modalReorderBtn} 
                onClick={() => {
                  closeModal();
                  handleReorder(selectedOrder);
                }}
                disabled={reorderLoading || selectedOrder.status === 'cancelled'}
              >
                {reorderLoading ? 'Processing...' : 'Reorder'}
              </button>
              <button className={styles.modalCloseBtn2} onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
