// src/pages/PlatterDetail.js
import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { GlobalHeader, GlobalFooter } from "../components/GlobalHeader&Footer";
import mealBoxImg from "../assets/MealBox.jpg";


// --- HELPER FUNCTION ---
// Parses "choose_one", "choose_two", etc., into a number.
const getLimitFromSelectionType = (type) => {
  if (!type) return 1;
  const words = { one: 1, two: 2, three: 3, four: 4, five: 5 };
  const match = type.match(/choose_(\w+)/);
  if (match && words[match[1]]) {
    return words[match[1]];
  }
  return 1; // Default to 1 if format is unexpected
};


// --- Preview Modal Component ---
const PreviewModal = ({ isOpen, onClose, platter, selections, singlePlatterPrice, handleConfirmAddToCart }) => {
  const [quantity, setQuantity] = useState(15);
  const [quantityError, setQuantityError] = useState('');

  // Reset quantity when modal opens
  useEffect(() => {
    if (isOpen) {
      setQuantity(15);
      setQuantityError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    setQuantity(isNaN(value) ? 0 : value);
    if (value < 15) {
      setQuantityError("Minimum order is 15 plates.");
    } else {
      setQuantityError('');
    }
  };

  const onAddToCartClick = () => {
    if (quantity < 15) {
        setQuantityError("Minimum order is 15 plates.");
        return;
    }
    handleConfirmAddToCart(quantity);
  };

  const selectedItemsList = Object.entries(selections).map(([categoryKey, indices]) => {
      const category = platter.categories[categoryKey];
      return (
        <div key={categoryKey} style={{ marginBottom: '1rem' }}>
          <h4 style={{ color: '#0F4B2E', borderBottom: '1px solid #eee', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>{category.displayName}</h4>
          <ul style={{ listStyle: 'none', paddingLeft: '1rem' }}>
            {indices.map(index => {
              const item = category.items[index];
              return <li key={item.name}>{item.name} {item.extraPrice > 0 && `(+₹${item.extraPrice})`}</li>;
            })}
          </ul>
        </div>
      );
  });

  const finalTotalPrice = (singlePlatterPrice * quantity).toFixed(2);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(0, 0, 0, 0.6)', display: 'flex',
      justifyContent: 'center', alignItems: 'center', zIndex: 2000
    }}>
      <div style={{
        background: '#fff', padding: '2rem', borderRadius: '12px',
        width: '90%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto'
      }}>
        <h2 style={{ textAlign: 'center', color: '#0F4B2E', marginBottom: '1rem' }}>Platter Preview</h2>
        <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', textAlign: 'center' }}>{platter.name}</h3>
        
        <div style={{ marginBottom: '2rem' }}>
            {selectedItemsList}
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="quantity" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Quantity (Plates):</label>
            <input
                type="number"
                id="quantity"
                value={quantity}
                onChange={handleQuantityChange}
                min="15"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}
            />
            {quantityError && <p style={{ color: 'red', fontSize: '0.9rem', marginTop: '0.5rem' }}>{quantityError}</p>}
        </div>

        <div style={{ textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '2rem' }}>
            Total Price: ₹{finalTotalPrice}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px', background: '#ccc', color: '#333', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={onAddToCartClick} style={{ flex: 1, padding: '12px', background: '#0F4B2E', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};


// --- MAIN COMPONENT ---
const PlatterDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [platter, setPlatter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selections, setSelections] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Calculate price for a single platter
  const singlePlatterPrice = useMemo(() => {
    if (!platter) return 0;
    let basePrice = platter.price?.min || (typeof platter.price === 'number' ? platter.price : 0);
    const extraCost = Object.entries(selections).reduce((acc, [categoryKey, indices]) => {
      const category = platter.categories?.[categoryKey];
      if (!category) return acc;
      const itemsExtraCost = indices.reduce((sum, itemIndex) => {
        const item = category.items[itemIndex];
        const extra = item.extraPrice || 0;
        return sum + extra;
      }, 0);
      return acc + itemsExtraCost;
    }, 0);
    return basePrice + extraCost;
  }, [selections, platter]);

  // Handle item selection (checkbox/radio)
  const handleSelection = (categoryKey, itemIndex) => {
    setSelections(prev => {
      const currentSelections = prev[categoryKey] || [];
      const category = platter.categories?.[categoryKey];
      const categoryLimit = getLimitFromSelectionType(category?.selectionType);
      const isSelected = currentSelections.includes(itemIndex);

      if (isSelected) {
        // If item is already selected, unselect it
        return { ...prev, [categoryKey]: currentSelections.filter(i => i !== itemIndex) };
      } else {
        if (categoryLimit === 1) { // Radio button behavior
          return { ...prev, [categoryKey]: [itemIndex] };
        } else {
          if (currentSelections.length >= categoryLimit) {
            // Remove the first (oldest) selection and add the new one
            const updatedSelections = [...currentSelections.slice(1), itemIndex];
            return { ...prev, [categoryKey]: updatedSelections };
          } else {
            // Add new selection if under limit
            return { ...prev, [categoryKey]: [...currentSelections, itemIndex] };
          }
        }
      }
    });
  };

  // Final "Add to Cart" logic
  const handleConfirmAddToCart = (quantity) => {
    const selectedItems = Object.entries(selections).map(([categoryKey, indices]) => {
        const category = platter.categories[categoryKey];
        return {
            categoryName: category.displayName,
            items: indices.map(index => category.items[index])
        };
    });

    const cartItem = {
      platterId: platter.id,
      platterName: platter.name,
      selections: selectedItems,
      singlePlatterPrice: singlePlatterPrice,
      quantity: quantity,
      totalPrice: singlePlatterPrice * quantity,
      timestamp: Date.now() // Add timestamp for sorting and unique identification
    };

    // Get existing cart items from localStorage
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Add new item to cart
    const updatedCart = [...existingCart, cartItem];
    
    // Save updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(updatedCart));

    // Show success message
    alert(`${quantity} x ${platter.name} has been added to your cart!`);
    setIsModalOpen(false);
    
    // Navigate to cart page
    navigate('/cart-page');
  };

  // Check if all required selections are made
  const validateSelections = () => {
    if (!platter?.categories) return false;
    
    return Object.entries(platter.categories).every(([key, category]) => {
      const categoryLimit = getLimitFromSelectionType(category.selectionType);
      const currentSelections = selections[key] || [];
      return currentSelections.length === categoryLimit;
    });
  };

  useEffect(() => {
    const fetchPlatter = async () => {
      setLoading(true);
      setError(null);
      try {
        const docRef = doc(db, "Authentic Platters", id);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          setError("Platter not found.");
          return;
        }

        const platterData = docSnap.data();
        
        // Validate platter data structure
        if (!platterData.name || !platterData.categories) {
          setError("Invalid platter data structure.");
          return;
        }

        // Normalize the data structure
        const normalizedData = {
          id: docSnap.id,
          ...platterData,
          categories: Object.entries(platterData.categories).reduce((acc, [key, category]) => {
            // Ensure each category has required properties
            if (!category.items || !Array.isArray(category.items)) {
              console.warn(`Category ${key} has invalid items structure`);
              return acc;
            }
            return {
              ...acc,
              [key]: {
                ...category,
                items: category.items.map(item => ({
                  ...item,
                  extraPrice: item.extraPrice !== undefined ? item.extraPrice : (item.extra_price !== undefined ? item.extra_price : 0)
                }))
              }
            };
          }, {})
        };

        setPlatter(normalizedData);
      } catch (err) {
        console.error("Error fetching platter:", err);
        setError("Failed to load platter. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPlatter();
    } else {
      setError("Invalid platter ID");
    }
  }, [id]);

  const displayImageUrl = platter?.imageUrl || platter?.image_url || mealBoxImg;

  if (loading || error) {
    // Basic loading/error display
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <GlobalHeader />
            <p>{loading ? "Loading..." : error}</p>
            <GlobalFooter />
        </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FEFEF8", position: "relative" }}>
      <GlobalHeader />
      <main style={{
        paddingTop: 80,
        paddingBottom: 300, // Significantly increased space for preview section and footer
        width: "100%",
        maxWidth: "800px",
        margin: "0 auto",
        padding: "0 1rem",
        position: "relative",
        zIndex: 1,
        marginBottom: "120px" // Added extra margin at the bottom
      }}>
        <button onClick={() => navigate("/bulk-orders")} style={{ marginTop: '1rem', marginBottom: '1rem', background: 'transparent', border: '1px solid #0F4B2E', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}>
            ← Back to Platters
        </button>
        
        <img src={displayImageUrl} alt={platter?.name} style={{ width: "100%", height: "400px", objectFit: "cover", borderRadius: "8px", marginBottom: "2rem" }} onError={(e) => { e.target.src = mealBoxImg; }} />
        <h1>{platter?.name}</h1>
        <p>{platter?.description}</p>
        
        {platter?.categories && Object.entries(platter.categories).map(([key, category]) => {
          const categoryLimit = getLimitFromSelectionType(category.selectionType);
          const inputType = categoryLimit > 1 ? "checkbox" : "radio";
          return (
            <div key={key} style={{ marginBottom: "4rem", background: "#fff", padding: "1.5rem", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <h3 style={{ color: '#0F4B2E' }}>{category.displayName || key}</h3>
                <span style={{ fontSize: "0.9rem", color: "#666" }}>Choose {categoryLimit}</span>
              </div>
              <ul style={{ listStyle: "none", padding: 0 }}>
                {category.items.map((item, index) => {
                  const extra = item.extraPrice || 0;
                  return (
                    <li key={index} style={{ padding: "0.5rem", display: 'flex', alignItems: 'center' }}>
                      <input
                        type={inputType}
                        id={`${key}-${index}`}
                        name={key}
                        checked={(selections[key] || []).includes(index)}
                        onChange={() => handleSelection(key, index)}
                        style={{ width: "20px", height: "20px", accentColor: "#0F4B2E", marginRight: '10px', cursor: 'pointer' }}
                      />
                      <label htmlFor={`${key}-${index}`} style={{ flex: 1, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <span>{item.name}</span>
                        {extra > 0 && (
                          <span style={{ color: "#0F4B2E", marginLeft: "8px", fontWeight: 600 }}>
                            +₹{extra}
                          </span>
                        )}
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </main>

      {/* Preview Section */}
      <div style={{
        width: "100%",
        background: "#fff",
        boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
        padding: "1rem",
        position: "fixed",
        bottom: 60, // Height of the footer
        left: 0,
        zIndex: 1002,
        borderTop: "1px solid #eee",
        height: "75px" // Fixed height for preview section
      }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          width: "100%", 
          maxWidth: "800px",
          margin: "0 auto"
        }}>
          <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
            Price: ₹{singlePlatterPrice.toFixed(2)} / plate
          </div>
          <button 
            onClick={() => setIsModalOpen(true)} 
            disabled={!validateSelections()}
            style={{ 
              padding: "12px 24px", 
              background: validateSelections() ? "#0F4B2E" : "#cccccc", 
              color: "white", 
              border: "none", 
              borderRadius: "8px", 
              cursor: validateSelections() ? "pointer" : "not-allowed", 
              fontSize: "1.1rem",
              transition: "background-color 0.3s ease"
            }}
          >
            {validateSelections() ? 'Preview Selections' : 'Complete All Selections'}
          </button>
        </div>
      </div>
      
      {/* Footer */}
      <div style={{ 
        position: "fixed", 
        bottom: 0, 
        left: 0, 
        width: "100%", 
        zIndex: 1000 
      }}>
        <GlobalFooter />
      </div>

      <PreviewModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        platter={platter}
        selections={selections}
        singlePlatterPrice={singlePlatterPrice}
        handleConfirmAddToCart={handleConfirmAddToCart}
      />
    </div>
  );
};


export default PlatterDetail;
