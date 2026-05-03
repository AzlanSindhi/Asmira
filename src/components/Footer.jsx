import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

const LINKS = [
  { to: '/',         label: 'Home' },
  { to: '/about',    label: 'About Us' },
  { to: '/services', label: 'Our Services' },
  { to: '/book',     label: 'Book Appointment' },
  { to: '/contact',  label: 'Contact' },
];

const SERVICES = [
  'Psychological Counseling',
  'Physiotherapy',
  'Chiropractic Care',
  'Stress & Anxiety Therapy',
  'Rehabilitation',
  'Group Therapy',
];

export default function Footer() {
  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={`${styles.inner} container`}>

        {/* Brand */}
        <div className={styles.brand}>
          <Link to="/" className={styles.logo} aria-label="Asmira Wellness Clinic">
            <div className={styles.logoIcon} aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="15" stroke="var(--gold)" strokeWidth="1.5"/>
                <path d="M16 8 C16 8 10 12 10 17 C10 20.3 12.7 23 16 23 C19.3 23 22 20.3 22 17 C22 12 16 8 16 8Z" fill="var(--amber)" opacity="0.8"/>
                <circle cx="16" cy="17" r="3" fill="var(--navy)"/>
              </svg>
            </div>
            <div>
              <span className={styles.logoName}>Asmira</span>
              <span className={styles.logoSub}>Wellness Clinic</span>
            </div>
          </Link>
          <p className={styles.tagline}>
            Restoring balance to mind and body through compassionate, evidence-based care.
          </p>
          <div className={styles.hours}>
            <span>Mon – Thur: 11am – 6pm</span>
            <span>Fri: 3pm – 8pm</span>
            <span>Sat: 11am – 8pm</span>
            <span>Sun: 9am – 2pm</span>
            <p>Everything available as per appointment</p>
          </div>
        </div>

        {/* Navigation */}
        <nav aria-label="Footer navigation">
          <h3 className={styles.heading}>Navigate</h3>
          <ul className={styles.list} role="list">
            {LINKS.map(({ to, label }) => (
              <li key={to}><Link to={to} className={styles.footerLink}>{label}</Link></li>
            ))}
          </ul>
        </nav>

        {/* Services */}
        <div>
          <h3 className={styles.heading}>Our Services</h3>
          <ul className={styles.list} role="list">
            {SERVICES.map(s => (
              <li key={s}><Link to="/services" className={styles.footerLink}>{s}</Link></li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <address className={styles.contact}>
          <h3 className={styles.heading}>Contact Us</h3>
          <a href="tel:+91 1234567890" className={styles.contactLink}>
            <span aria-hidden="true">📞</span> +91 95512 31430
          </a>
          <a href="mailto:hello@asmira.com" className={styles.contactLink}>
            <span aria-hidden="true">✉</span> asmirawellness@gmail.com
          </a>
          <p className={styles.address}>
            Asmira Wellness,1st Floor, Shop No 118 <br></br>
            M Square Mall Tithal Road
          </p>
          <div className={styles.emergency}>
            <span>🆘</span>
            <div>
              <strong>Mental Health Crisis</strong>
              <a href="tel:14416">14416 Lifeline</a>
            </div>
          </div>
        </address>
      </div>

      <div className={styles.bottom}>
        <p>© {new Date().getFullYear()} Asmira Wellness Clinic. All rights reserved.</p>
        <p>Healing begins with a single step.</p>
      </div>
    </footer>
  );
}
