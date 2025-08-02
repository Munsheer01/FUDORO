import React, { useRef, useState, useEffect } from "react";
import styles from "./WelcomeScreen.module.css";
import { GlobalFooter } from "../components/GlobalHeader&Footer";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  updateProfile, // Make sure updateProfile is imported
} from "firebase/auth";
// Removed unused Firestore imports

// Make sure db is exported from your firebase.js


const placeholderImage = (width, height, text = "Image") =>
  `https://placehold.co/${width}x${height}/EBF0F5/777777?text=${encodeURIComponent(
    text
  )}&font=poppins`;

// MobileNavigationMenu removed

// Accordion Section Component
function AccordionSection({ title, children, defaultOpen = false, id }) {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    setOpen(defaultOpen);
  }, [defaultOpen]);

  return (
    <section className={styles.accordionSection}>
      <button
        className={styles.accordionHeader}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
      >
        <span>{title}</span>
        <span
          className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
          aria-hidden="true"
        >
          &#9660; {/* Down arrow for chevron */}
        </span>
      </button>
      <div
        id={id}
        className={`${styles.accordionPanel} ${open ? styles.panelOpen : ""}`}
        role="region"
        aria-labelledby={id + "-header"}
        tabIndex={open ? 0 : -1}
      >
        {open && children}
      </div>
    </section>
  );
}

function WelcomeScreen() {
  const loginRef = useRef(null);
  // Removed unused otpSent state
  // Hamburger and mobile menu removed
  const [authError, setAuthError] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  // const [customClaims, setCustomClaims] = useState("");
  // Removed unused isAdmin state
  // Responsive: expanded accordions on desktop, collapsed on mobile
  const isMobile = window.matchMedia("(max-width: 767px)").matches;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      // Removed setIsAdmin references (no admin logic)
    });
    return () => unsubscribe();
  }, []);

  // Listen for auth state changes (redundant with the above, but harmless)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLoginClick = () => {
    loginRef.current.scrollIntoView({ behavior: "smooth" });
  };

  // Removed unused handleSendOtp function

  // Firebase Auth login/signup logic
  const handleVerifyLogin = async (e) => {
    e.preventDefault();
    setAuthError("");

    // --- IMPORTANT DEBUGGING STEP ---
    // Log the email and password being used
    console.log("Attempting to authenticate with Email:", email, "Password:", password);

    try {
      // Try to sign in
      await signInWithEmailAndPassword(auth, email, password);
      console.log("Successfully signed in existing user.");
      navigate("/home");
    } catch (err) {
      console.error("Sign-in attempt failed:", err.code, err.message);

      if (err.code === "auth/user-not-found") {
        console.log("User not found, attempting to sign up new user...");
        try {
          // Sign up new user
          const userCred = await createUserWithEmailAndPassword(auth, email, password);
          console.log("User created successfully:", userCred.user);

          // Set display name and photo URL
          await updateProfile(userCred.user, {
            displayName: displayName || null, // Use null for undefined to ensure Firebase accepts it
            photoURL: photoURL || null,
          });
          console.log("User profile updated.");

          // Save custom claims as a Firestore doc (for demo, since real custom claims require admin SDK)
          // Your commented out code for custom claims (Firestore doc) is here.
          // This part is NOT related to Firebase Authentication custom claims directly,
          // which are set via the Firebase Admin SDK.
          /*
          if (customClaims) {
            try {
              const claimsObj = JSON.parse(customClaims);
              await setDoc(doc(db, "userClaims", userCred.user.uid), claimsObj);
              console.log("User claims document saved to Firestore.");
            } catch (e) {
              setAuthError("Invalid custom claims JSON. Error: " + e.message);
              console.error("Error saving custom claims to Firestore:", e);
              return; // Stop execution if claims JSON is invalid
            }
          }
          */
          navigate("/home");
        } catch (signupErr) {
          console.error("Signup failed:", signupErr.code, signupErr.message);
          if (signupErr.code === "auth/weak-password") {
              setAuthError("Password is too weak. Please use at least 6 characters.");
          } else if (signupErr.code === "auth/email-already-in-use") {
              setAuthError("This email is already in use. Please sign in or use a different email.");
          } else if (signupErr.code === "auth/invalid-email") {
              setAuthError("The email address is not valid.");
          }
          else {
              setAuthError(signupErr.message); // Catch other specific errors
          }
        }
      } else if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
          setAuthError("Invalid login credentials. Please check your email and password.");
      }
      else {
        // Catch any other unexpected errors during sign-in
        setAuthError(err.message);
      }
    }
  };

  // Hamburger and mobile menu removed

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerCenter}>
          <div className={styles.logo}>FUDORO</div>
          <div className={styles.tagline}>
            Deliciously Delivered. Perfectly Catered.
          </div>
        </div>
        <button className={styles.floatingLoginBtn} onClick={handleLoginClick}>
          Login
        </button>
      </header>

      {/* Hero Section with Login */}
            <section className={styles.hero}>
        <div className={styles.heroContent}>
          <form
            id="book"
            ref={loginRef}
            className={`${styles.loginForm} ${styles.loginFormBg}`}
            onSubmit={handleVerifyLogin}
            aria-labelledby="login-title"
            aria-describedby="login-description"
          >
            <h2 id="login-title" className={styles.sectionTitle}>
              Login or Sign Up
            </h2>
            <div className={styles.formFeedback} aria-live="polite">
              {authError && <span style={{ color: "red" }}>{authError}</span>}
              {user && <span style={{ color: "green" }}>Logged in as {user.email}</span>}
            </div>
            <input
              type="text"
              name="displayName"
              placeholder="Display Name (optional)"
              aria-label="Display Name"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className={styles.paleInput}
            />
            <input
              type="email" // Use type="email" for better browser validation
              name="email"
              placeholder="Email"
              aria-label="Email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={styles.paleInput}
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              aria-label="Password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={styles.paleInput}
            />
            <input
              type="url"
              name="photoURL"
              placeholder="Photo URL (optional)"
              aria-label="Photo URL"
              value={photoURL}
              onChange={e => setPhotoURL(e.target.value)}
              className={styles.paleInput}
            />
            <button type="submit" className={styles.verifyBtn}>
              Login / Sign Up
            </button>
            {user && (
              <button
                type="button"
                className={styles.verifyBtn}
                style={{ marginTop: "1rem" }}
                onClick={() => signOut(auth)}
              >
                Sign Out
              </button>
            )}
          </form>
        </div>
      </section>

      {/* Accordion Sections */}
      <main className={`${styles.accordionMain} ${styles.gridMain}`}>
        <div className={`${styles.gridRow} ${styles.dropdownul}`}>
          <AccordionSection
            title="Services We Offer"
            id="servicesAccordion"
            defaultOpen={!isMobile}
          >
            <div className={styles.cardsStack}>
              <div className={styles.card}>
                <img
                  src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80"
                  alt="Man holding a plate of diverse food items for bulk meal delivery"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = placeholderImage(400, 200, "Bulk Meals");
                  }}
                />
                <div className={styles.cardContent}>
                  <h3>Bulk Meal Delivery</h3>
                  <p>
                    Reliable and hygienic food delivery for offices, hostels, and
                    institutions.
                  </p>
                </div>
              </div>
              <div className={styles.card}>
                <img
                  src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80"
                  alt="Elegant table setting at a catered event"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = placeholderImage(400, 200, "Event Catering");
                  }}
                />
                <div className={styles.cardContent}>
                  <h3>Event Catering</h3>
                  <p>
                    Customizable catering for weddings, parties, and corporate
                    events.
                  </p>
                </div>
              </div>
              <div className={styles.card}>
                <img
                  src="https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?auto=format&fit=crop&w=400&q=80"
                  alt="Healthy subscription meal box with fresh ingredients"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = placeholderImage(400, 200, "Subscription");
                  }}
                />
                <div className={styles.cardContent}>
                  <h3>Subscription Meals</h3>
                  <p>
                    Healthy and tasty meals delivered daily with flexible
                    subscription plans.
                  </p>
                </div>
              </div>
              <div className={styles.card}>
                <img
                  src="https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80"
                  alt="Chef preparing a custom food order in a kitchen"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = placeholderImage(400, 200, "Custom Orders");
                  }}
                />
                <div className={styles.cardContent}>
                  <h3>Custom Orders</h3>
                  <p>
                    Tailor your menu to suit your taste and dietary preferences.
                  </p>
                </div>
              </div>
            </div>
          </AccordionSection>

          <AccordionSection
            title="How We Work"
            id="howAccordion"
            defaultOpen={!isMobile}
          >
            <ol className={styles.stepsList}>
              <li>
                <strong>Place Your Order:</strong> Choose your service and submit your requirements.
              </li>
              <li>
                <strong>Confirmation:</strong> We confirm your order and delivery details.
              </li>
              <li>
                <strong>Preparation:</strong> Our chefs prepare your meals fresh.
              </li>
              <li>
                <strong>Delivery:</strong> Meals are delivered on time, hot and hygienic.
              </li>
              <li>
                <strong>Enjoy:</strong> Savor your food and let us know your feedback!
              </li>
            </ol>
          </AccordionSection>

          <AccordionSection
            title="Events We Cater"
            id="eventsAccordion"
            defaultOpen={!isMobile}
          >
            <div className={styles.eventsGrid}>
              <div className={styles.eventType}>
                <span role="img" aria-label="Wedding" className={styles.eventIcon}>&#128148;</span>
                <span>Weddings</span>
              </div>
              <div className={styles.eventType}>
                <span role="img" aria-label="Corporate" className={styles.eventIcon}>&#128188;</span>
                <span>Corporate Events</span>
              </div>
              <div className={styles.eventType}>
                <span role="img" aria-label="Party" className={styles.eventIcon}>&#127881;</span>
                <span>Private Parties</span>
              </div>
              <div className={styles.eventType}>
                <span role="img" aria-label="Birthday" className={styles.eventIcon}>&#127874;</span>
                <span>Birthdays</span>
              </div>
            </div>
          </AccordionSection>

          <AccordionSection
            title="Hear from Our Customers"
            id="testimonialsAccordion"
            defaultOpen={!isMobile}
          >
            <div className={styles.testimonials}>
              <div className={styles.testimonialCard}>
                <p>
                  <span className={styles.quoteMark}>&ldquo;</span>
                  The food was delicious and the service was prompt. Highly recommended!
                  <span className={styles.quoteMark}>&rdquo;</span>
                </p>
                <div className={styles.testimonialAuthor}>- Priya S.</div>
              </div>
              <div className={styles.testimonialCard}>
                <p>
                  <span className={styles.quoteMark}>&ldquo;</span>
                  Our corporate event was a hit thanks to FUDORO's catering!
                  <span className={styles.quoteMark}>&rdquo;</span>
                </p>
                <div className={styles.testimonialAuthor}>- Rahul M.</div>
              </div>
            </div>
          </AccordionSection>

          <AccordionSection
            title="Contact Us"
            id="contactAccordion"
            defaultOpen={!isMobile}
          >
            <form className={styles.contactForm} autoComplete="off">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                aria-label="Your Name"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                aria-label="Your Email"
                required
              />
              <textarea
                name="message"
                placeholder="Your Message"
                aria-label="Your Message"
                rows={3}
                required
              />
              <button type="submit" className={styles.verifyBtn}>
                Send Message
              </button>
            </form>
            <div className={styles.contactDetails}>
              <div>
                <strong>Email:</strong> <a href="mailto:info@fudoro.com">info@fudoro.com</a>
              </div>
              <div>
                <strong>Phone:</strong> <a href="tel:+919999999999">+91 99999 99999</a>
              </div>
            </div>
          </AccordionSection>
        </div>
      </main>

      {/* Footer */}
      <GlobalFooter />
    </div>
  );
}

export default WelcomeScreen;