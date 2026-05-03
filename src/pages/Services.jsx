import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import styles from './Services.module.css';

const CATEGORIES = ['All', 'Psychology', 'Physiotherapy', 'Chiropractic'];
const SERVICES = [
  { id: 1, cat: 'Psychology', icon: '🧠', title: 'Individual Therapy', desc: 'Confidential one-on-one sessions addressing anxiety, depression, trauma, stress, grief, and more.', duration: '50 min', price: 'From ₹9,500' },
  { id: 2, cat: 'Psychology', icon: '💑', title: 'Couples Counseling', desc: 'Guided therapy for couples navigating conflict, communication breakdowns, infidelity, or life transitions.', duration: '75 min', price: 'From ₹13,000' },
  { id: 3, cat: 'Psychology', icon: '👨‍👩‍👧', title: 'Family Therapy', desc: 'Structured sessions to improve family dynamics, resolve conflict, and strengthen bonds between members.', duration: '75 min', price: 'From ₹14,500' },
  { id: 4, cat: 'Psychology', icon: '🧒', title: 'Child & Adolescent', desc: 'Age-appropriate therapy for children and teens dealing with behavioural challenges, school stress, or trauma.', duration: '50 min', price: 'From ₹10,500' },
  { id: 5, cat: 'Psychology', icon: '🫂', title: 'Group Therapy', desc: 'Facilitated group sessions for anxiety, grief recovery, social skills, and shared lived experiences.', duration: '90 min', price: 'From ₹5,000' },
  { id: 6, cat: 'Psychology', icon: '🎯', title: 'Career Counseling', desc: 'Personalized guidance to help you choose the right career path, switch industries, or plan higher education with clarity and confidence.', duration: '60 min', price: 'From ₹6,000' },
  { id: 7, cat: 'Physiotherapy', icon: '🏃', title: 'Sports Injury Rehab', desc: 'Evidence-based rehabilitation for sports injuries including sprains, strains, fractures, and post-op recovery.', duration: '45 min', price: 'From ₹7,500' },
  { id: 8, cat: 'Physiotherapy', icon: '🦵', title: 'Post-Surgical Recovery', desc: 'Structured recovery programs following knee, hip, shoulder, and spinal surgeries.', duration: '45 min', price: 'From ₹9,000' },
  { id: 9, cat: 'Physiotherapy', icon: '😣', title: 'Chronic Pain Management', desc: 'Multidisciplinary physiotherapy programs for fibromyalgia, arthritis, chronic back and neck pain.', duration: '45 min', price: 'From ₹8,000' },
  { id: 10, cat: 'Physiotherapy', icon: '🏋️', title: 'Strength & Conditioning', desc: 'Clinical exercise programs to rebuild strength, stability, and endurance after injury or long-term inactivity.', duration: '60 min', price: 'From ₹7,000' },
  { id: 11, cat: 'Chiropractic', icon: '🦴', title: 'Spinal Adjustment', desc: 'Precise manual manipulation of the spine to relieve compression, restore alignment, and reduce pain.', duration: '30 min', price: 'From ₹6,500' },
  { id: 12, cat: 'Chiropractic', icon: '🧍', title: 'Posture Correction', desc: 'Comprehensive postural analysis and treatment plans for forward head posture, scoliosis, and kyphosis.', duration: '45 min', price: 'From ₹7,500' },
  { id: 13, cat: 'Chiropractic', icon: '😤', title: 'Headache & Migraine Relief', desc: 'Cervicogenic headache treatment through targeted spinal manipulation and soft tissue therapy.', duration: '30 min', price: 'From ₹6,500' },
  { id: 14, cat: 'Chiropractic', icon: '🤸', title: 'Functional Movement Screen', desc: 'Full-body movement assessment to identify imbalances, compensation patterns, and injury risk factors.', duration: '60 min', price: 'From ₹9,000' },
];

const CAT_COLORS = {
  Psychology:    { bg: 'rgba(16,55,92,0.07)',   accent: '#10375C' },
  Physiotherapy: { bg: 'rgba(235,131,23,0.08)', accent: '#EB8317' },
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
              { icon: '🤸', title: 'Physiotherapy', count: 4, desc: 'Sports rehab, chronic pain, post-surgical & conditioning programs.' },
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
