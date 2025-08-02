// src/pages/CartPage.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GlobalHeader, GlobalFooter } from "../components/GlobalHeader&Footer";

const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Calculate total price for all items
  const totalPrice = cartItems.reduce((total, item) => total + item.totalPrice, 0);

  // Handle quantity changes
  const handleQuantityChange = (index, newQuantity) => {
    if (newQuantity < 15) {
      alert("Minimum order quantity is 15 plates");
      return;
    }

    setCartItems(prevItems => {
      const updatedItems = [...prevItems];
      const item = { ...updatedItems[index] };
      item.quantity = newQuantity;
      item.totalPrice = item.singlePlatterPrice * newQuantity;
      updatedItems[index] = item;
      
      // Update localStorage with new cart state
      localStorage.setItem('cart', JSON.stringify(updatedItems));
      
      return updatedItems;
    });
  };

  // Remove item from cart
  const handleRemoveItem = (index) => {
    if (window.confirm("Are you sure you want to remove this item from your cart?")) {
      setCartItems(prevItems => {
        const updatedItems = prevItems.filter((_, i) => i !== index);
        // Update localStorage with new cart state
        localStorage.setItem('cart', JSON.stringify(updatedItems));
        return updatedItems;
      });
    }
  };

  // Proceed to checkout
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    // Get address info from localStorage (set by HomeScreen popup)
    let addressInfo = {};
    try {
      addressInfo = JSON.parse(localStorage.getItem("addressInfo") || "{}");
    } catch (e) {
      addressInfo = {};
    }
    // Redirect to checkout page, passing address info
    navigate("/checkout", { state: { addressInfo } });
  };

  // Load cart items from localStorage
  useEffect(() => {
    setLoading(true);
    try {
      const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
      // Sort items by timestamp, newest first
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
      <div style={{ minHeight: "100vh", background: "#FEFEF8" }}>
        <GlobalHeader />
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
          <p>Loading cart...</p>
        </div>
        <GlobalFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: "100vh", background: "#FEFEF8" }}>
        <GlobalHeader />
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
          <p style={{ color: "red" }}>{error}</p>
        </div>
        <GlobalFooter />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FEFEF8", position: "relative" }}>
      <GlobalHeader />
      <main style={{
        paddingTop: 80,
        paddingBottom: 120,
        width: "100%",
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "80px 1rem 120px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <h1 style={{ color: "#0F4B2E" }}>Your Cart</h1>
          <button
            onClick={() => navigate("/bulk-orders")}
            style={{
              background: "transparent",
              border: "1px solid #0F4B2E",
              padding: "8px 16px",
              borderRadius: "4px",
              cursor: "pointer",
              color: "#0F4B2E"
            }}
          >
            Continue Picking
          </button>
        </div>

        {cartItems.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: "3rem",
            background: "#fff",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            <h2 style={{ color: "#666", marginBottom: "1rem" }}>Your cart is empty</h2>
            <p style={{ marginBottom: "2rem" }}>Add some delicious platters to get started!</p>
            <button
              onClick={() => navigate("/bulk-orders")}
              style={{
                background: "#0F4B2E",
                color: "white",
                padding: "12px 24px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "1.1rem"
              }}
            >
              Browse Platters
            </button>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: "2rem" }}>
              {cartItems.map((item, index) => (
                <div
                  key={index}
                  style={{
                    background: "#fff",
                    padding: "1.5rem",
                    borderRadius: "12px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    marginBottom: "1rem"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                    <h3 style={{ color: "#0F4B2E" }}>{item.platterName}</h3>
                    <button
                      onClick={() => handleRemoveItem(index)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#ff4444",
                        cursor: "pointer"
                      }}
                    >
                      Remove
                    </button>
                  </div>

                  <div style={{ marginBottom: "1rem" }}>
                    {item.selections.map((selection, idx) => (
                      <div key={idx}>
                        <h4 style={{ color: "#666", fontSize: "0.9rem" }}>{selection.categoryName}</h4>
                        <p style={{ marginLeft: "1rem" }}>
                          {selection.items.map(item => item.name).join(", ")}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <label style={{ marginRight: "1rem" }}>Quantity:</label>
                      <input
                        type="number"
                        min="15"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(index, parseInt(e.target.value))}
                        style={{
                          width: "80px",
                          padding: "8px",
                          borderRadius: "4px",
                          border: "1px solid #ccc"
                        }}
                      />
                    </div>
                    <div>
                      <span style={{ marginRight: "1rem" }}>₹{item.singlePlatterPrice.toFixed(2)} / plate</span>
                      <strong>Total: ₹{item.totalPrice.toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{
              position: "fixed",
              bottom: 56,
              left: 0,
              width: "100%",
              background: "#fff",
              boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
              padding: "1rem",
              zIndex: 1002,
              borderTop: "1px solid #eee"
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                maxWidth: "1000px",
                margin: "0 auto"
              }}>
                <div>
                  <strong style={{ fontSize: "1.5rem" }}>Total: ₹{totalPrice.toFixed(2)}</strong>
                </div>
                <button
                  onClick={handleCheckout}
                  style={{
                    padding: "12px 24px",
                    background: "#0F4B2E",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "1.1rem"
                  }}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      <div style={{ position: "fixed", bottom: 0, left: 0, width: "100%", zIndex: 1000 }}>
        <GlobalFooter />
      </div>
    </div>
  );
};

export default CartPage;
