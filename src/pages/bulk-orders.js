// src/components/BulkOrders.js
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // Assuming your firebase config is in../firebase.js
import PlatterCard from "./platter-card"; // Import the separated PlatterCard component

import "./bulk-orders.css"; // Import main page styles
import { GlobalFooter, GlobalHeader } from "../components/GlobalHeader&Footer";

const BulkOrders = () => {
  const [platters, setPlatters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlatters = async () => {
      setLoading(true);
      setError(null); // Clear previous errors
      try {
        const plattersRef = collection(db, "Authentic Platters");
        const snapshot = await getDocs(plattersRef);
        if (snapshot.empty) {
          console.log('No platters found');
          setPlatters([]);
          return;
        }
        
        const fetchedPlatters = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || '',
            description: data.description || '',
            price: data.price || null,
            imageUrl: data.imageUrl || data.image_url || null,
            ...data  // Include any other fields
          };
        });
        
        console.log('Fetched platters:', fetchedPlatters); // For debugging
        setPlatters(fetchedPlatters);
      } catch (err) {
        console.error("Error fetching platters:", err);
        setError("Failed to load platters. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlatters();
  },[]);

  // Height of header and footer (should match CSS, adjust if needed)
  const HEADER_HEIGHT = 64; // px
  const FOOTER_HEIGHT = 56; // px
  return (
    <div
      className="bulk-orders-wrapper"
      style={{
        minHeight: "100vh",
        background: "#FEFEF8",
        position: "relative"
      }}
    >
      <div style={{ position: "fixed", top: 0, left: 0, width: "100%", zIndex: 1000 }}>
        <GlobalHeader />
      </div>
      <main
        className="bulk-orders-main"
        style={{
          minHeight: `calc(100vh - ${HEADER_HEIGHT + FOOTER_HEIGHT}px)`,
          paddingTop: HEADER_HEIGHT + 16,
          paddingBottom: FOOTER_HEIGHT + 16,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          width: "100%",
          maxWidth: "1200px",
          margin: "0 auto"
        }}
      >
        <h1 className="bulk-orders-title" style={{ textAlign: "center" }}>Bulk Order Platters</h1>
        <p className="bulk-orders-description" style={{ textAlign: "center", maxWidth: "600px" }}>
          Order in bulk for offices, hostels, or events. Choose from our authentic platters below.
        </p>

        {loading && (
          <div className="loading-indicator">
            <p>Loading platters...</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && platters.length === 0 && (
          <div className="no-platters-found">
            <p>No platters found.</p>
          </div>
        )}

        {!loading && !error && platters.length > 0 && (
          <div className="platters-grid" style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "2rem" }}>
            {platters.map(platter => (
              <div key={platter.id} style={{ width: "100%", maxWidth: "700px" }}>
                <PlatterCard platter={platter} />
              </div>
            ))}
          </div>
        )}
      </main>
      <div style={{ position: "fixed", bottom: 0, left: 0, width: "100%", zIndex: 1000 }}>
        <GlobalFooter />
      </div>
    </div>
  );
};

export default BulkOrders;