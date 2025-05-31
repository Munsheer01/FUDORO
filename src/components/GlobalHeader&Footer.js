import React, { useState } from "react";

// SVG icons for Cart, Hamburger, WhatsApp, Instagram
const CartIcon = () => (
  <svg width="24" height="24" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h7.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
);
const HamburgerIcon = ({ open }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
    <rect y="5" width="24" height="2" rx="1" fill="#D4AF37" style={{ transition: "all .3s", transform: open ? "rotate(45deg) translate(5px,5px)" : "none" }}/>
    <rect y="11" width="24" height="2" rx="1" fill="#D4AF37" style={{ opacity: open ? 0 : 1, transition: "all .3s" }}/>
    <rect y="17" width="24" height="2" rx="1" fill="#D4AF37" style={{ transition: "all .3s", transform: open ? "rotate(-45deg) translate(5px,-5px)" : "none" }}/>
  </svg>
);
const WhatsAppIcon = () => (
  <svg width="22" height="22" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#25D366"/><path d="M23.5 19.5c-.3-.2-1.8-.9-2.1-1-0.3-.1-.5-.2-.7.2s-.8 1-1 1.2c-.2.2-.4.2-.7.1-2-.8-3.3-2.8-3.5-3.2-.2-.3 0-.5.1-.7.1-.1.2-.3.3-.5.1-.2.1-.4 0-.6s-.7-1.7-1-2.3c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.7.3-.2.2-1 1-1 2.4s1 2.7 1.2 2.9c.2.2 2 3.1 5 4.2.7.2 1.2.3 1.6.2.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2z" fill="#fff"/></svg>
);
const InstagramIcon = () => (
  <svg width="22" height="22" viewBox="0 0 32 32" fill="none"><rect x="4" y="4" width="24" height="24" rx="7" fill="#EDD49B"/><circle cx="16" cy="16" r="6" fill="#0A5247"/><circle cx="23" cy="9" r="1.5" fill="#0A5247"/></svg>
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
    <footer className="globalFooter">
      <div className="footerContent">
        <div className="contactSection">
          <span>Contact Us:</span>
          <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="iconLink">
            <WhatsAppIcon />
          </a>
          <a href="https://instagram.com/fudoro" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="iconLink">
            <InstagramIcon />
          </a>
        </div>
        <div className="profileSection">
          <span>© {new Date().getFullYear()} FUDORO. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}