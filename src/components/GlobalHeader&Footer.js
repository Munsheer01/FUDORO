import React, { useState } from "react";


// SVG icons for Cart, Hamburger, WhatsApp, Instagram
const CartIcon = () => (
  <svg width="24" height="24" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h7.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>
);
const HamburgerIcon = ({ open }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <rect y="5" width="24" height="2" rx="1" fill="#D4AF37" style={{ transition: "all .3s", transform: open ? "rotate(45deg) translate(5px,5px)" : "none" }} />
    <rect y="11" width="24" height="2" rx="1" fill="#D4AF37" style={{ opacity: open ? 0 : 1, transition: "all .3s" }} />
    <rect y="17" width="24" height="2" rx="1" fill="#D4AF37" style={{ transition: "all .3s", transform: open ? "rotate(-45deg) translate(5px,-5px)" : "none" }} />
  </svg>
);

const navLinks = [
  { label: "Meal Boxes", href: "/meal-boxes" },
  { label: "Bulk Orders", href: "/bulk-orders" },
  { label: "Catering Services", href: "/catering-services" },
  { label: "Live Counters", href: "/live-counters" },
];

export function GlobalHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="globalHeader">
      <div className="headerInner">
        <a href="/" className="logo">FUDORO</a>
        {/* Desktop Nav */}
        <nav className="desktopNav">
          {navLinks.map(link => (
            <a key={link.href} href={link.href} className="navLink">
              {link.label}
            </a>
          ))}
        </nav>
        <a href="/cart" className="cartBtn" aria-label="Cart">
          <CartIcon />
        </a>
        {/* Mobile Hamburger */}
        <button
          className="hamburgerBtn"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(v => !v)}
        >
          <HamburgerIcon open={menuOpen} />
        </button>
      </div>
      {/* Mobile Slide Menu */}
      <nav className={`mobileMenu${menuOpen ? " menuOpen" : ""}`}>
        {navLinks.map(link => (
          <a key={link.href} href={link.href} className="mobileNavLink" onClick={() => setMenuOpen(false)}>
            {link.label}
          </a>
        ))}
        <a href="/cart" className="mobileCartBtn" onClick={() => setMenuOpen(false)}>
          <CartIcon /> <span>Cart</span>
        </a>
      </nav>
      {/* Overlay for menu */}
      {menuOpen && <div className="menuOverlay" onClick={() => setMenuOpen(false)} />}
    </header>
  );
}

export function GlobalFooter() {
  return (
    <footer className="footer">
      <div className="footerIcons">
        <a href="https://instagram.com/fudoro" aria-label="Instagram">
          <i className="fab fa-instagram" style={{ fontSize: "24px", color: "#E1306C" }}></i>
        </a>
        <a href="https://wa.me/919999999999" aria-label="WhatsApp">
          <i className="fab fa-whatsapp" style={{ fontSize: "24px", color: "#25D366" }}></i>
        </a>
      </div>
      <p>&copy; {new Date().getFullYear()} FUDORO. All rights reserved.</p>
    </footer>
  );
}