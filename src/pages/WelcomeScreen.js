import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./WelcomeScreen.module.css";
import { GlobalFooter } from "../components/GlobalHeader&Footer";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";

// Authentication form component — moved OUTSIDE to prevent recreation on parent re-render
const AuthForm = React.memo(({
  isLogin,
  email,
  password,
  error,
  loading,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onToggleMode,
}) => {
  return (
    <form className={styles.loginForm} onSubmit={onSubmit} noValidate>
      <label htmlFor="email" className={styles.label}>
        Email
        <input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={onEmailChange}
          required
          className={styles.input}
          autoComplete="email"
        />
      </label>
      <label htmlFor="password" className={styles.label}>
        Password
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={onPasswordChange}
          required
          className={styles.input}
          autoComplete={isLogin ? "current-password" : "new-password"}
          minLength={6}
        />
      </label>
      {error && (
        <div role="alert" className={styles.formError}>
          {error}
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className={styles.authButton}
      >
        {loading
          ? "Please wait..."
          : isLogin
          ? "Sign In"
          : "Create Account"}
      </button>
      <div className={styles.toggleContainer}>
        {isLogin ? (
          <>
            New to FUDORO?{" "}
            <button
              type="button"
              onClick={() => onToggleMode(false)}
              className={styles.toggleButton}
            >
              Create an account
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => onToggleMode(true)}
              className={styles.toggleButton}
            >
              Sign In
            </button>
          </>
        )}
      </div>
    </form>
  );
});

AuthForm.displayName = "AuthForm";

// Phone Authentication Component
const PhoneAuthForm = React.memo(({ onBack, error, loading, onSubmit }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [name, setName] = useState("");

  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    // Limit to 10 digits
    return digits.slice(0, 10);
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const handleOtpChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOtp(digits);
  };

  const isValidPhone = phoneNumber.length === 10 && /^[6-9]/.test(phoneNumber);
  const isValidOtp = otp.length === 6;

  return (
    <div className={styles.phoneAuthContainer}>
      <button 
        type="button" 
        onClick={onBack} 
        className={styles.backToEmailBtn}
        disabled={loading}
      >
        ← Back to Email Login
      </button>

      {!otpSent ? (
        <form onSubmit={(e) => onSubmit(e, phoneNumber, name, setOtpSent)} noValidate>
          <label htmlFor="name" className={styles.label}>
            Your Name
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={styles.input}
              autoComplete="name"
            />
          </label>

          <label htmlFor="phoneNumber" className={styles.label}>
            Phone Number
            <div className={styles.phoneInputContainer}>
              <span className={styles.phonePrefix}>+91</span>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                inputMode="numeric"
                placeholder="9876543210"
                value={phoneNumber}
                onChange={handlePhoneChange}
                required
                className={styles.phoneInput}
                autoComplete="tel"
                maxLength={10}
              />
            </div>
            {phoneNumber && !isValidPhone && (
              <span className={styles.inputHint}>
                {phoneNumber.length < 10 
                  ? `Enter ${10 - phoneNumber.length} more digit(s)` 
                  : 'Must start with 6, 7, 8, or 9'}
              </span>
            )}
          </label>

          {error && (
            <div role="alert" className={styles.formError}>
              {error}
            </div>
          )}

          <div id="recaptcha-container" className={styles.recaptchaContainer}></div>

          <button
            type="submit"
            disabled={loading || !isValidPhone || !name.trim()}
            className={styles.authButton}
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>
      ) : (
        <form onSubmit={(e) => onSubmit(e, phoneNumber, name, setOtpSent, otp)} noValidate>
          <div className={styles.otpSentMessage}>
            ✓ OTP sent to +91 {phoneNumber}
          </div>

          <label htmlFor="otp" className={styles.label}>
            Enter OTP
            <input
              id="otp"
              name="otp"
              type="text"
              inputMode="numeric"
              placeholder="123456"
              value={otp}
              onChange={handleOtpChange}
              required
              className={styles.otpInput}
              autoComplete="one-time-code"
              maxLength={6}
              autoFocus
            />
            {otp && !isValidOtp && (
              <span className={styles.inputHint}>
                Enter {6 - otp.length} more digit(s)
              </span>
            )}
          </label>

          {error && (
            <div role="alert" className={styles.formError}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !isValidOtp}
            className={styles.authButton}
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

          <button
            type="button"
            onClick={() => {
              setOtpSent(false);
              setOtp("");
            }}
            className={styles.resendButton}
            disabled={loading}
          >
            Change Phone Number
          </button>
        </form>
      )}
    </div>
  );
});

PhoneAuthForm.displayName = "PhoneAuthForm";

export default function WelcomeScreen() {
  const navigate = useNavigate();

  // User auth states and form states
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true); // toggle between login/signup
  const [authMode, setAuthMode] = useState("email"); // "email" or "phone"
  
  // Phone auth states
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState(null);

  // Monitor auth state WITHOUT automatic redirect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (loggedInUser) => {
      setUser(loggedInUser);
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);

  // Keyboard navigation - ESC key closes error messages
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && error) {
        setError('');
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [error]);

  // Initialize reCAPTCHA when switching to phone auth
  useEffect(() => {
    if (authMode === "phone" && !recaptchaVerifier) {
      const timer = setTimeout(() => {
        try {
          const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible',
            callback: () => {
              console.log('reCAPTCHA verified successfully');
            },
            'expired-callback': () => {
              console.warn('reCAPTCHA expired');
              setError('Verification expired. Please try again.');
            },
            'error-callback': (error) => {
              console.error('reCAPTCHA error:', error);
              setError('Verification failed. Please refresh and try again.');
            }
          });
          
          verifier.render().then(() => {
            console.log('reCAPTCHA rendered successfully');
            setRecaptchaVerifier(verifier);
          }).catch((error) => {
            console.error('reCAPTCHA render error:', error);
            setError('Failed to load verification. Please refresh the page.');
          });
        } catch (err) {
          console.error('reCAPTCHA initialization error:', err);
          setError('Failed to initialize verification. Please refresh the page.');
        }
      }, 100);

      return () => clearTimeout(timer);
    }

    // Cleanup
    return () => {
      if (authMode !== "phone" && recaptchaVerifier) {
        try {
          recaptchaVerifier.clear();
        } catch (e) {
          console.error('Error clearing reCAPTCHA:', e);
        }
        setRecaptchaVerifier(null);
      }
    };
  }, [authMode, recaptchaVerifier]);

  // Handle sign in with explicit navigation
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigate("/home");
    } catch (err) {
      setError(err.message || "Failed to sign in.");
    } finally {
      setLoading(false);
    }
  };

  // Handle sign up with explicit navigation
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      await updateProfile(userCredential.user, {
        displayName: email.split("@")[0] || "Fudoro User",
      });
      navigate("/home");
    } catch (err) {
      setError(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setEmail("");
      setPassword("");
      setError("");
    } catch (err) {
      setError("Failed to sign out.");
    }
  };

  // Handle phone authentication
  const handlePhoneAuth = async (e, phoneNumber, name, setOtpSent, otp) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!otp) {
        // Send OTP
        if (!recaptchaVerifier) {
          throw new Error('Verification not ready. Please wait a moment and try again.');
        }

        const fullPhoneNumber = `+91${phoneNumber}`;
        console.log('Sending OTP to:', fullPhoneNumber);
        
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout. Please try again.')), 30000)
        );
        
        const authPromise = signInWithPhoneNumber(
          auth,
          fullPhoneNumber,
          recaptchaVerifier
        );
        
        const confirmation = await Promise.race([authPromise, timeoutPromise]);
        
        setConfirmationResult(confirmation);
        setOtpSent(true);
        setError("");
        console.log('OTP sent successfully!');
      } else {
        // Verify OTP
        if (!confirmationResult) {
          throw new Error('No confirmation found. Please request OTP again.');
        }

        console.log('Verifying OTP:', otp);
        
        // Add timeout for verification
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Verification timeout. Please try again.')), 15000)
        );
        
        const verifyPromise = confirmationResult.confirm(otp);
        const result = await Promise.race([verifyPromise, timeoutPromise]);
        
        // Update user profile with name
        if (result.user && name) {
          await updateProfile(result.user, {
            displayName: name.trim(),
          });
        }

        console.log('Phone authentication successful!');
        navigate("/home");
      }
    } catch (err) {
      console.error('Phone auth error:', err);
      
      // User-friendly error messages
      if (err.message.includes('timeout') || err.message.includes('Timeout')) {
        setError('Request took too long. Please check your connection and try again.');
      } else if (err.code === 'auth/invalid-phone-number') {
        setError('Invalid phone number. Please check and try again.');
      } else if (err.code === 'auth/invalid-verification-code') {
        setError('Invalid OTP. Please check and try again.');
      } else if (err.code === 'auth/code-expired') {
        setError('OTP expired. Please request a new one.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many attempts. Please try again after a few minutes.');
      } else if (err.code === 'auth/quota-exceeded') {
        setError('Daily SMS quota exceeded. Please try email login or try again tomorrow.');
      } else if (err.code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection.');
      } else {
        setError(err.message || 'Failed to authenticate. Please try again.');
      }

      // Reset reCAPTCHA on error (only for OTP send, not verify)
      if (recaptchaVerifier && !otp) {
        try {
          recaptchaVerifier.clear();
          const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible',
          });
          await verifier.render();
          setRecaptchaVerifier(verifier);
        } catch (resetErr) {
          console.error('Error resetting reCAPTCHA:', resetErr);
          setError('Verification reset failed. Please refresh the page.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth state
  if (!authChecked) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>Loading FUDORO...</div>
      </div>
    );
  }

  // Service Cards component
  const ServiceCard = ({ title, description }) => (
    <div className={styles.card} tabIndex={0} aria-label={title}>
      <h3 className={styles.cardTitle}>{title}</h3>
      <p className={styles.cardDesc}>{description}</p>
    </div>
  );

  return (
    <main className={styles.wrapper} role="main" id="main-content">
      {/* Skip to main content link for screen readers */}
      <a href="#main-content" className={styles.skipToMain}>
        Skip to main content
      </a>
      
      <header className={styles.header} role="banner">
        <div className={styles.headerCenter}>
          <div className={styles.logo} aria-label="Fudoro logo">
            FUDORO
          </div>
          <div className={styles.tagline}>
            Reliable, hygienic food delivery for your needs
          </div>
        </div>
        <div className={styles.headerLogin}>
          <button
            className={styles.ctaBtn}
            style={{
              fontSize: "0.9rem",
              padding: "0.5rem 1.2rem",
              minWidth: "auto",
              minHeight: 40,
            }}
            onClick={() => {
              const loginSection = document.querySelector(
                `.${styles.loginSection}`
              );
              if (loginSection) {
                const yOffset = -100;
                const y =
                  loginSection.getBoundingClientRect().top +
                  window.pageYOffset +
                  yOffset;
                window.scrollTo({ top: y, behavior: "smooth" });
              }
            }}
            aria-label="Scroll to login section"
          >
            Login
          </button>
        </div>
      </header>

      <section
        className={styles.hero}
        aria-labelledby="welcome-hero-title"
      >
        <h1 id="welcome-hero-title" className={styles.heroLogo}>
          Welcome to FUDORO
        </h1>
        <p className={styles.heroTagline}>
          Bulk Meals • Event Catering • Daily Boxes
        </p>
        <button
          className={styles.ctaBtn}
          onClick={() => navigate("/home")}
          aria-label="Explore our services"
        >
          Explore Services
        </button>
      </section>

      <section
        className={styles.servicesSection}
        aria-label="Our service offerings"
      >
        <h2 className={styles.sectionTitle}>Our Services</h2>
        <div className={styles.cardsStack}>
          <ServiceCard
            title="Bulk Meal Delivery"
            description="Reliable and hygienic food delivery for offices, hostels, and institutions."
          />
          <ServiceCard
            title="Event Catering"
            description="Customizable catering for weddings, parties, and corporate events."
          />
          <ServiceCard
            title="Subscription Meals"
            description="Healthy and tasty meals delivered daily with flexible subscription plans."
          />
          <ServiceCard
            title="Custom Orders"
            description="Tailor your menu to suit your taste and dietary preferences."
          />
        </div>
      </section>

      <section
        className={styles.loginSection}
        aria-labelledby="auth-section-title"
      >
        {user ? (
          <div className={styles.signedInContainer}>
            <h2 id="auth-section-title" className={styles.sectionTitle}>Welcome back!</h2>
            <p className={styles.userWelcome}>
              Signed in as <strong>{user.displayName || user.email}</strong>
            </p>
            <div className={styles.signedInActions}>
              <button
                onClick={() => navigate("/home")}
                className={styles.ctaBtn}
                aria-label="Navigate to home page"
              >
                Go to Home
              </button>
              <button
                onClick={handleSignOut}
                className={styles.signOutButton}
                aria-label="Sign out of your account"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 id="auth-section-title" className={styles.sectionTitle}>Sign In / Register</h2>
            
            {/* Auth Mode Toggle */}
            <div className={styles.authModeToggle} role="tablist" aria-label="Authentication method">
              <button
                type="button"
                role="tab"
                aria-selected={authMode === "email"}
                aria-controls="auth-form-panel"
                className={`${styles.authModeBtn} ${authMode === "email" ? styles.active : ""}`}
                onClick={() => {
                  setAuthMode("email");
                  setError("");
                }}
              >
                📧 Email
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={authMode === "phone"}
                aria-controls="auth-form-panel"
                className={`${styles.authModeBtn} ${authMode === "phone" ? styles.active : ""}`}
                onClick={() => {
                  setAuthMode("phone");
                  setError("");
                }}
              >
                📱 Phone
              </button>
            </div>

            <div id="auth-form-panel" role="tabpanel" aria-labelledby="auth-section-title">
              {authMode === "email" ? (
                <AuthForm
                  isLogin={isLogin}
                  email={email}
                  password={password}
                  error={error}
                  loading={loading}
                  onEmailChange={(e) => setEmail(e.target.value)}
                  onPasswordChange={(e) => setPassword(e.target.value)}
                  onSubmit={isLogin ? handleSignIn : handleSignUp}
                  onToggleMode={(nextIsLogin) => {
                    setIsLogin(nextIsLogin);
                    setError("");
                  }}
                />
              ) : (
                <PhoneAuthForm
                  onBack={() => {
                    setAuthMode("email");
                    setError("");
                  }}
                  error={error}
                  loading={loading}
                  onSubmit={handlePhoneAuth}
                />
              )}
            </div>
          </>
        )}
      </section>


      <section
        className={styles.howItWorksSection}
        aria-label="How FUDORO works"
      >
        <h2 className={styles.sectionTitle}>How We Work</h2>
        <ol className={styles.stepsList}>
          <li>
            <b>Place Your Order:</b> Choose your service and submit your
            requirements.
          </li>
          <li>
            <b>Confirmation:</b> We confirm your order and delivery
            details.
          </li>
          <li>
            <b>Preparation:</b> Our chefs prepare your meals fresh.
          </li>
          <li>
            <b>Delivery:</b> Meals are delivered on time, hot and
            hygienic.
          </li>
          <li>
            <b>Enjoy:</b> Savor your food and let us know your feedback!
          </li>
        </ol>
      </section>

      <section
        className={styles.eventsSection}
        aria-label="Events we cater"
      >
        <h2 className={styles.sectionTitle}>Events We Cater</h2>
        <p className={styles.eventsText}>
          Weddings, corporate meetings, parties, and more. We tailor
          every menu to your event.
        </p>
      </section>

      <section
        className={styles.testimonialsSection}
        aria-label="Customer testimonials"
      >
        <h2 className={styles.sectionTitle}>Hear from Our Customers</h2>
        <div className={styles.testimonials}>
          <blockquote className={styles.testimonialCard}>
            <p className={styles.quoteMark}>
              &ldquo;The food was delicious and the service was prompt.
              Highly recommended!&rdquo;
            </p>
            <footer className={styles.testimonialAuthor}>
              - Happy Customer
            </footer>
          </blockquote>
          <blockquote className={styles.testimonialCard}>
            <p className={styles.quoteMark}>
              &ldquo;Our corporate event was a hit thanks to FUDORO's
              catering!&rdquo;
            </p>
            <footer className={styles.testimonialAuthor}>
              - Corporate Client
            </footer>
          </blockquote>
        </div>
      </section>

      <section
        className={styles.contactSection}
        aria-label="Contact details"
      >
        <h2 className={styles.sectionTitle}>Contact Us</h2>
        <p className={styles.contactDetails}>
          <strong>Email:</strong>{" "}
          <a
            href="mailto:info@fudoro.com"
            className={styles.contactLink}
          >
            info@fudoro.com
          </a>
          <br />
          <strong>Phone:</strong>{" "}
          <a
            href="tel:+919999999999"
            className={styles.contactLink}
          >
            +91 99999 99999
          </a>
        </p>
      </section>

      <GlobalFooter />
    </main>
  );
}
