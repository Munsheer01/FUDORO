import React, { useState } from "react";
import styles from "./HomeScreen.module.css";
import { GlobalHeader, GlobalFooter } from "../components/GlobalHeader&Footer";

// Section data
const sections = [
  {
    key: "meal-boxes",
    title: "Meal Boxes",
    description:
      "Curated meal boxes for individuals and families. Fresh, healthy, and delivered to your doorstep. Perfect for daily meals or special occasions.",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80",
    link: "/meal-boxes",
  },
  {
    key: "bulk-orders",
    title: "Bulk Orders",
    description:
      "Order in bulk for offices, hostels, or events. Hygienic, reliable, and customizable to your needs. Enjoy seamless delivery and great value.",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80",
    link: "/bulk-orders",
  },
  {
    key: "catering-services",
    title: "Catering Services",
    description:
      "Professional catering for weddings, parties, and corporate events. Choose from a wide range of cuisines and menu options.",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80",
    link: "/catering-services",
  },
  {
    key: "live-counters",
    title: "Live Counters",
    description:
      "Add excitement to your event with live food counters. Our chefs prepare dishes on-site, ensuring freshness and a memorable experience.",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80",

    link: "/live-counters",
  },
];

function HomeSection({ section }) {
  return (
    <div className={styles.sectionCard}>
      <div className={styles.imageContainer}>
        <img
          src={section.image}
          alt={section.title}
          className={styles.sectionImage}
        />
      </div>
      <div className={styles.sectionContent}>
        <h2 className={styles.sectionTitle}>{section.title}</h2>
        <p className={styles.sectionDesc}>{section.description}</p>
        <a
          href={section.link}
          className={styles.exploreLink}
        >
          Explore More &rarr;
        </a>
      </div>
    </div>
  );
}

export default function HomeScreen() {
  // Popup/modal state
  const [showModal, setShowModal] = useState(true);
  const [quantity, setQuantity] = useState(15);
  const [pincode, setPincode] = useState("");
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState("");
  const [availabilityResult, setAvailabilityResult] = useState("");

  // Location reading function
  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLocation({ lat, lng });
        setLocationError("");
        // Reverse geocode to get pincode
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
          const data = await response.json();
          // Try to extract pincode from address
          let pin = "";
          if (data && data.address) {
            pin = data.address.postcode || "";
          }
          if (pin) {
            setPincode(pin);
          } else {
            setLocationError("Could not auto-detect pincode for your location.");
          }
        } catch (err) {
          setLocationError("Error fetching pincode from location.");
        }
      },
      (err) => {
        setLocationError("Unable to retrieve your location.");
      }
    );
  };

  // Check availability (dummy logic)
  const handleCheckAvailability = () => {
    if (!pincode || pincode.length < 5) {
      setAvailabilityResult("Please enter a valid pincode.");
      return;
    }
    // Simulate delivery check
    if (pincode.startsWith("5")) {
      setAvailabilityResult("Delivery available to this pincode!");
    } else {
      setAvailabilityResult("Sorry, delivery is not available to this pincode.");
    }
  };

  // Modal content
  const modalContent = (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      background: "rgba(0,0,0,0.45)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{
        background: "#fff",
        borderRadius: "16px",
        boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
        padding: "2.5rem 2rem 2rem 2rem",
        maxWidth: "400px",
        width: "90vw",
        textAlign: "center",
        position: "relative"
      }}>
        <h2 style={{ color: "#0F4B2E", marginBottom: "1.2rem" }}>Welcome to FUDORO!</h2>
        <p style={{ marginBottom: "1.2rem", fontSize: "1.05rem" }}>
          Please choose your order quantity and check delivery availability.
        </p>
        <div style={{ marginBottom: "1.2rem" }}>
          <label htmlFor="quantity" style={{ fontWeight: "bold", display: "block", marginBottom: "0.5rem" }}>Plates:</label>
          <input
            type="number"
            id="quantity"
            min={1}
            max={1000}
            value={quantity}
            onChange={e => setQuantity(Number(e.target.value))}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc", marginBottom: "0.5rem" }}
          />
          <div style={{ fontSize: "0.98rem", color: "#0F4B2E", marginTop: "0.5rem" }}>
            {quantity <= 100 ? (
              <span>For <b>15-100 plates</b>, please choose <b>Meal Boxes</b> or <b>Bulk Orders</b>.</span>
            ) : (
              <span style={{ color: "#d32f2f", fontWeight: 600 }}>For <b>more than 100 plates</b>, please choose <b>Catering Services</b>.</span>
            )}
          </div>
        </div>
        <div style={{ marginBottom: "1.2rem" }}>
          <label htmlFor="pincode" style={{ fontWeight: "bold", display: "block", marginBottom: "0.5rem" }}>Enter your pincode:</label>
          <input
            type="text"
            id="pincode"
            value={pincode}
            onChange={e => setPincode(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ccc" }}
            maxLength={6}
          />
        </div>
        <div style={{ marginBottom: "1.2rem" }}>
          <button
            onClick={handleGetLocation}
            style={{ padding: "10px 18px", background: "#0F4B2E", color: "#fff", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}
          >
            Choose Your Location
          </button>
          {location && (
            <div style={{ marginTop: "0.7rem", fontSize: "0.95rem", color: "#0F4B2E" }}>
              Location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
            </div>
          )}
          {locationError && (
            <div style={{ marginTop: "0.7rem", color: "red", fontSize: "0.95rem" }}>{locationError}</div>
          )}
        </div>
        <div style={{ marginBottom: "1.2rem" }}>
          <button
            onClick={handleCheckAvailability}
            style={{ padding: "10px 18px", background: "#EDD49B", color: "#0F4B2E", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: 600 }}
          >
            Check Availability
          </button>
          {availabilityResult && (
            <div style={{ marginTop: "0.7rem", color: availabilityResult.includes("available") ? "#0F4B2E" : "red", fontWeight: 600 }}>
              {availabilityResult}
            </div>
          )}
        </div>
        <button
          onClick={() => setShowModal(false)}
          style={{ position: "absolute", top: "12px", right: "16px", background: "transparent", border: "none", fontSize: "1.5rem", color: "#0F4B2E", cursor: "pointer" }}
          title="Close"
        >
          &times;
        </button>
      </div>
    </div>
  );

  return (
    <div className={styles.wrapper}>
      <GlobalHeader />
      <main className={styles.main}>
        <div className={styles.sectionsGrid}>
          {sections.map((section) => (
            <HomeSection
              key={section.key}
              section={section}
            />
          ))}
        </div>
      </main>
      <GlobalFooter />
      {showModal && modalContent}
    </div>
  );
}
