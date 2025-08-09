import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import styles from "./MealBoxScreen.module.css";
import { GlobalHeader, GlobalFooter } from "../components/GlobalHeader&Footer";

const MealBoxScreen = () => {
  const navigate = useNavigate();
  const [mealBoxes, setMealBoxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    compartments: 'all',
    priceRange: 'all',
    mealType: 'all'
  });

  // Fetch meal boxes aligned with real data structure
  useEffect(() => {
    const fetchMealBoxes = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('🍱 Fetching Real FUDORO MealBoxes from Firestore...');
        
        const mealBoxQuery = query(
          collection(db, 'MealBoxes'),
          orderBy('configuration.totalCompartments', 'asc')
        );

        const querySnapshot = await getDocs(mealBoxQuery);
        
        if (querySnapshot.empty) {
          setError('No meal boxes found. Please check back later.');
          return;
        }

        const mealBoxesData = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          
          // Filter active meal boxes based on real data structure
          if (data.availability?.isActive !== false) {
            mealBoxesData.push({
              id: doc.id,
              ...data
            });
          }
        });

        console.log(`✅ Loaded ${mealBoxesData.length} real meal boxes`);
        setMealBoxes(mealBoxesData);
        
      } catch (err) {
        console.error('❌ Error fetching meal boxes:', err);
        setError('Failed to load meal boxes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMealBoxes();
  }, []);

  // Filter meal boxes based on real compartment counts (2, 3, 5, 7)
  const filteredMealBoxes = useMemo(() => {
    let filtered = [...mealBoxes];

    // Filter by compartments - aligned with real data
    if (filters.compartments !== 'all') {
      const compartmentCount = parseInt(filters.compartments);
      filtered = filtered.filter(mb => mb.configuration?.totalCompartments === compartmentCount);
    }

    // Filter by price range - based on real pricing
    if (filters.priceRange !== 'all') {
      filtered = filtered.filter(mb => {
        const vegPrice = mb.pricing?.veg?.basePrice || 0;
        switch (filters.priceRange) {
          case 'budget': return vegPrice <= 150; // Twin & Triple Treat
          case 'premium': return vegPrice > 150 && vegPrice <= 250; // Mega Meal Box  
          case 'luxury': return vegPrice > 250; // Grand Meal Box
          default: return true;
        }
      });
    }

    return filtered;
  }, [mealBoxes, filters]);

  const handleMealBoxSelect = useCallback((mealBox) => {
    navigate('/customize-meal-box', {
      state: {
        selectedMealBox: mealBox,
        orderType: 'meal-box'
      }
    });
  }, [navigate]);

  const handleFilterChange = useCallback((filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  }, []);

  if (loading) {
    return (
      <div className={styles.wrapper}>
        <GlobalHeader />
        <div className={styles.main}>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner}></div>
            <p>Loading authentic FUDORO meal boxes...</p>
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
            <h2>Oops! Something went wrong</h2>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>
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
        {/* Hero Section - Updated with real business info */}
        <section className={styles.heroSection}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>🍱 FUDORO Meal Boxes</h1>
            <p className={styles.heroDescription}>
              Elevate your event with custom meal boxes. Catering food meal boxes offer a convenient 
              and efficient way to provide delicious, high-quality meals for various occasions.
            </p>
            <div className={styles.heroStats}>
              <div className={styles.stat}>
                <span className={styles.statNumber}>4</span>
                <span className={styles.statLabel}>Meal Box Types</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>2-7</span>
                <span className={styles.statLabel}>Compartments</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>50+</span>
                <span className={styles.statLabel}>Food Options</span>
              </div>
            </div>
          </div>
        </section>

        {/* Filters Section - Updated with real compartment options */}
        <section className={styles.filtersSection}>
          <div className={styles.filtersContainer}>
            <h3 className={styles.filtersTitle}>Filter Meal Boxes</h3>
            <div className={styles.filterGroups}>
              
              <div className={styles.filterGroup}>
                <label className={styles.filterLabel}>Compartments:</label>
                <select
                  value={filters.compartments}
                  onChange={(e) => handleFilterChange('compartments', e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">All</option>
                  <option value="2">2 Compartments (Twin Treat)</option>
                  <option value="3">3 Compartments (Triple Treat)</option>
                  <option value="5">5 Compartments (Mega Meal)</option>
                  <option value="7">7 Compartments (Grand Meal)</option>
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
                  <option value="budget">Budget (₹120-180)</option>
                  <option value="premium">Premium (₹200-250)</option>
                  <option value="luxury">Luxury (₹280+)</option>
                </select>
              </div>

              <div className={styles.resultsCount}>
                <span>{filteredMealBoxes.length} meal box{filteredMealBoxes.length !== 1 ? 'es' : ''} found</span>
              </div>
            </div>
          </div>
        </section>

        {/* Meal Boxes Grid - Updated with real data display */}
        <section className={styles.mealBoxesSection}>
          <div className={styles.mealBoxesContainer}>
            {filteredMealBoxes.length === 0 ? (
              <div className={styles.noResults}>
                <div className={styles.noResultsIcon}>🍱</div>
                <h3>No meal boxes found</h3>
                <p>Try adjusting your filters to see more options.</p>
                <button 
                  onClick={() => setFilters({ compartments: 'all', priceRange: 'all', mealType: 'all' })}
                  className={styles.clearFiltersBtn}
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className={styles.mealBoxesGrid}>
                {filteredMealBoxes.map((mealBox) => (
                  <div key={mealBox.id} className={styles.mealBoxCard}>
                    <div className={styles.mealBoxImage}>
                      <img
                        src={mealBox.media?.imageUrl || '/assets/meal-box-placeholder.jpg'}
                        alt={mealBox.name}
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = '/assets/meal-box-placeholder.jpg';
                        }}
                      />
                      <div className={styles.compartmentsBadge}>
                        {mealBox.configuration?.totalCompartments} Compartments
                      </div>
                      {mealBox.availability?.isPopular && (
                        <div className={styles.popularBadge}>Popular</div>
                      )}
                    </div>

                    <div className={styles.mealBoxContent}>
                      <h3 className={styles.mealBoxTitle}>{mealBox.name}</h3>
                      <p className={styles.mealBoxDescription}>{mealBox.description}</p>

                      {/* Real compartment layout display */}
                      <div className={styles.compartmentLayout}>
                        <h4 className={styles.layoutTitle}>Compartments:</h4>
                        <div className={styles.compartmentList}>
                          {mealBox.configuration?.layout?.map((comp, index) => (
                            <span key={index} className={styles.compartmentTag}>
                              {comp.displayName}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className={styles.mealBoxFeatures}>
                        <div className={styles.feature}>
                          <span className={styles.featureIcon}>🍽️</span>
                          <span>{mealBox.configuration?.totalCompartments} compartments</span>
                        </div>
                        <div className={styles.feature}>
                          <span className={styles.featureIcon}>⏱️</span>
                          <span>{mealBox.businessRules?.preparationTime?.min}-{mealBox.businessRules?.preparationTime?.max} min</span>
                        </div>
                        <div className={styles.feature}>
                          <span className={styles.featureIcon}>📦</span>
                          <span>Min {mealBox.businessRules?.minimumOrder} boxes</span>
                        </div>
                      </div>

                      <div className={styles.pricingSection}>
                        <div className={styles.priceRow}>
                          <span className={styles.priceLabel}>🥬 Vegetarian:</span>
                          <span className={styles.priceValue}>₹{mealBox.pricing?.veg?.basePrice}</span>
                        </div>
                        <div className={styles.priceRow}>
                          <span className={styles.priceLabel}>🍗 Non-Vegetarian:</span>
                          <span className={styles.priceValue}>₹{mealBox.pricing?.nonVeg?.basePrice}</span>
                        </div>
                      </div>

                      <button
                        className={styles.selectMealBoxBtn}
                        onClick={() => handleMealBoxSelect(mealBox)}
                      >
                        Customize & Order
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Contact Information - Based on real business data */}
        <section className={styles.contactSection}>
          <div className={styles.contactContainer}>
            <h2 className={styles.contactTitle}>Create Your Meal Box Today!</h2>
            <p className={styles.contactDescription}>
              Personalize your meal box with an array of delicious and high-quality dishes.
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

      <GlobalFooter />
    </div>
  );
};

export default MealBoxScreen;
