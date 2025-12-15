import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import styles from "./HomeScreen.module.css";
import { GlobalHeader, GlobalFooter } from "../components/GlobalHeader&Footer";

// Static service sections configuration
const SERVICE_SECTIONS = [
  {
    key: "meal-boxes",
    title: "Meal Boxes",
    description:
      "Curated meal boxes for individuals and families. Fresh, healthy, and delivered to your doorstep. Perfect for daily meals or special occasions.",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80",
    fallbackImage: "/assets/meal-box-placeholder.jpg",
    link: "/meal-boxes",
    ctaText: "Order Now",
    minPlates: 1,
    maxPlates: 10,
    gradient: "linear-gradient(135deg, #0A5247 0%, #0F4B2E 100%)",
    comingSoon: true, // temporarily disabled
  },
  {
    key: "bulk-orders",
    title: "Bulk Orders",
    description:
      "Order in bulk for offices, hostels, or events. Hygienic, reliable, and customizable to your needs. Enjoy seamless delivery and great value.",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80",
    fallbackImage: "/assets/bulk-order-placeholder.jpg",
    link: "/bulk-orders",
    ctaText: "Bulk Order",
    minPlates: 15,
    maxPlates: 500,
    gradient: "linear-gradient(135deg, #0A5247 0%, #0F4B2E 100%)",
    featured: true,
    comingSoon: false,
  },
  {
    key: "catering-services",
    title: "Catering Services",
    description:
      "Professional catering for weddings, parties, and corporate events. Choose from a wide range of cuisines and menu options.",
    image:
      "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=600&q=80",
    fallbackImage: "/assets/catering-placeholder.jpg",
    link: "/catering-services",
    ctaText: "Book Catering",
    minPlates: 100,
    maxPlates: 1000,
    gradient: "linear-gradient(135deg, #0A5247 0%, #0F4B2E 100%)",
    comingSoon: true, // temporarily disabled
  },
  {
    key: "live-counters",
    title: "Live Counters",
    description:
      "Add excitement to your event with live food counters. Our chefs prepare dishes on-site, ensuring freshness and a memorable experience.",
    image:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=600&q=80",
    fallbackImage: "/assets/live-counter-placeholder.jpg",
    link: "/live-counters",
    ctaText: "Book Live Counter",
    minPlates: 100,
    maxPlates: 1000,
    gradient: "linear-gradient(135deg, #0f4b2e 0%, 0f4b2e 100%)",
    comingSoon: true, // temporarily disabled
  },
];

// Quick Order Modal Component
const QuickOrderModal = React.memo(
  ({ isOpen, onClose, onProceed, featuredPlatters = [] }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
      pincode: "",
      plates: 15,
      selectedService: null,
      isDeliveryAvailable: null,
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const hyderabadPincodes = useMemo(
      () => [
        "500001",
        "500002",
        "500003",
        "500004",
        "500008",
        "500016",
        "500032",
        "500081",
        "500018",
        "500020",
        "500034",
        "500038",
      ],
      []
    );

    const checkDeliveryAvailability = useCallback(
      async (pincode) => {
        setLoading(true);
        try {
          await new Promise((resolve) => setTimeout(resolve, 1200));

          const isAvailable = hyderabadPincodes.some((code) =>
            pincode.startsWith(code.substring(0, 3))
          );

          setFormData((prev) => ({
            ...prev,
            isDeliveryAvailable: isAvailable,
          }));
          setStep(isAvailable ? 3 : 2);
        } catch (error) {
          setErrors({
            pincode: "Unable to check delivery. Please try again.",
          });
        } finally {
          setLoading(false);
        }
      },
      [hyderabadPincodes]
    );

    const handlePincodeSubmit = useCallback(
      (e) => {
        e.preventDefault();
        setErrors({});

        if (!formData.pincode || formData.pincode.length !== 6) {
          setErrors({ pincode: "Please enter a valid 6-digit pincode" });
          return;
        }

        if (!/^\d{6}$/.test(formData.pincode)) {
          setErrors({
            pincode: "Pincode should contain only numbers",
          });
          return;
        }

        checkDeliveryAvailability(formData.pincode);
      },
      [formData.pincode, checkDeliveryAvailability]
    );

    const resetModal = useCallback(() => {
      setStep(1);
      setFormData({
        pincode: "",
        plates: 15,
        selectedService: null,
        isDeliveryAvailable: null,
      });
      setErrors({});
      setLoading(false);
    }, []);

    const handleClose = useCallback(() => {
      resetModal();
      onClose();
    }, [resetModal, onClose]);

    const handleProceed = useCallback(() => {
      onProceed(formData);
      onClose();
    }, [formData, onProceed, onClose]);

    if (!isOpen) return null;

    return (
      <div
        className={styles.modalOverlay}
        onClick={handleClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div
          className={styles.modalContent}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className={styles.modalClose}
            onClick={handleClose}
            aria-label="Close modal"
          >
            ×
          </button>

          {step === 1 && (
            <div className={styles.modalStep}>
              <h2 id="modal-title" className={styles.modalTitle}>
                Quick Order
              </h2>
              <p className={styles.modalDesc}>
                Enter your pincode to check delivery availability in Hyderabad
              </p>

              <form
                className={styles.modalForm}
                onSubmit={handlePincodeSubmit}
              >
                <div className={styles.inputGroup}>
                  <label htmlFor="pincode">Pincode</label>
                  <input
                    id="pincode"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]{6}"
                    className={`${styles.modalInput} ${
                      errors.pincode ? styles.inputError : ""
                    }`}
                    placeholder="Enter 6-digit pincode"
                    value={formData.pincode}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        pincode: e.target.value.replace(/\D/g, "").slice(0, 6),
                      }))
                    }
                    autoComplete="postal-code"
                    aria-describedby={
                      errors.pincode ? "pincode-error" : undefined
                    }
                  />
                  {errors.pincode && (
                    <span
                      id="pincode-error"
                      className={styles.errorText}
                      role="alert"
                    >
                      {errors.pincode}
                    </span>
                  )}
                </div>
                <button
                  type="submit"
                  className={styles.modalBtn}
                  disabled={loading || formData.pincode.length !== 6}
                  aria-describedby="check-status"
                >
                  {loading ? (
                    <>
                      <span
                        className={styles.spinner}
                        aria-hidden="true"
                      ></span>
                      Checking...
                    </>
                  ) : (
                    "Check Availability"
                  )}
                </button>
                <p id="check-status" className={styles.modalSubDesc}>
                  We currently deliver in Hyderabad and surrounding areas
                </p>
              </form>
            </div>
          )}

          {step === 2 && (
            <div className={styles.modalStep}>
              <div className={styles.notAvailableIcon} aria-hidden="true">
                😔
              </div>
              <h2 className={styles.modalTitle}>
                We don't deliver to <strong>{formData.pincode}</strong> yet
              </h2>
              <p className={styles.modalDesc}>
                But we're expanding fast! We'll notify you when we start
                delivering to your area.
              </p>
              <div className={styles.modalActions}>
                <button
                  className={styles.modalBtnSecondary}
                  onClick={resetModal}
                >
                  Try Another Pincode
                </button>
                <button className={styles.modalBtn} onClick={handleClose}>
                  Notify Me Later
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className={styles.modalStep}>
              <div className={styles.availableIcon} aria-hidden="true">
                🎉
              </div>
              <h2 className={styles.modalTitle}>
                Great! We deliver to <strong>{formData.pincode}</strong>
              </h2>
              <p className={styles.modalDesc}>
                You can now proceed with your bulk order. Minimum order: 15
                plates.
              </p>

              <div className={styles.plateSelector}>
                <label
                  htmlFor="plate-count"
                  className={styles.visuallyHidden}
                >
                  Number of plates
                </label>
                <button
                  type="button"
                  className={styles.plateBtn}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      plates: Math.max(15, prev.plates - 5),
                    }))
                  }
                  disabled={formData.plates <= 15}
                  aria-label="Decrease plate count"
                >
                  −
                </button>
                <div className={styles.plateCount}>
                  <span className={styles.plateNumber}>
                    {formData.plates}
                  </span>
                  <span className={styles.plateLabel}>plates</span>
                </div>
                <button
                  type="button"
                  className={styles.plateBtn}
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      plates: Math.min(500, prev.plates + 5),
                    }))
                  }
                  disabled={formData.plates >= 500}
                  aria-label="Increase plate count"
                >
                  +
                </button>
              </div>

              <button className={styles.modalBtn} onClick={handleProceed}>
                Proceed to Bulk Orders →
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
);

// Enhanced Service Card Component
const ServiceCard = React.memo(
  ({ service, isExpanded, onToggle, onExplore, index }) => {
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const isComingSoon = service.comingSoon;

    const handleImageLoad = useCallback(() => setImageLoaded(true), []);
    const handleImageError = useCallback(() => setImageError(true), []);

    const handleKeyDown = useCallback(
      (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      },
      [onToggle]
    );

    const handleCardClick = useCallback(
      (e) => {
        if (isComingSoon) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        onExplore();
      },
      [isComingSoon, onExplore]
    );

    return (
      <article
        className={`${styles.serviceCard} ${
          isExpanded ? styles.expanded : ""
        } ${service.featured ? styles.featured : ""} ${
          isComingSoon ? styles.comingSoonCard : ""
        }`}
        style={{ "--gradient": service.gradient }}
        data-index={index}
        onClick={handleCardClick}
      >
        <div className={styles.imageContainer}>
          <img
            src={imageError ? service.fallbackImage : service.image}
            alt={`${service.title} service`}
            className={`${styles.serviceImage} ${
              imageLoaded ? styles.loaded : ""
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading={index > 1 ? "lazy" : "eager"}
          />
          <div className={styles.imageOverlay} />

          {isComingSoon && (
            <div className={styles.comingSoonOverlay}>
              <div className={styles.comingSoonContent}>
                <h4 className={styles.comingSoonText}>Coming Soon</h4>
                <p className={styles.comingSoonSubtext}>
                  Available in the future
                </p>
              </div>
            </div>
          )}

          {service.featured && (
            <div className={styles.featuredBadge}>
              <span>⭐ Popular</span>
            </div>
          )}

          <div className={styles.titleOverlay}>
            <h3 className={styles.overlayTitle}>{service.title}</h3>
            <p className={styles.plateRange}>
              {service.minPlates}-{service.maxPlates}{" "}
              {service.minPlates === 1 ? "serving" : "plates"}
            </p>
          </div>

          <button
            className={`${styles.chevronBtn} ${
              isExpanded ? styles.chevronOpen : ""
            }`}
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            onKeyDown={handleKeyDown}
            aria-expanded={isExpanded}
            aria-label={`${isExpanded ? "Collapse" : "Expand"} ${
              service.title
            } details`}
          >
            <span className={styles.chevronIcon}>›</span>
          </button>
        </div>

        <div className={styles.serviceContent} aria-hidden={!isExpanded}>
          <h3 className={styles.serviceTitle}>{service.title}</h3>
          <p className={styles.serviceDesc}>{service.description}</p>

          <div className={styles.serviceInfo}>
            <div className={styles.plateInfo}>
              <span className={styles.plateInfoText}>
                Perfect for {service.minPlates}-{service.maxPlates}{" "}
                {service.minPlates === 1 ? "serving" : "plates"}
              </span>
            </div>

            <div className={styles.serviceFeatures}>
              <span>🚀 Fast delivery</span>
              <span>🍽️ Fresh food</span>
              <span>💰 Great value</span>
            </div>
          </div>

          <button
            className={styles.exploreBtn}
            onClick={(e) => {
              e.stopPropagation();
              if (!isComingSoon) onExplore();
            }}
            disabled={isComingSoon}
            aria-label={`Explore ${service.title} options`}
          >
            {isComingSoon ? "Coming Soon" : `${service.ctaText} →`}
          </button>
        </div>
      </article>
    );
  }
);

// Featured Platter Component
const FeaturedPlatter = React.memo(({ platter, onOrderClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formattedPrice = useMemo(() => {
    const price = platter.price?.base || 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price);
  }, [platter.price]);

  return (
    <article className={styles.featuredPlatter}>
      <div className={styles.platterImageContainer}>
        <img
          src={
            imageError
              ? "/assets/platter-placeholder.jpg"
              : platter.imageUrl
          }
          alt={`${platter.name} platter`}
          className={`${styles.platterImage} ${
            imageLoaded ? styles.loaded : ""
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          loading="lazy"
        />
        {platter.isPopular && (
          <div className={styles.featuredBadge}>
            <span>⭐ Popular</span>
          </div>
        )}
        {platter.isVeg && <div className={styles.vegBadge}>🟢</div>}
      </div>

      <div className={styles.platterContent}>
        <h4 className={styles.platterName}>{platter.name}</h4>
        <p className={styles.platterDesc}>{platter.description}</p>

        <div className={styles.platterMeta}>
          <span className={styles.cuisine}>{platter.cuisine}</span>
          <span className={styles.serves}>
            {platter.serves?.display}
          </span>
        </div>

        <div className={styles.platterFooter}>
          <span className={styles.price}>{formattedPrice}</span>
          <button
            className={styles.orderBtn}
            onClick={() => onOrderClick(platter)}
            aria-label={`Order ${platter.name} platter`}
          >
            Order Now
          </button>
        </div>
      </div>
    </article>
  );
});

// Main HomeScreen Component
const HomeScreen = () => {
  const navigate = useNavigate();
  const [featuredPlatters, setFeaturedPlatters] = useState([]);
  const [expandedSection, setExpandedSection] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const fetchFeaturedPlatters = useCallback(
    async () => {
      try {
        setLoading(true);
        setError(null);

        const snapshot = await getDocs(
          collection(db, "Enhanced_Authentic_Platters")
        );

        if (snapshot.empty) {
          setFeaturedPlatters([]);
          return;
        }

        const allPlatters = snapshot.docs.map((doc) => {
          const data = doc.data();
          return { id: doc.id, ...data };
        });

        const activePlatters = allPlatters
          .filter((platter) => platter.isActive === true)
          .sort(
            (a, b) =>
              (b.meta?.popularity || 0) - (a.meta?.popularity || 0)
          )
          .slice(0, 3);

        setFeaturedPlatters(activePlatters);
      } catch (err) {
        setError(
          `Failed to load featured items${
            retryCount > 0 ? ` (Attempt ${retryCount + 1})` : ""
          }`
        );
        setFeaturedPlatters([]);
      } finally {
        setLoading(false);
      }
    },
    [retryCount]
  );

  useEffect(() => {
    fetchFeaturedPlatters();
  }, [fetchFeaturedPlatters]);

  const handleToggleSection = useCallback((sectionKey) => {
    setExpandedSection((prev) =>
      prev === sectionKey ? null : sectionKey
    );
  }, []);

  const handleExploreService = useCallback(
    (service) => {
      if (service.comingSoon) return;

      if (
        service.key === "meal-boxes" ||
        service.key === "catering-services"
      ) {
        navigate(service.link);
        return;
      }

      navigate(service.link, {
        state: {
          serviceType: service.key,
          minPlates: service.minPlates,
          maxPlates: service.maxPlates,
        },
      });
    },
    [navigate]
  );

  const handleOrderPlatter = useCallback(
    (platter) => {
      navigate("/bulk-orders", {
        state: {
          selectedPlatter: platter.id,
          preFilledData: {
            cuisine: platter.cuisine,
            mealType: platter.mealType,
          },
        },
      });
    },
    [navigate]
  );

  const handleQuickOrderProceed = useCallback(
    (formData) => {
      navigate("/bulk-orders", {
        state: {
          pincode: formData.pincode,
          plates: formData.plates,
          quickOrder: true,
        },
      });
    },
    [navigate]
  );

  const handleRetry = useCallback(() => {
    setRetryCount((prev) => prev + 1);
  }, []);

  return (
    <div className={styles.wrapper}>
      <GlobalHeader />

      {/* Hero Section with Quick Order */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Order Food in Bulk</h1>
          <p className={styles.heroDesc}>
            Perfect for offices, hostels, events, and celebrations in
            Hyderabad
          </p>
          <div className={styles.heroFeatures}>
            <span className={styles.feature}>🚀 Fast delivery</span>
            <span className={styles.feature}>🍽️ Fresh food</span>
            <span className={styles.feature}>💰 Great value</span>
            <span className={styles.feature}>⭐ Top rated</span>
          </div>
          <button
            className={styles.heroBtn}
            onClick={() => setIsModalOpen(true)}
            aria-describedby="hero-desc"
          >
            Quick Order Now
          </button>
          <p id="hero-desc" className={styles.heroSubtext}>
            Check delivery availability • Minimum 15 plates
          </p>
        </div>
      </section>

      {/* Services Section */}
      <main className={styles.main}>
        <section className={styles.servicesSection}>
          <h2 className={styles.sectionTitle}>Our Services</h2>
          <p className={styles.sectionSubtitle}>
            Choose from our range of food services for any occasion
          </p>

          <div className={styles.servicesGrid}>
            {SERVICE_SECTIONS.map((service, index) => (
              <ServiceCard
                key={service.key}
                service={service}
                index={index}
                isExpanded={expandedSection === service.key}
                onToggle={() => handleToggleSection(service.key)}
                onExplore={() => handleExploreService(service)}
              />
            ))}
          </div>
        </section>

        {/* Featured Platters Section */}
        <section
          className={styles.featuredSection}
          aria-labelledby="featured-title"
        >
          <h2 id="featured-title" className={styles.sectionTitle}>
            Featured Platters
          </h2>
          <p className={styles.sectionSubtitle}>
            Popular choices from our authentic collection
          </p>

          {loading && (
            <div
              className={styles.loadingContainer}
              role="status"
              aria-live="polite"
            >
              <div
                className={styles.loadingSpinner}
                aria-hidden="true"
              ></div>
              <p>Loading featured platters...</p>
            </div>
          )}

          {error && (
            <div className={styles.errorContainer} role="alert">
              <div className={styles.errorIcon}>⚠️</div>
              <p>{error}</p>
              <button
                className={styles.retryBtn}
                onClick={handleRetry}
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              {featuredPlatters.length > 0 ? (
                <div className={styles.plattersGrid}>
                  {featuredPlatters.map((platter) => (
                    <FeaturedPlatter
                      key={platter.id}
                      platter={platter}
                      onOrderClick={handleOrderPlatter}
                    />
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>🍽️</div>
                  <h3>No featured platters available</h3>
                  <p>Check back soon for our latest offerings</p>
                  <button
                    className={styles.exploreBtn}
                    onClick={() => navigate("/bulk-orders")}
                  >
                    Explore All Platters
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* Quick Order Modal */}
      <QuickOrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onProceed={handleQuickOrderProceed}
        featuredPlatters={featuredPlatters}
      />

      <GlobalFooter />
    </div>
  );
};

export default HomeScreen;
