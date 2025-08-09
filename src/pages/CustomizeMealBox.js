import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './CustomizeMealBox.module.css';
import { GlobalHeader, GlobalFooter } from '../components/GlobalHeader&Footer';

// Cart utility functions
const CartUtils = {
  getCart: () => {
    try {
      return JSON.parse(localStorage.getItem('cart') || '[]');
    } catch (e) {
      return [];
    }
  },
  saveCart: (cartItems) => {
    try {
      localStorage.setItem('cart', JSON.stringify(cartItems));
      return true;
    } catch (e) {
      console.error('Failed to save cart:', e);
      return false;
    }
  },
  addToCart: (item) => {
    const cart = CartUtils.getCart();
    cart.push({ ...item, timestamp: Date.now() });
    return CartUtils.saveCart(cart);
  },
  getCartCount: () => {
    return CartUtils.getCart().length;
  }
};

// Enhanced Compartment Selector for Real Data Structure
const CompartmentSelector = React.memo(({ compartment, mealBox, mealType, onSelectionChange, selections = [] }) => {
  const [selectedItems, setSelectedItems] = useState(selections);

  const handleItemSelect = useCallback((item) => {
    // For meal boxes, typically one item per compartment
    const newSelection = selectedItems[0]?.id === item.id ? [] : [item];
    setSelectedItems(newSelection);
    onSelectionChange(mealBox.id, compartment.category, newSelection);
  }, [selectedItems, onSelectionChange, mealBox.id, compartment.category]);

  const isItemSelected = (item) => {
    return selectedItems.some(selected => selected.id === item.id);
  };

  // Get food options for this compartment based on real data structure
  const getFoodOptions = () => {
    const categoryOptions = mealBox.foodOptions?.[compartment.category];
    if (!categoryOptions) return [];

    // For categories that have both veg and nonVeg options
    if (categoryOptions.veg && categoryOptions.nonVeg) {
      return mealType === 'veg' ? categoryOptions.veg : categoryOptions.nonVeg;
    }
    
    // For categories that only have veg options (like desserts, extras)
    if (categoryOptions.veg) {
      return categoryOptions.veg;
    }

    // Fallback to direct array if structure is different
    return Array.isArray(categoryOptions) ? categoryOptions : [];
  };

  const foodOptions = getFoodOptions();

  if (foodOptions.length === 0) {
    return (
      <div className={styles.compartmentSection}>
        <div className={styles.compartmentHeader}>
          <h3 className={styles.compartmentTitle}>{compartment.displayName}</h3>
          <span className={styles.noOptionsText}>No options available</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.compartmentSection}>
      <div className={styles.compartmentHeader}>
        <h3 className={styles.compartmentTitle}>
          {compartment.displayName}
          <span className={styles.compartmentPosition}>Compartment {compartment.position}</span>
        </h3>
        <div className={styles.compartmentInfo}>
          <span className={styles.compartmentSize}>
            {compartment.type} ({compartment.capacity || '200ml'})
          </span>
          {compartment.required && (
            <span className={styles.requiredBadge}>Required</span>
          )}
        </div>
      </div>

      <div className={styles.compartmentItems}>
        {foodOptions.map((item) => (
          <div
            key={item.id}
            className={`${styles.compartmentItem} ${isItemSelected(item) ? styles.selected : ''}`}
            onClick={() => handleItemSelect(item)}
          >
            <div className={styles.itemHeader}>
              <div className={styles.itemInfo}>
                <h4 className={styles.itemName}>
                  {item.name}
                  {item.isDefault && <span className={styles.defaultTag}>Default</span>}
                </h4>
              </div>
              <div className={styles.itemPrice}>
                {item.extraPrice > 0 ? `+₹${item.extraPrice}` : 'Free'}
              </div>
            </div>
            
            <div className={styles.itemActions}>
              <button
                className={`${styles.selectItemBtn} ${isItemSelected(item) ? styles.selected : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleItemSelect(item);
                }}
              >
                {isItemSelected(item) ? '✓ Selected' : 'Select'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

const CustomizeMealBox = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedMealBox } = location.state || {};

  const [quantity, setQuantity] = useState(selectedMealBox?.businessRules?.minimumOrder || 5);
  const [mealType, setMealType] = useState('veg');
  const [compartmentSelections, setCompartmentSelections] = useState({});
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (!selectedMealBox) {
      navigate('/meal-boxes');
      return;
    }
    
    setCartCount(CartUtils.getCartCount());
    
    // Initialize default selections based on real data structure
    const defaultSelections = {};
    selectedMealBox.configuration?.layout?.forEach((compartment) => {
      const categoryOptions = selectedMealBox.foodOptions?.[compartment.category];
      if (categoryOptions) {
        let options = [];
        
        // Handle different data structures
        if (categoryOptions.veg && categoryOptions.nonVeg) {
          options = mealType === 'veg' ? categoryOptions.veg : categoryOptions.nonVeg;
        } else if (categoryOptions.veg) {
          options = categoryOptions.veg;
        }
        
        const defaultItem = options?.find(item => item.isDefault);
        if (defaultItem) {
          defaultSelections[compartment.category] = [defaultItem];
        }
      }
    });
    
    setCompartmentSelections(defaultSelections);
  }, [selectedMealBox, navigate, mealType]);

  const handleSelectionChange = useCallback((mealBoxId, compartmentCategory, selections) => {
    setCompartmentSelections(prev => ({
      ...prev,
      [compartmentCategory]: selections
    }));
  }, []);

  const handleQuantityChange = useCallback((change) => {
    const minOrder = selectedMealBox?.businessRules?.minimumOrder || 4;
    const maxOrder = selectedMealBox?.businessRules?.maximumOrder || 50;
    const newQuantity = Math.max(minOrder, Math.min(maxOrder, quantity + change));
    setQuantity(newQuantity);
  }, [quantity, selectedMealBox]);

  const handleMealTypeChange = useCallback((newMealType) => {
    setMealType(newMealType);
    
    // Reset selections when meal type changes, preserving dessert/extras selections
    const newSelections = {};
    selectedMealBox.configuration?.layout?.forEach((compartment) => {
      const categoryOptions = selectedMealBox.foodOptions?.[compartment.category];
      if (categoryOptions) {
        let options = [];
        
        // Handle categories that have both veg and nonveg
        if (categoryOptions.veg && categoryOptions.nonVeg) {
          options = newMealType === 'veg' ? categoryOptions.veg : categoryOptions.nonVeg;
        } 
        // Handle categories that only have veg (desserts, extras)
        else if (categoryOptions.veg) {
          options = categoryOptions.veg;
        }
        
        const defaultItem = options?.find(item => item.isDefault);
        if (defaultItem) {
          newSelections[compartment.category] = [defaultItem];
        }
      }
    });
    
    setCompartmentSelections(newSelections);
  }, [selectedMealBox]);

  // Calculate total price based on real data structure
  const totalPrice = useMemo(() => {
    if (!selectedMealBox) return 0;
    
    const basePrice = selectedMealBox.pricing?.[mealType]?.basePrice || 0;
    let extrasTotal = 0;
    
    Object.values(compartmentSelections).forEach(selections => {
      selections.forEach(item => {
        extrasTotal += item.extraPrice || 0;
      });
    });
    
    return (basePrice + extrasTotal) * quantity;
  }, [selectedMealBox, mealType, compartmentSelections, quantity]);

  // Check if customization is complete based on required compartments
  const isCustomizationComplete = useMemo(() => {
    if (!selectedMealBox) return false;
    
    const requiredCompartments = selectedMealBox.configuration?.layout?.filter(c => c.required) || [];
    return requiredCompartments.every(compartment => 
      compartmentSelections[compartment.category]?.length > 0
    );
  }, [selectedMealBox, compartmentSelections]);

  const handleAddToCart = useCallback(() => {
    if (!isCustomizationComplete) {
      alert('Please complete all required compartment selections.');
      return;
    }

    const cartItem = {
      type: 'meal-box',
      mealBoxId: selectedMealBox.id,
      mealBoxName: selectedMealBox.name,
      mealType: mealType,
      quantity: quantity,
      singleMealBoxPrice: selectedMealBox.pricing?.[mealType]?.basePrice || 0,
      totalPrice: totalPrice,
      imageUrl: selectedMealBox.media?.imageUrl,
      compartmentSelections: compartmentSelections,
      compartments: selectedMealBox.configuration?.totalCompartments,
      timestamp: Date.now()
    };

    if (CartUtils.addToCart(cartItem)) {
      setCartCount(CartUtils.getCartCount());
      alert(`${selectedMealBox.name} added to cart successfully!`);
    } else {
      alert('Failed to add to cart. Please try again.');
    }
  }, [selectedMealBox, mealType, quantity, totalPrice, compartmentSelections, isCustomizationComplete]);

  const handleDirectCheckout = useCallback(() => {
    if (!isCustomizationComplete) {
      alert('Please complete all required compartment selections.');
      return;
    }

    // Convert to customization format for OrderSummary
    const customizations = {
      'meal-box-1': {
        mealBox: selectedMealBox,
        mealType: mealType,
        quantity: quantity,
        compartmentSelections: compartmentSelections
      }
    };

    navigate('/order-summary', {
      state: {
        customizations,
        orderTotal: totalPrice,
        totalQuantity: quantity,
        orderType: 'meal-box'
      }
    });
  }, [selectedMealBox, mealType, quantity, compartmentSelections, totalPrice, isCustomizationComplete, navigate]);

  if (!selectedMealBox) {
    return (
      <div className={styles.wrapper}>
        <GlobalHeader />
        <div className={styles.main}>
          <div className={styles.emptyState}>
            <h2>No meal box selected</h2>
            <p>Please go back and select a meal box to customize.</p>
            <button onClick={() => navigate('/meal-boxes')}>
              Browse Meal Boxes
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
        {/* Page Header */}
        <div className={styles.pageHeader}>
          <button 
            className={styles.backButton}
            onClick={() => navigate('/meal-boxes')}
          >
            ← Back to Meal Boxes
          </button>
          <div className={styles.headerInfo}>
            <h1 className={styles.pageTitle}>Customize Your {selectedMealBox.name}</h1>
            <p className={styles.pageDescription}>
              Personalize each of the {selectedMealBox.configuration?.totalCompartments} compartments with your favorite food options
            </p>
          </div>
        </div>

        <div className={styles.customizationContainer}>
          {/* Meal Box Customization */}
          <div className={styles.mealBoxCustomization}>
            {/* Meal Box Header */}
            <div className={styles.mealBoxHeader}>
              <img 
                src={selectedMealBox.media?.imageUrl || '/assets/meal-box-placeholder.jpg'}
                alt={selectedMealBox.name}
                className={styles.mealBoxThumb}
                onError={(e) => {
                  e.target.src = '/assets/meal-box-placeholder.jpg';
                }}
              />
              <div className={styles.mealBoxInfo}>
                <h2 className={styles.mealBoxName}>{selectedMealBox.name}</h2>
                <p className={styles.mealBoxDescription}>{selectedMealBox.description}</p>
                
                <div className={styles.businessRules}>
                  <span>🍽️ {selectedMealBox.configuration?.totalCompartments} compartments</span>
                  <span>⏱️ {selectedMealBox.businessRules?.preparationTime?.min}-{selectedMealBox.businessRules?.preparationTime?.max} min</span>
                  <span>📦 Min {selectedMealBox.businessRules?.minimumOrder} boxes</span>
                </div>
              </div>
            </div>

            {/* Meal Type Selection */}
            <div className={styles.mealTypeSection}>
              <h3 className={styles.sectionTitle}>Select Meal Type</h3>
              <div className={styles.mealTypeOptions}>
                <label className={styles.mealTypeOption}>
                  <input
                    type="radio"
                    value="veg"
                    checked={mealType === 'veg'}
                    onChange={(e) => handleMealTypeChange(e.target.value)}
                  />
                  <span className={styles.optionContent}>
                    🥬 Vegetarian - ₹{selectedMealBox.pricing?.veg?.basePrice}
                  </span>
                </label>
                <label className={styles.mealTypeOption}>
                  <input
                    type="radio"
                    value="nonVeg"
                    checked={mealType === 'nonVeg'}
                    onChange={(e) => handleMealTypeChange(e.target.value)}
                  />
                  <span className={styles.optionContent}>
                    🍗 Non-Vegetarian - ₹{selectedMealBox.pricing?.nonVeg?.basePrice}
                  </span>
                </label>
              </div>
            </div>

            {/* Quantity Selection */}
            <div className={styles.quantitySection}>
              <h3 className={styles.sectionTitle}>Quantity</h3>
              <div className={styles.quantityControl}>
                <button 
                  className={styles.quantityBtn}
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= (selectedMealBox?.businessRules?.minimumOrder || 4)}
                >
                  -
                </button>
                <span className={styles.quantity}>{quantity} boxes</span>
                <button 
                  className={styles.quantityBtn}
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= (selectedMealBox?.businessRules?.maximumOrder || 50)}
                >
                  +
                </button>
              </div>
            </div>

            {/* Compartments Customization - Based on real layout */}
            <div className={styles.compartmentsContainer}>
              <h3 className={styles.sectionTitle}>Customize Your Compartments</h3>
              <div className={styles.compartmentsGrid}>
                {selectedMealBox.configuration?.layout?.map((compartment, index) => (
                  <CompartmentSelector
                    key={`${compartment.category}-${compartment.position}`}
                    compartment={compartment}
                    mealBox={selectedMealBox}
                    mealType={mealType}
                    onSelectionChange={handleSelectionChange}
                    selections={compartmentSelections[compartment.category] || []}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary Sticky */}
          <div className={styles.orderSummarySticky}>
            <div className={styles.orderSummary}>
              <h3 className={styles.summaryTitle}>Order Summary</h3>
              
              <div className={styles.summaryStats}>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Meal Box:</span>
                  <span className={styles.statValue}>{selectedMealBox.name}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Type:</span>
                  <span className={styles.statValue}>
                    {mealType === 'veg' ? '🥬 Vegetarian' : '🍗 Non-Vegetarian'}
                  </span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Quantity:</span>
                  <span className={styles.statValue}>{quantity} boxes</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Compartments:</span>
                  <span className={styles.statValue}>{selectedMealBox.configuration?.totalCompartments}</span>
                </div>
              </div>

              <div className={styles.totalAmount}>
                <span className={styles.totalLabel}>Total Amount</span>
                <span className={styles.totalValue}>₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>

              <div className={styles.completionStatus}>
                {isCustomizationComplete ? (
                  <span className={styles.completeStatus}>✓ Ready to order</span>
                ) : (
                  <span className={styles.incompleteStatus}>⚠ Complete required selections</span>
                )}
              </div>

              <div className={styles.actionButtons}>
                <button 
                  className={`${styles.addToCartBtn} ${!isCustomizationComplete ? styles.disabled : ''}`}
                  onClick={handleAddToCart}
                  disabled={!isCustomizationComplete}
                >
                  🛒 Add to Cart ({cartCount})
                </button>
                
                <button 
                  className={`${styles.checkoutBtn} ${!isCustomizationComplete ? styles.disabled : ''}`}
                  onClick={handleDirectCheckout}
                  disabled={!isCustomizationComplete}
                >
                  Order Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <GlobalFooter />
    </div>
  );
};

export default CustomizeMealBox;
