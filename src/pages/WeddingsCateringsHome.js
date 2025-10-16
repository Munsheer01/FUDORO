// pages/WeddingsCateringsHome.js
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import styles from "./WeddingsCateringsHome.module.css";
import { GlobalFooter, GlobalHeader } from "../components/GlobalHeader&Footer";

// Enhanced Wedding Catering Menu Card Component - Following BulkOrders Design
const CateringMenuCard = React.memo(function CateringMenuCard({ 
  menu, 
  onSelect, 
  isSelected 
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showMenuDetails, setShowMenuDetails] = useState(false);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  const handleCardClick = useCallback(() => {
    onSelect(menu);
  }, [menu, onSelect]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(menu);
    }
  }, [menu, onSelect]);

  const formattedPrice = useMemo(() => {
    const pricePerPlate = menu.price?.perPlate || 0;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(pricePerPlate);
  }, [menu.price]);

  const tierColors = {
    silver: '#C0C0C0',
    gold: '#FFD700',
    platinum: '#E5E4E2'
  };

  const totalMenuItems = useMemo(() => {
    if (!menu.menuItems) return 0;
    return Object.values(menu.menuItems).reduce((total, items) => {
      return total + (Array.isArray(items) ? items.length : 0);
    }, 0);
  }, [menu.menuItems]);

  const toggleMenuDetails = useCallback((e) => {
    e.stopPropagation();
    setShowMenuDetails(prev => !prev);
  }, []);

  return (
    <div
      className={`${styles.menuCard} ${isSelected ? styles.selected : ""}`}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Select ${menu.name} wedding catering menu`}
    >
      <div className={styles.menuImageContainer}>
        {!imageError && (
          <img
            src={menu.imageUrl || "https://placehold.co/400x250/0A5247/EDD49B?text=Wedding+Menu&font=poppins"}
            alt={menu.name}
            className={`${styles.menuImage} ${imageLoaded ? styles.loaded : ""}`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        )}
        <div className={styles.menuImageOverlay} />
        
        {/* Tier Badge */}
        <div 
          className={styles.tierBadge}
          style={{ backgroundColor: tierColors[menu.tier] }}
        >
          {menu.tier?.toUpperCase()}
        </div>
        
        {/* Popular Badge */}
        {menu.meta?.popularity >= 90 && (
          <div className={styles.popularBadge}>
            ⭐ Popular
          </div>
        )}
        
        {/* Cuisine Badge */}
        <div className={styles.cuisineBadge}>
          {menu.cuisine}
        </div>
        
        {/* Selected Badge */}
        {isSelected && (
          <div className={styles.selectedBadge}>
            ✓ Selected
          </div>
        )}
      </div>

      <div className={styles.menuContent}>
        <h3 className={styles.menuName}>{menu.name}</h3>
        <p className={styles.menuDescription}>{menu.description}</p>

        <div className={styles.menuDetails}>
          <div className={styles.servingInfo}>
            <span className={styles.servingText}>
              👥 {menu.serves?.display}
            </span>
          </div>
          
          <div className={styles.menuFeatures}>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>🍽️</span>
              <span>{totalMenuItems} Total Items</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>⏱️</span>
              <span>{menu.timing?.preparationTime}</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>📍</span>
              <span>{menu.location?.city}, {menu.location?.state}</span>
            </div>
          </div>

          <div className={styles.businessRules}>
            <div className={styles.minOrder}>
              Min: {menu.businessRules?.minimumOrder} guests
            </div>
            <div className={styles.advanceBooking}>
              Book: {menu.businessRules?.advanceBooking} ahead
            </div>
          </div>
        </div>

        {/* Menu Categories Preview */}
        <div className={styles.categoriesPreview}>
          <button
            className={styles.categoriesToggle}
            onClick={toggleMenuDetails}
            aria-expanded={showMenuDetails}
          >
            <span>View Menu Items</span>
            <span>{showMenuDetails ? '▲' : '▼'}</span>
          </button>
          
          {showMenuDetails && (
            <div className={styles.categoriesList}>
              {Object.entries(menu.menuItems || {}).map(([category, items]) => (
                <div key={category} className={styles.categoryItem}>
                  <strong>{category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</strong>
                  <span className={styles.selectionType}>({Array.isArray(items) ? items.length : 0} items)</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pricing Section */}
        <div className={styles.pricingSection}>
          <div className={styles.priceRow}>
            <span className={styles.priceLabel}>Price per Plate:</span>
            <span className={styles.priceValue}>{formattedPrice}</span>
          </div>
          <div className={styles.priceUnit}>
            Example: {menu.price?.exampleGuests} guests = ₹{(menu.price?.totalCostExample || 0).toLocaleString('en-IN')}
          </div>
        </div>

        <button 
          className={`${styles.selectButton} ${isSelected ? styles.selected : ""}`}
          onClick={handleCardClick}
        >
          {isSelected ? "✓ Selected" : "+ Select Menu"}
        </button>
      </div>
    </div>
  );
});

// Main Wedding Catering Services Component
const WeddingsCateringsHome = () => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [filters, setFilters] = useState({
    tier: '',
    minGuests: '',
    maxGuests: ''
  });

  const navigate = useNavigate();

  // Fetch wedding catering menus from Firestore
  const fetchMenus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const menusRef = collection(db, "weddings_caterings");
      const q = query(
        menusRef,
        where("isActive", "==", true),
        orderBy("price.perPlate", "asc")
      );

      const snapshot = await getDocs(q);
      const fetchedMenus = [];

      snapshot.forEach((doc) => {
        fetchedMenus.push({
          id: doc.id,
          ...doc.data()
        });
      });

      setMenus(fetchedMenus);
    } catch (err) {
      console.error("Error fetching wedding catering menus:", err);
      setError("Failed to load wedding catering menus. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenus();
  }, [fetchMenus]);

  // Filter menus based on selected filters
  const filteredMenus = useMemo(() => {
    return menus.filter(menu => {
      if (filters.tier && menu.tier !== filters.tier) return false;
      
      if (filters.minGuests) {
        const minGuests = parseInt(filters.minGuests);
        if (menu.serves?.max < minGuests) return false;
      }
      
      if (filters.maxGuests) {
        const maxGuests = parseInt(filters.maxGuests);
        if (menu.serves?.min > maxGuests) return false;
      }
      
      return true;
    });
  }, [menus, filters]);

  const handleMenuSelect = useCallback((menu) => {
    setSelectedMenu(selectedMenu?.id === menu.id ? null : menu);
  }, [selectedMenu]);

  const handleFilterChange = useCallback((filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      tier: '',
      minGuests: '',
      maxGuests: ''
    });
  }, []);

  const handleProceedToCustomize = useCallback(() => {
    if (selectedMenu) {
      navigate('/catering/customize', { 
        state: { selectedMenu } 
      });
    }
  }, [selectedMenu, navigate]);

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <GlobalHeader />
        <main className={styles.main}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <h3>Loading wedding catering menus...</h3>
            <p>Preparing our finest wedding feast options for you</p>
          </div>
        </main>
        <GlobalFooter />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.wrapper}>
        <GlobalHeader />
        <main className={styles.main}>
          <div className={styles.errorContainer}>
            <div className={styles.errorIcon}>⚠️</div>
            <h3>Oops! Something went wrong</h3>
            <p>{error}</p>
            <button className={styles.retryButton} onClick={fetchMenus}>
              🔄 Try Again
            </button>
          </div>
        </main>
        <GlobalFooter />
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <GlobalHeader />
      <main className={styles.main}>
        {/* Hero Section */}
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Wedding Catering Services
            </h1>
            <p className={styles.heroDescription}>
              Create unforgettable wedding celebrations with our traditional Indian feast menus. 
              Fixed menus designed for large gatherings with authentic flavors and professional service.
            </p>
            <div className={styles.heroStats}>
              <div className={styles.stat}>
                <span className={styles.statNumber}>{menus.length}</span>
                <span className={styles.statLabel}>Premium Menus</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>500+</span>
                <span className={styles.statLabel}>Weddings Served</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>24/7</span>
                <span className={styles.statLabel}>Support Available</span>
              </div>
            </div>
          </div>
        </section>

        {/* Filters Section */}
        <section className={styles.filtersSection}>
          <div className={styles.filtersContainer}>
            <h2 className={styles.filtersTitle}>Find Your Perfect Wedding Menu</h2>
            <div className={styles.filterGroups}>
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Menu Tier:</label>
                <select
                  className={styles.filterSelect}
                  value={filters.tier}
                  onChange={(e) => handleFilterChange('tier', e.target.value)}
                >
                  <option value="">All Tiers</option>
                  <option value="silver">Silver - Budget Friendly</option>
                  <option value="gold">Gold - Balanced Premium</option>
                  <option value="platinum">Platinum - Luxury</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Min Guests:</label>
                <select
                  className={styles.filterSelect}
                  value={filters.minGuests}
                  onChange={(e) => handleFilterChange('minGuests', e.target.value)}
                >
                  <option value="">Any</option>
                  <option value="100">100+</option>
                  <option value="200">200+</option>
                  <option value="500">500+</option>
                  <option value="1000">1000+</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Max Guests:</label>
                <select
                  className={styles.filterSelect}
                  value={filters.maxGuests}
                  onChange={(e) => handleFilterChange('maxGuests', e.target.value)}
                >
                  <option value="">Any</option>
                  <option value="500">Up to 500</option>
                  <option value="1000">Up to 1000</option>
                  <option value="1500">Up to 1500</option>
                  <option value="2000">Up to 2000</option>
                </select>
              </div>

              <div className={styles.resultsCount}>
                {filteredMenus.length} menu{filteredMenus.length !== 1 ? 's' : ''} available
              </div>
            </div>

            {(filters.tier || filters.minGuests || filters.maxGuests) && (
              <button className={styles.clearFiltersBtn} onClick={clearFilters}>
                ✕ Clear Filters
              </button>
            )}
          </div>
        </section>

        {/* Menus Section */}
        <section className={styles.menusSection}>
          <div className={styles.menusContainer}>
            {filteredMenus.length === 0 ? (
              <div className={styles.noResults}>
                <div className={styles.noResultsIcon}>🍽️</div>
                <h3>No wedding menus found</h3>
                <p>Try adjusting your filters to see more options.</p>
                <button className={styles.clearFiltersButton} onClick={clearFilters}>
                  🔄 Clear Filters
                </button>
              </div>
            ) : (
              <div className={styles.menusGrid}>
                {filteredMenus.map((menu) => (
                  <CateringMenuCard
                    key={menu.id}
                    menu={menu}
                    onSelect={handleMenuSelect}
                    isSelected={selectedMenu?.id === menu.id}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Contact Section */}
        <section className={styles.contactSection}>
          <div className={styles.contactContainer}>
            <h2 className={styles.contactTitle}>Need Help Planning Your Wedding?</h2>
            <p className={styles.contactDescription}>
              Our wedding catering specialists are here to help you create the perfect feast for your special day.
            </p>
            <div className={styles.contactInfo}>
              <div className={styles.contactLocation}>
                <h3>Wedding Catering Specialists</h3>
                <p>+91 8919354409 / +91 9703344431</p>
              </div>
              <div className={styles.contactLocation}>
                <h3>Event Planning Support</h3>
                <p>+91 7396081234 / +91 9246946473</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Action Bar */}
      {selectedMenu && (
        <div className={styles.bottomActionBar}>
          <div className={styles.orderSummary}>
            <div className={styles.selectedSummary}>
              <div className={styles.selectedCount}>
                Selected: {selectedMenu.name}
              </div>
              <div className={styles.selectedQuantity}>
                {selectedMenu.serves?.display} • {selectedMenu.tier?.toUpperCase()} Menu
              </div>
            </div>
            <div className={styles.estimatedTotal}>
              From ₹{selectedMenu.price?.perPlate}/plate
            </div>
          </div>
          <button 
            className={styles.proceedButton}
            onClick={handleProceedToCustomize}
          >
            Customize Order →
          </button>
        </div>
      )}

      <GlobalFooter />
    </div>
  );
};

export default WeddingsCateringsHome;
