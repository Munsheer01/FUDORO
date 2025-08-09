// src/pages/CartPage.js (Enhanced for Real MealBox Data)
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GlobalHeader, GlobalFooter } from "../components/GlobalHeader&Footer";
import styles from "./CartPage.module.css";

const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Calculate total price for all items
  const totalPrice = cartItems.reduce((total, item) => total + item.totalPrice, 0);

  // Handle quantity changes for different item types
  const handleQuantityChange = (index, newQuantity) => {
    const item = cartItems[index];
    
    // Different minimum quantities for different item types
    let minQuantity = 15; // Default for platters
    if (item.type === 'meal-box') {
      // Use minimum order from meal box business rules (varies by type)
      minQuantity = item.minimumOrder || 4;
    }

    if (newQuantity < minQuantity) {
      alert(`Minimum order quantity is ${minQuantity} ${item.type === 'meal-box' ? 'boxes' : 'plates'}`);
      return;
    }
    
    setCartItems(prevItems => {
      const updatedItems = [...prevItems];
      const updatedItem = { ...updatedItems[index] };
      
      updatedItem.quantity = newQuantity;
      
      // Calculate price based on item type
      if (item.type === 'meal-box') {
        updatedItem.totalPrice = updatedItem.singleMealBoxPrice * newQuantity;
        
        // Add extra prices for compartment selections
        let extrasTotal = 0;
        Object.values(updatedItem.compartmentSelections || {}).forEach(selections => {
          selections.forEach(selection => {
            extrasTotal += selection.extraPrice || 0;
          });
        });
        updatedItem.totalPrice += (extrasTotal * newQuantity);
      } else {
        updatedItem.totalPrice = updatedItem.singlePlatterPrice * newQuantity;
      }
      
      updatedItems[index] = updatedItem;
      
      localStorage.setItem('cart', JSON.stringify(updatedItems));
      return updatedItems;
    });
  };

  // Remove item from cart
  const handleRemoveItem = (index) => {
    const item = cartItems[index];
    const itemType = item.type === 'meal-box' ? 'meal box' : 'platter';
    
    if (window.confirm(`Are you sure you want to remove this ${itemType} from your cart?`)) {
      setCartItems(prevItems => {
        const updatedItems = prevItems.filter((_, i) => i !== index);
        localStorage.setItem('cart', JSON.stringify(updatedItems));
        return updatedItems;
      });
    }
  };

  // Clear entire cart
  const handleClearCart = () => {
    if (window.confirm("Are you sure you want to clear your entire cart?")) {
      setCartItems([]);
      localStorage.setItem('cart', JSON.stringify([]));
    }
  };

  // Enhanced checkout handling for mixed cart items
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    const customizations = {};
    
    cartItems.forEach((item, index) => {
      // Handle MealBox items from cart with real data structure
      if (item.type === 'meal-box') {
        customizations[`cart-meal-box-${index}`] = {
          mealBox: {
            id: item.mealBoxId,
            name: item.mealBoxName,
            media: { imageUrl: item.imageUrl },
            pricing: {
              [item.mealType]: { basePrice: item.singleMealBoxPrice }
            },
            configuration: { totalCompartments: item.compartments || 2 },
            businessRules: { 
              minimumOrder: item.minimumOrder || 4,
              preparationTime: { min: 30, max: 75 }
            }
          },
          mealType: item.mealType,
          quantity: item.quantity,
          compartmentSelections: item.compartmentSelections || {}
        };
      } 
      // Handle regular Platter items (existing logic)
      else {
        const selections = item.selections || [];
        const extrasTotal = selections.reduce((sum, selection) => 
          sum + (selection.items || []).reduce((s, i) => s + (i.extraPrice || 0), 0), 0
        );
        const basePrice = Math.max(0, item.singlePlatterPrice - extrasTotal);

        customizations[`cart-item-${index}`] = {
          platter: {
            id: item.platterId,
            name: item.platterName,
            cuisine: item.cuisine,
            imageUrl: item.imageUrl,
            price: { base: basePrice },
            categories: {}
          },
          quantity: item.quantity,
          categories: selections.reduce((acc, selection) => {
            const categoryKey = (selection.categoryName || 'category').toLowerCase().replace(/\s+/g, '-');
            acc[categoryKey] = selection.items || [];
            return acc;
          }, {})
        };
      }
    });

    // Determine order type based on cart contents
    const hasMealBoxes = cartItems.some(item => item.type === 'meal-box');
    const hasPlatters = cartItems.some(item => item.type !== 'meal-box');
    let orderType = 'bulk';
    
    if (hasMealBoxes && hasPlatters) {
      orderType = 'mixed';
    } else if (hasMealBoxes) {
      orderType = 'meal-box';
    }
    
    navigate('/order-summary', {
      state: {
        customizations,
        orderTotal: totalPrice,
        totalQuantity: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        orderType: orderType,
        fromCart: true
      }
    });
  };

  // Load cart items from localStorage
  useEffect(() => {
    setLoading(true);
    try {
      const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const sortedCart = savedCart.sort((a, b) => b.timestamp - a.timestamp);
      setCartItems(sortedCart);
    } catch (err) {
      setError("Failed to load cart items. Please try again later.");
      console.error("Error loading cart:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <GlobalHeader />
        <div className={styles.main}>
          <div className={styles.loading}>Loading cart...</div>
        </div>
        <GlobalFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.wrapper}>
        <GlobalHeader />
        <div className={styles.main}>
          <div className={styles.error}>{error}</div>
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
          <h1 className={styles.pageTitle}>Your Cart</h1>
          {cartItems.length > 0 && (
            <button className={styles.clearCartBtn} onClick={handleClearCart}>
              Clear Cart
            </button>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className={styles.emptyCart}>
            <div className={styles.emptyIcon}>🛒</div>
            <h2>Your cart is empty</h2>
            <p>Add some delicious platters or meal boxes to get started!</p>
            <div className={styles.shopButtons}>
              <button 
                className={styles.shopBtn}
                onClick={() => navigate('/bulk-orders')}
              >
                Browse Platters
              </button>
              <button 
                className={styles.shopBtn}
                onClick={() => navigate('/meal-boxes')}
              >
                Browse Meal Boxes
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.cartContent}>
            <div className={styles.cartItems}>
              {cartItems.map((item, index) => (
                <div key={index} className={styles.cartItem}>
                  <img 
                    src={item.imageUrl || '/assets/meal-box-placeholder.jpg'} 
                    alt={item.mealBoxName || item.platterName}
                    className={styles.itemImage}
                    onError={(e) => {
                      e.target.src = '/assets/meal-box-placeholder.jpg';
                    }}
                  />
                  
                  <div className={styles.itemDetails}>
                    <div className={styles.itemHeader}>
                      <h3 className={styles.itemName}>
                        {item.mealBoxName || item.platterName}
                      </h3>
                      <div className={styles.itemTypeBadge}>
                        {item.type === 'meal-box' ? (
                          <span className={styles.mealBoxBadge}>
                            🍱 {item.compartments || 2} Compartments
                          </span>
                        ) : (
                          <span className={styles.platterBadge}>
                            🍽️ {item.cuisine}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Meal type for meal boxes */}
                    {item.type === 'meal-box' && (
                      <p className={styles.mealType}>
                        {item.mealType === 'veg' ? '🥬 Vegetarian' : '🍗 Non-Vegetarian'}
                      </p>
                    )}
                    
                    {/* Display selections/compartments */}
                    <div className={styles.itemSelections}>
                      {item.type === 'meal-box' ? (
                        // Display compartment selections for meal boxes
                        <div className={styles.compartmentSelections}>
                          <h4>Compartment Selections:</h4>
                          {Object.entries(item.compartmentSelections || {}).map(([category, selections], selIndex) => (
                            <div key={selIndex} className={styles.selection}>
                              <span className={styles.selectionCategory}>{category.replace('-', ' ')}:</span>
                              <span className={styles.selectionItems}>
                                {selections.map(sel => sel.name).join(', ')}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        // Display platter selections
                        <div className={styles.platterSelections}>
                          {(item.selections || []).map((selection, selIndex) => (
                            <div key={selIndex} className={styles.selection}>
                              <span className={styles.selectionCategory}>{selection.categoryName}:</span>
                              <span className={styles.selectionItems}>
                                {(selection.items || []).map(item => item.name).join(", ")}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className={styles.itemControls}>
                    <div className={styles.quantityControl}>
                      <button 
                        onClick={() => handleQuantityChange(index, item.quantity - (item.type === 'meal-box' ? 1 : 5))}
                        disabled={item.quantity <= (item.type === 'meal-box' ? (item.minimumOrder || 4) : 15)}
                        className={styles.quantityBtn}
                      >
                        −
                      </button>
                      <span className={styles.quantity}>{item.quantity}</span>
                      <button 
                        onClick={() => handleQuantityChange(index, item.quantity + (item.type === 'meal-box' ? 1 : 5))}
                        className={styles.quantityBtn}
                      >
                        +
                      </button>
                    </div>
                    
                    <div className={styles.itemPrice}>
                      <span className={styles.price}>₹{item.totalPrice.toLocaleString('en-IN')}</span>
                      <span className={styles.priceUnit}>
                        ({item.quantity} {item.type === 'meal-box' ? 'boxes' : 'plates'})
                      </span>
                    </div>
                    
                    <button 
                      className={styles.removeBtn}
                      onClick={() => handleRemoveItem(index)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.cartSummary}>
              <div className={styles.summaryHeader}>
                <h3>Order Summary</h3>
              </div>
              
              <div className={styles.summaryDetails}>
                <div className={styles.summaryRow}>
                  <span>Total Items:</span>
                  <span>{cartItems.length}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Total Units:</span>
                  <span>
                    {cartItems.reduce((sum, item) => sum + item.quantity, 0)} 
                    {cartItems.every(item => item.type === 'meal-box') ? ' boxes' : 
                     cartItems.every(item => item.type !== 'meal-box') ? ' plates' : 
                     ' items'}
                  </span>
                </div>
                <div className={styles.summaryRow}>
                  <span>Item Types:</span>
                  <span>
                    {cartItems.some(item => item.type === 'meal-box') && 
                     cartItems.some(item => item.type !== 'meal-box') ? 'Mixed' :
                     cartItems.every(item => item.type === 'meal-box') ? 'Meal Boxes' :
                     'Platters'}
                  </span>
                </div>
                <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                  <span>Total Amount:</span>
                  <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>
              
              <button 
                className={styles.checkoutBtn}
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>

      <GlobalFooter />
    </div>
  );
};

export default CartPage;
