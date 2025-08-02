import React, { useEffect, useState } from "react";
import { GlobalHeader, GlobalFooter } from "../components/GlobalHeader&Footer";
import PlatterCard from "./platter-card";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function CateringServices() {
  const [cateringPlatters, setCateringPlatters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCateringPlatters() {
      setLoading(true);
      setError(""); 
      try {
        // Fetch all platters from the same collection as bulk orders
        const snapshot = await getDocs(collection(db, "Authentic Platters"));
        // Use the same filtering logic as BulkOrders for catering cards
        const platters = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(platter => {
            // Check for a 'type' or 'category' field, or a 'isCatering' boolean
            return (
              platter.type === "catering" ||
              platter.category === "catering" ||
              platter.isCatering === true ||
              (platter.tags && Array.isArray(platter.tags) && platter.tags.includes("catering"))
            );
          });
        setCateringPlatters(platters);
      } catch (err) {
        setError("Failed to load catering services. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchCateringPlatters();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#FEFEF8", position: "relative" }}>
      <GlobalHeader />
      <main style={{
        paddingTop: 80,
        paddingBottom: 120,
        width: "100%",
        maxWidth: "900px",
        margin: "0 auto",
        padding: "0 1rem",
        position: "relative",
        zIndex: 1,
      }}>
        <h1 style={{ textAlign: "center", color: "#0F4B2E", marginBottom: "2rem" }}>Catering Services</h1>
        <p style={{ textAlign: "center", color: "#0F4B2E", marginBottom: "2rem", fontSize: "1.1rem" }}>
          Professional catering for weddings, parties, and corporate events. Choose from a wide range of cuisines and menu options.
        </p>
        {loading && <div style={{ textAlign: "center", color: "#0F4B2E" }}>Loading catering services...</div>}
        {error && <div style={{ textAlign: "center", color: "red" }}>{error}</div>}
        {!loading && !error && cateringPlatters.length === 0 && (
          <div style={{ textAlign: "center", color: "#0F4B2E" }}>No catering services found.</div>
        )}
        {!loading && !error && cateringPlatters.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem", alignItems: "center" }}>
            {cateringPlatters.map(platter => (
              <div key={platter.id} style={{ width: "100%", maxWidth: "700px" }}>
                <PlatterCard platter={platter} />
              </div>
            ))}
          </div>
        )}
      </main>
      <GlobalFooter />
    </div>
  );
}
