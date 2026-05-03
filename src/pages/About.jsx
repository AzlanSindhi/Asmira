import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import styles from './About.module.css';

const TEAM = [
  {
    name: 'Dr. Asmira Hassan',
    role: 'Clinical Psychologist & Founder',
    creds: 'PhD, CPsych, ABPP',
    bio: 'Dr. Hassan founded Asmira Clinic with a vision for truly integrated care. With 14 years of clinical experience, she specialises in trauma-informed therapy, anxiety disorders, and life transitions.',
    initials: 'AH',
    color: '#10375C',
  },
  {
    name: 'Dr. Liam Okafor',
    role: 'Senior Physiotherapist',
    creds: 'DPT, CSCS, OCS',
    bio: 'Liam brings evidence-based rehabilitation expertise with a focus on post-surgical recovery, sports injuries, and chronic pain management. He is certified in dry needling and manual therapy.',
    initials: 'LO',
    color: '#EB8317',
  },
  {
    name: 'Dr. Priya Mehta',
    role: 'Chiropractor & Wellness Specialist',
    creds: 'DC, DACBN, CCSP',
    bio: 'Dr. Mehta combines chiropractic care with nutritional counseling and functional movement analysis. She specialises in spinal rehabilitation, posture correction, and athlete performance.',
    initials: 'PM',
    color: '#F3C623',
  },
  {
    name: 'Sofia Reyes',
    role: 'Licensed Counselor & Therapist',
    creds: 'LPC, EMDR-Certified',
    bio: 'Sofia works with individuals and couples navigating depression, grief, relationship issues, and identity challenges. Her approach is warm, non-judgmental, and deeply client-centred.',
    initials: 'SR',
    color: '#1a5276',
  },
];

const VALUES = [
  { icon: '🤝', title: 'Compassionate Care', desc: 'Every patient walks through our door deserving dignity, empathy, and undivided attention.' },
  { icon: '🔬', title: 'Evidence-Based Practice', desc: 'All our treatment protocols are grounded in peer-reviewed research and clinical best practices.' },
  { icon: '🌐', title: 'Integrated Approach', desc: 'We break down silos between specialties — your psychologist talks to your physio, and vice versa.' },
  { icon: '🔒', title: 'Confidentiality & Trust', desc: 'Your privacy is sacred. We operate under the strictest professional and legal confidentiality standards.' },
  { icon: '🌱', title: 'Long-Term Wellness', desc: 'We don\'t just treat today\'s pain. We empower you with the tools for lasting health and resilience.' },
  { icon: '🎯', title: 'Personalised Plans', desc: 'No two patients are alike. Every care plan is unique, adaptive, and built around your specific goals.' },
];

export default function About() {
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
        <title>About Us — Asmira Wellness Clinic</title>
        <meta name="description" content="Meet the compassionate, multidisciplinary team at Asmira Wellness Clinic. Our psychologists, physiotherapists, and chiropractors are dedicated to your whole-person healing." />
        <link rel="canonical" href="https://asmira.com/about" />
      </Helmet>

      {/* Hero */}
      <section className={styles.hero} aria-label="About page hero">
        <div className={`${styles.heroContent} container`}>
          <span className="eyebrow">Our Story</span>
          <h1 className={styles.heroTitle}>
            A clinic built on <em>compassion</em>
          </h1>
          <p className={styles.heroSub}>
            Asmira Wellness Clinic was founded on a simple but radical belief: that psychological,
            physical, and structural health are inseparable — and healing works best when specialists work together.
          </p>
        </div>
        <div className={styles.heroBg} aria-hidden="true" />
      </section>

      {/* Mission */}
      <section className={styles.mission} aria-labelledby="mission-heading">
        <div className={`${styles.missionInner} container`}>
          <div className={`${styles.missionText} reveal`}>
            <span className="eyebrow">Our Mission</span>
            <h2 id="mission-heading" className={styles.missionTitle}>
              Treating the <em>root,</em><br />not just the branch.
            </h2>
            <p>
              Founded in 2010, Asmira began as Dr. Asma's private psychology practice.
              After years of observing how mental health and physical health intertwine —
              how chronic pain fuels depression, how anxiety manifests as muscle tension —
              she partnered with leading physiotherapy and chiropractic experts to create
              something the region had never seen: a truly integrated wellness clinic.
            </p>
            <p>
              Today, Asmira serves over 3,200 patients across three disciplines, with
              a shared patient record system that ensures every member of your care team
              is always on the same page.
            </p>
          </div>

          {/* <div className={`${styles.missionStats} reveal`} aria-hidden="true">
            {[
              { value: '2010', label: 'Year Founded' },
              { value: '3,200+', label: 'Patients Served' },
              { value: '4', label: 'Core Specialists' },
              { value: '98%', label: 'Patient Satisfaction' },
            ].map(s => (
              <div key={s.label} className={styles.missionStat}>
                <strong>{s.value}</strong>
                <span>{s.label}</span>
              </div>
            ))}
          </div> */}
        </div>
      </section>

      {/* Values */}
      <section className={styles.values} aria-labelledby="values-heading">
        <div className="container">
          <div className={`${styles.sectionHead} reveal`}>
            <span className="eyebrow">What We Stand For</span>
            <h2 id="values-heading" className={styles.sectionTitle}>
              Our core <em>values</em>
            </h2>
          </div>
          <ul className={styles.valuesGrid} role="list">
            {VALUES.map((v, i) => (
              <li key={v.title} className={`${styles.valueCard} reveal`}
                  style={{ transitionDelay: `${i * 0.08}s` }}>
                <span className={styles.valueIcon} aria-hidden="true">{v.icon}</span>
                <h3 className={styles.valueTitle}>{v.title}</h3>
                <p className={styles.valueDesc}>{v.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Team */}
      <section className={styles.team} aria-labelledby="team-heading">
        <div className="container">
          <div className={`${styles.sectionHead} reveal`}>
            <span className="eyebrow">The Specialists</span>
            <h2 id="team-heading" className={styles.sectionTitle}>
              Meet your <em>care team</em>
            </h2>
            <p className={styles.sectionSub}>
              Every member of the Asmira team is fully accredited, clinically experienced, and deeply committed to your wellness.
            </p>
          </div>

          <ul className={styles.teamGrid} role="list">
            {TEAM.map((m, i) => (
              <li key={m.name} className={`${styles.teamCard} reveal`}
                  style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className={styles.teamAvatar} aria-hidden="true"
                     style={{ background: `linear-gradient(135deg, ${m.color} 0%, ${m.color}99 100%)` }}>
                  {m.initials}
                </div>
                <h3 className={styles.teamName}>{m.name}</h3>
                <p className={styles.teamRole}>{m.role}</p>
                <p className={styles.teamCreds}>{m.creds}</p>
                <p className={styles.teamBio}>{m.bio}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Accreditations */}
      <section className={styles.accreditations} aria-labelledby="accred-heading">
        <div className="container">
          <div className={`${styles.sectionHead} reveal`}>
            <span className="eyebrow">Recognised & Accredited</span>
            <h2 id="accred-heading" className={styles.sectionTitle}>
              Trusted by professional <em>bodies</em>
            </h2>
          </div>
          <ul className={styles.accredList} role="list">
            {[
              'American Psychological Association (APA)',
              'American Physical Therapy Association (APTA)',
              'American Chiropractic Association (ACA)',
              'Joint Commission Accredited Facility',
              'HIPAA Compliant Practice',
              'National Register of Health Service Psychologists',
            ].map(a => (
              <li key={a} className={`${styles.accredItem} reveal`}>
                <span aria-hidden="true">✦</span> {a}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta} aria-label="Book appointment">
        <div className={`${styles.ctaInner} container reveal`}>
          <h2 className={styles.ctaTitle}>Ready to meet your care team?</h2>
          <p>Book a no-obligation consultation and take the first step toward whole-person wellness.</p>
          <div className={styles.ctaBtns}>
            <Link to="/book" className={styles.ctaBtn}>Book an Appointment</Link>
            <Link to="/contact" className={styles.ctaLink}>Contact Us →</Link>
          </div>
        </div>
      </section>
    </>
  );
}
