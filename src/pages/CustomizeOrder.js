import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './CustomizeOrder.module.css';
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

// Enhanced Category Selector Component with Defensive Programming
const CategorySelector = React.memo(({ category, categoryKey, platterId, onSelectionChange, selections = [] }) => {
  // ✅ FIX: Ensure selections is always an array
  const [selectedItems, setSelectedItems] = useState(Array.isArray(selections) ? selections : []);

  // ✅ FIX: Ensure category has required properties with defaults
  const safeCategory = {
    displayName: categoryKey || 'Category',
    selectionType: 'choose_one',
    items: [],
    ...category
  };

  const getSelectionLimit = (selectionType) => {
    if (!selectionType) return 1;
    const match = selectionType.match(/choose_(\w+)/);
    if (!match) return 1;
    const numMap = {
      'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
      'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
    };
    return numMap[match[1]] || 1;
  };

  const selectionLimit = getSelectionLimit(safeCategory.selectionType);
  const isMultiSelect = selectionLimit > 1;

  const handleItemSelect = useCallback((item) => {
    if (!item) return;
    
    let newSelection;
    if (isMultiSelect) {
      const isSelected = selectedItems.some(selected => selected?.id === item.id);
      if (isSelected) {
        newSelection = selectedItems.filter(selected => selected?.id !== item.id);
      } else if (selectedItems.length < selectionLimit) {
        newSelection = [...selectedItems, item];
      } else {
        newSelection = [...selectedItems.slice(0, -1), item];
      }
    } else {
      newSelection = selectedItems[0]?.id === item.id ? [] : [item];
    }

    setSelectedItems(newSelection);
    if (onSelectionChange) {
      onSelectionChange(platterId, categoryKey, newSelection);
    }
  }, [selectedItems, isMultiSelect, selectionLimit, onSelectionChange, platterId, categoryKey]);

  const isItemSelected = (item) => {
    if (!item || !Array.isArray(selectedItems)) return false;
    return selectedItems.some(selected => selected?.id === item.id);
  };

  const canSelectMore = selectedItems.length < selectionLimit;

  // ✅ FIX: Handle included items safely
  if (safeCategory.selectionType === 'included') {
    const includedItems = Array.isArray(safeCategory.items) ? safeCategory.items : [];
    
    return (
      <div className={styles.categorySection}>
        <div className={styles.categoryHeader}>
          <h3 className={styles.categoryTitle}>
            {safeCategory.displayName}
            <span className={styles.includedBadge}>Included</span>
          </h3>
        </div>
        <div className={styles.includedItems}>
          {includedItems.map((item, index) => (
            <div key={item?.id || `included-${index}`} className={styles.includedItem}>
              <span className={styles.itemName}>{item?.name || 'Unnamed Item'}</span>
              {item?.description && (
                <span className={styles.itemDescription}>{item.description}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ✅ FIX: Ensure items is always an array before mapping
  const categoryItems = Array.isArray(safeCategory.items) ? safeCategory.items : [];

  return (
    <div className={styles.categorySection}>
      <div className={styles.categoryHeader}>
        <h3 className={styles.categoryTitle}>{safeCategory.displayName}</h3>
        <div className={styles.categoryInfo}>
          <span className={styles.selectionType}>
            {isMultiSelect ? `Choose up to ${selectionLimit}` : 'Choose one'}
          </span>
          <span className={styles.selectedCount}>
            {selectedItems.length}/{selectionLimit} selected
          </span>
        </div>
      </div>

      <div className={styles.categoryItems}>
        {categoryItems.map((item, index) => {
          // ✅ FIX: Handle cases where item might be null/undefined
          if (!item) return null;
          
          return (
            <div
              key={item.id || `item-${index}`}
              className={`${styles.categoryItem} ${isItemSelected(item) ? styles.selected : ''}`}
              onClick={() => handleItemSelect(item)}
            >
              <div className={styles.itemHeader}>
                <div className={styles.itemInfo}>
                  <h4 className={styles.itemName}>{item.name || 'Unnamed Item'}</h4>
                  {item.description && (
                    <p className={styles.itemDescription}>{item.description}</p>
                  )}
                </div>
                <div className={styles.itemPrice}>
                  {(item.extraPrice || 0) > 0 ? `+₹${item.extraPrice}` : 'Free'}
                </div>
              </div>
              <div className={styles.itemActions}>
                <button
                  className={`${styles.selectItemBtn} ${isItemSelected(item) ? styles.selected : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleItemSelect(item);
                  }}
                  disabled={!canSelectMore && !isItemSelected(item)}
                >
                  {isItemSelected(item) ? '✓ Selected' : 'Select'}
                </button>
              </div>
            </div>
          );
        })}
        
        {categoryItems.length === 0 && (
          <div className={styles.noItems}>
            <p>No items available for this category.</p>
          </div>
        )}
      </div>
    </div>
  );
});

const CustomizeOrder = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // ✅ FIX: Comprehensive state validation with defaults
  const locationState = location.state || {};
  const selectedPlattersObj = locationState.selectedPlatters || {};
  const orderType = locationState.orderType || 'bulk';
  
  // ✅ FIX: Convert selectedPlatters object to array with validation
  const selectedPlattersArray = useMemo(() => {
    if (!selectedPlattersObj || typeof selectedPlattersObj !== 'object') {
      return [];
    }
    
    const values = Object.values(selectedPlattersObj);
    return values.filter(item => item && item.platter); // Filter out invalid entries
  }, [selectedPlattersObj]);

  const [platterCustomizations, setPlatterCustomizations] = useState({});
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // ✅ FIX: Check array length instead of object
    if (!Array.isArray(selectedPlattersArray) || selectedPlattersArray.length === 0) {
      console.warn('No valid platters found, redirecting to bulk orders');
      navigate('/bulk-orders');
      return;
    }
    
    setCartCount(CartUtils.getCartCount());
  }, [selectedPlattersArray, navigate]);

  const handleSelectionChange = useCallback((platterId, categoryKey, selections) => {
    if (!platterId || !categoryKey) return;
    
    setPlatterCustomizations(prev => ({
      ...prev,
      [platterId]: {
        ...prev[platterId],
        [categoryKey]: Array.isArray(selections) ? selections : []
      }
    }));
  }, []);

  const handleQuantityChange = useCallback((platterId, change) => {
    if (!platterId || typeof change !== 'number') return;
    
    setPlatterCustomizations(prev => {
      const currentCustomizations = prev[platterId] || {};
      const selectedPlatterObj = selectedPlattersObj[platterId];
      const currentQuantity = currentCustomizations.quantity || selectedPlatterObj?.quantity || 15;
      const newQuantity = Math.max(15, currentQuantity + change);
      
      return {
        ...prev,
        [platterId]: {
          ...currentCustomizations,
          quantity: newQuantity
        }
      };
    });
  }, [selectedPlattersObj]);

  // ✅ FIX: Enhanced total calculation with null checks
  const calculateTotal = useMemo(() => {
    if (!Array.isArray(selectedPlattersArray)) return 0;
    
    let total = 0;
    
    selectedPlattersArray.forEach(({ platter }) => {
      if (!platter || !platter.id) return;
      
      const platterId = platter.id;
      const customizations = platterCustomizations[platterId] || {};
      const selectedPlatterObj = selectedPlattersObj[platterId];
      const quantity = customizations.quantity || selectedPlatterObj?.quantity || 15;
      const basePrice = platter.price?.base || 0;
      
      let extrasTotal = 0;
      const categories = platter.categories || {};
      
      Object.keys(categories).forEach(categoryKey => {
        const selections = customizations[categoryKey] || [];
        if (Array.isArray(selections)) {
          selections.forEach(item => {
            if (item && typeof item.extraPrice === 'number') {
              extrasTotal += item.extraPrice;
            }
          });
        }
      });
      
      total += (basePrice + extrasTotal) * quantity;
    });
    
    return total;
  }, [selectedPlattersArray, platterCustomizations, selectedPlattersObj]);

  const handleAddToCart = useCallback(() => {
    if (!Array.isArray(selectedPlattersArray) || selectedPlattersArray.length === 0) {
      alert('No platters to add to cart.');
      return;
    }

    selectedPlattersArray.forEach(({ platter }) => {
      if (!platter || !platter.id) return;
      
      const platterId = platter.id;
      const customizations = platterCustomizations[platterId] || {};
      const selectedPlatterObj = selectedPlattersObj[platterId];
      const quantity = customizations.quantity || selectedPlatterObj?.quantity || 15;
      
      const selections = [];
      const categories = platter.categories || {};
      
      Object.entries(categories).forEach(([categoryKey, category]) => {
        const selectedItems = customizations[categoryKey] || [];
        if (Array.isArray(selectedItems) && selectedItems.length > 0) {
          selections.push({
            categoryName: category?.displayName || categoryKey,
            items: selectedItems.filter(item => item) // Filter out null/undefined items
          });
        }
      });

      const basePrice = platter.price?.base || 0;
      let extrasTotal = 0;
      
      selections.forEach(selection => {
        if (selection && Array.isArray(selection.items)) {
          selection.items.forEach(item => {
            if (item && typeof item.extraPrice === 'number') {
              extrasTotal += item.extraPrice;
            }
          });
        }
      });

      const cartItem = {
        type: 'platter',
        platterId: platter.id,
        platterName: platter.name || 'Unnamed Platter',
        cuisine: platter.cuisine || 'Unknown Cuisine',
        imageUrl: platter.imageUrl || '',
        quantity: quantity,
        singlePlatterPrice: basePrice + extrasTotal,
        totalPrice: (basePrice + extrasTotal) * quantity,
        selections: selections,
        timestamp: Date.now()
      };

      CartUtils.addToCart(cartItem);
    });

    setCartCount(CartUtils.getCartCount());
    alert('All platters added to cart successfully!');
  }, [selectedPlattersArray, platterCustomizations, selectedPlattersObj]);

  const handleDirectCheckout = useCallback(() => {
    if (!Array.isArray(selectedPlattersArray) || selectedPlattersArray.length === 0) {
      alert('No platters to checkout.');
      return;
    }

    const customizations = {};
    
    selectedPlattersArray.forEach(({ platter }) => {
      if (!platter || !platter.id) return;
      
      const platterId = platter.id;
      const customPlatter = platterCustomizations[platterId] || {};
      const selectedPlatterObj = selectedPlattersObj[platterId];
      const quantity = customPlatter.quantity || selectedPlatterObj?.quantity || 15;
      
      const categories = {};
      const platterCategories = platter.categories || {};
      
      Object.keys(platterCategories).forEach(categoryKey => {
        const selections = customPlatter[categoryKey] || [];
        if (Array.isArray(selections) && selections.length > 0) {
          categories[categoryKey] = selections.filter(item => item); // Filter out null/undefined
        }
      });

      customizations[`bulk-${platterId}`] = {
        platter,
        quantity,
        categories
      };
    });

    navigate('/order-summary', {
      state: {
        customizations,
        orderTotal: calculateTotal,
        totalQuantity: selectedPlattersArray.reduce((sum, { platter }) => {
          if (!platter || !platter.id) return sum;
          const platterId = platter.id;
          const customizations = platterCustomizations[platterId] || {};
          const selectedPlatterObj = selectedPlattersObj[platterId];
          return sum + (customizations.quantity || selectedPlatterObj?.quantity || 15);
        }, 0),
        orderType: 'bulk'
      }
    });
  }, [selectedPlattersArray, platterCustomizations, selectedPlattersObj, calculateTotal, navigate]);

  // ✅ FIX: Enhanced empty state check
  if (!Array.isArray(selectedPlattersArray) || selectedPlattersArray.length === 0) {
    return (
      <div className={styles.wrapper}>
        <GlobalHeader />
        <div className={styles.main}>
          <div className={styles.emptyState}>
            <h2>No platters selected</h2>
            <p>Please go back and select platters to customize.</p>
            <button onClick={() => navigate('/bulk-orders')}>
              Browse Platters
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
        <div className={styles.pageHeader}>
          <button 
            className={styles.backButton}
            onClick={() => navigate('/bulk-orders')}
          >
            ← Back to Platters
          </button>
          <div className={styles.headerInfo}>
            <h1 className={styles.pageTitle}>Customize Your Order</h1>
            <p className={styles.pageDescription}>
              Personalize each platter with your preferred food options
            </p>
          </div>
        </div>

        <div className={styles.customizationContainer}>
          <div className={styles.plattersCustomization}>
            {/* ✅ FIX: Safe mapping with comprehensive null checks */}
            {selectedPlattersArray.map(({ platter }, index) => {
              if (!platter || !platter.id) {
                console.warn(`Invalid platter at index ${index}:`, platter);
                return null;
              }
              
              const platterId = platter.id;
              const customizations = platterCustomizations[platterId] || {};
              const selectedPlatterObj = selectedPlattersObj[platterId];
              const quantity = customizations.quantity || selectedPlatterObj?.quantity || 15;
              const categories = platter.categories || {};

              return (
                <div key={platterId} className={styles.platterCustomization}>
                  <div className={styles.platterHeader}>
                    <img 
                      src={platter.imageUrl || '/assets/platter-placeholder.jpg'}
                      alt={platter.name || 'Platter'}
                      className={styles.platterThumb}
                      onError={(e) => {
                        e.target.src = '/assets/platter-placeholder.jpg';
                      }}
                    />
                    <div className={styles.platterInfo}>
                      <h2 className={styles.platterName}>{platter.name || 'Unnamed Platter'}</h2>
                      <p className={styles.platterMeta}>
                        {platter.cuisine || 'Unknown Cuisine'} • {platter.mealType || 'Mixed'}
                      </p>
                      <p className={styles.platterDescription}>{platter.description || 'No description available'}</p>
                    </div>
                  </div>

                  <div className={styles.quantitySection}>
                    <h3 className={styles.sectionTitle}>Quantity</h3>
                    <div className={styles.quantityControl}>
                      <button 
                        className={styles.quantityBtn}
                        onClick={() => handleQuantityChange(platterId, -5)}
                        disabled={quantity <= 15}
                      >
                        -5
                      </button>
                      <span className={styles.quantity}>{quantity} plates</span>
                      <button 
                        className={styles.quantityBtn}
                        onClick={() => handleQuantityChange(platterId, 5)}
                      >
                        +5
                      </button>
                    </div>
                  </div>

                  <div className={styles.categoriesContainer}>
                    <h3 className={styles.sectionTitle}>Customize Categories</h3>
                    {Object.keys(categories).length > 0 ? (
                      Object.entries(categories).map(([categoryKey, category]) => {
                        if (!category) return null;
                        
                        return (
                          <CategorySelector
                            key={`${platterId}-${categoryKey}`}
                            category={category}
                            categoryKey={categoryKey}
                            platterId={platterId}
                            onSelectionChange={handleSelectionChange}
                            selections={customizations[categoryKey] || []}
                          />
                        );
                      })
                    ) : (
                      <div className={styles.noCategories}>
                        <p>No customization categories available for this platter.</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.orderSummarySticky}>
            <div className={styles.orderSummary}>
              <h3 className={styles.summaryTitle}>Order Summary</h3>
              
              <div className={styles.summaryStats}>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Platters:</span>
                  <span className={styles.statValue}>{selectedPlattersArray.length}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statLabel}>Total Plates:</span>
                  <span className={styles.statValue}>
                    {selectedPlattersArray.reduce((sum, { platter }) => {
                      if (!platter || !platter.id) return sum;
                      const platterId = platter.id;
                      const customizations = platterCustomizations[platterId] || {};
                      const selectedPlatterObj = selectedPlattersObj[platterId];
                      return sum + (customizations.quantity || selectedPlatterObj?.quantity || 15);
                    }, 0)}
                  </span>
                </div>
              </div>

              <div className={styles.totalAmount}>
                <span className={styles.totalLabel}>Total Amount</span>
                <span className={styles.totalValue}>₹{calculateTotal.toLocaleString('en-IN')}</span>
              </div>

              <div className={styles.actionButtons}>
                <button 
                  className={styles.addToCartBtn}
                  onClick={handleAddToCart}
                >
                  🛒 Add to Cart ({cartCount})
                </button>
                
                <button 
                  className={styles.checkoutBtn}
                  onClick={handleDirectCheckout}
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

export default CustomizeOrder;
