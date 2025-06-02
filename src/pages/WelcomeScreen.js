import React, { useRef, useState, useEffect } from "react";
import styles from "./WelcomeScreen.module.css";

const placeholderImage = (width, height, text = "Image") =>
  `https://placehold.co/${width}x${height}/EBF0F5/777777?text=${encodeURIComponent(
    text
  )}&font=poppins`;

const MobileNavigationMenu = ({ isOpen }) => {
  if (!isOpen) return null;
  return (
    <nav className={styles.mobileNavMenu}>
      <a href="#services">Services</a>
      <a href="#book">Book Order</a>
      {/* Add other navigation links here */}
    </nav>
  );
};

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
          ▶
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
  const [otpSent, setOtpSent] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Responsive: expanded accordions on desktop, collapsed on mobile
  const [isMobile, setIsMobile] = useState(() =>
    window.matchMedia("(max-width: 767px)").matches
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const handleResize = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handleResize);
    return () => mq.removeEventListener("change", handleResize);
  }, []);

  const handleLoginClick = () => {
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
    loginRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    setOtpSent(true);
    setTimeout(() => setOtpSent(false), 2000);
  };

  const handleVerifyLogin = (e) => {
    e.preventDefault();
    alert("Login verification logic goes here!");
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className={styles.wrapper}>
      {/* Header */}
      <header className={styles.header}>
        <button
          className={`${styles.hamburger} ${
            isMobileMenuOpen ? styles.hamburgerOpen : ""
          }`}
          aria-label="Menu"
          aria-expanded={isMobileMenuOpen}
          onClick={toggleMobileMenu}
        >
          <span />
          <span />
          <span />
        </button>
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
      <MobileNavigationMenu isOpen={isMobileMenuOpen} />

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
              Login to Place Your Order
            </h2>
            <div className={styles.formFeedback} aria-live="polite">
              {/* Feedback messages here */}
            </div>
            <input
              type="text"
              name="mobileOrEmail"
              placeholder="Mobile number or Gmail"
              aria-label="Mobile number or Gmail"
              required
              className={styles.paleInput}
            />
            <input
              type="password"
              name="password"
              placeholder="Password (optional for OTP)"
              aria-label="Password"
              className={styles.paleInput}
            />
            <button
              type="button"
              className={styles.otpBtn}
              onClick={handleSendOtp}
              disabled={otpSent}
            >
              {otpSent ? "Sending..." : "Send OTP"}
            </button>
            <input
              type="text"
              name="otp"
              placeholder="Enter OTP"
              aria-label="Enter OTP"
              required
              className={styles.paleInput}
            />
            <button type="submit" className={styles.verifyBtn}>
              Verify &amp; Login
            </button>
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
              <span role="img" aria-label="Wedding" className={styles.eventIcon}>💍</span>
              <span>Weddings</span>
            </div>
            <div className={styles.eventType}>
              <span role="img" aria-label="Corporate" className={styles.eventIcon}>🏢</span>
              <span>Corporate Events</span>
            </div>
            <div className={styles.eventType}>
              <span role="img" aria-label="Party" className={styles.eventIcon}>🎉</span>
              <span>Private Parties</span>
            </div>
            <div className={styles.eventType}>
              <span role="img" aria-label="Birthday" className={styles.eventIcon}>🎂</span>
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
      
      <div className={styles.footer}>          
      <footer className={styles.footerIcons}>
          <a href="https://instagram.com/fudoro" aria-label="Instagram">
          <i className="fab fa-instagram" style={{ fontSize: "24px", color: "#E1306C" }}></i>
        </a>
        <a href="https://wa.me/919999999999" aria-label="WhatsApp">
          <i className="fab fa-whatsapp" style={{ fontSize: "24px", color: "#25D366" }}></i>
        </a>
        
        <p>&copy; {new Date().getFullYear()} FUDORO. All rights reserved.</p>
      </footer>
      </div>
    </div>
  );
}

export default WelcomeScreen;