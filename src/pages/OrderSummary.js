// src/pages/OrderSummary.js (Enhanced for Real MealBox Data Structure)
import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './OrderSummary.module.css';
import { GlobalHeader, GlobalFooter } from '../components/GlobalHeader&Footer';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const OrderSummary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { 
    customizations = {}, 
    orderTotal = 0, 
    totalQuantity = 0, 
    orderType = 'bulk', 
    preFilledData = {},
    fromCart = false 
  } = location.state || {};

  const [deliveryInfo, setDeliveryInfo] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    pincode: preFilledData.pincode || '',
    eventDate: '',
    eventTime: '',
    specialInstructions: ''
  });
  
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [loading, setLoading] = useState(false);

  // Enhanced orderItems structure aligned with real meal box data
  const orderItems = useMemo(() => {
    return Object.values(customizations).map(customization => {
      // Handle MealBox orders with real data structure
      if (customization.mealBox) {
        const mealBox = customization.mealBox;
        const quantity = customization.quantity || 4; // Real minimum orders vary by box type
        const mealType = customization.mealType || 'veg';
        const compartmentSelections = customization.compartmentSelections || {};
        
        const basePrice = mealBox.pricing?.[mealType]?.basePrice || 0;
        let extrasTotal = 0;
        
        // Format compartment selections for admin system based on real structure
        const selections = [];
        
        Object.entries(compartmentSelections).forEach(([compartmentCategory, selectedItems]) => {
          if (selectedItems && selectedItems.length > 0) {
            // Use proper category display names from real data
            const categoryDisplayNames = {
              'flavored-rice': 'Flavored Rice',
              'curry': 'Curry', 
              'appetizer': 'Appetizer',
              'crispy-fry': 'Crispy Fry',
              'dessert': 'Dessert',
              'extras': 'Extras',
              'plain-rice': 'Plain Rice'
            };
            
            const categorySelection = {
              categoryName: categoryDisplayNames[compartmentCategory] || compartmentCategory,
              items: selectedItems.map(item => {
                extrasTotal += item.extraPrice || 0;
                return {
                  name: item.name,
                  extraPrice: item.extraPrice || 0,
                  isDefault: item.isDefault || false
                };
              })
            };
            selections.push(categorySelection);
          }
        });

        const totalPrice = (basePrice + extrasTotal) * quantity;

        return {
          mealBoxId: mealBox.id,
          mealBoxName: mealBox.name,
          mealType: mealType,
          imageUrl: mealBox.media?.imageUrl,
          quantity,
          basePrice,
          totalPrice,
          selections,
          type: 'meal-box',
          compartments: mealBox.configuration?.totalCompartments,
          // Real business rules from meal box data
          minimumOrder: mealBox.businessRules?.minimumOrder,
          preparationTime: mealBox.businessRules?.preparationTime
        };
      }
      
      // Handle regular Platter orders (existing logic)
      const platter = customization.platter;
      const quantity = customization.quantity || 15;
      const categories = customization.categories || {};
      
      const basePrice = platter.price?.base || 0;
      let extrasTotal = 0;
      
      const selections = [];
      
      Object.entries(categories).forEach(([categoryKey, selectedItems]) => {
        if (selectedItems && selectedItems.length > 0) {
          const categoryData = platter.categories?.[categoryKey];
          const categoryName = categoryData?.displayName || categoryKey;
          
          const categorySelection = {
            categoryName,
            items: selectedItems.map(item => {
              extrasTotal += item.extraPrice || 0;
              return {
                name: item.name,
                extraPrice: item.extraPrice || 0
              };
            })
          };
          selections.push(categorySelection);
        }
      });

      const totalPrice = (basePrice + extrasTotal) * quantity;

      return {
        platterId: platter.id,
        platterName: platter.name,
        cuisine: platter.cuisine,
        imageUrl: platter.imageUrl,
        quantity,
        basePrice,
        totalPrice,
        selections,
        type: 'platter'
      };
    });
  }, [customizations]);

  const isOrderComplete = useMemo(() => {
    return deliveryInfo.name && 
           deliveryInfo.phone && 
           deliveryInfo.email && 
           deliveryInfo.address && 
           deliveryInfo.eventDate && 
           deliveryInfo.eventTime && 
           orderItems.length > 0;
  }, [deliveryInfo, orderItems]);

  const handleInputChange = (field, value) => {
    setDeliveryInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Enhanced Firebase save with meal box support aligned to real data
  const handleSubmitOrder = async () => {
    if (!isOrderComplete) {
      alert('Please fill in all required fields.');
      return;
    }

    setLoading(true);

    try {
      // Create order data structure aligned with real meal box data
      const orderData = {
        customerId: 'guest',
        customerInfo: {
          name: deliveryInfo.name,
          phone: deliveryInfo.phone,
          email: deliveryInfo.email,
          address: deliveryInfo.address,
          pincode: deliveryInfo.pincode
        },
        items: orderItems.map(item => ({
          ...item,
          // Add meal box specific fields for admin processing
          ...(item.type === 'meal-box' && {
            mealBoxType: item.mealBoxName,
            compartmentCount: item.compartments,
            mealPreference: item.mealType,
            minimumOrderQuantity: item.minimumOrder,
            estimatedPreparationTime: item.preparationTime
          })
        })),
        totalAmount: orderTotal,
        totalQuantity: orderItems.reduce((sum, item) => sum + item.quantity, 0),
        status: 'pending',
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
        eventDate: deliveryInfo.eventDate,
        eventTime: deliveryInfo.eventTime,
        specialInstructions: deliveryInfo.specialInstructions || '',
        orderType: orderType,
        // Business location routing based on real contact info
        businessLocation: 'hyderabad', // Can be dynamic based on delivery address
        contactNumbers: {
          hyderabad: ["+91 8919354409", "+91 9703344431"],
          khammam: ["+91 7396081234", "+91 9246946473"]
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      console.log('📝 Saving real meal box order data:', orderData);

      const orderDoc = await addDoc(collection(db, 'orders'), orderData);
      
      console.log('✅ Real meal box order saved with ID:', orderDoc.id);

      if (fromCart) {
        localStorage.setItem('cart', JSON.stringify([]));
      }

      navigate('/order-confirmation', {
        state: {
          orderId: orderDoc.id,
          orderItems,
          deliveryInfo,
          orderTotal,
          paymentMethod,
          orderType,
          businessContact: "+91 8919354409" // Real business number
        }
      });

    } catch (error) {
      console.error('❌ Error placing real meal box order:', error);
      
      let errorMessage = 'Failed to place order. ';
      if (error.code === 'permission-denied') {
        errorMessage += 'Please check your internet connection and try again.';
      } else {
        errorMessage += 'Please try again or contact us at +91 8919354409.';
      }
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced empty state handling
  if (Object.keys(customizations).length === 0) {
    return (
      <div className={styles.wrapper}>
        <GlobalHeader />
        <div className={styles.main}>
          <div className={styles.emptyState}>
            <h2>No order items found</h2>
            <p>Please go back and complete your order customization.</p>
            <div className={styles.emptyStateActions}>
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
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Order Summary</h1>
          <p className={styles.pageDescription}>
            Review your {orderType === 'meal-box' ? 'meal box' : 
                         orderType === 'mixed' ? 'mixed' : 'platter'} order and provide delivery information
          </p>
        </div>

        <div className={styles.summaryContainer}>
          <div className={styles.orderDetails}>
            {/* Order Items Section */}
            <section className={styles.itemsSection}>
              <h2 className={styles.sectionTitle}>Order Items</h2>
              
              {orderItems.map((item, index) => (
                <div key={index} className={styles.orderItem}>
                  <img 
                    src={item.imageUrl || '/assets/meal-box-placeholder.jpg'} 
                    alt={item.mealBoxName || item.platterName}
                    className={styles.itemImage}
                    onError={(e) => {
                      e.target.src = '/assets/meal-box-placeholder.jpg';
                    }}
                  />
                  
                  <div className={styles.itemDetails}>
                    <h3 className={styles.itemName}>
                      {item.mealBoxName || item.platterName}
                      {item.type === 'meal-box' && (
                        <span className={styles.itemType}>
                          🍱 {item.compartments} Compartments
                        </span>
                      )}
                      {item.type === 'platter' && (
                        <span className={styles.itemType}>
                          🍽️ {item.cuisine}
                        </span>
                      )}
                    </h3>
                    
                    {/* Display meal type for meal boxes */}
                    {item.type === 'meal-box' && (
                      <p className={styles.mealType}>
                        {item.mealType === 'veg' ? '🥬 Vegetarian' : '🍗 Non-Vegetarian'}
                      </p>
                    )}
                    
                    <p className={styles.itemQuantity}>
                      {item.quantity} {item.type === 'meal-box' ? 'boxes' : 'plates'}
                      {item.type === 'meal-box' && item.minimumOrder && (
                        <span className={styles.minOrder}>
                          (Min: {item.minimumOrder})
                        </span>
                      )}
                    </p>
                    
                    {/* Enhanced selections display */}
                    {item.selections.length > 0 && (
                      <div className={styles.selectedItems}>
                        <h4 className={styles.selectionsTitle}>
                          {item.type === 'meal-box' ? 'Compartment Selections:' : 'Your Selections:'}
                        </h4>
                        <div className={styles.selectionsList}>
                          {item.selections.map((selection, selIndex) => (
                            <div key={selIndex} className={styles.selectionCategory}>
                              <strong>{selection.categoryName}:</strong>
                              <span className={styles.selectionItems}>
                                {selection.items.map((selItem, itemIndex) => (
                                  <span key={itemIndex} className={styles.selectionItem}>
                                    {selItem.name}
                                    {selItem.isDefault && <span className={styles.defaultTag}> (Default)</span>}
                                    {selItem.extraPrice > 0 && <span className={styles.extraPrice}> (+₹{selItem.extraPrice})</span>}
                                  </span>
                                )).reduce((prev, curr) => [prev, ', ', curr])}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className={styles.itemPrice}>
                    <div className={styles.price}>₹{item.totalPrice.toLocaleString('en-IN')}</div>
                    {item.type === 'meal-box' && item.preparationTime && (
                      <div className={styles.prepTime}>
                        ⏱️ {item.preparationTime.min}-{item.preparationTime.max} min
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </section>

            {/* Delivery Information Section */}
            <section className={styles.deliverySection}>
              <h2 className={styles.sectionTitle}>Delivery Information</h2>
              
              <div className={styles.deliveryForm}>
                <div className={styles.formRow}>
                  <input
                    type="text"
                    placeholder="Full Name*"
                    value={deliveryInfo.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={styles.formInput}
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number*"
                    value={deliveryInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={styles.formInput}
                    required
                  />
                </div>
                
                <div className={styles.formRow}>
                  <input
                    type="email"
                    placeholder="Email Address*"
                    value={deliveryInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={styles.formInput}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Pincode"
                    value={deliveryInfo.pincode}
                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                    className={styles.formInput}
                  />
                </div>
                
                <textarea
                  placeholder="Complete Address*"
                  value={deliveryInfo.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className={styles.formTextarea}
                  required
                />
                
                <div className={styles.formRow}>
                  <input
                    type="date"
                    placeholder="Event Date*"
                    value={deliveryInfo.eventDate}
                    onChange={(e) => handleInputChange('eventDate', e.target.value)}
                    className={styles.formInput}
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <input
                    type="time"
                    placeholder="Event Time*"
                    value={deliveryInfo.eventTime}
                    onChange={(e) => handleInputChange('eventTime', e.target.value)}
                    className={styles.formInput}
                    required
                  />
                </div>
                
                <textarea
                  placeholder="Special Instructions (Optional)"
                  value={deliveryInfo.specialInstructions}
                  onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                  className={styles.formTextarea}
                />
              </div>
            </section>
          </div>

          {/* Order Summary Card */}
          <div className={styles.orderSummaryCard}>
            <h3 className={styles.summaryTitle}>Order Summary</h3>
            
            <div className={styles.summaryBreakdown}>
              <div className={styles.summaryRow}>
                <span>Items</span>
                <span>{orderItems.length}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Total Units</span>
                <span>
                  {orderItems.reduce((sum, item) => sum + item.quantity, 0)}
                  {orderItems.every(item => item.type === 'meal-box') ? ' boxes' : 
                   orderItems.every(item => item.type !== 'meal-box') ? ' plates' : ' items'}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span>Order Type</span>
                <span className={styles.orderTypeBadge}>
                  {orderType === 'meal-box' ? '🍱 Meal Boxes' : 
                   orderType === 'mixed' ? '🍽️🍱 Mixed Order' : 
                   '🍽️ Platters'}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>₹{orderTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                <span>Total Amount</span>
                <span>₹{orderTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Contact Information */}
            <div className={styles.contactInfo}>
              <h4 className={styles.contactTitle}>Questions?</h4>
              <div className={styles.contactNumbers}>
                <div className={styles.contactNumber}>
                  📍 Hyderabad: +91 8919354409
                </div>
                <div className={styles.contactNumber}>
                  📍 Khammam: +91 7396081234
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className={styles.paymentMethods}>
              <h4 className={styles.paymentTitle}>Payment Method</h4>
              <div className={styles.paymentOptions}>
                <label className={styles.paymentOption}>
                  <input
                    type="radio"
                    name="payment"
                    value="online"
                    checked={paymentMethod === 'online'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  💳 Online Payment
                </label>
                <label className={styles.paymentOption}>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  💵 Cash on Delivery
                </label>
              </div>
            </div>

            <button 
              className={styles.placeOrderBtn}
              onClick={handleSubmitOrder}
              disabled={!isOrderComplete || loading}
            >
              {loading ? 'Placing Order...' : 'Place Order'}
            </button>
          </div>
        </div>
      </div>

      <GlobalFooter />
    </div>
  );
};

export default OrderSummary;
