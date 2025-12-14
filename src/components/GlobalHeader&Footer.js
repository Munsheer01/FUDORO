// Production-Ready GlobalHeader&Footer.js with Enhanced Cart and Profile Logic
import React, { useState, useEffect, useRef, createContext, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, addDoc } from 'firebase/firestore';
import "./GlobalHeader&Footer.css";

// ============================================
// CART CONTEXT AND PROVIDER
// ============================================
const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [user] = useAuthState(auth);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('fudoro_cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart:', error);
        localStorage.removeItem('fudoro_cart');
      }
    }
  }, []);

  // Sync cart to localStorage whenever it changes
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('fudoro_cart', JSON.stringify(cartItems));
    } else {
      localStorage.removeItem('fudoro_cart');
    }
  }, [cartItems]);

  // Sync cart to Firestore for logged-in users
  useEffect(() => {
    const syncCartToFirestore = async () => {
      if (user && cartItems.length > 0) {
        try {
          const cartRef = doc(db, 'carts', user.uid);
          await setDoc(cartRef, {
            items: cartItems,
            userId: user.uid,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } catch (error) {
          console.error('Error syncing cart to Firestore:', error);
        }
      }
    };

    const timeoutId = setTimeout(syncCartToFirestore, 1000);
    return () => clearTimeout(timeoutId);
  }, [cartItems, user]);

  // Load cart from Firestore when user logs in
  useEffect(() => {
    const loadCartFromFirestore = async () => {
      if (user) {
        try {
          const cartRef = doc(db, 'carts', user.uid);
          const cartDoc = await getDoc(cartRef);
          
          if (cartDoc.exists()) {
            const firestoreCart = cartDoc.data().items || [];
            const localCart = JSON.parse(localStorage.getItem('fudoro_cart') || '[]');
            
            // Merge carts if both exist
            if (localCart.length > 0) {
              const mergedCart = [...firestoreCart];
              localCart.forEach(localItem => {
                const existingIndex = mergedCart.findIndex(item => item.id === localItem.id);
                if (existingIndex >= 0) {
                  mergedCart[existingIndex].quantity += localItem.quantity;
                } else {
                  mergedCart.push(localItem);
                }
              });
              setCartItems(mergedCart);
            } else {
              setCartItems(firestoreCart);
            }
          }
        } catch (error) {
          console.error('Error loading cart from Firestore:', error);
        }
      }
    };

    loadCartFromFirestore();
  }, [user]);

  const addToCart = (product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      
      return [...prevItems, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem && existingItem.quantity > 1) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
      
      return prevItems.filter(item => item.id !== product.id);
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('fudoro_cart');
    if (user) {
      const cartRef = doc(db, 'carts', user.uid);
      setDoc(cartRef, { items: [], updatedAt: new Date().toISOString() });
    }
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.price) || 0;
      return total + (price * item.quantity);
    }, 0).toFixed(2);
  };

  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

// ============================================
// ICON COMPONENTS
// ============================================
const UserIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const CartIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

const MenuIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ============================================
// USER ACCOUNT DROPDOWN COMPONENT
// ============================================
const UserAccountDropdown = ({ user, isOpen, onToggle, onClose, onNavigate, onOpenDialog }) => {
  const dropdownRef = useRef(null);

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
    <div className="user-account-wrapper" ref={dropdownRef}>
      <button className="user-account-btn" onClick={onToggle}>
        <UserIcon />
        <span className="user-email">{user.email?.split('@')[0]}</span>
        <ChevronDownIcon />
      </button>

      {isOpen && (
        <div className="user-dropdown">
          <div className="dropdown-header">
            <p className="user-email-full">{user.email}</p>
          </div>
          
          <div className="dropdown-menu">
            {menuItems.map(item => (
              <button
                key={item.id}
                className="dropdown-item"
                onClick={() => {
                  item.action();
                  onClose();
                }}
              >
                <span className="dropdown-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
            
            <div className="dropdown-divider" />
            
            <button
              className="dropdown-item logout-btn"
              onClick={async () => {
                try {
                  await signOut(auth);
                  onNavigate('/');
                  onClose();
                } catch (error) {
                  console.error('Logout error:', error);
                }
              }}
            >
              <span className="dropdown-icon">🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================
// USER DIALOG COMPONENTS
// ============================================
const UserDetailsDialog = ({ user, isOpen, onClose }) => {
  const [userDetails, setUserDetails] = useState({
    displayName: '',
    phone: '',
    email: user?.email || ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserDetails(prev => ({ ...prev, ...userDoc.data() }));
          }
        } catch (error) {
          console.error('Error fetching user details:', error);
        }
      }
    };

    if (isOpen) {
      fetchUserDetails();
    }
  }, [user, isOpen]);

  const handleSave = async () => {
    setLoading(true);
    setMessage('');

    try {
      await setDoc(doc(db, 'users', user.uid), {
        ...userDetails,
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setMessage('Profile updated successfully!');
      setTimeout(() => {
        setMessage('');
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error saving user details:', error);
      setMessage('Error updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>User Details</h2>
          <button className="dialog-close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="dialog-body">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={userDetails.displayName}
              onChange={(e) => setUserDetails({ ...userDetails, displayName: e.target.value })}
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={userDetails.email}
              disabled
              className="disabled-input"
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              value={userDetails.phone}
              onChange={(e) => setUserDetails({ ...userDetails, phone: e.target.value })}
              placeholder="Enter your phone number"
            />
          </div>

          {message && (
            <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
              {message}
            </div>
          )}
        </div>

        <div className="dialog-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

const AddressesDialog = ({ user, isOpen, onClose }) => {
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState({
    address: '',
    city: '',
    state: '',
    pincode: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAddresses = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists() && userDoc.data().addresses) {
            setAddresses(userDoc.data().addresses);
          }
        } catch (error) {
          console.error('Error fetching addresses:', error);
        }
      }
    };

    if (isOpen) {
      fetchAddresses();
    }
  }, [user, isOpen]);

  const handleAddAddress = async () => {
    if (!newAddress.address || !newAddress.city || !newAddress.state || !newAddress.pincode) {
      alert('Please fill all fields');
      return;
    }

    setLoading(true);
    try {
      const updatedAddresses = [...addresses, { ...newAddress, id: Date.now() }];
      await updateDoc(doc(db, 'users', user.uid), {
        addresses: updatedAddresses
      });

      setAddresses(updatedAddresses);
      setNewAddress({ address: '', city: '', state: '', pincode: '' });
    } catch (error) {
      console.error('Error adding address:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
      await updateDoc(doc(db, 'users', user.uid), {
        addresses: updatedAddresses
      });
      setAddresses(updatedAddresses);
    } catch (error) {
      console.error('Error deleting address:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content large" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>Manage Addresses</h2>
          <button className="dialog-close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="dialog-body">
          <div className="addresses-list">
            {addresses.map(address => (
              <div key={address.id} className="address-card">
                <p className="address-text">{address.address}</p>
                <p className="address-details">
                  {address.city}, {address.state} - {address.pincode}
                </p>
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteAddress(address.id)}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>

          <div className="add-address-form">
            <h3>Add New Address</h3>
            <div className="form-group">
              <input
                type="text"
                placeholder="Street Address"
                value={newAddress.address}
                onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
              />
            </div>
            <div className="form-row">
              <input
                type="text"
                placeholder="City"
                value={newAddress.city}
                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
              />
              <input
                type="text"
                placeholder="State"
                value={newAddress.state}
                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
              />
              <input
                type="text"
                placeholder="Pincode"
                value={newAddress.pincode}
                onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
              />
            </div>
            <button className="btn-primary" onClick={handleAddAddress} disabled={loading}>
              {loading ? 'Adding...' : 'Add Address'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeedbackDialog = ({ user, isOpen, onClose }) => {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!feedback.trim() || rating === 0) {
      alert('Please provide both rating and feedback');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'feedback'), {
        userId: user.uid,
        userEmail: user.email,
        feedback,
        rating,
        createdAt: new Date().toISOString()
      });

      setSubmitted(true);
      setTimeout(() => {
        onClose();
        setFeedback('');
        setRating(0);
        setSubmitted(false);
      }, 2000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error submitting feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>Send Feedback</h2>
          <button className="dialog-close" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="dialog-body">
          {submitted ? (
            <div className="success-message">
              <p>✅ Thank you for your valuable feedback!</p>
              <p>We appreciate your time and will use it to improve our services.</p>
            </div>
          ) : (
            <>
              <div className="rating-section">
                <label>How would you rate your experience?</label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      className={`star ${star <= rating ? 'active' : ''}`}
                      onClick={() => setRating(star)}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Your Feedback</label>
                <textarea
                  rows="5"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tell us about your experience..."
                />
              </div>
            </>
          )}
        </div>

        {!submitted && (
          <div className="dialog-footer">
            <button className="btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// MAIN HEADER COMPONENT
// ============================================
const GlobalHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user] = useAuthState(auth);
  const { getCartCount } = useCart();
  
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [activeDialog, setActiveDialog] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigationItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/meal-boxes', label: 'Meal Boxes', icon: '🍱' },
    { path: '/platters', label: 'Platters', icon: '🍽️' },
    { path: '/catering', label: 'Catering', icon: '🎉' },
    { path: '/bulk-orders', label: 'Bulk Orders', icon: '📦' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <header className={`modern-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="header-container">
          <div className="logo-section">
            <button className="logo-link" onClick={() => navigate('/')}>
              <span className="logo-icon">🍽️</span>
              <span className="logo-text">FUDORO</span>
              <span className="logo-tagline">Authentic Flavors</span>
            </button>
          </div>

          <nav className="desktop-nav">
            {navigationItems.map(item => (
              <div key={item.path} className="nav-item-wrapper">
                <button
                  className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                  onClick={() => navigate(item.path)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </button>
              </div>
            ))}
          </nav>

          <div className="header-actions">
            {user ? (
              <UserAccountDropdown
                user={user}
                isOpen={userDropdownOpen}
                onToggle={() => setUserDropdownOpen(!userDropdownOpen)}
                onClose={() => setUserDropdownOpen(false)}
                onNavigate={navigate}
                onOpenDialog={setActiveDialog}
              />
            ) : (
              <button className="action-btn login-btn" onClick={() => navigate('/login')}>
                <UserIcon />
              </button>
            )}

            <button className="action-btn cart-btn" onClick={() => navigate('/cart')}>
              <div className="cart-icon-container">
                <CartIcon />
                {getCartCount() > 0 && (
                  <span className="cart-badge">{getCartCount()}</span>
                )}
              </div>
            </button>

            <button 
              className="action-btn mobile-menu-btn" 
              onClick={() => setMobileMenuOpen(true)}
            >
              <MenuIcon />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && <div className="menu-overlay" onClick={() => setMobileMenuOpen(false)} />}
      <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-content">
          <div className="mobile-menu-header">
            <div className="mobile-logo">
              <span>🍽️</span>
              <span>FUDORO</span>
            </div>
            <button className="mobile-close-btn" onClick={() => setMobileMenuOpen(false)}>
              <CloseIcon />
            </button>
          </div>

          <nav className="mobile-nav">
            {navigationItems.map(item => (
              <button
                key={item.path}
                className={`mobile-nav-link ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
              >
                <span className="mobile-nav-icon">{item.icon}</span>
                <div className="mobile-nav-content">
                  <span className="mobile-nav-label">{item.label}</span>
                </div>
              </button>
            ))}
          </nav>

          <div className="mobile-menu-footer">
            <button className="mobile-cart-btn" onClick={() => {
              navigate('/cart');
              setMobileMenuOpen(false);
            }}>
              <CartIcon />
              <span>View Cart ({getCartCount()})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <UserDetailsDialog
        user={user}
        isOpen={activeDialog === 'userDetails'}
        onClose={() => setActiveDialog(null)}
      />
      <AddressesDialog
        user={user}
        isOpen={activeDialog === 'addresses'}
        onClose={() => setActiveDialog(null)}
      />
      <FeedbackDialog
        user={user}
        isOpen={activeDialog === 'feedback'}
        onClose={() => setActiveDialog(null)}
      />
    </>
  );
};

// ============================================
// FOOTER COMPONENT
// ============================================
const GlobalFooter = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);
  const [message, setMessage] = useState('');

  const handleNewsletter = async (e) => {
    e.preventDefault();
    setSubscribing(true);
    setMessage('');

    try {
      await addDoc(collection(db, 'newsletter'), {
        email,
        subscribedAt: new Date().toISOString()
      });

      setMessage('Successfully subscribed!');
      setEmail('');
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setMessage('Error subscribing. Please try again.');
    } finally {
      setSubscribing(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="modern-footer">
      <div className="footer-main">
        <div className="footer-container">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="footer-logo-icon">🍽️</span>
              <div className="footer-logo-text">
                <h3>FUDORO</h3>
                <p>Authentic Platters</p>
              </div>
            </div>

            <p className="footer-description">
              Experience the authentic taste of tradition with our carefully curated meal boxes and catering services.
            </p>

            <div className="footer-social">
              <h4>Follow Us</h4>
              <div className="social-links">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link instagram">📷</a>
                <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer" className="social-link whatsapp">💬</a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link facebook">📘</a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link twitter">🐦</a>
              </div>
            </div>
          </div>

          <div className="footer-links">
            <div className="footer-section">
              <h4 className="footer-section-title">Quick Links</h4>
              <ul className="footer-section-links">
                <li><button className="footer-link" onClick={() => navigate('/')}>Home</button></li>
                <li><button className="footer-link" onClick={() => navigate('/meal-boxes')}>Meal Boxes</button></li>
                <li><button className="footer-link" onClick={() => navigate('/platters')}>Platters</button></li>
                <li><button className="footer-link" onClick={() => navigate('/catering')}>Catering</button></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4 className="footer-section-title">Company</h4>
              <ul className="footer-section-links">
                <li><button className="footer-link" onClick={() => navigate('/about')}>About Us</button></li>
                <li><button className="footer-link" onClick={() => navigate('/my-orders')}>My Orders</button></li>
                <li><button className="footer-link" onClick={() => navigate('/contact')}>Contact</button></li>
                <li><button className="footer-link" onClick={() => navigate('/faq')}>FAQ</button></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4 className="footer-section-title">Legal</h4>
              <ul className="footer-section-links">
                <li><button className="footer-link" onClick={() => navigate('/privacy')}>Privacy Policy</button></li>
                <li><button className="footer-link" onClick={() => navigate('/terms')}>Terms of Service</button></li>
                <li><button className="footer-link" onClick={() => navigate('/refund')}>Refund Policy</button></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4 className="footer-section-title">Support</h4>
              <ul className="footer-section-links">
                <li><button className="footer-link">Help Center</button></li>
                <li><button className="footer-link">Track Order</button></li>
                <li><button className="footer-link">Bulk Orders</button></li>
                <li><button className="footer-link">Careers</button></li>
              </ul>
            </div>
          </div>

          <div className="footer-newsletter">
            <h4>Stay Updated</h4>
            <p>Subscribe to our newsletter for exclusive offers and updates.</p>
            
            <form className="newsletter-form" onSubmit={handleNewsletter}>
              <div className="newsletter-input-wrapper">
                <input
                  type="email"
                  className="newsletter-input"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="newsletter-btn" disabled={subscribing}>
                  {subscribing ? 'Subscribing...' : 'Subscribe'}
                </button>
              </div>
              {message && <p className="newsletter-message">{message}</p>}
            </form>

            <div className="footer-stats">
              <div className="stat">
                <span className="stat-number">10K+</span>
                <span className="stat-label">Happy Customers</span>
              </div>
              <div className="stat">
                <span className="stat-number">500+</span>
                <span className="stat-label">Daily Orders</span>
              </div>
              <div className="stat">
                <span className="stat-number">4.8★</span>
                <span className="stat-label">Average Rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-container">
          <div className="footer-bottom-content">
            <div className="footer-copyright">
              <p>© 2025 FUDORO. All rights reserved.</p>
              <p>Made with ❤️ for authentic food lovers</p>
            </div>

            <div className="footer-bottom-links">
              <button className="footer-bottom-link" onClick={() => navigate('/privacy')}>Privacy</button>
              <button className="footer-bottom-link" onClick={() => navigate('/terms')}>Terms</button>
              <button className="footer-bottom-link" onClick={() => navigate('/sitemap')}>Sitemap</button>
            </div>

            <button className="back-to-top-btn" onClick={scrollToTop}>
              ↑ Back to Top
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

// ============================================
// COMBINED EXPORT - SINGLE EXPORT ONLY
// ============================================
const GlobalHeaderFooter = () => (
  <>
    <GlobalHeader />
    <GlobalFooter />
  </>
);

export { GlobalHeader, GlobalFooter };
export default GlobalHeaderFooter;
