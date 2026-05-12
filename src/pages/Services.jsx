import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import styles from './Services.module.css';
const CATEGORIES = ['All', 'Psychology', 'Chiropractic'];

const SERVICES = [
  {
    id: 1,
    cat: 'Psychology',
    icon: '🧠',
    title: 'Individual Therapy',
    desc: 'Confidential one-on-one sessions addressing anxiety, depression, trauma, stress, grief, and emotional wellbeing.',
    duration: '50 min',
    price: '₹900'
  },
  {
    id: 2,
    cat: 'Psychology',
    icon: '💑',
    title: 'Couples Counseling',
    desc: 'Guided therapy sessions for couples navigating communication issues, conflict, trust concerns, and relationship challenges.',
    duration: '60 min',
    price: '₹1100'
  },
  {
    id: 3,
    cat: 'Psychology',
    icon: '👨‍👩‍👧',
    title: 'Family Therapy',
    desc: 'Structured family sessions focused on improving relationships, resolving conflicts, and strengthening emotional connections.',
    duration: '90 min',
    price: '₹1800'
  },
  {
    id: 4,
    cat: 'Psychology',
    icon: '🧒',
    title: 'Child & Adolescent Therapy',
    desc: 'Supportive therapy for children and teenagers dealing with behavioural issues, stress, emotional challenges, and school-related concerns.',
    duration: '50 min',
    price: '₹900'
  },
  {
    id: 5,
    cat: 'Psychology',
    icon: '🎯',
    title: 'Career Counseling',
    desc: 'Personalized guidance to help students and professionals make informed academic and career decisions with confidence.',
    duration: '60 min',
    price: '₹1100'
  },
  {
    id: 6,
    cat: 'Chiropractic',
    icon: '😣',
    title: 'Migraine Relief',
    desc: 'Targeted chiropractic care and manual therapy focused on reducing migraine frequency, tension, and headache-related discomfort.',
    duration: '45 min',
    price: '₹1500'
  },
  {
    id: 7,
    cat: 'Chiropractic',
    icon: '🤸',
    title: 'Movement Screen',
    desc: 'Comprehensive movement assessment to identify mobility restrictions, muscular imbalances, and injury risks.',
    duration: '60 min',
    price: '₹1000'
  },
  {
    id: 8,
    cat: 'Chiropractic',
    icon: '🦴',
    title: 'Spinal Adjustment',
    desc: 'Manual spinal adjustments designed to improve alignment, mobility, posture, and overall musculoskeletal function.',
    duration: '30 min',
    price: '₹1000'
  },
  {
    id: 9,
    cat: 'Chiropractic',
    icon: '🧍',
    title: 'Posture Correction',
    desc: 'Postural assessment and corrective therapy to improve alignment, reduce strain, and support long-term spinal health.',
    duration: '45 min',
    price: '₹1000'
  },
];

const CAT_COLORS = {
  Psychology:    { bg: 'rgba(16,55,92,0.07)',   accent: '#10375C' },
  // Physiotherapy: { bg: 'rgba(235,131,23,0.08)', accent: '#EB8317' },
  Chiropractic:  { bg: 'rgba(243,198,35,0.1)',  accent: '#c9a000' },
};

export default function Services() {
  const [active, setActive] = useState('All');
  const [visible, setVisible] = useState(SERVICES);

  useEffect(() => {
    setVisible(active === 'All' ? SERVICES : SERVICES.filter(s => s.cat === active));
  }, [active]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } }),
      { threshold: 0.08 }
    );
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, [visible]);

  return (
    <>
      <Helmet>
        <title>Our Services — Asmira Wellness Clinic</title>
        <meta name="description" content="Explore Asmira's full range of services: psychological counseling, physiotherapy, and chiropractic care. Evidence-based treatment for mind and body." />
        <link rel="canonical" href="https://asmira.com/services" />
      </Helmet>

      {/* Hero */}
      <section className={styles.hero} aria-label="Services hero">
        <div className={`${styles.heroContent} container`}>
          <span className="eyebrow">What We Treat</span>
          <h1 className={styles.heroTitle}>
            Comprehensive care for <em>mind & body</em>
          </h1>
          <p className={styles.heroSub}>
            From psychological counseling to spinal rehabilitation — every service at Asmira
            is delivered by accredited specialists with your whole-person health in mind.
          </p>
        </div>
        <div className={styles.heroBg} aria-hidden="true" />
      </section>

      {/* Discipline overview */}
      <section className={styles.overview} aria-label="Discipline overview">
        <div className="container">
          <ul className={styles.overviewGrid} role="list">
            {[
              { icon: '🧠', title: 'Psychology', count: 6, desc: 'Counseling, therapy, EMDR, trauma treatment & group programs.' },
              // { icon: '🤸', title: 'Physiotherapy', count: 4, desc: 'Sports rehab, chronic pain, post-surgical & conditioning programs.' },
              { icon: '🦴', title: 'Chiropractic', count: 4, desc: 'Spinal adjustment, posture, migraine & functional movement.' },
            ].map(d => (
              <li key={d.title} className={`${styles.overviewCard} reveal`}>
                <span className={styles.overviewIcon}>{d.icon}</span>
                <div>
                  <h2 className={styles.overviewTitle}>{d.title} <span className={styles.overviewCount}>{d.count} services</span></h2>
                  <p className={styles.overviewDesc}>{d.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Services grid */}
      <section className={styles.main} aria-labelledby="services-list-heading">
        <div className="container">
          <h2 id="services-list-heading" className="sr-only">Services List</h2>

          <nav className={styles.filters} aria-label="Filter by discipline">
            <ul role="list" className={styles.filterList}>
              {CATEGORIES.map(cat => (
                <li key={cat}>
                  <button
                    className={`${styles.filterBtn} ${active === cat ? styles.filterActive : ''}`}
                    onClick={() => setActive(cat)}
                    aria-pressed={active === cat}
                  >{cat}</button>
                </li>
              ))}
            </ul>
          </nav>

          <ul className={styles.grid} role="list">
            {visible.map((s, i) => {
              const colors = CAT_COLORS[s.cat] || {};
              return (
                <li key={s.id} className={`${styles.serviceCard} reveal`}
                    style={{ transitionDelay: `${(i % 4) * 0.07}s` }}>
                  <div className={styles.cardTop}>
                    <div className={styles.cardIcon} style={{ background: colors.bg }}>{s.icon}</div>
                    <span className={styles.cardCat} style={{ color: colors.accent }}>{s.cat}</span>
                  </div>
                  <h3 className={styles.cardTitle}>{s.title}</h3>
                  <p className={styles.cardDesc}>{s.desc}</p>
                  <div className={styles.cardMeta}>
                    <span className={styles.metaItem}>⏱ {s.duration}</span>
                    <span className={styles.metaItem}>💰 {s.price}</span>
                  </div>
                  <Link to="/book" className={styles.cardBtn}>Book this service</Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
{/* 
      {/* Insurance *
      <section className={styles.insurance} aria-labelledby="insurance-heading">
        <div className={`${styles.insuranceInner} container`}>
          <div className={`${styles.insuranceText} reveal`}>
            <span className="eyebrow">Coverage</span>
            <h2 id="insurance-heading" className={styles.insuranceTitle}>
              We accept most <em>major insurers</em>
            </h2>
            <p>
              Asmira is in-network with most major health insurance providers.
              We also offer competitive self-pay rates and flexible payment plans.
              Contact us and we'll help you verify coverage before your first appointment.
            </p>
            <Link to="/contact" className={styles.insuranceLink}>Check your coverage →</Link>
          </div>
          <ul className={styles.insurerList} role="list" aria-label="Accepted insurers">
            {['Blue Cross Blue Shield','Aetna','UnitedHealthcare','Cigna','Humana','Medicare','Medicaid','Self-Pay Welcome'].map(ins => (
              <li key={ins} className={`${styles.insurerBadge} reveal`}>
                <span aria-hidden="true">✦</span> {ins}
              </li>
            ))}
          </ul>
        </div>
      </section> */}

      {/* CTA */}
      <section className={styles.cta} aria-label="Book appointment">
        <div className={`${styles.ctaInner} container reveal`}>
          <div>
            <h2 className={styles.ctaTitle}>Not sure which service is right for you?</h2>
            <p>Book a free 15-minute discovery call with our intake coordinator.</p>
          </div>
          <div className={styles.ctaBtns}>
            <Link to="/book" className={styles.ctaBtn}>Book Appointment</Link>
            <a href="tel:+11234567890" className={styles.ctaPhone}>📞 Call Us</a>
          </div>
        </div>
      </section>
    </>
  );
}
