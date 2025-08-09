import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { GlobalHeader, GlobalFooter } from "../components/GlobalHeader&Footer";
import styles from "./CheckoutPage.module.css";

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Enhanced to handle both platter and meal box data
  const { orderItems = [], orderTotal = 0, orderType = 'bulk' } = location.state || {};
  const popupAddress = location.state?.addressInfo || {};

  const [address, setAddress] = useState({
    name: "",
    phone: "",
    pincode: popupAddress.pincode || "",
    locality: popupAddress.locality || "",
    city: popupAddress.city || "",
    street: "",
    landmark: "",
    eventDate: "",
    eventTime: "",
    specialInstructions: ""
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);

  // Handle input changes
  function handleChange(e) {
    setAddress({
      ...address,
      [e.target.name]: e.target.value
    });
  }

  // Enhanced finish handler for real meal box orders
  function handleFinish() {
    // Validate required fields
    if (!address.name || !address.phone || !address.eventDate || !address.eventTime) {
      alert('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    // Simulate order processing
    setTimeout(() => {
      // Calculate total items and preparation time based on order type
      const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);
      const isMealBoxOrder = orderItems.some(item => item.type === 'meal-box');
      const maxPrepTime = orderItems.reduce((max, item) => {
        if (item.type === 'meal-box' && item.preparationTime) {
          return Math.max(max, item.preparationTime.max || 60);
        }
        return Math.max(max, 45); // Default platter prep time
      }, 30);

      alert(
        `Order placed successfully!\n\n` +
        `Order Type: ${orderType === 'meal-box' ? 'Meal Boxes' : 
                      orderType === 'mixed' ? 'Mixed Order' : 'Platters'}\n` +
        `Total Items: ${totalItems} ${isMealBoxOrder ? 'boxes/items' : 'plates'}\n` +
        `Total Amount: ₹${orderTotal.toLocaleString('en-IN')}\n` +
        `Estimated Preparation: ${maxPrepTime} minutes\n` +
        `Payment: ${paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}\n\n` +
        `Contact: ${address.pincode?.startsWith('50') ? '+91 8919354409 (Hyderabad)' : '+91 7396081234 (Khammam)'}\n\n` +
        `We'll call you to confirm the order details.`
      );
      
      navigate("/order-confirmation", {
        state: {
          orderId: `FUDO-${Date.now()}`,
          orderItems,
          deliveryInfo: address,
          orderTotal,
          paymentMethod,
          orderType,
          estimatedPreparation: maxPrepTime
        }
      });
      
      setLoading(false);
    }, 2000);
  }

  // Enhanced empty state
  if (!orderItems || orderItems.length === 0) {
    return (
      <div className={styles.wrapper}>
        <GlobalHeader />
        <div className={styles.main}>
          <div className={styles.emptyState}>
            <h2>No items to checkout</h2>
            <p>Please add items to your cart first.</p>
            <div className={styles.actionButtons}>
              <button onClick={() => navigate('/bulk-orders')}>
                Browse Platters
              </button>
              <button onClick={() => navigate('/meal-boxes')}>
                Browse Meal Boxes
              </button>
            </div>
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
        <div className={styles.checkoutHeader}>
          <h1>Checkout - {orderType === 'meal-box' ? 'Meal Boxes' : 
                              orderType === 'mixed' ? 'Mixed Order' : 'Platters'}</h1>
          <p>Complete your order with delivery details</p>
        </div>

        <div className={styles.checkoutContainer}>
          {/* Order Summary Section */}
          <div className={styles.orderSummarySection}>
            <h2>Order Summary</h2>
            <div className={styles.orderItems}>
              {orderItems.map((item, index) => (
                <div key={index} className={styles.checkoutItem}>
                  <div className={styles.itemInfo}>
                    <h3>{item.mealBoxName || item.platterName}</h3>
                    <p>
                      {item.type === 'meal-box' ? (
                        <>🍱 {item.compartments} Compartments • {item.mealType === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'}</>
                      ) : (
                        <>🍽️ {item.cuisine}</>
                      )}
                    </p>
                  </div>
                  <div className={styles.itemQuantity}>
                    {item.quantity} {item.type === 'meal-box' ? 'boxes' : 'plates'}
                  </div>
                  <div className={styles.itemPrice}>
                    ₹{item.totalPrice.toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
            <div className={styles.orderTotal}>
              <strong>Total: ₹{orderTotal.toLocaleString('en-IN')}</strong>
            </div>
          </div>

          {/* Delivery Form */}
          <div className={styles.deliveryForm}>
            <h2>Delivery Information</h2>
            
            <div className={styles.formGroup}>
              <input
                type="text"
                name="name"
                placeholder="Full Name*"
                value={address.name}
                onChange={handleChange}
                required
              />
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number*"
                value={address.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <input
                type="text"
                name="pincode"
                placeholder="Pincode"
                value={address.pincode}
                onChange={handleChange}
              />
              <input
                type="text"
                name="city"
                placeholder="City"
                value={address.city}
                onChange={handleChange}
              />
            </div>

            <input
              type="text"
              name="street"
              placeholder="Street Address*"
              value={address.street}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="landmark"
              placeholder="Landmark (Optional)"
              value={address.landmark}
              onChange={handleChange}
            />

            <div className={styles.formGroup}>
              <input
                type="date"
                name="eventDate"
                value={address.eventDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
              />
              <input
                type="time"
                name="eventTime"
                value={address.eventTime}
                onChange={handleChange}
                required
              />
            </div>

            <textarea
              name="specialInstructions"
              placeholder="Special Instructions (Optional)"
              value={address.specialInstructions}
              onChange={handleChange}
              rows={3}
            />

            {/* Payment Method Selection */}
            <div className={styles.paymentSection}>
              <h3>Payment Method</h3>
              <div className={styles.paymentOptions}>
                <label className={styles.paymentOption}>
                  <input
                    type="radio"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  💵 Cash on Delivery
                </label>
                <label className={styles.paymentOption}>
                  <input
                    type="radio"
                    value="online"
                    checked={paymentMethod === 'online'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  💳 Online Payment
                </label>
              </div>
            </div>

            {/* Contact Information */}
            <div className={styles.contactInfo}>
              <h3>Questions? Contact Us:</h3>
              <div className={styles.contactNumbers}>
                <p>📍 Hyderabad: +91 8919354409 / +91 9703344431</p>
                <p>📍 Khammam: +91 7396081234 / +91 9246946473</p>
              </div>
            </div>

            <button 
              className={styles.placeOrderBtn} 
              onClick={handleFinish}
              disabled={loading}
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>

      <GlobalFooter />
    </div>
  );
}
