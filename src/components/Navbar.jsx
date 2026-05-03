import { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import styles from './Navbar.module.css';

const NAV_LINKS = [
  { to: '/',         label: 'Home' },
  { to: '/about',    label: 'About Us' },
  { to: '/services', label: 'Our Services' },
  { to: '/contact',  label: 'Contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 48);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => {
    const fn = () => { if (window.innerWidth > 768) setOpen(false); };
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);

  // Prevent body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`} role="banner">
      <nav className={`${styles.nav} container`} aria-label="Main navigation">

        {/* Logo */}
        <Link to="/" className={styles.logo} aria-label="Asmira Wellness Clinic — Home">
          <div className={styles.logoMark} aria-hidden="true">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="15" stroke="var(--gold)" strokeWidth="1.5"/>
              <path d="M16 8 C16 8 10 12 10 17 C10 20.3 12.7 23 16 23 C19.3 23 22 20.3 22 17 C22 12 16 8 16 8Z" fill="var(--amber)" opacity="0.8"/>
              <circle cx="16" cy="17" r="3" fill="var(--navy)"/>
            </svg>
          </div>
          <div className={styles.logoText}>
            <span className={styles.logoName}>Asmira</span>
            <span className={styles.logoSub}>Wellness Clinic</span>
          </div>
        </Link>

        {/* Desktop Links */}
        <ul className={styles.links} role="list">
          {NAV_LINKS.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to} end={to === '/'}
                className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}
              >{label}</NavLink>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link to="/book" className={styles.cta}>
          Book Appointment
        </Link>

        {/* Hamburger */}
        <button
          className={`${styles.hamburger} ${open ? styles.hamburgerOpen : ''}`}
          onClick={() => setOpen(o => !o)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Close menu' : 'Open menu'}
        >
          <span /><span /><span />
        </button>
      </nav>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={`${styles.mobileMenu} ${open ? styles.mobileOpen : ''}`}
        aria-hidden={!open}
      >
        <ul role="list">
          {NAV_LINKS.map(({ to, label }) => (
            <li key={to}>
              <NavLink
                to={to} end={to === '/'}
                className={({ isActive }) => `${styles.mobileLink} ${isActive ? styles.mobileActive : ''}`}
                onClick={() => setOpen(false)}
              >{label}</NavLink>
            </li>
          ))}
          <li>
            <Link to="/book" className={styles.mobileCta} onClick={() => setOpen(false)}>
              Book Appointment
            </Link>
          </li>
        </ul>

        <div className={styles.mobileContact}>
          <a href="tel:+11234567890">📞 +1 (123) 456-7890</a>
          <a href="mailto:hello@asmira.com">✉ hello@asmira.com</a>
        </div>
      </div>
    </header>
  );
}
