import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import styles from './Home.module.css';

const SERVICES = [
  {
    icon: '🧠',
    label: 'Psychology',
    title: 'Psychological Counseling',
    desc: 'One-on-one therapy sessions for anxiety, depression, trauma, grief, and personal growth with licensed psychologists.',
    color: '#10375C',
    link: '/services',
  },
  // {
  //   icon: '🤸',
  //   label: 'Physiotherapy',
  //   title: 'Physiotherapy & Rehab',
  //   desc: 'Science-backed movement therapy to restore strength, mobility, and function after injury, surgery, or chronic pain.',
  //   color: '#EB8317',
  //   link: '/services',
  // },
  {
    icon: '🦴',
    label: 'Chiropractic',
    title: 'Chiropractic Care',
    desc: 'Precise spinal adjustments and musculoskeletal treatment to relieve pain, improve posture, and restore alignment.',
    color: '#F3C623',
    link: '/services',
  },
  {
    icon: '🧘',
    label: 'Holistic',
    title: 'Mind-Body Wellness',
    desc: 'Integrated wellness programs combining mindfulness, stress management, and therapeutic techniques for whole-person healing.',
    color: '#1a5276',
    link: '/services',
  },
];

const TESTIMONIALS = [
  {
    quote: 'After months of chronic back pain, Asmira\'s chiropractic team gave me my life back. I can finally play with my kids again.',
    name: 'David R.',
    role: 'Chiropractic Patient',
    initial: 'D',
  },
  {
    quote: 'The counseling sessions helped me understand my anxiety in a completely new way. I feel genuinely equipped now.',
    name: 'Layla M.',
    role: 'Psychology Patient',
    initial: 'L',
  },
  {
    quote: 'Post-surgery rehabilitation was seamless. The physio team was encouraging every step of the way.',
    name: 'Thomas K.',
    role: 'Physiotherapy Patient',
    initial: 'T',
  },
];

const PROCESS = [
  { num: '01', title: 'Initial Consultation', desc: 'We start with a thorough intake assessment to understand your history, goals, and needs.' },
  { num: '02', title: 'Personalised Plan', desc: 'A tailored treatment plan is designed just for you — no generic protocols.' },
  { num: '03', title: 'Integrated Treatment', desc: 'Our specialists collaborate across disciplines to address root causes, not just symptoms.' },
  { num: '04', title: 'Ongoing Support', desc: 'Regular check-ins and adjustments ensure you continue progressing toward full wellness.' },
];

export default function Home() {
  const heroRef = useRef(null);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    el.querySelectorAll('[data-reveal]').forEach((item, i) => {
      item.style.animationDelay = `${i * 0.14}s`;
      item.classList.add(styles.heroAnimate);
    });
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <Helmet>
        <title>Asmira Wellness Clinic — Psychological Counseling, Physiotherapy & Chiropractic Care</title>
        <meta name="description" content="Asmira Wellness Clinic offers holistic mind-body healing through expert psychological counseling, physiotherapy, and chiropractic care. Book your appointment today." />
        <link rel="canonical" href="https://asmira.com/" />
        <meta property="og:title" content="Asmira Wellness Clinic" />
        <meta property="og:description" content="Holistic healing for mind and body. Expert psychological counseling, physiotherapy & chiropractic care." />
      </Helmet>

      {/* ── HERO ── */}
      <section className={styles.hero} aria-label="Asmira clinic hero" ref={heroRef}>
        <div className={styles.heroBg} aria-hidden="true">
          <div className={styles.blob1} />
          <div className={styles.blob2} />
          <div className={styles.blob3} />
          <div className={styles.grid} />
        </div>

        <div className={`${styles.heroInner} container`}>
          <div className={styles.heroLeft}>
            <div className={styles.heroPill} data-reveal>
              <span className={styles.pillDot} aria-hidden="true" />
              Accepting New Patients
            </div>

            <h1 className={styles.heroTitle} data-reveal>
              Healing for your<br />
              <em>mind,</em> body <span className={styles.amp}>&amp;</span> <em>soul.</em>
            </h1>

            <p className={styles.heroDesc} data-reveal>
              At Asmira, our multidisciplinary team of psychologist, physiotherapist, and chiropractor
              work together to restore your wellbeing — from the inside out.
            </p>

            <div className={styles.heroCtas} data-reveal>
              <Link to="/book" className={styles.heroBtnPrimary}>
                Book Appointment
              </Link>
              <Link to="/services" className={styles.heroBtnSecondary}>
                Explore Services
              </Link>
            </div>

            
          </div>

          {/* Hero Visual */}
          <aside className={styles.heroRight} aria-label="Clinic specialty highlights" data-reveal>
            <div className={styles.heroCard}>
              <div className={styles.heroCardInner}>
                <div className={styles.cardSpecialties}>
                  {[
                    { icon: '🧠', label: 'Psychology', bg: 'rgba(16,55,92,0.08)' },
                    // { icon: '🤸', label: 'Physiotherapy', bg: 'rgba(235,131,23,0.1)' },
                    { icon: '🦴', label: 'Chiropractic', bg: 'rgba(243,198,35,0.15)' },
                  ].map(s => (
                    <div key={s.label} className={styles.specialty} style={{ background: s.bg }}>
                      <span>{s.icon}</span>
                      <strong>{s.label}</strong>
                    </div>
                  ))}
                </div>
                <div className={styles.heroQuote}>
                  <span className={styles.quoteMark} aria-hidden="true">"</span>
                  <p>Your wellbeing is our purpose.</p>
                  <cite>— Dr. Asma Khan, Founder</cite>
                </div>
              </div>
              <div className={styles.cardAccent} aria-hidden="true" />
            </div>

            {/* Float badge
            <div className={styles.floatBadge} aria-label="Next available slots">
              <span className={styles.floatDot} aria-hidden="true" />
              <div>
                <strong>Next slot:</strong>
                <p>Tomorrow, 10:00 AM</p>
              </div>
            </div> */}
          </aside>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className={styles.services} aria-labelledby="services-heading">
        <div className="container">
          <div className={`${styles.sectionHead} reveal`}>
            <span className="eyebrow">What We Offer</span>
            <h2 id="services-heading" className={styles.sectionTitle}>
              Specialised care for <em>every need</em>
            </h2>
            <p className={styles.sectionSub}>
              Three core disciplines working as one — for comprehensive, coordinated healing.
            </p>
          </div>

          <ul className={styles.servicesGrid} role="list">
            {SERVICES.map((s, i) => (
              <li key={s.title} className={`${styles.serviceCard} reveal`}
                  style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className={styles.serviceTop}>
                  <span className={styles.serviceEmoji} aria-hidden="true" style={{ background: `${s.color}14` }}>{s.icon}</span>
                  <span className={styles.serviceLabel}>{s.label}</span>
                </div>
                <h3 className={styles.serviceTitle}>{s.title}</h3>
                <p className={styles.serviceDesc}>{s.desc}</p>
                <Link to={s.link} className={styles.serviceLink}>
                  Learn more <span aria-hidden="true">→</span>
                </Link>
                <div className={styles.serviceBar} style={{ background: s.color }} aria-hidden="true" />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── WHY ASMIRA ── */}
      <section className={styles.why} aria-labelledby="why-heading">
        <div className={`${styles.whyInner} container`}>
          <div className={`${styles.whyText} reveal`}>
            <span className="eyebrow">Why Choose Asmira</span>
            <h2 id="why-heading" className={styles.whyTitle}>
              We help you understand <em>Your Emotions.</em>
            </h2>
            <p>
              Most clinics treat conditions in isolation. At Asmira, our psychologists, physiotherapists,
              and chiropractors collaborate directly — sharing insights across disciplines so your
              treatment plan reflects the full picture of your health.
            </p>
            <p>
              Whether you're managing chronic pain, navigating anxiety, recovering from injury, or simply
              seeking a healthier life — Asmira's integrated model ensures nothing falls through the cracks.
            </p>
            <ul className={styles.whyBullets} role="list">
              {[
                'Multidisciplinary team approach',
                'Evidence-based treatment protocols',
                'Individualized care plans',
                'Trauma-informed practice',
                'Flexible in-person & telehealth options',
              ].map(b => (
                <li key={b}><span aria-hidden="true">✦</span> {b}</li>
              ))}
            </ul>
            <Link to="/about" className={styles.whyBtn}>Meet Our Team →</Link>
          </div>

          <div className={`${styles.whyVisual} reveal`} aria-hidden="true">
            <div className={styles.whyCards}>
              {[
                { icon: '🧠', title: 'Emotional Wellbeing', sub: 'Your Journey to Better Emotional Health' },
                { icon: '🤸', title: 'Physical Rehab', sub: 'Evidence-based protocols' },
                { icon: '🦴', title: 'Spine & Joints', sub: 'Precision adjustments' },
                { icon: '🌿', title: 'Whole Wellness', sub: 'Mind-body integration' },
              ].map(card => (
                <div key={card.title} className={styles.whyCard}>
                  <span>{card.icon}</span>
                  <strong>{card.title}</strong>
                  <p>{card.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section className={styles.process} aria-labelledby="process-heading">
        <div className="container">
          <div className={`${styles.sectionHead} reveal`}>
            <span className="eyebrow">How It Works</span>
            <h2 id="process-heading" className={styles.sectionTitle}>
              Your journey to <em>wellness</em>
            </h2>
          </div>

          <ol className={styles.processSteps} role="list">
            {PROCESS.map((step, i) => (
              <li key={step.num} className={`${styles.processStep} reveal`}
                  style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className={styles.stepNum} aria-hidden="true">{step.num}</div>
            
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDesc}>{step.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
{/* 
      {/* ── TESTIMONIALS ── 
      <section className={styles.testimonials} aria-labelledby="testimonials-heading">
        <div className="container">
          <div className={`${styles.sectionHead} reveal`}>
            <span className="eyebrow">Patient Stories</span>
            <h2 id="testimonials-heading" className={styles.sectionTitle}>
              Real people, <em>real results</em>
            </h2>
          </div>

          <ul className={styles.testimonialsGrid} role="list">
            {TESTIMONIALS.map((t, i) => (
              <li key={t.name} className={`${styles.testimonialCard} reveal`}
                  style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className={styles.stars} aria-label="5 stars">{'★★★★★'}</div>
                <blockquote className={styles.quote}>{t.quote}</blockquote>
                <footer className={styles.quoteFooter}>
                  <div className={styles.avatar} aria-hidden="true">{t.initial}</div>
                  <div>
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                  </div>
                </footer>
              </li>
            ))}
          </ul>
        </div>
      </section> 
  */}

      {/* ── CTA BANNER ── */}
      <section className={styles.ctaBanner} aria-label="Book appointment call to action">
        <div className={`${styles.ctaInner} container`}>
          <div className="reveal">
            <span className="eyebrow" style={{ color: 'var(--gold)' }}>Take the First Step</span>
            <h2 className={styles.ctaTitle}>
              Your wellbeing<br />deserves <em>priority.</em>
            </h2>
            <p className={styles.ctaSub}>
              New patient consultations available this week. Let us build your personalised care plan.
            </p>
          </div>
          <div className={`${styles.ctaBtns} reveal`} style={{ transitionDelay: '0.15s' }}>
            <Link to="/book" className={styles.ctaPrimary}>Book Appointment</Link>
            <Link to="/contact" className={styles.ctaSecondary}>Ask a Question</Link>
            <a href="tel:+91 95122 31430" className={styles.ctaPhone}>📞 +91 95122 31430</a>
          </div>
        </div>
      </section>
    </>
  );
}
