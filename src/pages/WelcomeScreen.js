import React, { useRef, useState, useEffect } from "react";
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
              className={styles.paleInput}
            />
            <input
              type="password"
              name="password"
              placeholder="Password (optional for OTP)"
              aria-label="Password"
              className={styles.paleInput}
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
        </div>
      </main>

      

      

      

      
      {/* Footer */}
      <div className={styles.footer}>          
      <footer className={styles.footerIcons}>
        
          <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <svg width="24" height="24" fill="currentColor" aria-hidden="true" viewBox="0 0 24 24">
              <path d="M12 2.2c3.2 0 3.584.012 4.85.07 1.17.056 1.97.24 2.43.41a4.92 4.92 0 0 1 1.77 1.03 4.92 4.92 0 0 1 1.03 1.77c.17.46.354 1.26.41 2.43.058 1.266.07 1.65.07 4.85s-.012 3.584-.07 4.85c-.056 1.17-.24 1.97-.41 2.43a4.92 4.92 0 0 1-1.03 1.77 4.92 4.92 0 0 1-1.77 1.03c-.46.17-1.26.354-2.43.41-1.266.058-1.65.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.056-1.97-.24-2.43-.41a4.92 4.92 0 0 1-1.77-1.03 4.92 4.92 0 0 1-1.03-1.77c-.17-.46-.354-1.26-.41-2.43C2.212 15.784 2.2 15.4 2.2 12.2s.012-3.584.07-4.85c.056-1.17.24-1.97.41-2.43A4.92 4.92 0 0 1 3.71 3.15a4.92 4.92 0 0 1 1.77-1.03c.46-.17 1.26-.354 2.43-.41C8.416 2.212 8.8 2.2 12 2.2zm0-2.2C8.736 0 8.332.013 7.052.072 5.77.13 4.73.31 3.89.57a7.07 7.07 0 0 0-2.56 1.64A7.07 7.07 0 0 0 .57 4.89c-.26.84-.44 1.88-.5 3.16C.013 8.332 0 8.736 0 12c0 3.264.013 3.668.072 4.948.06 1.28.24 2.32.5 3.16a7.07 7.07 0 0 0 1.64 2.56 7.07 7.07 0 0 0 2.56 1.64c.84.26 1.88.44 3.16.5C8.332 23.987 8.736 24 12 24s3.668-.013 4.948-.072c1.28-.06 2.32-.24 3.16-.5a7.07 7.07 0 0 0 2.56-1.64 7.07 7.07 0 0 0 1.64-2.56c.26-.84.44-1.88.5-3.16.059-1.28.072-1.684.072-4.948s-.013-3.668-.072-4.948c-.06-1.28-.24-2.32-.5-3.16a7.07 7.07 0 0 0-1.64-2.56A7.07 7.07 0 0 0 20.11.57c-.84-.26-1.88-.44-3.16-.5C15.668.013 15.264 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm7.844-10.406a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/>
            </svg>
          </a>
          <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
            <svg width="24" height="24" fill="currentColor" aria-hidden="true" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.1 3.2 5.077 4.363.709.306 1.262.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.617h-.001a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.999-3.648-.235-.374A9.86 9.86 0 0 1 0 11.513C0 5.16 5.159 0 11.504 0c3.084 0 5.983 1.203 8.166 3.387A11.48 11.48 0 0 1 23.999 11.5c0 6.352-5.159 11.5-11.504 11.5m8.413-19.913A10.944 10.944 0 0 0 11.504 1.05C5.786 1.05 1.05 5.786 1.05 11.513c0 2.037.547 4.021 1.588 5.754l.247.414-.662 2.419 2.482-.652.4.237a8.822 8.822 0 0 0 4.299 1.18c5.716 0 10.451-4.736 10.451-10.454 0-2.796-1.089-5.423-3.067-7.401"/>
            </svg>
          </a>
        
      <div className={styles.footer}>          
      <footer className={styles.footerIcons}>
        
          <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <svg width="24" height="24" fill="currentColor" aria-hidden="true" viewBox="0 0 24 24">
              <path d="M12 2.2c3.2 0 3.584.012 4.85.07 1.17.056 1.97.24 2.43.41a4.92 4.92 0 0 1 1.77 1.03 4.92 4.92 0 0 1 1.03 1.77c.17.46.354 1.26.41 2.43.058 1.266.07 1.65.07 4.85s-.012 3.584-.07 4.85c-.056 1.17-.24 1.97-.41 2.43a4.92 4.92 0 0 1-1.03 1.77 4.92 4.92 0 0 1-1.77 1.03c-.46.17-1.26.354-2.43.41-1.266.058-1.65.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.056-1.97-.24-2.43-.41a4.92 4.92 0 0 1-1.77-1.03 4.92 4.92 0 0 1-1.03-1.77c-.17-.46-.354-1.26-.41-2.43C2.212 15.784 2.2 15.4 2.2 12.2s.012-3.584.07-4.85c.056-1.17.24-1.97.41-2.43A4.92 4.92 0 0 1 3.71 3.15a4.92 4.92 0 0 1 1.77-1.03c.46-.17 1.26-.354 2.43-.41C8.416 2.212 8.8 2.2 12 2.2zm0-2.2C8.736 0 8.332.013 7.052.072 5.77.13 4.73.31 3.89.57a7.07 7.07 0 0 0-2.56 1.64A7.07 7.07 0 0 0 .57 4.89c-.26.84-.44 1.88-.5 3.16C.013 8.332 0 8.736 0 12c0 3.264.013 3.668.072 4.948.06 1.28.24 2.32.5 3.16a7.07 7.07 0 0 0 1.64 2.56 7.07 7.07 0 0 0 2.56 1.64c.84.26 1.88.44 3.16.5C8.332 23.987 8.736 24 12 24s3.668-.013 4.948-.072c1.28-.06 2.32-.24 3.16-.5a7.07 7.07 0 0 0 2.56-1.64 7.07 7.07 0 0 0 1.64-2.56c.26-.84.44-1.88.5-3.16.059-1.28.072-1.684.072-4.948s-.013-3.668-.072-4.948c-.06-1.28-.24-2.32-.5-3.16a7.07 7.07 0 0 0-1.64-2.56A7.07 7.07 0 0 0 20.11.57c-.84-.26-1.88-.44-3.16-.5C15.668.013 15.264 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm7.844-10.406a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/>
            </svg>
          </a>
          <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
            <svg width="24" height="24" fill="currentColor" aria-hidden="true" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.1 3.2 5.077 4.363.709.306 1.262.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.617h-.001a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.999-3.648-.235-.374A9.86 9.86 0 0 1 0 11.513C0 5.16 5.159 0 11.504 0c3.084 0 5.983 1.203 8.166 3.387A11.48 11.48 0 0 1 23.999 11.5c0 6.352-5.159 11.5-11.504 11.5m8.413-19.913A10.944 10.944 0 0 0 11.504 1.05C5.786 1.05 1.05 5.786 1.05 11.513c0 2.037.547 4.021 1.588 5.754l.247.414-.662 2.419 2.482-.652.4.237a8.822 8.822 0 0 0 4.299 1.18c5.716 0 10.451-4.736 10.451-10.454 0-2.796-1.089-5.423-3.067-7.401"/>
            </svg>
          </a>
        
        <p>&copy; {new Date().getFullYear()} FUDORO. All rights reserved.</p>
      </footer>
      </div>
      </div>
    </div>
  );
}

export default WelcomeScreen;