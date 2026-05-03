import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { sendContactMessage } from '../firebase/services';
import styles from './Contact.module.css';

const CONTACT_INFO = [
  { icon: '📞', label: 'Phone',   value: '+91 95122 31430',          href: 'tel:+91 12345 67890' },
  { icon: '✉',  label: 'Email',   value: 'asmirawellness@gmail.com',             href: 'asmirawellness@gmail.com' },
  { icon: '📍', label: 'Address', value: 'Asmira Wellness, 1st Floor, Shop No:118, M Square Mall Tithal Road', href: 'https://maps.google.com' },
  { icon: '🕐', label: 'Hours',   value: 'Mon–Thur 1am–8pm · Fri 3pm–8pm · Sat 11am–8pm · Sun 9am–2pm', href: null },
];

const FAQS = [
  { q: 'Do I need a referral to book an appointment?', a: 'No referral is needed for most services. You can book directly through our website or by phone. Some insurance plans may require a referral — we can help you check.' },
  { q: 'Are your practitioners fully licensed?', a: 'Yes. All practitioners at Asmira are fully licensed, registered with their respective professional bodies, and carry professional indemnity insurance.' },
  { q: 'Do you offer telehealth / online appointments?', a: 'Yes — psychological counseling and initial consultations are available via secure video call. Physiotherapy and chiropractic care are in-person only.' },
  { q: 'How long will I need to be in treatment?', a: 'This varies by condition and individual. Your practitioner will discuss expected timelines during your initial assessment. Many patients see meaningful progress within 4–8 sessions.' },
  { q: 'What should I bring to my first appointment?', a: 'Please bring a valid photo ID, your insurance card, a list of current medications, and any relevant medical records. Arrive 10 minutes early to complete intake paperwork.' },
  { q: 'Is my information kept confidential?', a: 'Absolutely. All patient information is protected under HIPAA. We use encrypted systems and maintain strict confidentiality standards across all disciplines.' },
];

export default function Contact() {
  const [status, setStatus] = useState('idle');
  const [openFaq, setOpenFaq] = useState(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } }),
      { threshold: 0.08 }
    );
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const onSubmit = async (data) => {
    setStatus('loading');
    const result = await sendContactMessage(data);
    if (result.success) { setStatus('success'); reset(); }
    else { setStatus('error'); }
  };

  return (
    <>
      <Helmet>
        <title>Contact Us — Asmira Wellness Clinic</title>
        <meta name="description" content="Get in touch with Asmira Wellness Clinic. We're here to answer your questions about psychological counseling, physiotherapy, and chiropractic care." />
        <link rel="canonical" href="https://asmira.com/contact" />
      </Helmet>

      {/* Hero */}
      <section className={styles.hero} aria-label="Contact page hero">
        <div className={`${styles.heroContent} container`}>
          <span className="eyebrow">We're Here for You</span>
          <h1 className={styles.heroTitle}>Let's start your <em>healing journey</em></h1>
          <p className={styles.heroSub}>
            Questions about services, insurance, or what to expect? Our friendly team reads every message and responds within one business day.
          </p>
        </div>
        <div className={styles.heroBg} aria-hidden="true" />
      </section>

      {/* Main */}
      <section className={styles.main} aria-labelledby="contact-heading">
        <div className={`${styles.mainInner} container`}>

          {/* Info panel */}
          <aside className={`${styles.info} reveal`}>
            <h2 id="contact-heading" className={styles.infoTitle}>
              Find us <em>here</em>
            </h2>

            <ul className={styles.infoList} role="list">
              {CONTACT_INFO.map(item => (
                <li key={item.label} className={styles.infoItem}>
                  <span className={styles.infoIcon} aria-hidden="true">{item.icon}</span>
                  <div>
                    <span className={styles.infoLabel}>{item.label}</span>
                    {item.href ? (
                      <a href={item.href} className={styles.infoValue}
                         target={item.href.startsWith('http') ? '_blank' : undefined}
                         rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}>
                        {item.value}
                      </a>
                    ) : (
                      <span className={styles.infoValue}>{item.value}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {/* Emergency box */}
            <div className={styles.emergency} role="complementary" aria-label="Mental health crisis resources">
              <div className={styles.emergencyIcon} aria-hidden="true">🆘</div>
              <div>
                <strong>Mental Health Crisis?</strong>
                <p>If you or someone you know is in crisis, please call or text <a href="tel:14416">14416</a> (Suicide & Crisis Lifeline) or visit your nearest emergency department.</p>
              </div>
            </div>

            {/* Map placeholder */}
            <div className={styles.mapBox} aria-label="Clinic location illustration">
              <div className={styles.mapIcon} aria-hidden="true">📍</div>
              <strong>Asmira Wellness, 1st Floor, Shop No-118,M Square Mall, Tithal Road</strong>
              <span>Valsad, Gujarat 396001</span>
              <a href="https://www.google.com/maps/place/Asmira+Wellness/@20.6043025,72.9103001,17z/data=!4m14!1m7!3m6!1s0x3be0c3a5e42ae13b:0xbd63b582bb641ad9!2sAsmira+Wellness!8m2!3d20.6043025!4d72.9128804!16s%2Fg%2F11ywzvnrnx!3m5!1s0x3be0c3a5e42ae13b:0xbd63b582bb641ad9!8m2!3d20.6043025!4d72.9128804!16s%2Fg%2F11ywzvnrnx?entry=ttu&g_ep=EgoyMDI2MDQxOS4wIKXMDSoASAFQAw%3D%3D"
               target="_blank" rel="noopener noreferrer" className={styles.mapLink}>
                Get Directions →
              </a>
            </div>
          </aside>

          {/* Form */}
          <div className={`${styles.formWrap} reveal`} style={{ transitionDelay: '0.1s' }}>
            {status === 'success' ? (
              <div className={styles.successState} role="alert" aria-live="polite">
                <div className={styles.successIcon} aria-hidden="true">✦</div>
                <h3>Message Received!</h3>
                <p>Thank you for reaching out to Asmira. A member of our team will respond within one business day.</p>
                <button className={styles.resetBtn} onClick={() => setStatus('idle')}>Send Another Message</button>
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Contact form">
                <h2 className={styles.formTitle}>Send us a message</h2>

                {status === 'error' && (
                  <div className={styles.errorBanner} role="alert">
                    Something went wrong. Please email us directly at asmirawellness@gmail.com or call +91 95122 53430.
                  </div>
                )}

                <div className={styles.formRow}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="name">Full Name *</label>
                    <input id="name" className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                      type="text" placeholder="" autoComplete="name"
                      {...register('name', { required: 'Name is required' })} />
                    {errors.name && <span className={styles.fieldErr} role="alert">{errors.name.message}</span>}
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="email">Email Address *</label>
                    <input id="email" className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                      type="email" placeholder="" autoComplete="email"
                      {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' } })} />
                    {errors.email && <span className={styles.fieldErr} role="alert">{errors.email.message}</span>}
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="subject">Subject *</label>
                  <select id="subject" className={`${styles.input} ${errors.subject ? styles.inputError : ''}`}
                    {...register('subject', { required: 'Please select a subject' })}>
                    <option value="">Select a topic</option>
                    <option value="appointment">Appointment Enquiry</option>
                    <option value="psychology">Psychological Counseling</option>
                    <option value="physiotherapy">Physiotherapy</option>
                    <option value="chiropractic">Chiropractic Care</option>
                    <option value="insurance">Insurance & Billing</option>
                    <option value="telehealth">Telehealth Options</option>
                    <option value="other">General Question</option>
                  </select>
                  {errors.subject && <span className={styles.fieldErr} role="alert">{errors.subject.message}</span>}
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="phone">Phone Number</label>
                  <input id="phone" className={styles.input} type="tel"
                    placeholder="" autoComplete="tel"
                    {...register('phone')} />
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="message">Your Message *</label>
                  <textarea id="message"
                    className={`${styles.input} ${styles.textarea} ${errors.message ? styles.inputError : ''}`}
                    placeholder="Tell us how we can help. Feel free to share as much or as little as you're comfortable with..."
                    rows={5}
                    {...register('message', { required: 'Message is required', minLength: { value: 20, message: 'Please write at least 20 characters' } })} />
                  {errors.message && <span className={styles.fieldErr} role="alert">{errors.message.message}</span>}
                </div>

                <button type="submit" className={styles.submitBtn} disabled={status === 'loading'}>
                  {status === 'loading'
                    ? <span className={styles.spinner} aria-label="Sending…" />
                    : 'Send Message →'}
                </button>
                <p className={styles.formNote}>
                  🔒 Your privacy is important to us. All communications are confidential and HIPAA-compliant.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className={styles.faq} aria-labelledby="faq-heading">
        <div className="container">
          <div className={`${styles.sectionHead} reveal`}>
            <span className="eyebrow">Common Questions</span>
            <h2 id="faq-heading" className={styles.sectionTitle}>
              Frequently asked <em>questions</em>
            </h2>
          </div>
          <ul className={styles.faqList} role="list">
            {FAQS.map((faq, i) => (
              <li key={i} className={`${styles.faqItem} reveal`} style={{ transitionDelay: `${i * 0.06}s` }}>
                <button
                  className={`${styles.faqQ} ${openFaq === i ? styles.faqOpen : ''}`}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  <span>{faq.q}</span>
                  <span className={styles.faqIcon} aria-hidden="true">{openFaq === i ? '−' : '+'}</span>
                </button>
                <div className={`${styles.faqA} ${openFaq === i ? styles.faqAOpen : ''}`} aria-hidden={openFaq !== i}>
                  <p>{faq.a}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
