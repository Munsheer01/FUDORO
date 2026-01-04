// src/components/PlatterCard.js
import React from "react";
import { useNavigate } from "react-router-dom";
import mealBoxImg from "../assets/MealBox.jpg"; // Default image if none is provided
import styles from "./HomeScreen.module.css"

import "./platter-card.css"; // Import card-specific styles

const PlatterCard = ({ platter }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/bulk-orders/${platter.id}`);
  };

  // Determine the image URL, prioritizing imageUrl, then image_url, then default
  const displayImageUrl =
    platter.imageUrl ||
    platter.image_url ||
    mealBoxImg;

  // Format price display
  const priceDisplay =
    platter.price && typeof platter.price === "object" && platter.price.min!== undefined && platter.price.max!== undefined? (
      <span className="platter-price">₹{platter.price.min} - ₹{platter.price.max}</span>
    ) : platter.price!== undefined? (
      <span className="platter-price">₹{platter.price}</span>
    ) : (
      <span className="platter-price">Price not available</span>
    );

  return (
    <div className={styles.sectionCard} onClick={handleClick} tabIndex={0} role="button">
      <div className="platter-image-container">
        <img
          src={displayImageUrl}
          alt={platter.name}
          className="platter-image"
          onError={(e) => { e.target.src = mealBoxImg; }} // Fallback for broken images
        />
        <div className="platter-image-overlay"></div> {/* For subtle effects */}
      </div>
      <div className={styles.sectionContent}>
        <h3 className="platter-name">{platter.name}</h3>
        <p className={styles.sectionDesc}>{platter.description}</p>
        {priceDisplay}
      </div>
      <div className="platter-card-border-glow"></div> {/* For glowing border effect */}
    </div>
  );
};

export default PlatterCard;