// src/admin/pages/orders/components/OrderCard.js (Fixed)
import React, { useState } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../../firebase';
import styles from './OrderCard.module.css';

const OrderCard = ({ order, onStatusUpdate }) => {
  const [updating, setUpdating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(order.status);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [paymentData, setPaymentData] = useState({
    status: order.payment?.status || 'pending',
    method: order.payment?.method || 'manual',
    advanceAmount: order.payment?.advanceAmount || 0,
    notes: order.payment?.paymentNotes || ''
  });

  // ESC key handler
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (showDetailsModal) {
          setShowDetailsModal(false);
        } else if (showPaymentModal) {
          setShowPaymentModal(false);
        }
      }
    };

    if (showDetailsModal || showPaymentModal) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showDetailsModal, showPaymentModal]);

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
            <div className={styles.itemHeader}>
              <span className={styles.itemName}>
                {item.platterName || item.mealBoxName || item.name}
              </span>
              <span className={styles.itemQuantity}>×{item.quantity}</span>
              <span className={styles.itemPrice}>₹{item.totalPrice?.toLocaleString('en-IN')}</span>
            </div>
            {item.selections && item.selections.length > 0 && (
              <div className={styles.quickSelections}>
                {item.selections.slice(0, 3).map((selection, idx) => (
                  <span key={idx} className={styles.quickSelection}>
                    <strong>{selection.categoryName}:</strong> {selection.items.map(i => i.name).join(', ')}
                  </span>
                ))}
                {item.selections.length > 3 && (
                  <span className={styles.moreSelections}>+ {item.selections.length - 3} more categories</span>
                )}
              </div>
            )}
          </div>
        ))}
        <div className={styles.orderTotal}>
          <strong>Total: {order.totalQuantity} {order.items?.[0]?.type === 'meal-box' ? 'boxes' : 'platters'} • ₹{order.totalAmount?.toLocaleString('en-IN')}</strong>
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
        <div className={styles.modal} onClick={(e) => {
          if (e.target === e.currentTarget) setShowPaymentModal(false);
        }}>
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

      {/* Order Details Modal */}
      {showDetailsModal && (
        <div className={styles.modal} onClick={(e) => {
          if (e.target === e.currentTarget) setShowDetailsModal(false);
        }}>
          <div className={`${styles.modalContent} ${styles.largeModal}`}>
            <div className={styles.modalHeader}>
              <div>
                <h3>📋 Order Details - #{order.id.slice(-6)}</h3>
                <small>Order ID: {order.id}</small>
              </div>
              <button 
                className={styles.closeBtn}
                onClick={() => setShowDetailsModal(false)}
                title="Close (ESC)"
              >
                ✕
              </button>
            </div>
            
            <div className={styles.modalBody}>
              {/* Order Info */}
              <div className={styles.detailsSection}>
                <h4>📦 Order Information</h4>
                <div className={styles.detailsGrid}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Order Type:</span>
                    <span className={styles.detailValue}>{order.orderType?.toUpperCase() || 'BULK'}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Order Status:</span>
                    <span className={`${styles.detailValue} ${styles.statusBadge}`} style={{ backgroundColor: getStatusColor(currentStatus) }}>
                      {currentStatus.toUpperCase()}
                    </span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Order Date:</span>
                    <span className={styles.detailValue}>{createdAtDate.toLocaleString()}</span>
                  </div>
                  {order.orderReference && (
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Reference No:</span>
                      <span className={styles.detailValue}>{order.orderReference}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Details */}
              <div className={styles.detailsSection}>
                <h4>👤 Customer Details</h4>
                <div className={styles.detailsGrid}>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Name:</span>
                    <span className={styles.detailValue}>{order.customerInfo?.name || 'Anonymous'}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Phone:</span>
                    <span className={styles.detailValue}>{order.customerInfo?.phone}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Email:</span>
                    <span className={styles.detailValue}>{order.customerInfo?.email}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Address:</span>
                    <span className={styles.detailValue}>{order.customerInfo?.address}</span>
                  </div>
                  {order.customerInfo?.pincode && (
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Pincode:</span>
                      <span className={styles.detailValue}>{order.customerInfo.pincode}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Event Details */}
              {(order.eventDate || order.eventTime) && (
                <div className={styles.detailsSection}>
                  <h4>🎉 Event Details</h4>
                  <div className={styles.detailsGrid}>
                    {order.eventDate && (
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Event Date:</span>
                        <span className={styles.detailValue}>{order.eventDate}</span>
                      </div>
                    )}
                    {order.eventTime && (
                      <div className={styles.detailRow}>
                        <span className={styles.detailLabel}>Event Time:</span>
                        <span className={styles.detailValue}>{order.eventTime}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Order Items - Detailed */}
              <div className={styles.detailsSection}>
                <h4>🍽️ Order Items</h4>
                <div className={styles.itemsTable}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>Item Details</th>
                        <th>Menu Selections</th>
                        <th>Qty</th>
                        <th>Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items?.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <div>
                              <strong>{item.platterName || item.mealBoxName || item.name || 'Item'}</strong>
                              {item.cuisine && <div className={styles.itemCategory}>Cuisine: {item.cuisine}</div>}
                              {item.mealType && <div className={styles.itemCategory}>Type: {item.mealType}</div>}
                            </div>
                          </td>
                          <td>
                            {item.selections && item.selections.length > 0 ? (
                              <div className={styles.menuSelections}>
                                {item.selections.map((selection, selIdx) => (
                                  <div key={selIdx} className={styles.selectionCategory}>
                                    <strong className={styles.categoryName}>{selection.categoryName}:</strong>
                                    <div className={styles.selectedItems}>
                                      {selection.items.map((selectedItem, itemIdx) => (
                                        <div key={itemIdx} className={styles.selectedItem}>
                                          • {selectedItem.name}
                                          {selectedItem.extraPrice > 0 && (
                                            <span className={styles.extraPrice}> (+₹{selectedItem.extraPrice})</span>
                                          )}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className={styles.noCustomizations}>No selections specified</span>
                            )}
                          </td>
                          <td className={styles.centered}>
                            <strong>×{item.quantity}</strong>
                            {item.type === 'platter' && <div className={styles.smallText}>platters</div>}
                            {item.type === 'meal-box' && <div className={styles.smallText}>boxes</div>}
                          </td>
                          <td className={styles.rightAlign}>
                            <div className={styles.priceBreakdown}>
                              {item.priceSnapshot ? (
                                <>
                                  <div>Base: ₹{item.priceSnapshot.basePrice?.toLocaleString('en-IN')}</div>
                                  {item.priceSnapshot.extrasTotal > 0 && (
                                    <div className={styles.extrasPrice}>Extras: +₹{item.priceSnapshot.extrasTotal?.toLocaleString('en-IN')}</div>
                                  )}
                                  <div className={styles.totalPrice}><strong>₹{item.totalPrice?.toLocaleString('en-IN')}</strong></div>
                                </>
                              ) : (
                                <strong>₹{item.totalPrice?.toLocaleString('en-IN')}</strong>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className={styles.totalRow}>
                        <td colSpan="2"><strong>Total Order</strong></td>
                        <td className={styles.centered}><strong>{order.totalQuantity} {order.items?.[0]?.type === 'meal-box' ? 'boxes' : 'platters'}</strong></td>
                        <td className={styles.rightAlign}><strong>₹{order.totalAmount?.toLocaleString('en-IN')}</strong></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Special Instructions */}
              {order.specialInstructions && (
                <div className={styles.detailsSection}>
                  <h4>📝 Special Instructions</h4>
                  <div className={styles.instructionsBox}>
                    {order.specialInstructions}
                  </div>
                </div>
              )}

              {/* Payment Summary */}
              <div className={styles.detailsSection}>
                <h4>💰 Payment Summary</h4>
                <div className={styles.paymentSummaryTable}>
                  <div className={styles.summaryRow}>
                    <span>Subtotal:</span>
                    <span>₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                  </div>
                  {order.payment?.advanceAmount > 0 && (
                    <>
                      <div className={styles.summaryRow}>
                        <span>Advance Paid:</span>
                        <span className={styles.paidAmount}>-₹{order.payment.advanceAmount?.toLocaleString('en-IN')}</span>
                      </div>
                      <div className={styles.summaryRow}>
                        <span>Remaining Amount:</span>
                        <span className={styles.remainingAmount}>₹{order.payment.remainingAmount?.toLocaleString('en-IN')}</span>
                      </div>
                    </>
                  )}
                  <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                    <span><strong>Total Amount:</strong></span>
                    <span><strong>₹{order.totalAmount?.toLocaleString('en-IN')}</strong></span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Payment Status:</span>
                    <span className={`${styles.paymentBadge} ${styles[order.payment?.status || 'pending']}`}>
                      {(order.payment?.status || 'pending').replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Payment Method:</span>
                    <span>{(order.payment?.method || 'manual').toUpperCase()}</span>
                  </div>
                </div>
              </div>

              {/* Payment History */}
              {order.payment?.history && order.payment.history.length > 0 && (
                <div className={styles.detailsSection}>
                  <h4>📜 Payment History</h4>
                  <div className={styles.historyList}>
                    {order.payment.history.map((entry, index) => (
                      <div key={index} className={styles.historyItem}>
                        <div className={styles.historyTime}>
                          {new Date(entry.timestamp).toLocaleString()}
                        </div>
                        <div className={styles.historyDetails}>
                          <strong>{entry.action.replace('_', ' ').toUpperCase()}</strong>
                          {entry.amount > 0 && ` - ₹${entry.amount.toLocaleString('en-IN')}`}
                          {entry.method && ` via ${entry.method.toUpperCase()}`}
                          {entry.notes && <div className={styles.historyNotes}>{entry.notes}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className={styles.modalFooter}>
              <button 
                className={styles.printBtn}
                onClick={() => window.print()}
              >
                🖨️ Print Order
              </button>
              <button 
                className={styles.closeBtn}
                onClick={() => setShowDetailsModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.cardActions}>
        <button 
          className={styles.viewDetailsBtn}
          onClick={() => setShowDetailsModal(true)}
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
