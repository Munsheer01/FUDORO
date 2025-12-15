// Updated GlobalHeader&Footer.js with User Account Menu
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import "./GlobalHeader&Footer.css";


// User Account SVG Icon (Larger Size, Responsive)
const UserIcon = () => (
  <svg className="profile-icon-svg" width="40" height="40" viewBox="0 0 32 32" fill="currentColor">
    <circle cx="16" cy="10" r="6" />
    <path d="M16 18c-6 0-10 2.5-10 5.5V28h20v-4.5C26 20.5 22 18 16 18z" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M7 10l5 5 5-5z"/>
  </svg>
);

// Cart Icon Component (Classic Cart Symbol)
const CartIcon = ({ count = 0 }) => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="currentColor">
    <path d="M7 24a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm12 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM6.2 19l.9-2h10.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 22 8H7.21l-.94-2H2v2h2l3.6 7.59-1.35 2.44A1.992 1.992 0 0 0 6 20c0 1.1.9 2 2 2h14v-2H8.42c-.14 0-.25-.11-.25-.25zM7.16 10h12.31l-2.76 5H9.1l-1.94-5z" />
  </svg>
);

// User Account Dropdown Component
const UserAccountDropdown = ({ user, isOpen, onToggle, onClose, onNavigate, onOpenDialog }) => {
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!user) return null;

  const menuItems = [
    { id: 'profile', label: 'User Details', icon: '👤', action: () => onOpenDialog('userDetails') },
    { id: 'addresses', label: 'Addresses', icon: '📍', action: () => onOpenDialog('addresses') },
    { id: 'orders', label: 'My Orders', icon: '📦', action: () => onNavigate('/my-orders') },
    { id: 'feedback', label: 'Feedback', icon: '💬', action: () => onOpenDialog('feedback') }
  ];

  return (
    <div className="user-account-dropdown" ref={dropdownRef}>
      <button className="action-btn user-account-btn" onClick={onToggle}>
        <UserIcon />
        <ChevronDownIcon />
      </button>

      {isOpen && (
        <div className="user-dropdown-menu">
          <div className="user-dropdown-header">
            <div className="user-avatar">
              {user.photoURL ? (
                <img src={user.photoURL} alt="Profile" />
              ) : (
                <div className="default-avatar">
                  {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            <div className="user-info">
              <h4 className="user-name">{user.displayName || 'User'}</h4>
              <p className="user-email">{user.email}</p>
            </div>
          </div>

          <div className="user-dropdown-items">
            {menuItems.map(item => (
              <button
                key={item.id}
                className="user-dropdown-item"
                onClick={() => {
                  item.action();
                  onClose();
                }}
              >
                <span className="item-icon">{item.icon}</span>
                <span className="item-label">{item.label}</span>
              </button>
            ))}
          </div>

          <div className="user-dropdown-footer">
            <button
              className="logout-btn"
              onClick={() => {
                auth.signOut();
                onClose();
              }}
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// User Detail Dialog Component
const UserDetailDialog = ({ user, isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    phone: user?.phoneNumber || ''
  });

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content" onClick={e => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>User Details</h2>
          <button className="dialog-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="dialog-body">
          <div className="form-group">
            <label>Display Name</label>
            <input
              type="text"
              className="form-input"
              value={formData.displayName}
              onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
              placeholder="Enter your display name"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              className="form-input disabled"
              value={formData.email}
              disabled
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              className="form-input"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+91 XXXXX XXXXX"
            />
          </div>
        </div>

        <div className="dialog-footer">
          <button className="btn-primary">Update Profile</button>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

// Address Management Dialog Component  
const AddressDialog = ({ isOpen, onClose }) => {
  const [addresses, setAddresses] = useState([
    {
      id: 1,
      type: 'Home',
      address: 'Villa-123, Tellapur',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500032',
      isDefault: true
    }
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    type: 'Home',
    address: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false
  });

  const handleAddAddress = () => {
    if (!formData.address || !formData.city || !formData.state || !formData.pincode) {
      alert('Please fill in all fields');
      return;
    }

    if (formData.isDefault) {
      setAddresses(prev => prev.map(addr => ({ ...addr, isDefault: false })));
    }

    const newAddress = {
      id: Date.now(),
      ...formData
    };

    setAddresses(prev => [...prev, newAddress]);
    resetForm();
    setShowAddForm(false);
    alert('Address added successfully!');
  };

  const handleEditAddress = (address) => {
    setEditingId(address.id);
    setFormData({
      type: address.type,
      address: address.address,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      isDefault: address.isDefault
    });
    setShowAddForm(true);
  };

  const handleUpdateAddress = () => {
    if (!formData.address || !formData.city || !formData.state || !formData.pincode) {
      alert('Please fill in all fields');
      return;
    }

    if (formData.isDefault) {
      setAddresses(prev => prev.map(addr => ({ 
        ...addr, 
        isDefault: addr.id === editingId ? true : false 
      })));
    }

    setAddresses(prev => prev.map(addr => 
      addr.id === editingId 
        ? { ...addr, ...formData }
        : addr
    ));

    resetForm();
    setShowAddForm(false);
    alert('Address updated successfully!');
  };

  const handleDeleteAddress = (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      const deletedAddress = addresses.find(addr => addr.id === id);
      setAddresses(prev => prev.filter(addr => addr.id !== id));
      
      // If deleted address was default, make first address default
      if (deletedAddress.isDefault && addresses.length > 1) {
        setAddresses(prev => {
          const updated = [...prev];
          updated[0].isDefault = true;
          return updated;
        });
      }
      alert('Address deleted successfully!');
    }
  };

  const handleSetDefault = (id) => {
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr.id === id ? true : false
    })));
  };

  const resetForm = () => {
    setFormData({
      type: 'Home',
      address: '',
      city: '',
      state: '',
      pincode: '',
      isDefault: false
    });
    setEditingId(null);
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content" onClick={e => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>Manage Addresses</h2>
          <button className="dialog-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="dialog-body">
          {!showAddForm ? (
            <>
              {addresses.length > 0 ? (
                addresses.map(address => (
                  <div key={address.id} className="address-card">
                    <div className="address-header">
                      <h4>{address.type}</h4>
                      {address.isDefault && <span className="default-badge">Default</span>}
                    </div>
                    <p className="address-text">
                      {address.address}<br/>
                      {address.city}, {address.state} - {address.pincode}
                    </p>
                    <div className="address-actions">
                      <button 
                        className="btn-edit"
                        onClick={() => handleEditAddress(address)}
                        title="Edit this address"
                      >
                        Edit
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDeleteAddress(address.id)}
                        title="Delete this address"
                      >
                        Delete
                      </button>
                      {!address.isDefault && (
                        <button 
                          className="btn-set-default"
                          onClick={() => handleSetDefault(address.id)}
                          title="Set as default address"
                        >
                          Set as Default
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-addresses">No addresses saved yet.</p>
              )}

              <button 
                className="btn-add-address"
                onClick={() => setShowAddForm(true)}
              >
                + Add New Address
              </button>
            </>
          ) : (
            <>
              <div className="address-form">
                <h3>{editingId ? 'Edit Address' : 'Add New Address'}</h3>
                
                <div className="form-group">
                  <label>Address Type</label>
                  <select 
                    className="form-select"
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <textarea
                    className="form-textarea"
                    rows="2"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="House/Flat No., Street, Landmark"
                  />
                </div>

                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.city}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="Enter city"
                  />
                </div>

                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.state}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="Enter state"
                  />
                </div>

                <div className="form-group">
                  <label>Pincode</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.pincode}
                    onChange={(e) => setFormData(prev => ({ ...prev, pincode: e.target.value }))}
                    placeholder="Enter 6-digit pincode"
                    maxLength="6"
                  />
                </div>

                <div className="form-group checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                    />
                    Set as default address
                  </label>
                </div>
              </div>

              <div className="address-form-actions">
                <button 
                  className="btn-primary"
                  onClick={editingId ? handleUpdateAddress : handleAddAddress}
                >
                  {editingId ? 'Update Address' : 'Add Address'}
                </button>
                <button 
                  className="btn-secondary"
                  onClick={() => {
                    resetForm();
                    setShowAddForm(false);
                  }}
                >
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>

        <div className="dialog-footer">
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

// Feedback Dialog Component
const FeedbackDialog = ({ isOpen, onClose }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const feedbackCategories = [
    'Food Quality', 'Delivery Service', 'Website Experience',
    'Customer Support', 'Pricing', 'Other'
  ];

  const resetForm = () => {
    setRating(0);
    setFeedback('');
    setCategories([]);
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const handleSubmitFeedback = async () => {
    // Validation
    if (rating === 0) {
      setSubmitError('Please select a rating');
      return;
    }

    if (categories.length === 0) {
      setSubmitError('Please select at least one feedback category');
      return;
    }

    if (!feedback.trim()) {
      setSubmitError('Please provide feedback details');
      return;
    }

    if (feedback.trim().length < 10) {
      setSubmitError('Feedback must be at least 10 characters long');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Prepare feedback data
      const feedbackData = {
        rating,
        categories,
        feedback: feedback.trim(),
        submittedAt: new Date().toISOString(),
        userAgent: navigator.userAgent
      };

      console.log('Submitting feedback:', feedbackData);

      // Simulate API call (replace with actual Firebase/API call)
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In production, you would send this to your backend:
      // const response = await fetch('/api/feedback', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(feedbackData)
      // });
      // const result = await response.json();

      setSubmitSuccess(true);
      
      // Reset form after 2 seconds and close dialog
      setTimeout(() => {
        resetForm();
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitError('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content" onClick={e => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>Share Your Feedback</h2>
          <button className="dialog-close-btn" onClick={onClose}>×</button>
        </div>

        <div className="dialog-body">
          {submitSuccess ? (
            <div className="feedback-success">
              <div className="success-icon">✅</div>
              <h3>Thank You!</h3>
              <p>Your feedback has been submitted successfully. We appreciate your input!</p>
            </div>
          ) : (
            <>
              <div className="form-group">
                <label>How would you rate your experience?</label>
                <div className="rating-stars">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      className={`star ${star <= rating ? 'active' : ''}`}
                      onClick={() => {
                        setRating(star);
                        setSubmitError(null);
                      }}
                      title={`Rate ${star} star${star !== 1 ? 's' : ''}`}
                    >
                      ⭐
                    </button>
                  ))}
                </div>
                {rating > 0 && <span className="rating-text">{rating} out of 5 stars</span>}
              </div>

              <div className="form-group">
                <label>What would you like to give feedback about?</label>
                <div className="checkbox-group">
                  {feedbackCategories.map(category => (
                    <label key={category} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={categories.includes(category)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCategories(prev => [...prev, category]);
                          } else {
                            setCategories(prev => prev.filter(c => c !== category));
                          }
                          setSubmitError(null);
                        }}
                      />
                      {category}
                    </label>
                  ))}
                </div>
                {categories.length > 0 && (
                  <span className="selected-categories">
                    Selected: {categories.join(', ')}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label>Tell us more about your experience</label>
                <textarea
                  className="form-textarea"
                  rows="4"
                  value={feedback}
                  onChange={(e) => {
                    setFeedback(e.target.value);
                    setSubmitError(null);
                  }}
                  placeholder="Share your thoughts, suggestions, or concerns..."
                  disabled={isSubmitting}
                />
                <span className="character-count">
                  {feedback.length} / 500 characters
                </span>
              </div>

              {submitError && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  {submitError}
                </div>
              )}
            </>
          )}
        </div>

        <div className="dialog-footer">
          {!submitSuccess && (
            <>
              <button 
                className="btn-primary"
                onClick={handleSubmitFeedback}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
              <button 
                className="btn-secondary" 
                onClick={() => {
                  resetForm();
                  onClose();
                }}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Header Component
export const GlobalHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user] = useAuthState(auth);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [activeDialog, setActiveDialog] = useState(null);

  // Navigation items
  const navItems = [
    { path: '/home', label: 'Home', icon: '🏠' },
    /*{ path: '/meal-boxes', label: 'Meal Boxes', icon: '📦' },*/
    { path: '/bulk-orders', label: 'Bulk Orders', icon: '🍽️' },
    /*{ path: '/catering-services', label: 'Catering', icon: '🎉' }*/
  ];  

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle navigation
  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  // Cart count (you can get this from your cart state)
  const cartCount = 0;

  return (
    <>
      <header className={`modern-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="header-container">
          {/* Logo Section */}
          <div className="logo-section">
            <a href="/" className="logo-link">
              <span className="logo-icon">🍽️</span>
              <span className="logo-text">FUDORO</span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <nav className="desktop-nav">
            {navItems.map(item => (
              <div key={item.path} className="nav-item-wrapper">
                <button
                  className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={() => handleNavigation(item.path)}
                >
                  <span>{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </button>
              </div>
            ))}
          </nav>

          {/* Header Actions */}
          <div className="header-actions">
            <button
              className="action-btn"
              onClick={() => navigate('/cart')}
              title="Shopping Cart"
            >
              <div className="cart-icon-container">
                <CartIcon />
                {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
              </div>
            </button>

            {user ? (
              <UserAccountDropdown
                user={user}
                isOpen={isUserMenuOpen}
                onToggle={() => setIsUserMenuOpen(!isUserMenuOpen)}
                onClose={() => setIsUserMenuOpen(false)}
                onNavigate={handleNavigation}
                onOpenDialog={setActiveDialog}
              />
            ) : (
              <button
                className="action-btn"
                onClick={() => navigate('/login')}
                title="Sign In"
              >
                <UserIcon />
              </button>
            )}

            <button
              className="mobile-menu-btn action-btn"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      {/* User Dialogs */}
      <UserDetailDialog
        user={user}
        isOpen={activeDialog === 'userDetails'}
        onClose={() => setActiveDialog(null)}
      />
      <AddressDialog
        isOpen={activeDialog === 'addresses'}
        onClose={() => setActiveDialog(null)}
      />
      <FeedbackDialog
        isOpen={activeDialog === 'feedback'}
        onClose={() => setActiveDialog(null)}
      />

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <>
          <div className="menu-overlay" onClick={() => setIsMobileMenuOpen(false)} />
          <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
            <div className="mobile-menu-content">
              <div className="mobile-menu-header">
                <div className="mobile-logo">
                  <span>🍽️</span>
                  FUDORO
                </div>
                <button
                  className="mobile-close-btn"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  ×
                </button>
              </div>

              <nav className="mobile-nav">
                {navItems.map(item => (
                  <button
                    key={item.path}
                    className={`mobile-nav-link ${location.pathname === item.path ? 'active' : ''}`}
                    onClick={() => handleNavigation(item.path)}
                  >
                    <span>{item.icon}</span>
                    {item.label}
                  </button>
                ))}
                
                <hr className="mobile-divider" />
                
                {user ? (
                  <>
                    <button
                      className="mobile-nav-link"
                      onClick={() => {
                        setActiveDialog('userDetails');
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <span>👤</span>
                      User Details
                    </button>
                    <button
                      className="mobile-nav-link"
                      onClick={() => handleNavigation('/my-orders')}
                    >
                      <span>📦</span>
                      My Orders
                    </button>
                    <button
                      className="mobile-nav-link"
                      onClick={() => {
                        auth.signOut();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <span>🚪</span>
                      Sign Out
                    </button>
                  </>
                ) : (
                  <button
                    className="mobile-nav-link"
                    onClick={() => handleNavigation('/login')}
                  >
                    <span>👤</span>
                    Sign In
                  </button>
                )}
              </nav>

              <button
                className="mobile-cart-btn"
                onClick={() => handleNavigation('/cart')}
              >
                <CartIcon />
                Cart {cartCount > 0 && `(${cartCount})`}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

// Updated GlobalFooter Component - Multi-Column Layout
export const GlobalFooter = () => {
  return (
    <footer className="modern-footer">
      <div className="footer-main">
        <div className="footer-container">
          {/* Multi-column layout */}
          <div className="footer-columns">
            {/* Column 1: Brand & Description */}
            <div className="footer-column footer-brand-column">
              <div className="footer-brand">
                <div className="footer-logo">
                  <span className="footer-logo-icon">🍽️</span>
                  <div className="footer-logo-text">
                    <h3>FUDORO</h3>
                    <p>Premium Catering Experience</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 2: Contact Us */}
            <div className="footer-column">
              <div className="footer-contact">
                <h4>Contact Us</h4>
                <div className="contact-locations">
                  <div className="contact-location">
                    <span className="location-icon">📍</span>
                    <div className="location-details">
                      <span className="location-name">Hyderabad</span>
                      <span>+91 8919354409 / +91 9703344431</span>
                    </div>
                  </div>
                  <div className="contact-location">
                    <span className="location-icon">📍</span>
                    <div className="location-details">
                      <span className="location-name">Khammam</span>
                      <span>+91 7396081234 / +91 9246946473</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 3: Services */}
            <div className="footer-column">
              <div className="footer-services">
                <h4>Services</h4>
                <ul className="services-list">
                  <li>Meal Boxes</li>
                  <li>Bulk Orders</li>
                  <li>Catering Services</li>
                  <li>Event Planning</li>
                </ul>
              </div>
            </div>

            {/* Column 4: Follow Us */}
            <div className="footer-column">
              <div className="footer-social">
                <h4>Follow Us</h4>
                <div className="social-links">
                  <a 
                    href="https://instagram.com/fudoro" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="social-link instagram" 
                    aria-label="Follow us on Instagram"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.40z"/>
                    </svg>
                  </a>
                  
                  <a 
                    href="https://wa.me/918919354409" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="social-link whatsapp" 
                    aria-label="Contact us on WhatsApp"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                  </a>
                  
                  <a 
                    href="https://youtube.com/fudoro" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="social-link youtube" 
                    aria-label="Subscribe to our YouTube channel"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <div className="footer-copyright">
            <p>&copy; 2025 FUDORO. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};
