// src/pages/OrderConfirmation.js - Enhanced Version with Tables
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './OrderConfirmation.module.css';
import { GlobalHeader, GlobalFooter } from '../components/GlobalHeader&Footer';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    orderItems = [],
    deliveryInfo = {},
    orderTotal = 0,
    orderId = 'FUDO-' + Date.now(),
    orderReference = '',
    paymentMethod = 'cod',
    orderType = 'bulk',
    businessContact = '+91 8919354409',
    estimatedPreparation = 60
  } = location.state || {};

  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
    
    // Optional: Send confirmation email or SMS here
    // sendOrderConfirmation(orderId, deliveryInfo, orderItems);
  }, []);

  const handleBackToHome = () => {
    // Clear any remaining cart data
    localStorage.removeItem('cart');
    navigate('/', { replace: true });
  };

  const handleTrackOrder = () => {
    // In a real app, this would redirect to order tracking
    alert(`Order tracking will be available soon. Contact us at ${businessContact} for updates.`);
  };

  const handleReorder = () => {
    if (orderType === 'meal-box') {
      navigate('/meal-boxes');
    } else {
      navigate('/bulk-orders');
    }
  };

  const handlePrintOrder = () => {
    window.print();
  };

  // Calculate some order statistics
  const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  const hasMealBoxes = orderItems.some(item => item.type === 'meal-box');
  const hasPlatter = orderItems.some(item => item.type === 'platter');

  // Calculate estimated delivery date/time
  const getEstimatedDelivery = () => {
    if (deliveryInfo.eventDate && deliveryInfo.eventTime) {
      return `${deliveryInfo.eventDate} at ${deliveryInfo.eventTime}`;
    }
    const deliveryDate = new Date();
    deliveryDate.setMinutes(deliveryDate.getMinutes() + estimatedPreparation);
    return deliveryDate.toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  if (orderItems.length === 0) {
    return (
      <div className={styles.wrapper}>
        <GlobalHeader />
        <main className={styles.main}>
          <div className={styles.emptyState}>
            <h2>No Order Found</h2>
            <p>Please place an order first.</p>
            <button onClick={handleBackToHome} className={styles.primaryBtn}>
              Go to Home
            </button>
          </div>
        </main>
        <GlobalFooter />
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <GlobalHeader />
      <main className={styles.main}>
        <div className={styles.confirmationContainer}>
          {/* Success Header */}
          <div className={styles.successHeader}>
            <div className={styles.successIcon}>✅</div>
            <h1 className={styles.successTitle}>Order Confirmed!</h1>
            <p className={styles.successMessage}>
              Thank you for your order. We've received your request and will contact you shortly to confirm the details.
            </p>
          </div>

          {/* Order Reference Card */}
          <div className={styles.orderReferenceCard}>
            <div className={styles.referenceItem}>
              <span className={styles.referenceLabel}>Order ID:</span>
              <span className={styles.referenceValue}>{orderId}</span>
            </div>
            {orderReference && (
              <div className={styles.referenceItem}>
                <span className={styles.referenceLabel}>Reference Number:</span>
                <span className={styles.referenceValue}>{orderReference}</span>
              </div>
            )}
            <div className={styles.referenceItem}>
              <span className={styles.referenceLabel}>Order Date:</span>
              <span className={styles.referenceValue}>
                {new Date().toLocaleString('en-IN', { 
                  dateStyle: 'medium', 
                  timeStyle: 'short' 
                })}
              </span>
            </div>
          </div>

          {/* Order Items Section with Table */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>📦</span>
              Items Ordered
            </h2>
            <div className={styles.tableContainer}>
              <table className={styles.itemsTable}>
                <thead>
                  <tr>
                    <th>Item Details</th>
                    <th>Type</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total Price</th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((item, index) => (
                    <React.Fragment key={index}>
                      <tr className={styles.itemRow}>
                        <td className={styles.itemDetails}>
                          <div className={styles.itemName}>
                            {item.mealBoxName || item.platterName}
                          </div>
                          {item.cuisine && (
                            <div className={styles.itemMeta}>
                              🍽️ {item.cuisine}
                            </div>
                          )}
                          {item.mealType && (
                            <div className={styles.itemMeta}>
                              {item.mealType === 'veg' ? '🥬 Vegetarian' : '🍗 Non-Vegetarian'}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className={styles.badge}>
                            {item.type === 'meal-box' ? 'Meal Box' : 'Platter'}
                          </span>
                        </td>
                        <td className={styles.quantity}>
                          {item.quantity} {item.type === 'meal-box' ? 'boxes' : 'plates'}
                        </td>
                        <td className={styles.price}>
                          ₹{item.basePrice?.toLocaleString('en-IN') || 0}
                        </td>
                        <td className={styles.totalPrice}>
                          ₹{item.totalPrice?.toLocaleString('en-IN') || 0}
                        </td>
                      </tr>
                      {item.selections && item.selections.length > 0 && (
                        <tr className={styles.selectionsRow}>
                          <td colSpan="5">
                            <div className={styles.selectionsContainer}>
                              <strong className={styles.selectionsTitle}>Selected Items:</strong>
                              <div className={styles.selectionsList}>
                                {item.selections.map((category, idx) => (
                                  <div key={idx} className={styles.categorySelection}>
                                    <span className={styles.categoryName}>
                                      {category.categoryName}:
                                    </span>
                                    <span className={styles.categoryItems}>
                                      {category.items.map(selItem => selItem.name).join(', ')}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
                <tfoot>
                  <tr className={styles.summaryRow}>
                    <td colSpan="2"><strong>Total Items:</strong></td>
                    <td><strong>{orderItems.length}</strong></td>
                    <td><strong>Total Quantity:</strong></td>
                    <td><strong>{totalItems} {hasPlatter ? 'plates' : 'boxes'}</strong></td>
                  </tr>
                  <tr className={styles.totalRow}>
                    <td colSpan="4"><strong>Grand Total:</strong></td>
                    <td><strong>₹{orderTotal.toLocaleString('en-IN')}</strong></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          {/* Order Summary Table */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>📋</span>
              Order Summary
            </h2>
            <div className={styles.tableContainer}>
              <table className={styles.summaryTable}>
                <tbody>
                  <tr>
                    <td className={styles.summaryLabel}>Order Type:</td>
                    <td className={styles.summaryValue}>
                      {orderType === 'meal-box' ? 'Meal Boxes' : orderType === 'platter' ? 'Platters' : 'Mixed Order'}
                    </td>
                  </tr>
                  <tr>
                    <td className={styles.summaryLabel}>Total Items:</td>
                    <td className={styles.summaryValue}>{orderItems.length}</td>
                  </tr>
                  <tr>
                    <td className={styles.summaryLabel}>Total Quantity:</td>
                    <td className={styles.summaryValue}>{totalItems} {hasPlatter ? 'plates' : 'boxes'}</td>
                  </tr>
                  <tr>
                    <td className={styles.summaryLabel}>Payment Method:</td>
                    <td className={styles.summaryValue}>
                      {paymentMethod === 'cod' ? '💵 Cash on Delivery' : '💳 Online Payment'}
                    </td>
                  </tr>
                  <tr className={styles.totalSummaryRow}>
                    <td className={styles.summaryLabel}><strong>Total Amount:</strong></td>
                    <td className={styles.summaryValue}><strong>₹{orderTotal.toLocaleString('en-IN')}</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Delivery Information Section with Table */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>🚚</span>
              Delivery Information
            </h2>
            <div className={styles.tableContainer}>
              <table className={styles.infoTable}>
                <tbody>
                  <tr>
                    <td className={styles.infoLabel}>Customer Name:</td>
                    <td className={styles.infoValue}>{deliveryInfo.name}</td>
                  </tr>
                  <tr>
                    <td className={styles.infoLabel}>Phone Number:</td>
                    <td className={styles.infoValue}>
                      <a href={`tel:${deliveryInfo.phone}`}>{deliveryInfo.phone}</a>
                    </td>
                  </tr>
                  <tr>
                    <td className={styles.infoLabel}>Email Address:</td>
                    <td className={styles.infoValue}>
                      <a href={`mailto:${deliveryInfo.email}`}>{deliveryInfo.email}</a>
                    </td>
                  </tr>
                  <tr>
                    <td className={styles.infoLabel}>Delivery Address:</td>
                    <td className={styles.infoValue}>{deliveryInfo.address}</td>
                  </tr>
                  <tr>
                    <td className={styles.infoLabel}>Pincode:</td>
                    <td className={styles.infoValue}>{deliveryInfo.pincode}</td>
                  </tr>
                  {deliveryInfo.eventDate && (
                    <tr>
                      <td className={styles.infoLabel}>Event Date & Time:</td>
                      <td className={styles.infoValue}>
                        📅 {deliveryInfo.eventDate} at {deliveryInfo.eventTime}
                      </td>
                    </tr>
                  )}
                  {deliveryInfo.specialInstructions && (
                    <tr>
                      <td className={styles.infoLabel}>Special Instructions:</td>
                      <td className={styles.infoValue}>{deliveryInfo.specialInstructions}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Payment Details Section */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>💳</span>
              Payment Details
            </h2>
            <div className={styles.paymentCard}>
              <div className={styles.paymentMethod}>
                <span className={styles.paymentIcon}>
                  {paymentMethod === 'cod' ? '💵' : '💳'}
                </span>
                <div className={styles.paymentInfo}>
                  <strong>
                    {paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                  </strong>
                  <p className={styles.paymentNote}>
                    {paymentMethod === 'cod' 
                      ? 'Pay when your order arrives' 
                      : 'Payment will be processed after order confirmation'}
                  </p>
                </div>
              </div>
              <div className={styles.paymentAmount}>
                <span className={styles.amountLabel}>Amount Payable:</span>
                <span className={styles.amountValue}>₹{orderTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </section>

          {/* Estimated Timeline Section */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>⏱️</span>
              Estimated Timeline
            </h2>
            <div className={styles.timelineContainer}>
              <div className={styles.timelineItem}>
                <div className={styles.timelineIcon}>📞</div>
                <div className={styles.timelineContent}>
                  <strong>Confirmation Call</strong>
                  <p>Within 15 minutes</p>
                </div>
              </div>
              <div className={styles.timelineDivider}>→</div>
              <div className={styles.timelineItem}>
                <div className={styles.timelineIcon}>👨‍🍳</div>
                <div className={styles.timelineContent}>
                  <strong>Preparation</strong>
                  <p>{estimatedPreparation} minutes</p>
                </div>
              </div>
              <div className={styles.timelineDivider}>→</div>
              <div className={styles.timelineItem}>
                <div className={styles.timelineIcon}>🚚</div>
                <div className={styles.timelineContent}>
                  <strong>Delivery</strong>
                  <p>{getEstimatedDelivery()}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Information Section */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              <span className={styles.sectionIcon}>📞</span>
              Questions or Changes?
            </h2>
            <div className={styles.contactGrid}>
              <div className={styles.contactCard}>
                <h3 className={styles.contactLocation}>📍 Hyderabad</h3>
                <div className={styles.contactNumbers}>
                  <a href="tel:+918919354409" className={styles.contactLink}>
                    +91 8919354409
                  </a>
                  <a href="tel:+919703344431" className={styles.contactLink}>
                    +91 9703344431
                  </a>
                </div>
              </div>
              <div className={styles.contactCard}>
                <h3 className={styles.contactLocation}>📍 Khammam</h3>
                <div className={styles.contactNumbers}>
                  <a href="tel:+917396081234" className={styles.contactLink}>
                    +91 7396081234
                  </a>
                  <a href="tel:+919246946473" className={styles.contactLink}>
                    +91 9246946473
                  </a>
                </div>
              </div>
            </div>
            <p className={styles.contactNote}>
              Our team will call you shortly to confirm your order details and delivery time.
            </p>
          </section>

          {/* Action Buttons */}
          <div className={styles.actionButtons}>
            <button onClick={handlePrintOrder} className={styles.secondaryBtn}>
              🖨️ Print Order
            </button>
            <button onClick={handleTrackOrder} className={styles.secondaryBtn}>
              📱 Track Order
            </button>
            <button onClick={handleReorder} className={styles.secondaryBtn}>
              🔄 Order Again
            </button>
            <button onClick={handleBackToHome} className={styles.primaryBtn}>
              🏠 Back to Home
            </button>
          </div>
        </div>
      </main>
      <GlobalFooter />
    </div>
  );
};

export default OrderConfirmation;
