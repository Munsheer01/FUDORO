import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { GlobalHeader, GlobalFooter } from "../components/GlobalHeader&Footer";

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  // Address info passed from cart page (which gets it from HomeScreen popup)
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
    mealType: "",
  });
  // Removed unused payment state

  // Handle input changes
  function handleChange(e) {
    setAddress({ ...address, [e.target.name]: e.target.value });
  }

  // Correctly define handleMealTypeChange as a top-level function
  function handleMealTypeChange(e) {
    setAddress({ ...address, mealType: e.target.value });
  }

  function handleFinish() {
    // TODO: Implement order submission logic
    alert("Order placed successfully!");
    navigate("/"); // Redirect to home or order confirmation
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FEFEF8", position: "relative" }}>
      <GlobalHeader />
      <main style={{
        paddingTop: 80,
        paddingBottom: 120,
        width: "100%",
        maxWidth: "600px",
        margin: "0 auto",
        padding: "0 1rem",
        position: "relative",
        zIndex: 1,
      }}>
        <h1 style={{ textAlign: "center", color: "#0F4B2E", marginBottom: "2rem" }}>Checkout</h1>
        <form style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem" }}>
            <div style={{ flex: "1 1 45%" }}>
              <label>Name</label>
              <input name="name" value={address.name} onChange={handleChange} required style={{ width: "100%" }} />
            </div>
            <div style={{ flex: "1 1 45%" }}>
              <label>Phone</label>
              <input name="phone" value={address.phone} onChange={handleChange} required style={{ width: "100%" }} />
            </div>
            <div style={{ flex: "1 1 45%" }}>
              <label>Pincode</label>
              <input name="pincode" value={address.pincode} onChange={handleChange} required style={{ width: "100%" }} />
            </div>
            <div style={{ flex: "1 1 45%" }}>
              <label>Locality</label>
              <input name="locality" value={address.locality} onChange={handleChange} required style={{ width: "100%" }} />
            </div>
            <div style={{ flex: "1 1 45%" }}>
              <label>City</label>
              <input name="city" value={address.city} onChange={handleChange} required style={{ width: "100%" }} />
            </div>
            <div style={{ flex: "1 1 45%" }}>
              <label>Street Address</label>
              <input name="street" value={address.street} onChange={handleChange} required style={{ width: "100%" }} />
            </div>
            <div style={{ flex: "1 1 45%" }}>
              <label>Landmark</label>
              <input name="landmark" value={address.landmark} onChange={handleChange} style={{ width: "100%" }} />
            </div>
            <div style={{ flex: "1 1 45%" }}>
              <label>Event Date</label>
              <input type="date" name="eventDate" value={address.eventDate} onChange={handleChange} style={{ width: "100%" }} />
            </div>
          </div>
          <div style={{ marginTop: "1.5rem" }}>
            <label style={{ marginRight: "1rem" }}>Meal Type:</label>
            <label style={{ marginRight: "1rem" }}>
              <input type="radio" name="mealType" value="Breakfast" checked={address.mealType === "Breakfast"} onChange={handleMealTypeChange} />
              Breakfast
            </label>
            <label style={{ marginRight: "1rem" }}>
              <input type="radio" name="mealType" value="Lunch" checked={address.mealType === "Lunch"} onChange={handleMealTypeChange} />
              Lunch
            </label>
            <label>
              <input type="radio" name="mealType" value="Dinner" checked={address.mealType === "Dinner"} onChange={handleMealTypeChange} />
              Dinner
            </label>
          </div>
          <button type="button" onClick={handleFinish} style={{ background: "#0F4B2E", color: "#fff", padding: "1rem", border: "none", borderRadius: "6px", fontSize: "1.1rem", marginTop: "2rem" }}>
            Finish
          </button>
        </form>
      </main>
      <GlobalFooter />
    </div>
  );
}
