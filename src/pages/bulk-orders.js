import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import styles from "./BulkOrders.module.css";
import { GlobalFooter, GlobalHeader } from "../components/GlobalHeader&Footer";

// Enhanced Platter Card Component - Functionality Preserved, Design Aligned
const PlatterCard = React.memo(function PlatterCard({ platter, onSelect, isSelected, selectedQuantity }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const handleCardClick = useCallback(() => {
    onSelect(platter);
  }, [platter, onSelect]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(platter);
    }
  }, [platter, onSelect]);

  const formattedPrice = useMemo(() => {
    const basePrice = platter.price?.base || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(basePrice);
  }, [platter.price]);

  const priceRange = useMemo(() => {
    if (platter.price?.min !== platter.price?.max && platter.price?.min && platter.price?.max) {
      return `₹${platter.price.min} - ₹${platter.price.max}`;
    }
    return null;
  }, [platter.price]);

  const totalCategories = Object.keys(platter.categories || {}).filter(
    key => key !== 'complimentary'
  ).length;

  const toggleCategories = useCallback((e) => {
    e.stopPropagation();
    setShowCategories(prev => !prev);
  }, []);

  return (
    <div 
      className={`${styles.platterCard} ${isSelected ? styles.selected : ''}`}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Select ${platter.name} platter`}
    >
      <div className={styles.platterImageContainer}>
        <img
          src={platter.imageUrl || '/assets/platter-placeholder.jpg'}
          alt={platter.name}
          className={`${styles.platterImage} ${imageLoaded ? styles.loaded : ''}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        <div className={styles.platterImageOverlay}></div>
        
        {/* Badges */}
        
        <div className={styles.compartmentsBadge}>
          {totalCategories} Categories
        </div>
        
        {platter.cuisine && (
          <div className={styles.cuisineBadge}>{platter.cuisine}</div>
        )}
        
        {selectedQuantity > 0 && (
          <div className={styles.selectedBadge}>
            ✓ {selectedQuantity} Selected
          </div>
        )}
        
        <div className={`${styles.foodTypeIndicator} ${platter.isVeg ? styles.veg : styles.nonVeg}`}>
          <span className={styles.foodTypeIcon}>
            {platter.isVeg ? '🌱' : '🍗'}
          </span>
        </div>
      </div>

      <div className={styles.platterContent}>
        <h3 className={styles.platterName}>{platter.name}</h3>
        <p className={styles.platterDescription}>{platter.description}</p>

        <div className={styles.platterDetails}>
          <div className={styles.servingInfo}>
            <span className={styles.servingText}>
              Serves {platter.servingInfo?.serves || '15+'} people
            </span>
          </div>

          <div className={styles.platterFeatures}>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>🍽️</span>
              <span>{totalCategories} categories</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>⏱️</span>
              <span>{platter.businessRules?.preparationTime || '45-60'} min</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>👥</span>
              <span>{platter.servingInfo?.serves || '15+'} people</span>
            </div>
          </div>

          <div className={styles.businessRules}>
            {platter.businessRules?.minimumOrder && (
              <div className={styles.minOrder}>
                Min {platter.businessRules.minimumOrder} plates
              </div>
            )}
            {platter.businessRules?.advanceBookingHours && (
              <div className={styles.advanceBooking}>
                {platter.businessRules.advanceBookingHours}h advance booking
              </div>
            )}
          </div>
        </div>

        {/* Categories Preview - Functionality Preserved */}
        {platter.categories && Object.keys(platter.categories).length > 0 && (
          <div className={styles.categoriesPreview}>
            <button 
              className={styles.categoriesToggle}
              onClick={toggleCategories}
              aria-expanded={showCategories}
            >
              <span>Food Categories ({totalCategories})</span>
              <span>{showCategories ? '▼' : '▶'}</span>
            </button>
            
            {showCategories && (
              <div className={styles.categoriesList}>
                {Object.entries(platter.categories).map(([key, category]) => {
                  if (key === 'complimentary') return null;
                  return (
                    <div key={key} className={styles.categoryItem}>
                      <strong>{category.displayName || key}</strong>
                      <span className={styles.selectionType}>
                        {category.selectionType?.replace('_', ' ')}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <div className={styles.pricingSection}>
          <div className={styles.priceRow}>
            <span className={styles.priceLabel}>Starting from:</span>
            <span className={styles.priceValue}>{formattedPrice}</span>
          </div>
          <div className={styles.priceUnit}>per plate</div>
          {priceRange && (
            <div className={styles.priceRange}>{priceRange}</div>
          )}
        </div>

        <button
          className={`${styles.selectButton} ${isSelected ? styles.selected : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
          aria-label={isSelected ? `Remove ${platter.name} from selection` : `Add ${platter.name} to selection`}
        >
          {isSelected ? `✓ Selected (${selectedQuantity})` : 'Select Platter'}
        </button>
      </div>
    </div>
  );
});

const BulkOrders = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [platters, setPlatters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlatters, setSelectedPlatters] = useState({});
  
  const [filters, setFilters] = useState({
    cuisine: 'all',
    priceRange: 'all',
    servingSize: 'all'
  });

  // Fetch platters from Firestore with optimized query
  useEffect(() => {
    const fetchPlatters = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching Enhanced Authentic Platters from Firestore...');
        
        // OPTIMIZED QUERY - Filter active platters and sort by popularity
        const platterQuery = query(
          collection(db, 'Enhanced_Authentic_Platters'),
          where('isActive', '==', true),
          orderBy('isPopular', 'desc')
        );
        
        const querySnapshot = await getDocs(platterQuery);
        
        if (querySnapshot.empty) {
          setError('No platters available at the moment. Please check back later.');
          return;
        }

        const plattersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        console.log(`Fetched ${plattersData.length} platters successfully`);
        setPlatters(plattersData);
      } catch (error) {
        console.error('Error fetching platters:', error);
        setError('Failed to load platters. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlatters();
  }, []);

  // Filter platters based on selected filters
  const filteredPlatters = useMemo(() => {
    let filtered = [...platters];

    if (filters.cuisine !== 'all') {
      filtered = filtered.filter(platter => {
        const platterCuisine = platter.cuisine?.toLowerCase() || '';
        const filterCuisine = filters.cuisine.toLowerCase();
        
        // For multi-cuisine filter, match platters with 'multi-cuisine' or those that contain multiple cuisines
        if (filterCuisine === 'multi-cuisine') {
          return platterCuisine === 'multi-cuisine' || platterCuisine.includes('multi');
        }
        
        // For specific cuisines, match exact or includes (in case of compound cuisine names)
        return platterCuisine === filterCuisine || platterCuisine.includes(filterCuisine);
      });
    }

    if (filters.priceRange !== 'all') {
      filtered = filtered.filter(platter => {
        const price = platter.price?.base || 0;
        switch (filters.priceRange) {
          case 'budget': return price <= 200;
          case 'premium': return price > 200 && price <= 400;
          case 'luxury': return price > 400;
          default: return true;
        }
      });
    }

    if (filters.servingSize !== 'all') {
      filtered = filtered.filter(platter => {
        const serves = parseInt(platter.servingInfo?.serves) || 15;
        switch (filters.servingSize) {
          case 'small': return serves <= 20;
          case 'medium': return serves > 20 && serves <= 50;
          case 'large': return serves > 50;
          default: return true;
        }
      });
    }

    return filtered;
  }, [platters, filters]);

  const handlePlatterSelect = useCallback((platter) => {
    setSelectedPlatters(prev => {
      const currentQuantity = prev[platter.id]?.quantity || 0;
      const minOrder = platter.businessRules?.minimumOrder || 15;
      
      if (currentQuantity === 0) {
        return {
          ...prev,
          [platter.id]: {
            platter,
            quantity: minOrder
          }
        };
      } else {
        const newPrev = { ...prev };
        delete newPrev[platter.id];
        return newPrev;
      }
    });
  }, []);

  const handleFilterChange = useCallback((filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      cuisine: 'all',
      priceRange: 'all',
      servingSize: 'all'
    });
  }, []);

  const handleProceedToCustomization = () => {
    if (Object.keys(selectedPlatters).length === 0) {
      alert('Please select at least one platter to proceed.');
      return;
    }

    navigate('/customize-order', {
      state: {
        selectedPlatters: selectedPlatters,
        orderType: 'bulk'
      }
    });
  };

  const selectedCount = Object.keys(selectedPlatters).length;
  const totalQuantity = Object.values(selectedPlatters).reduce(
    (sum, item) => sum + item.quantity, 0
  );
  const estimatedTotal = Object.values(selectedPlatters).reduce(
    (sum, item) => sum + (item.platter.price?.base || 0) * item.quantity, 0
  );

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <GlobalHeader />
        <div className={styles.main}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading delicious FUDORO platters...</p>
          </div>
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
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>⚠️</div>
            <h2>Oops! Something went wrong</h2>
            <p>{error}</p>
            <button 
              className={styles.retryButton}
              onClick={() => window.location.reload()}
            >
              Try Again
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
        {/* Hero Section - Matching MealBoxes Design */}
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>🍽️ FUDORO Bulk Orders</h1>
            <p className={styles.heroDescription}>
              Create unforgettable events with our authentic platter collections. 
              Perfect for corporate gatherings, family celebrations, and special occasions.
            </p>
            <div className={styles.heroStats}>
              <div className={styles.stat}>
                <span className={styles.statNumber}>{platters.length}</span>
                <span className={styles.statLabel}>Platter Types</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>15+</span>
                <span className={styles.statLabel}>People Served</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>50+</span>
                <span className={styles.statLabel}>Food Options</span>
              </div>
            </div>
          </div>
        </section>

        {/* Filters Section - Matching MealBoxes Design */}
        <section className={styles.filtersSection}>
          <div className={styles.filtersContainer}>
            <h3 className={styles.filtersTitle}>Filter Platters</h3>
            <div className={styles.filterGroups}>
              
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Cuisine:</label>
                <select
                  value={filters.cuisine}
                  onChange={(e) => handleFilterChange('cuisine', e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">All Cuisines</option>
                  <option value="north indian">North Indian</option>
                  <option value="south indian">South Indian</option>
                  <option value="chinese">Chinese</option>
                  <option value="continental">Continental</option>
                  <option value="multi-cuisine">Multi-Cuisine</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Price Range:</label>
                <select
                  value={filters.priceRange}
                  onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">All Prices</option>
                  <option value="budget">Budget (≤₹200)</option>
                  <option value="premium">Premium (₹201-400)</option>
                  <option value="luxury">Luxury (₹400+)</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Serving Size:</label>
                <select
                  value={filters.servingSize}
                  onChange={(e) => handleFilterChange('servingSize', e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">All Sizes</option>
                  <option value="small">Small (≤20 people)</option>
                  <option value="medium">Medium (21-50 people)</option>
                  <option value="large">Large (50+ people)</option>
                </select>
              </div>

              

              <div className={styles.resultsCount}>
                <span>{filteredPlatters.length} platter{filteredPlatters.length !== 1 ? 's' : ''} found</span>
              </div>
            </div>
            
            {(filters.cuisine !== 'all' || filters.priceRange !== 'all' || filters.servingSize !== 'all') && (
              <button 
                className={styles.clearFiltersBtn}
                onClick={handleClearFilters}
              >
                Clear All Filters
              </button>
            )}
          </div>
        </section>

        {/* Back Button Section */}
        <div className={styles.backButtonSection}>
          <button 
            className={styles.backButton}
            onClick={() => navigate('/home')}
            aria-label="Navigate back to home page"
          >
            ← Back to Home
          </button>
        </div>

        {/* Platters Grid - Matching MealBoxes Design */}
        <section className={styles.plattersSection}>
          <div className={styles.plattersContainer}>
            {filteredPlatters.length === 0 ? (
              <div className={styles.noResults}>
                <div className={styles.noResultsIcon}>🍽️</div>
                <h3>No platters found</h3>
                <p>Try adjusting your filters to see more options.</p>
                <button 
                  onClick={handleClearFilters}
                  className={styles.clearFiltersButton}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className={styles.plattersGrid}>
                {filteredPlatters.map((platter) => (
                  <PlatterCard
                    key={platter.id}
                    platter={platter}
                    onSelect={handlePlatterSelect}
                    isSelected={!!selectedPlatters[platter.id]}
                    selectedQuantity={selectedPlatters[platter.id]?.quantity || 0}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Contact Section - Matching MealBoxes Design */}
        <section className={styles.contactSection}>
          <div className={styles.contactContainer}>
            <h2 className={styles.contactTitle}>Ready to Place Your Bulk Order?</h2>
            <p className={styles.contactDescription}>
              Need help selecting the perfect platters for your event? Our team is here to assist you.
            </p>
            
            <div className={styles.contactInfo}>
              <div className={styles.contactLocation}>
                <h3>📍 Hyderabad</h3>
                <p>+91 8919354409 / +91 9703344431</p>
              </div>
              <div className={styles.contactLocation}>
                <h3>📍 Khammam</h3>
                <p>+91 7396081234 / +91 9246946473</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Fixed Bottom Action Bar - Functionality Preserved */}
      {selectedCount > 0 && (
        <div className={styles.bottomActionBar}>
          <div className={styles.orderSummary}>
            <div className={styles.selectedSummary}>
              <span className={styles.selectedCount}>
                {selectedCount} platter{selectedCount !== 1 ? 's' : ''} selected
              </span>
              <span className={styles.selectedQuantity}>
                {totalQuantity} total plates
              </span>
            </div>
            <div className={styles.estimatedTotal}>
              ₹{estimatedTotal.toLocaleString('en-IN')}
            </div>
          </div>
          
          <button 
            className={styles.proceedButton}
            onClick={handleProceedToCustomization}
          >
            Customize Order
          </button>
        </div>
      )}

      <GlobalFooter />
    </div>
  );
};

export default BulkOrders;
