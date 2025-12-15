// src/pages/OrderSummary.js - Enhanced with Better Error Handling
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './OrderSummary.module.css';
import { GlobalHeader, GlobalFooter } from '../components/GlobalHeader&Footer';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

// Enhanced Validation utilities with helpful suggestions
const validators = {
  name: (value) => {
    if (!value || value.trim().length === 0) {
      return { error: 'Name is required', suggestion: 'Please enter your full name' };
    }
    if (value.trim().length < 2) {
      return { error: 'Name is too short', suggestion: 'Name must be at least 2 characters long' };
    }
    if (value.trim().length > 50) {
      return { error: 'Name is too long', suggestion: 'Name must be less than 50 characters' };
    }
    if (!/^[a-zA-Z\s.'-]+$/.test(value)) {
      return { error: 'Invalid characters in name', suggestion: 'Name can only contain letters, spaces, dots, hyphens and apostrophes' };
    }
    if (/^\s|\s$/.test(value)) {
      return { error: 'Extra spaces detected', suggestion: 'Remove leading or trailing spaces' };
    }
    return null;
  },

  phone: (value) => {
    if (!value || value.trim().length === 0) {
      return { error: 'Phone number is required', suggestion: 'Please enter your 10-digit mobile number' };
    }
    
    // Remove all non-numeric characters for validation
    const cleanPhone = value.replace(/\D/g, '');
    
    if (cleanPhone.length < 10) {
      return { error: 'Phone number is too short', suggestion: `Please enter ${10 - cleanPhone.length} more digit(s)` };
    }
    if (cleanPhone.length > 10) {
      return { error: 'Phone number is too long', suggestion: 'Phone number should be exactly 10 digits' };
    }
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      return { error: 'Invalid phone number', suggestion: 'Indian mobile numbers start with 6, 7, 8, or 9' };
    }
    return null;
  },

  email: (value) => {
    if (!value || value.trim().length === 0) {
      return { error: 'Email is required', suggestion: 'Please enter your email address' };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      if (!value.includes('@')) {
        return { error: 'Invalid email format', suggestion: 'Email must contain @ symbol (e.g., name@example.com)' };
      }
      if (!value.includes('.')) {
        return { error: 'Invalid email format', suggestion: 'Email must contain a domain (e.g., name@example.com)' };
      }
      return { error: 'Invalid email format', suggestion: 'Please enter a valid email (e.g., name@example.com)' };
    }
    if (value.length > 100) {
      return { error: 'Email is too long', suggestion: 'Email must be less than 100 characters' };
    }
    return null;
  },

  address: (value) => {
  if (!value || value.trim().length === 0) {
    return {
      error: 'Address is required',
      suggestion: 'Please enter your delivery address',
    };
  }
  // No strict format checks; any non-empty value is accepted
  return null;
},


  pincode: (value) => {
    if (!value || value.trim().length === 0) {
      return { error: 'Pincode is required', suggestion: 'Please enter your 6-digit pincode' };
    }
    const cleanPincode = value.replace(/\D/g, '');
    if (cleanPincode.length < 6) {
      return { error: 'Pincode is incomplete', suggestion: `Please enter ${6 - cleanPincode.length} more digit(s)` };
    }
    if (cleanPincode.length > 6) {
      return { error: 'Pincode is too long', suggestion: 'Pincode should be exactly 6 digits' };
    }
    if (!/^\d{6}$/.test(cleanPincode)) {
      return { error: 'Invalid pincode format', suggestion: 'Pincode must be 6 digits (e.g., 500001)' };
    }
    // Basic Indian pincode validation (starts with 1-9)
    if (!/^[1-9]\d{5}$/.test(cleanPincode)) {
      return { error: 'Invalid pincode', suggestion: 'Please enter a valid Indian pincode' };
    }
    return null;
  },

  eventDate: (value) => {
    if (!value || value.trim().length === 0) {
      return { error: 'Event date is required', suggestion: 'Please select the date for your event' };
    }
    
    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 6); // 6 months in advance
    
    if (isNaN(selectedDate.getTime())) {
      return { error: 'Invalid date', suggestion: 'Please select a valid date from the calendar' };
    }
    if (selectedDate < today) {
      return { error: 'Past date selected', suggestion: 'Event date cannot be in the past. Please select today or a future date' };
    }
    if (selectedDate > maxDate) {
      return { error: 'Date too far ahead', suggestion: 'We accept bookings up to 6 months in advance' };
    }
    
    // Check if date is within 24 hours
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (selectedDate < tomorrow) {
      return { 
        error: 'Short notice booking', 
        suggestion: 'For same-day orders, please call us at +91 8919354409',
        type: 'warning'
      };
    }
    
    return null;
  },

  eventTime: (value) => {
    if (!value || value.trim().length === 0) {
      return { error: 'Event time is required', suggestion: 'Please select the time for your event' };
    }
    
    // Parse the time
    const [hours, minutes] = value.split(':').map(Number);
    
    if (isNaN(hours) || isNaN(minutes)) {
      return { error: 'Invalid time format', suggestion: 'Please select a valid time' };
    }
    
    // Check business hours (e.g., 6 AM to 11 PM)
    if (hours < 6 || hours >= 23) {
      return { 
        error: 'Outside service hours', 
        suggestion: 'Please select a time between 6:00 AM and 11:00 PM',
        type: 'warning'
      };
    }
    
    return null;
  }
};

// Toast notification component
const Toast = ({ message, type, onClose }) => (
  <div className={`${styles.toast} ${styles[type]}`}>
    <span>{message}</span>
    <button onClick={onClose} className={styles.toastClose}>×</button>
  </div>
);

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

  // State management
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

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [suggestions, setSuggestions] = useState({});
  const [fieldWarnings, setFieldWarnings] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showAllErrors, setShowAllErrors] = useState(false);

  // Generate unique order reference number
  const generateOrderReference = useCallback(() => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 7);
    return `FUD-${timestamp}-${randomStr}`.toUpperCase();
  }, []);

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      showToast('Connection restored', 'success');
    };
    const handleOffline = () => {
      setIsOnline(false);
      showToast('No internet connection. Your order will be saved when connection is restored.', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Form state persistence
  useEffect(() => {
    const savedForm = localStorage.getItem('orderSummaryDraft');
    if (savedForm) {
      try {
        const parsed = JSON.parse(savedForm);
        setDeliveryInfo(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Failed to restore form data', e);
      }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('orderSummaryDraft', JSON.stringify(deliveryInfo));
    }, 1000);
    return () => clearTimeout(timer);
  }, [deliveryInfo]);

  // Enhanced orderItems with memoization
  const orderItems = useMemo(() => {
    return Object.values(customizations).map(customization => {
      if (customization.mealBox) {
        const mealBox = customization.mealBox;
        const quantity = customization.quantity || 4;
        const mealType = customization.mealType || 'veg';
        const compartmentSelections = customization.compartmentSelections || {};
        const basePrice = mealBox.pricing?.[mealType]?.basePrice || 0;
        let extrasTotal = 0;
        const selections = [];

        const categoryDisplayNames = {
          'flavored-rice': 'Flavored Rice',
          'curry': 'Curry',
          'appetizer': 'Appetizer',
          'crispy-fry': 'Crispy Fry',
          'dessert': 'Dessert',
          'extras': 'Extras',
          'plain-rice': 'Plain Rice'
        };

        Object.entries(compartmentSelections).forEach(([compartmentCategory, selectedItems]) => {
          if (selectedItems?.length > 0) {
            selections.push({
              categoryName: categoryDisplayNames[compartmentCategory] || compartmentCategory,
              items: selectedItems.map(item => {
                extrasTotal += (item.extraPrice || 0);
                return {
                  name: item.name,
                  extraPrice: item.extraPrice || 0,
                  isDefault: item.isDefault || false
                };
              })
            });
          }
        });

        const totalPrice = (basePrice + extrasTotal) * quantity;

        return {
          mealBoxId: mealBox.id,
          mealBoxName: mealBox.name,
          mealType,
          imageUrl: mealBox.media?.imageUrl,
          quantity,
          basePrice,
          totalPrice,
          selections,
          type: 'meal-box',
          compartments: mealBox.configuration?.totalCompartments,
          minimumOrder: mealBox.businessRules?.minimumOrder,
          preparationTime: mealBox.businessRules?.preparationTime,
          priceSnapshot: {
            basePrice,
            extrasTotal,
            total: totalPrice
          }
        };
      }

      // Handle platter orders
      const platter = customization.platter;
      const quantity = customization.quantity || 15;
      const categories = customization.categories || {};
      const basePrice = platter.price?.base || 0;
      let extrasTotal = 0;
      const selections = [];

      Object.entries(categories).forEach(([categoryKey, selectedItems]) => {
        if (selectedItems?.length > 0) {
          const categoryData = platter.categories?.[categoryKey];
          selections.push({
            categoryName: categoryData?.displayName || categoryKey,
            items: selectedItems.map(item => {
              extrasTotal += (item.extraPrice || 0);
              return {
                name: item.name,
                extraPrice: item.extraPrice || 0
              };
            })
          });
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
        type: 'platter',
        priceSnapshot: {
          basePrice,
          extrasTotal,
          total: totalPrice
        }
      };
    });
  }, [customizations]);

  // Show toast notification
  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  }, []);

  // Real-time validation as user types
  const handleInputChange = useCallback((field, value) => {
    setDeliveryInfo(prev => ({ ...prev, [field]: value }));

    // Real-time validation
    if (validators[field]) {
      const validationResult = validators[field](value);
      
      if (validationResult) {
        setErrors(prev => ({ ...prev, [field]: validationResult.error }));
        setSuggestions(prev => ({ ...prev, [field]: validationResult.suggestion }));
        
        if (validationResult.type === 'warning') {
          setFieldWarnings(prev => ({ ...prev, [field]: true }));
        } else {
          setFieldWarnings(prev => ({ ...prev, [field]: false }));
        }
      } else {
        setErrors(prev => ({ ...prev, [field]: null }));
        setSuggestions(prev => ({ ...prev, [field]: null }));
        setFieldWarnings(prev => ({ ...prev, [field]: false }));
      }
    }
  }, []);

  // Handle blur for validation
  const handleBlur = useCallback((field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    if (validators[field]) {
      const validationResult = validators[field](deliveryInfo[field]);
      
      if (validationResult) {
        setErrors(prev => ({ ...prev, [field]: validationResult.error }));
        setSuggestions(prev => ({ ...prev, [field]: validationResult.suggestion }));
        
        if (validationResult.type === 'warning') {
          setFieldWarnings(prev => ({ ...prev, [field]: true }));
        }
      } else {
        setErrors(prev => ({ ...prev, [field]: null }));
        setSuggestions(prev => ({ ...prev, [field]: null }));
        setFieldWarnings(prev => ({ ...prev, [field]: false }));
      }
    }
  }, [deliveryInfo]);

  // Validate all fields
  const validateForm = useCallback(() => {
    const newErrors = {};
    const newSuggestions = {};
    const newWarnings = {};

    Object.keys(validators).forEach(field => {
      const validationResult = validators[field](deliveryInfo[field]);
      if (validationResult) {
        newErrors[field] = validationResult.error;
        newSuggestions[field] = validationResult.suggestion;
        
        if (validationResult.type === 'warning') {
          newWarnings[field] = true;
        }
      }
    });

    setErrors(newErrors);
    setSuggestions(newSuggestions);
    setFieldWarnings(newWarnings);
    setTouched(
      Object.keys(validators).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );

    return Object.keys(newErrors).length === 0;
  }, [deliveryInfo]);

  // Form completion check
  const isOrderComplete = useMemo(() => {
    // Check if there are order items
    if (orderItems.length === 0) {
      return false;
    }

    // Check all required fields
    const allFieldsValid = Object.keys(validators).every(field => {
      const validationResult = validators[field](deliveryInfo[field]);
      // Allow warnings but not errors
      return !validationResult || validationResult.type === 'warning';
    });

    return allFieldsValid;
  }, [deliveryInfo, orderItems]);

  // Get form completion status
  const getFormCompletionStatus = useMemo(() => {
    const requiredFields = Object.keys(validators);
    const completedFields = requiredFields.filter(field => {
      const validationResult = validators[field](deliveryInfo[field]);
      return !validationResult || validationResult.type === 'warning';
    });

    return {
      total: requiredFields.length,
      completed: completedFields.length,
      percentage: Math.round((completedFields.length / requiredFields.length) * 100)
    };
  }, [deliveryInfo]);

  // Exponential backoff retry logic
  const submitWithRetry = async (submitFunction, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await submitFunction();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        const delay = Math.min(1000 * Math.pow(2, i), 10000);
        showToast(`Retrying... (Attempt ${i + 2}/${maxRetries + 1})`, 'warning');
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  };

  // Enhanced order submission
  const handleSubmitOrder = async () => {
    // Validate form
    setShowAllErrors(true);
    if (!validateForm()) {
      showToast('Please fix all errors before submitting', 'error');
      
      // Scroll to first error
      const firstErrorField = Object.keys(errors).find(field => errors[field]);
      if (firstErrorField) {
        const element = document.querySelector(`[name="${firstErrorField}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
      }
      return;
    }

    if (!isOnline) {
      showToast('No internet connection. Please check your connection and try again.', 'error');
      return;
    }

    if (orderItems.length === 0) {
      showToast('No items in your order. Please add items before placing order.', 'error');
      navigate('/meal-boxes');
      return;
    }

    setLoading(true);

    try {
      const currentUser = auth.currentUser;
      const orderReference = generateOrderReference();
      const browserInfo = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform
      };

      // Create comprehensive order data
      const orderData = {
        orderReference,
        userId: currentUser?.uid || null,
        customerId: currentUser?.uid || `guest-${Date.now()}`,
        customerInfo: {
          name: deliveryInfo.name.trim(),
          phone: deliveryInfo.phone.trim(),
          email: currentUser?.email || deliveryInfo.email.trim(),
          address: deliveryInfo.address.trim(),
          pincode: deliveryInfo.pincode.trim()
        },
        items: orderItems.map(item => ({
          ...item,
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
        paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'pending' : 'awaiting_confirmation',
        eventDate: deliveryInfo.eventDate,
        eventTime: deliveryInfo.eventTime,
        specialInstructions: deliveryInfo.specialInstructions.trim(),
        orderType,
        businessLocation: 'hyderabad',
        contactNumbers: {
          hyderabad: ['+91 8919354409', '+91 9703344431'],
          khammam: ['+91 7396081234', '+91 9246946473']
        },
        metadata: {
          source: 'web',
          browserInfo,
          orderVersion: '2.0'
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      console.log('Submitting production order:', orderData);

      // Submit with retry logic
      const orderDoc = await submitWithRetry(async () => {
        return await addDoc(collection(db, 'orders'), orderData);
      });

      console.log('Order successfully placed with ID:', orderDoc.id);

      // Clear cart and form draft
      if (fromCart) {
        localStorage.setItem('cart', JSON.stringify([]));
      }
      localStorage.removeItem('orderSummaryDraft');

      // Navigate to confirmation
      navigate('/order-confirmation', {
        state: {
          orderId: orderDoc.id,
          orderReference,
          orderItems,
          deliveryInfo,
          orderTotal,
          paymentMethod,
          orderType,
          businessContact: '+91 8919354409'
        }
      });

    } catch (error) {
      console.error('Error placing order:', error);

      let errorMessage = 'Failed to place order. ';
      if (error.code === 'permission-denied') {
        errorMessage += 'Permission denied. Please ensure you are logged in.';
      } else if (error.code === 'unavailable') {
        errorMessage += 'Service temporarily unavailable. Please try again.';
      } else {
        errorMessage += 'Please try again or contact us at +91 8919354409.';
      }

      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Empty state
  if (Object.keys(customizations).length === 0) {
    return (
      <div className={styles.wrapper}>
        <GlobalHeader />
        <main className={styles.main}>
          <div className={styles.emptyState}>
            <h2>No Order Items</h2>
            <p>Please go back and complete your order customization.</p>
            <div className={styles.emptyStateActions}>
              <button onClick={() => navigate('/meal-boxes')}>Browse Meal Boxes</button>
              <button onClick={() => navigate('/bulk-orders')}>Browse Platters</button>
            </div>
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
        <div className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Order Summary</h1>
          <p className={styles.pageDescription}>
            Review your {orderType === 'meal-box' ? 'meal box' : orderType === 'mixed' ? 'mixed' : 'platter'} order and provide delivery information
          </p>
        </div>

        <div className={styles.summaryContainer}>
          {/* Order Details */}
          <div className={styles.orderDetails}>
            {/* Order Items Section */}
            <section className={styles.itemsSection} aria-label="Order Items">
              <h2 className={styles.sectionTitle}>Your Items ({orderItems.length})</h2>
              {orderItems.map((item, index) => (
                <div key={index} className={styles.orderItem}>
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.mealBoxName || item.platterName}
                      className={styles.itemImage}
                      loading="lazy"
                    />
                  )}
                  <div className={styles.itemDetails}>
                    <h3 className={styles.itemName}>
                      {item.mealBoxName || item.platterName}
                      <span className={styles.itemType}>
                        {item.type === 'meal-box' ? 'Meal Box' : 'Platter'}
                      </span>
                    </h3>
                    {item.cuisine && (
                      <p className={styles.itemCuisine}>Cuisine: {item.cuisine}</p>
                    )}
                    {item.mealType && (
                      <p className={styles.mealType}>
                        Meal Type: <strong>{item.mealType.toUpperCase()}</strong>
                      </p>
                    )}
                    <p className={styles.itemQuantity}>
                      Quantity: {item.quantity} {item.type === 'meal-box' ? 'boxes' : 'platters'}
                    </p>

                    {item.selections?.length > 0 && (
                      <div className={styles.selectedItems}>
                        <p className={styles.selectionsTitle}>Your Selections</p>
                        {item.selections.map((category, idx) => (
                          <div key={idx} className={styles.categorySelection}>
                            <strong>{category.categoryName}</strong>
                            <div className={styles.selectionsList}>
                              {category.items.map((selItem, itemIdx) => (
                                <span key={itemIdx} className={styles.selectionItem}>
                                  {selItem.name}
                                  {selItem.extraPrice > 0 && ` (+₹${selItem.extraPrice})`}
                                </span>
                              ))}
                            </div>
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
            </section>

            {/* Delivery Information Section */}
            <section className={styles.deliverySection} aria-label="Delivery Information">
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Delivery Information</h2>
                <div className={styles.formProgress}>
                  <span className={styles.progressText}>
                    {getFormCompletionStatus.completed} of {getFormCompletionStatus.total} fields completed
                  </span>
                  <div className={styles.progressBar}>
                    <div 
                      className={styles.progressFill} 
                      style={{ width: `${getFormCompletionStatus.percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              <form className={styles.deliveryForm} onSubmit={(e) => e.preventDefault()}>
                {/* Name Field */}
                <div className={styles.formField}>
                  <label htmlFor="name" className={styles.fieldLabel}>
                    Full Name <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={deliveryInfo.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    onBlur={() => handleBlur('name')}
                    className={`${styles.formInput} ${
                      touched.name && errors.name ? styles.error : ''
                    } ${touched.name && !errors.name && deliveryInfo.name ? styles.success : ''}`}
                    aria-label="Full Name"
                    aria-required="true"
                    aria-invalid={touched.name && !!errors.name}
                    aria-describedby={errors.name ? 'name-error' : undefined}
                  />
                  {touched.name && errors.name && (
                    <div className={styles.errorContainer}>
                      <span id="name-error" className={styles.errorText}>
                        ❌ {errors.name}
                      </span>
                      {suggestions.name && (
                        <span className={styles.suggestionText}>
                          💡 {suggestions.name}
                        </span>
                      )}
                    </div>
                  )}
                  {touched.name && !errors.name && deliveryInfo.name && (
                    <span className={styles.successText}>✅ Looks good!</span>
                  )}
                </div>

                {/* Phone Field */}
                <div className={styles.formField}>
                  <label htmlFor="phone" className={styles.fieldLabel}>
                    Phone Number <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter 10-digit mobile number"
                    value={deliveryInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    onBlur={() => handleBlur('phone')}
                    maxLength="10"
                    className={`${styles.formInput} ${
                      touched.phone && errors.phone ? styles.error : ''
                    } ${touched.phone && !errors.phone && deliveryInfo.phone ? styles.success : ''}`}
                    aria-label="Phone Number"
                    aria-required="true"
                    aria-invalid={touched.phone && !!errors.phone}
                    aria-describedby={errors.phone ? 'phone-error' : undefined}
                  />
                  {touched.phone && errors.phone && (
                    <div className={styles.errorContainer}>
                      <span id="phone-error" className={styles.errorText}>
                        ❌ {errors.phone}
                      </span>
                      {suggestions.phone && (
                        <span className={styles.suggestionText}>
                          💡 {suggestions.phone}
                        </span>
                      )}
                    </div>
                  )}
                  {touched.phone && !errors.phone && deliveryInfo.phone && (
                    <span className={styles.successText}>✅ Looks good!</span>
                  )}
                </div>

                {/* Email Field */}
                <div className={styles.formField}>
                  <label htmlFor="email" className={styles.fieldLabel}>
                    Email Address <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={deliveryInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    onBlur={() => handleBlur('email')}
                    className={`${styles.formInput} ${
                      touched.email && errors.email ? styles.error : ''
                    } ${touched.email && !errors.email && deliveryInfo.email ? styles.success : ''}`}
                    aria-label="Email Address"
                    aria-required="true"
                    aria-invalid={touched.email && !!errors.email}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                  />
                  {touched.email && errors.email && (
                    <div className={styles.errorContainer}>
                      <span id="email-error" className={styles.errorText}>
                        ❌ {errors.email}
                      </span>
                      {suggestions.email && (
                        <span className={styles.suggestionText}>
                          💡 {suggestions.email}
                        </span>
                      )}
                    </div>
                  )}
                  {touched.email && !errors.email && deliveryInfo.email && (
                    <span className={styles.successText}>✅ Looks good!</span>
                  )}
                </div>

                {/* Address Field */}
                <div className={styles.formField}>
                  <label htmlFor="address" className={styles.fieldLabel}>
                    Delivery Address <span className={styles.required}>*</span>
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    placeholder="House/Flat No., Street, Landmark, City"
                    value={deliveryInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    onBlur={() => handleBlur('address')}
                    className={`${styles.formTextarea} ${
                      touched.address && errors.address ? styles.error : ''
                    } ${touched.address && !errors.address && deliveryInfo.address ? styles.success : ''}`}
                    rows="3"
                    aria-label="Delivery Address"
                    aria-required="true"
                    aria-invalid={touched.address && !!errors.address}
                    aria-describedby={errors.address ? 'address-error' : undefined}
                  />
                  {touched.address && errors.address && (
                    <div className={styles.errorContainer}>
                      <span id="address-error" className={styles.errorText}>
                        ❌ {errors.address}
                      </span>
                      {suggestions.address && (
                        <span className={styles.suggestionText}>
                          💡 {suggestions.address}
                        </span>
                      )}
                    </div>
                  )}
                  {touched.address && !errors.address && deliveryInfo.address && (
                    <span className={styles.successText}>✅ Looks good!</span>
                  )}
                </div>

                {/* Pincode Field */}
                <div className={styles.formField}>
                  <label htmlFor="pincode" className={styles.fieldLabel}>
                    Pincode <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="pincode"
                    name="pincode"
                    type="text"
                    placeholder="Enter 6-digit pincode"
                    value={deliveryInfo.pincode}
                    onChange={(e) => handleInputChange('pincode', e.target.value)}
                    onBlur={() => handleBlur('pincode')}
                    maxLength="6"
                    className={`${styles.formInput} ${
                      touched.pincode && errors.pincode ? styles.error : ''
                    } ${touched.pincode && !errors.pincode && deliveryInfo.pincode ? styles.success : ''}`}
                    aria-label="Pincode"
                    aria-required="true"
                    aria-invalid={touched.pincode && !!errors.pincode}
                    aria-describedby={errors.pincode ? 'pincode-error' : undefined}
                  />
                  {touched.pincode && errors.pincode && (
                    <div className={styles.errorContainer}>
                      <span id="pincode-error" className={styles.errorText}>
                        ❌ {errors.pincode}
                      </span>
                      {suggestions.pincode && (
                        <span className={styles.suggestionText}>
                          💡 {suggestions.pincode}
                        </span>
                      )}
                    </div>
                  )}
                  {touched.pincode && !errors.pincode && deliveryInfo.pincode && (
                    <span className={styles.successText}>✅ Looks good!</span>
                  )}
                </div>

                {/* Date and Time Row */}
                <div className={styles.formRow}>
                  {/* Event Date Field */}
                  <div className={styles.formField}>
                    <label htmlFor="eventDate" className={styles.fieldLabel}>
                      Event Date <span className={styles.required}>*</span>
                    </label>
                    <input
                      id="eventDate"
                      name="eventDate"
                      type="date"
                      value={deliveryInfo.eventDate}
                      onChange={(e) => handleInputChange('eventDate', e.target.value)}
                      onBlur={() => handleBlur('eventDate')}
                      min={new Date().toISOString().split('T')[0]}
                      className={`${styles.formInput} ${
                        touched.eventDate && errors.eventDate && !fieldWarnings.eventDate ? styles.error : ''
                      } ${fieldWarnings.eventDate ? styles.warning : ''} ${
                        touched.eventDate && !errors.eventDate && deliveryInfo.eventDate ? styles.success : ''
                      }`}
                      aria-label="Event Date"
                      aria-required="true"
                      aria-invalid={touched.eventDate && !!errors.eventDate}
                      aria-describedby={errors.eventDate ? 'eventDate-error' : undefined}
                    />
                    {touched.eventDate && errors.eventDate && (
                      <div className={styles.errorContainer}>
                        <span 
                          id="eventDate-error" 
                          className={fieldWarnings.eventDate ? styles.warningText : styles.errorText}
                        >
                          {fieldWarnings.eventDate ? '⚠️' : '❌'} {errors.eventDate}
                        </span>
                        {suggestions.eventDate && (
                          <span className={styles.suggestionText}>
                            💡 {suggestions.eventDate}
                          </span>
                        )}
                      </div>
                    )}
                    {touched.eventDate && !errors.eventDate && deliveryInfo.eventDate && (
                      <span className={styles.successText}>✅ Looks good!</span>
                    )}
                  </div>

                  {/* Event Time Field */}
                  <div className={styles.formField}>
                    <label htmlFor="eventTime" className={styles.fieldLabel}>
                      Event Time <span className={styles.required}>*</span>
                    </label>
                    <input
                      id="eventTime"
                      name="eventTime"
                      type="time"
                      value={deliveryInfo.eventTime}
                      onChange={(e) => handleInputChange('eventTime', e.target.value)}
                      onBlur={() => handleBlur('eventTime')}
                      className={`${styles.formInput} ${
                        touched.eventTime && errors.eventTime && !fieldWarnings.eventTime ? styles.error : ''
                      } ${fieldWarnings.eventTime ? styles.warning : ''} ${
                        touched.eventTime && !errors.eventTime && deliveryInfo.eventTime ? styles.success : ''
                      }`}
                      aria-label="Event Time"
                      aria-required="true"
                      aria-invalid={touched.eventTime && !!errors.eventTime}
                      aria-describedby={errors.eventTime ? 'eventTime-error' : undefined}
                    />
                    {touched.eventTime && errors.eventTime && (
                      <div className={styles.errorContainer}>
                        <span 
                          id="eventTime-error" 
                          className={fieldWarnings.eventTime ? styles.warningText : styles.errorText}
                        >
                          {fieldWarnings.eventTime ? '⚠️' : '❌'} {errors.eventTime}
                        </span>
                        {suggestions.eventTime && (
                          <span className={styles.suggestionText}>
                            💡 {suggestions.eventTime}
                          </span>
                        )}
                      </div>
                    )}
                    {touched.eventTime && !errors.eventTime && deliveryInfo.eventTime && (
                      <span className={styles.successText}>✅ Looks good!</span>
                    )}
                  </div>
                </div>

                {/* Special Instructions Field */}
                <div className={styles.formField}>
                  <label htmlFor="specialInstructions" className={styles.fieldLabel}>
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    id="specialInstructions"
                    name="specialInstructions"
                    placeholder="Any special requests or dietary requirements?"
                    value={deliveryInfo.specialInstructions}
                    onChange={(e) => handleInputChange('specialInstructions', e.target.value)}
                    className={styles.formTextarea}
                    rows="3"
                    aria-label="Special Instructions"
                  />
                </div>
              </form>
            </section>
          </div>

          {/* Order Summary Card */}
          <aside className={styles.orderSummaryCard} aria-label="Order Summary">
            <h2 className={styles.summaryTitle}>Order Summary</h2>
            <div className={styles.summaryBreakdown}>
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>₹{orderTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Total Items</span>
                <span>{orderItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>
              <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                <span>Total Amount</span>
                <span>₹{orderTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Payment Methods */}
            

            <button
              onClick={handleSubmitOrder}
              disabled={!isOrderComplete || loading || !isOnline}
              className={`${styles.placeOrderBtn} ${loading ? styles.loading : ''}`}
              aria-busy={loading}
              aria-disabled={!isOrderComplete || loading || !isOnline}
            >
              {loading ? (
                <>
                  <span className={styles.loadingSpinner}></span>
                  Processing Order...
                </>
              ) : !isOnline ? (
                'No Internet Connection'
              ) : (
                'Place Order'
              )}
            </button>

            {!isOrderComplete && (
              <div className={styles.warningContainer}>
                {orderItems.length === 0 ? (
                  <p className={styles.warningText} role="alert">
                    ⚠️ No items in cart. Please add items to continue.
                  </p>
                ) : (
                  <p className={styles.warningText} role="alert">
                    ⚠️ Please fill in all required fields to continue
                  </p>
                )}
                {showAllErrors && Object.keys(errors).length > 0 && (
                  <div className={styles.errorSummary}>
                    <p className={styles.errorSummaryTitle}>Please fix the following:</p>
                    <ul className={styles.errorList}>
                      {Object.entries(errors).map(([field, error]) => (
                        error && (
                          <li key={field} className={styles.errorListItem}>
                            {field.charAt(0).toUpperCase() + field.slice(1)}: {error}
                          </li>
                        )
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      </main>
      <GlobalFooter />

      {/* Toast Notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default OrderSummary;
