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

  // Calculate some order statistics
  const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  const hasMealBoxes = orderItems.some(item => item.type === 'meal-box');
  const hasPlatter = orderItems.some(item => item.type === 'platter');

  if (orderItems.length === 0) {
    return (
      <div className={styles.wrapper}>
        <GlobalHeader />
        <div className={styles.main}>
          <div className={styles.emptyState}>
            <h2>No order information available.</h2>
            <p>Please place an order first.</p>
            <button onClick={() => navigate('/')}>
              Go to Home
            </button>
          </div>
        </div>
        <GlobalFooter />
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <GlobalHeader />
      
      <div className={styles.main}>
        <div className={styles.confirmationContainer}>
          {/* Success Header */}
          <div className={styles.successHeader}>
            <div className={styles.successIcon}>✅</div>
            <h1 className={styles.successTitle}>Order Confirmed!</h1>
            <p className={styles.successMessage}>
              Thank you for your order. We've received your request and will contact you shortly to confirm the details.
            </p>
          </div>

          {/* Order Details Card */}
          <div className={styles.orderDetailsCard}>
            <div className={styles.orderHeader}>
              <h2>Order Details</h2>
              <div className={styles.orderId}>
                Order ID: <strong>{orderId}</strong>
              </div>
            </div>

            {/* Order Items */}
            <div className={styles.orderItemsSection}>
              <h3>Items Ordered</h3>
              <div className={styles.itemsList}>
                {orderItems.map((item, index) => (
                  <div key={index} className={styles.confirmationItem}>
                    <div className={styles.itemDetails}>
                      <h4 className={styles.itemName}>
                        {item.mealBoxName || item.platterName}
                        {item.type === 'meal-box' && (
                          <span className={styles.itemBadge}>
                            🍱 {item.compartments} Compartments
                          </span>
                        )}
                        {item.type === 'platter' && (
                          <span className={styles.itemBadge}>
                            🍽️ {item.cuisine}
                          </span>
                        )}
                      </h4>
                      
                      {item.type === 'meal-box' && (
                        <p className={styles.mealType}>
                          {item.mealType === 'veg' ? '🥬 Vegetarian' : '🍗 Non-Vegetarian'}
                        </p>
                      )}
                      
                      <div className={styles.itemMeta}>
                        <span>Quantity: {item.quantity} {item.type === 'meal-box' ? 'boxes' : 'plates'}</span>
                        {item.minimumOrder && (
                          <span>Min Order: {item.minimumOrder}</span>
                        )}
                        {item.preparationTime && (
                          <span>Prep Time: {item.preparationTime.min}-{item.preparationTime.max} min</span>
                        )}
                      </div>

                      {/* Show selections/compartments */}
                      {item.selections && item.selections.length > 0 && (
                        <div className={styles.itemSelections}>
                          <h5>
                            {item.type === 'meal-box' ? 'Compartment Selections:' : 'Selected Items:'}
                          </h5>
                          {item.selections.map((selection, selIndex) => (
                            <div key={selIndex} className={styles.selectionItem}>
                              <strong>{selection.categoryName}:</strong>
                              <span>{selection.items.map(i => i.name).join(', ')}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className={styles.itemPrice}>
                      ₹{item.totalPrice.toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.orderTotalSection}>
                <div className={styles.orderStats}>
                  <div className={styles.stat}>
                    <span>Total Items:</span>
                    <span>{orderItems.length}</span>
                  </div>
                  <div className={styles.stat}>
                    <span>Total Quantity:</span>
                    <span>
                      {totalItems} {hasMealBoxes && hasPlatter ? 'items' : 
                                   hasMealBoxes ? 'boxes' : 'plates'}
                    </span>
                  </div>
                  <div className={styles.stat}>
                    <span>Order Type:</span>
                    <span>
                      {orderType === 'meal-box' ? 'Meal Boxes' : 
                       orderType === 'mixed' ? 'Mixed Order' : 'Platters'}
                    </span>
                  </div>
                </div>
                <div className={styles.totalAmount}>
                  <strong>Total: ₹{orderTotal.toLocaleString('en-IN')}</strong>
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className={styles.deliveryInfoSection}>
              <h3>Delivery Information</h3>
              <div className={styles.deliveryDetails}>
                <div className={styles.deliveryRow}>
                  <strong>Name:</strong> {deliveryInfo.name}
                </div>
                <div className={styles.deliveryRow}>
                  <strong>Phone:</strong> {deliveryInfo.phone}
                </div>
                <div className={styles.deliveryRow}>
                  <strong>Email:</strong> {deliveryInfo.email}
                </div>
                <div className={styles.deliveryRow}>
                  <strong>Address:</strong> {deliveryInfo.address}
                  {deliveryInfo.pincode && `, ${deliveryInfo.pincode}`}
                </div>
                <div className={styles.deliveryRow}>
                  <strong>Event Date & Time:</strong> {deliveryInfo.eventDate} at {deliveryInfo.eventTime}
                </div>
                {deliveryInfo.specialInstructions && (
                  <div className={styles.deliveryRow}>
                    <strong>Special Instructions:</strong> {deliveryInfo.specialInstructions}
                  </div>
                )}
              </div>
            </div>

            {/* Payment & Timeline */}
            <div className={styles.paymentTimelineSection}>
              <div className={styles.paymentInfo}>
                <h4>Payment Method</h4>
                <p>
                  {paymentMethod === 'cod' ? '💵 Cash on Delivery' : '💳 Online Payment'}
                  {paymentMethod === 'cod' && <small> - Pay when your order arrives</small>}
                </p>
              </div>

              <div className={styles.timeline}>
                <h4>Estimated Timeline</h4>
                <div className={styles.timelineItem}>
                  <span className={styles.timelineIcon}>📞</span>
                  <span>Confirmation Call: Within 15 minutes</span>
                </div>
                <div className={styles.timelineItem}>
                  <span className={styles.timelineIcon}>👨‍🍳</span>
                  <span>Preparation: {estimatedPreparation} minutes</span>
                </div>
                <div className={styles.timelineItem}>
                  <span className={styles.timelineIcon}>🚚</span>
                  <span>Delivery: {deliveryInfo.eventDate} at {deliveryInfo.eventTime}</span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className={styles.contactSection}>
              <h4>Questions or Changes?</h4>
              <div className={styles.contactInfo}>
                <div className={styles.contactItem}>
                  <strong>📍 Hyderabad:</strong>
                  <span>+91 8919354409 / +91 9703344431</span>
                </div>
                <div className={styles.contactItem}>
                  <strong>📍 Khammam:</strong>
                  <span>+91 7396081234 / +91 9246946473</span>
                </div>
              </div>
              <p className={styles.contactNote}>
                Our team will call you shortly to confirm your order details and delivery time.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={styles.actionButtons}>
            <button className={styles.trackOrderBtn} onClick={handleTrackOrder}>
              📱 Track Order
            </button>
            <button className={styles.reorderBtn} onClick={handleReorder}>
              🔄 Order Again
            </button>
            <button className={styles.homeBtn} onClick={handleBackToHome}>
              🏠 Back to Home
            </button>
          </div>
        </div>
      </div>

      <GlobalFooter />
    </div>
  );
};

export default OrderConfirmation;
