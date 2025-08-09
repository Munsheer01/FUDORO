import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./GlobalHeader&Footer.css";

// Modern SVG Icons with animations
const CartIcon = ({ count = 0 }) => (
  <div className="cart-icon-container">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V17C17 18.1 16.1 19 15 19H9C7.9 19 7 18.1 7 17V13M17 13H7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
    {count > 0 && <span className="cart-badge">{count}</span>}
  </div>
);

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8"></circle>
    <path d="m21 21-4.35-4.35"></path>
  </svg>
);

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="6" x2="21" y2="6"></line>
    <line x1="3" y1="12" x2="21" y2="12"></line>
    <line x1="3" y1="18" x2="21" y2="18"></line>
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const UserIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

// Enhanced Navigation Links with descriptions
const navLinks = [
  { 
    label: "Meal Boxes", 
    href: "/meal-boxes",
    description: "Individual customizable meal boxes",
    icon: "🍱"
  },
  { 
    label: "Bulk Orders", 
    href: "/bulk-orders",
    description: "Large quantity platters for events",
    icon: "🍽️"
  },
  { 
    label: "Catering", 
    href: "/catering",
    description: "Full-service event catering",
    icon: "🎉"
  },
  { 
    label: "Live Counters", 
    href: "/live-counters",
    description: "Interactive cooking stations",
    icon: "👨‍🍳"
  }
];

// Modern Search Component
const SearchBar = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef(null);

  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="search-overlay">
      <div className="search-container">
        <div className="search-input-wrapper">
          <SearchIcon />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search for food, restaurants, cuisines..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <button onClick={onClose} className="search-close">
            <CloseIcon />
          </button>
        </div>
        <div className="search-suggestions">
          <div className="search-suggestion">🍛 Biryani</div>
          <div className="search-suggestion">🍕 Pizza</div>
          <div className="search-suggestion">🥗 Healthy Meals</div>
          <div className="search-suggestion">🍰 Desserts</div>
        </div>
      </div>
    </div>
  );
};

export function GlobalHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Get cart count from localStorage
  useEffect(() => {
    const updateCartCount = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartCount(cart.length);
      } catch (e) {
        setCartCount(0);
      }
    };
    
    updateCartCount();
    window.addEventListener('storage', updateCartCount);
    return () => window.removeEventListener('storage', updateCartCount);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const toggleSearch = () => setSearchOpen(!searchOpen);
  const toggleDarkMode = () => setDarkMode(!darkMode);

  const handleNavClick = (href) => {
    navigate(href);
    setMenuOpen(false);
  };

  return (
    <>
      <header className={`modern-header ${scrolled ? 'scrolled' : ''} ${darkMode ? 'dark-mode' : ''}`}>
        <div className="header-container">
          {/* Logo Section */}
          <div className="logo-section">
            <a href="/" className="logo-link">
              <div className="logo-icon">🍽️</div>
              <span className="logo-text">FUDORO</span>
              <span className="logo-tagline">Premium Catering</span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            {navLinks.map((link) => (
              <div key={link.href} className="nav-item-wrapper">
                <button
                  onClick={() => handleNavClick(link.href)}
                  className={`nav-link ${location.pathname === link.href ? 'active' : ''}`}
                >
                  <span className="nav-icon">{link.icon}</span>
                  <span className="nav-label">{link.label}</span>
                </button>
                <div className="nav-tooltip">
                  <span>{link.description}</span>
                </div>
              </div>
            ))}
          </nav>

          {/* Action Buttons */}
          <div className="header-actions">
            {/* Search Button */}
            <button 
              className="action-btn search-btn"
              onClick={toggleSearch}
              aria-label="Search"
            >
              <SearchIcon />
            </button>

            {/* Dark Mode Toggle */}
            <button 
              className="action-btn dark-mode-btn"
              onClick={toggleDarkMode}
              aria-label="Toggle dark mode"
            >
              {darkMode ? '🌞' : '🌙'}
            </button>

            {/* User Account */}
            <button 
              className="action-btn user-btn"
              onClick={() => navigate('/account')}
              aria-label="User account"
            >
              <UserIcon />
            </button>

            {/* Cart Button */}
            <button 
              className="action-btn cart-btn"
              onClick={() => navigate('/cart')}
              aria-label={`Cart with ${cartCount} items`}
            >
              <CartIcon count={cartCount} />
            </button>

            {/* Mobile Menu Button */}
            <button 
              className="action-btn mobile-menu-btn"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {menuOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="scroll-progress">
          <div 
            className="scroll-progress-bar"
            style={{ 
              width: `${(window.pageYOffset / (document.documentElement.scrollHeight - window.innerHeight)) * 100}%` 
            }}
          />
        </div>
      </header>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-content">
          <div className="mobile-menu-header">
            <div className="mobile-logo">
              <span className="logo-icon">🍽️</span>
              <span>FUDORO</span>
            </div>
            <button onClick={toggleMenu} className="mobile-close-btn">
              <CloseIcon />
            </button>
          </div>

          <nav className="mobile-nav">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className={`mobile-nav-link ${location.pathname === link.href ? 'active' : ''}`}
              >
                <span className="mobile-nav-icon">{link.icon}</span>
                <div className="mobile-nav-content">
                  <span className="mobile-nav-label">{link.label}</span>
                  <span className="mobile-nav-desc">{link.description}</span>
                </div>
              </button>
            ))}
          </nav>

          <div className="mobile-menu-footer">
            <button 
              onClick={() => { handleNavClick('/cart'); }}
              className="mobile-cart-btn"
            >
              <CartIcon count={cartCount} />
              <span>View Cart ({cartCount})</span>
            </button>
            
            <div className="mobile-contact">
              <p>📞 Hyderabad: +91 8919354409</p>
              <p>📞 Khammam: +91 7396081234</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Overlay */}
      <SearchBar isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Menu Overlay */}
      {menuOpen && <div className="menu-overlay" onClick={() => setMenuOpen(false)} />}
    </>
  );
}

// Modern Social Media Icons
const SocialIcons = {
  Instagram: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  ),
  WhatsApp: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.63"/>
    </svg>
  ),
  Facebook: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  Twitter: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
    </svg>
  )
};

export function GlobalFooter() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  const footerSections = {
    company: {
      title: "Company",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Our Story", href: "/story" },
        { label: "Careers", href: "/careers" },
        { label: "Press", href: "/press" },
        { label: "Contact", href: "/contact" }
      ]
    },
    services: {
      title: "Services",
      links: [
        { label: "Meal Boxes", href: "/meal-boxes" },
        { label: "Bulk Orders", href: "/bulk-orders" },
        { label: "Catering", href: "/catering" },
        { label: "Live Counters", href: "/live-counters" },
        { label: "Corporate Events", href: "/corporate" }
      ]
    },
    support: {
      title: "Support",
      links: [
        { label: "Help Center", href: "/help" },
        { label: "Order Tracking", href: "/tracking" },
        { label: "Cancellation", href: "/cancellation" },
        { label: "Refunds", href: "/refunds" },
        { label: "Food Safety", href: "/safety" }
      ]
    },
    legal: {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "/privacy" },
        { label: "Terms of Service", href: "/terms" },
        { label: "Cookie Policy", href: "/cookies" },
        { label: "GDPR", href: "/gdpr" },
        { label: "Accessibility", href: "/accessibility" }
      ]
    }
  };

  return (
    <footer className="modern-footer">
      {/* Main Footer Content */}
      <div className="footer-main">
        <div className="footer-container">
          {/* Brand Section */}
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="footer-logo-icon">🍽️</span>
              <div className="footer-logo-text">
                <h3>FUDORO</h3>
                <p>Premium Catering Experience</p>
              </div>
            </div>
            <p className="footer-description">
              Elevating your events with authentic flavors and exceptional service. 
              From intimate gatherings to grand celebrations, we craft memorable culinary experiences.
            </p>
            
            {/* Contact Information */}
            <div className="footer-contact">
              <div className="contact-item">
                <span className="contact-icon">📍</span>
                <div>
                  <strong>Hyderabad</strong>
                  <p>+91 8919354409 / +91 9703344431</p>
                </div>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📍</span>
                <div>
                  <strong>Khammam</strong>
                  <p>+91 7396081234 / +91 9246946473</p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="footer-social">
              <h4>Follow Us</h4>
              <div className="social-links">
                <a href="#" className="social-link instagram" aria-label="Instagram">
                  <SocialIcons.Instagram />
                </a>
                <a href="#" className="social-link whatsapp" aria-label="WhatsApp">
                  <SocialIcons.WhatsApp />
                </a>
                <a href="#" className="social-link facebook" aria-label="Facebook">
                  <SocialIcons.Facebook />
                </a>
                <a href="#" className="social-link twitter" aria-label="Twitter">
                  <SocialIcons.Twitter />
                </a>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div className="footer-links">
            {Object.entries(footerSections).map(([key, section]) => (
              <div key={key} className="footer-section">
                <h4 className="footer-section-title">{section.title}</h4>
                <ul className="footer-section-links">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <button 
                        onClick={() => navigate(link.href)}
                        className="footer-link"
                      >
                        {link.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter Section */}
          <div className="footer-newsletter">
            <h4>Stay Updated</h4>
            <p>Get the latest updates on new menus, special offers, and exclusive events.</p>
            
            <form onSubmit={handleSubscribe} className="newsletter-form">
              <div className="newsletter-input-wrapper">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="newsletter-input"
                  required
                />
                <button type="submit" className="newsletter-btn" disabled={subscribed}>
                  {subscribed ? '✓ Subscribed!' : 'Subscribe'}
                </button>
              </div>
            </form>

            {/* Quick Stats */}
            <div className="footer-stats">
              <div className="stat">
                <span className="stat-number">50K+</span>
                <span className="stat-label">Happy Customers</span>
              </div>
              <div className="stat">
                <span className="stat-number">500+</span>
                <span className="stat-label">Events Catered</span>
              </div>
              <div className="stat">
                <span className="stat-number">50+</span>
                <span className="stat-label">Menu Options</span>
              </div>
            </div>

            {/* Awards & Certifications */}
            <div className="footer-badges">
              <div className="badge">🏆 Best Catering 2024</div>
              <div className="badge">✅ Food Safety Certified</div>
              <div className="badge">🌟 5-Star Rated</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="footer-container">
          <div className="footer-bottom-content">
            <div className="footer-copyright">
              <p>&copy; 2025 FUDORO Premium Catering. All rights reserved.</p>
              <p>Crafted with ❤️ for food lovers</p>
            </div>
            
            <div className="footer-bottom-links">
              <button onClick={() => navigate('/privacy')} className="footer-bottom-link">
                Privacy
              </button>
              <button onClick={() => navigate('/terms')} className="footer-bottom-link">
                Terms
              </button>
              <button onClick={() => navigate('/sitemap')} className="footer-bottom-link">
                Sitemap
              </button>
            </div>

            <div className="footer-back-to-top">
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="back-to-top-btn"
                aria-label="Back to top"
              >
                ↑ Top
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
