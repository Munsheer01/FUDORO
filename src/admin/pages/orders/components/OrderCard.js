// src/admin/pages/orders/components/OrderCard.js (Fixed)
import React, { useState } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../../firebase';
import styles from './OrderCard.module.css';

const OrderCard = ({ order, onStatusUpdate }) => {
  const [updating, setUpdating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(order.status);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    status: order.payment?.status || 'pending',
    method: order.payment?.method || 'manual',
    advanceAmount: order.payment?.advanceAmount || 0,
    notes: order.payment?.paymentNotes || ''
  });

  // ✅ Safe timestamp conversion function
  const getDateFromTimestamp = (timestamp) => {
    if (!timestamp) {
      return new Date(); // Fallback to current date
    }
    
    // If it's already a Date object
    if (timestamp instanceof Date) {
      return timestamp;
    }
    
    // If it has toDate method (Firestore Timestamp)
    if (typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    
    // If it's a plain object with seconds (serialized Firestore Timestamp)
    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000);
    }
    
    // Try to create a new Date from the value
    return new Date(timestamp);
  };

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: '#f59e0b' },
    { value: 'confirmed', label: 'Confirmed', color: '#3b82f6' },
    { value: 'preparing', label: 'Preparing', color: '#f97316' },
    { value: 'ready', label: 'Ready', color: '#10b981' },
    { value: 'dispatched', label: 'Dispatched', color: '#8b5cf6' },
    { value: 'delivered', label: 'Delivered', color: '#22c55e' },
    { value: 'cancelled', label: 'Cancelled', color: '#ef4444' }
  ];

  const getStatusColor = (status) => {
    const statusObj = statusOptions.find(s => s.value === status);
    return statusObj ? statusObj.color : '#6b7280';
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === currentStatus) return;

    setUpdating(true);
    try {
      const orderRef = doc(db, 'orders', order.id);
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
        lastUpdatedBy: 'admin'
      });

      setCurrentStatus(newStatus);
      
      if (onStatusUpdate) {
        onStatusUpdate(order.id, newStatus);
      }

      console.log(`✅ Order ${order.id} status updated to ${newStatus}`);
      
    } catch (error) {
      console.error('❌ Error updating order status:', error);
      alert('Failed to update order status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handlePaymentUpdate = async () => {
    setUpdating(true);
    try {
      const orderRef = doc(db, 'orders', order.id);
      const remainingAmount = order.totalAmount - paymentData.advanceAmount;
      
      const paymentUpdate = {
        'payment.status': paymentData.status,
        'payment.method': paymentData.method,
        'payment.advanceAmount': Number(paymentData.advanceAmount),
        'payment.remainingAmount': remainingAmount,
        'payment.paymentNotes': paymentData.notes,
        'payment.lastUpdated': serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      // Add payment date if marking as paid
      if (paymentData.status === 'advance_paid' && !order.payment?.advancePaidDate) {
        paymentUpdate['payment.advancePaidDate'] = serverTimestamp();
      }
      if (paymentData.status === 'fully_paid' && !order.payment?.fullyPaidDate) {
        paymentUpdate['payment.fullyPaidDate'] = serverTimestamp();
      }

      // Add to payment history
      const historyEntry = {
        timestamp: new Date().toISOString(),
        action: paymentData.status,
        amount: Number(paymentData.advanceAmount),
        method: paymentData.method,
        notes: paymentData.notes,
        updatedBy: 'admin'
      };

      await updateDoc(orderRef, {
        ...paymentUpdate,
        'payment.history': [...(order.payment?.history || []), historyEntry]
      });

      setShowPaymentModal(false);
      console.log(`✅ Payment updated for order ${order.id}`);
      
    } catch (error) {
      console.error('❌ Error updating payment:', error);
      alert('Failed to update payment. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    return date.toLocaleDateString();
  };

  // ✅ Safe date conversion
  const createdAtDate = getDateFromTimestamp(order.createdAt);

  return (
    <div className={styles.orderCard}>
      <div className={styles.cardHeader}>
        <div className={styles.orderInfo}>
          <h3 className={styles.orderId}>#{order.id.slice(-6)}</h3>
          <div className={styles.statusContainer}>
            <select
              value={currentStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={updating}
              className={styles.statusSelect}
              style={{ backgroundColor: getStatusColor(currentStatus) }}
            >
              {statusOptions.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className={styles.orderMeta}>
          <span className={styles.orderTime}>
            {getTimeAgo(createdAtDate)}
          </span>
          <div className={styles.orderValue}>
            ₹{order.totalAmount?.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      <div className={styles.customerInfo}>
        <div className={styles.customerDetails}>
          <strong>{order.customerInfo?.name || 'Anonymous'}</strong>
          <span>📞 {order.customerInfo?.phone}</span>
          <span>📧 {order.customerInfo?.email}</span>
        </div>
        
        <div className={styles.deliveryInfo}>
          <div className={styles.address}>
            📍 {order.customerInfo?.address}
          </div>
          <div className={styles.eventDetails}>
            🎉 {order.eventDate} at {order.eventTime}
          </div>
        </div>
      </div>

      <div className={styles.orderItems}>
        <h4>Order Items:</h4>
        {order.items?.map((item, index) => (
          <div key={index} className={styles.orderItem}>
            <span className={styles.itemName}>{item.platterName}</span>
            <span className={styles.itemQuantity}>×{item.quantity}</span>
            <span className={styles.itemPrice}>₹{item.totalPrice?.toLocaleString('en-IN')}</span>
          </div>
        ))}
        <div className={styles.orderTotal}>
          <strong>Total: {order.totalQuantity} plates • ₹{order.totalAmount?.toLocaleString('en-IN')}</strong>
        </div>
      </div>

      {order.specialInstructions && (
        <div className={styles.specialInstructions}>
          <strong>📝 Special Instructions:</strong>
          <p>{order.specialInstructions}</p>
        </div>
      )}

      {/* Payment Information */}
      <div className={styles.paymentSection}>
        <div className={styles.paymentHeader}>
          <h4>💰 Payment Status</h4>
          <button 
            className={styles.updatePaymentBtn}
            onClick={() => setShowPaymentModal(true)}
          >
            ✏️ Update Payment
          </button>
        </div>
        
        <div className={styles.paymentInfo}>
          <div className={styles.paymentRow}>
            <span>Status:</span>
            <span className={`${styles.paymentBadge} ${styles[order.payment?.status || 'pending']}`}>
              {(order.payment?.status || 'pending').replace('_', ' ').toUpperCase()}
            </span>
          </div>
          
          <div className={styles.paymentRow}>
            <span>Method:</span>
            <span>{(order.payment?.method || 'manual').toUpperCase()}</span>
          </div>
          
          <div className={styles.paymentRow}>
            <span>Total Amount:</span>
            <strong>₹{order.totalAmount?.toLocaleString('en-IN')}</strong>
          </div>
          
          {order.payment?.advanceAmount > 0 && (
            <>
              <div className={styles.paymentRow}>
                <span>Advance Paid:</span>
                <strong className={styles.paidAmount}>
                  ₹{order.payment.advanceAmount?.toLocaleString('en-IN')}
                </strong>
              </div>
              
              <div className={styles.paymentRow}>
                <span>Remaining:</span>
                <strong className={styles.remainingAmount}>
                  ₹{order.payment.remainingAmount?.toLocaleString('en-IN')}
                </strong>
              </div>
            </>
          )}
          
          {order.payment?.paymentNotes && (
            <div className={styles.paymentNotes}>
              <em>Note: {order.payment.paymentNotes}</em>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>💰 Update Payment</h3>
              <button 
                className={styles.closeBtn}
                onClick={() => setShowPaymentModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label>Payment Status</label>
                <select 
                  value={paymentData.status}
                  onChange={(e) => setPaymentData({...paymentData, status: e.target.value})}
                  className={styles.formSelect}
                >
                  <option value="pending">Pending (No payment yet)</option>
                  <option value="advance_paid">Advance Paid</option>
                  <option value="fully_paid">Fully Paid</option>
                  <option value="cod">Cash on Delivery</option>
                </select>
              </div>
              
              <div className={styles.formGroup}>
                <label>Payment Method</label>
                <select 
                  value={paymentData.method}
                  onChange={(e) => setPaymentData({...paymentData, method: e.target.value})}
                  className={styles.formSelect}
                >
                  <option value="manual">Manual/Offline</option>
                  <option value="cash">Cash</option>
                  <option value="upi">UPI</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="online">Online Payment</option>
                </select>
              </div>
              
              <div className={styles.formGroup}>
                <label>Advance Amount (₹)</label>
                <input 
                  type="number"
                  value={paymentData.advanceAmount}
                  onChange={(e) => setPaymentData({...paymentData, advanceAmount: e.target.value})}
                  className={styles.formInput}
                  placeholder="Enter advance amount"
                  min="0"
                  max={order.totalAmount}
                />
                <small>Remaining: ₹{(order.totalAmount - paymentData.advanceAmount).toLocaleString('en-IN')}</small>
              </div>
              
              <div className={styles.formGroup}>
                <label>Payment Notes</label>
                <textarea 
                  value={paymentData.notes}
                  onChange={(e) => setPaymentData({...paymentData, notes: e.target.value})}
                  className={styles.formTextarea}
                  placeholder="Add any notes about the payment..."
                  rows="3"
                />
              </div>
            </div>
            
            <div className={styles.modalFooter}>
              <button 
                className={styles.cancelBtn}
                onClick={() => setShowPaymentModal(false)}
              >
                Cancel
              </button>
              <button 
                className={styles.saveBtn}
                onClick={handlePaymentUpdate}
                disabled={updating}
              >
                {updating ? 'Saving...' : '💾 Save Payment'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.cardActions}>
        <button 
          className={styles.viewDetailsBtn}
          onClick={() => alert(`Order placed: ${createdAtDate.toLocaleString()}`)}
        >
          📄 View Details
        </button>
        
        <button 
          className={styles.printBtn}
          onClick={() => window.print()}
        >
          🖨️ Print Receipt
        </button>
      </div>

      {updating && (
        <div className={styles.updatingOverlay}>
          <div className={styles.spinner}></div>
          <span>Updating status...</span>
        </div>
      )}
    </div>
  );
};

export default OrderCard;
