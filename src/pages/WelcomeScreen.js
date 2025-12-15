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

  // Monitor auth state WITHOUT automatic redirect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (loggedInUser) => {
      setUser(loggedInUser);
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, []);

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
    <main className={styles.wrapper} role="main" tabIndex={-1}>
      <header className={styles.header}>
        <div className={styles.headerCenter}>
          <div className={styles.logo} aria-label="Fudoro logo">
            FUDORO
          </div>
          <div className={styles.tagline}>
            Reliable, hygienic food delivery for your needs
          </div>
        </div>
        <button
          className={styles.ctaBtn}
          style={{
            position: "absolute",
            right: 32,
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: "0.95rem",
            padding: "0.5rem 1.5rem",
            minWidth: 100,
            minHeight: 36,
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
          aria-label="Login"
        >
          Login
        </button>
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
        aria-label={user ? "User signed in" : "User sign in or sign up"}
      >
        {user ? (
          <div className={styles.signedInContainer}>
            <h2 className={styles.sectionTitle}>Welcome back!</h2>
            <p className={styles.userWelcome}>
              Signed in as <strong>{user.displayName || user.email}</strong>
            </p>
            <div className={styles.signedInActions}>
              <button
                onClick={() => navigate("/home")}
                className={styles.ctaBtn}
              >
                Go to Home
              </button>
              <button
                onClick={handleSignOut}
                className={styles.signOutButton}
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className={styles.sectionTitle}>Sign In / Register</h2>
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
