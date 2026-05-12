import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { sendContactMessage, submitFeedback } from '../firebase/services';
import styles from './Contact.module.css';

const CONTACT_INFO = [
  { icon: '📞', label: 'Phone',   value: '+91 95122 31430',
    href: 'tel:+91 95122 31430' },
  { icon: '✉',  label: 'Email',   value: 'asmirawellness@gmail.com',
    href: 'mailto:asmirawellness@gmail.com' },
  { icon: '📍', label: 'Address', value: 'Asmira Wellness, 1st Floor, Shop No:118, M Square Mall, Tithal Road, Valsad – 396001',
    href: 'https://www.google.com/maps/place/Asmira+Wellness/@20.6043025,72.9103001,17z' },
  { icon: '🕐', label: 'Hours',   value: 'Mon–Thu 1pm–8pm · Fri 3pm–8pm · Sat 11am–8pm · Sun 9am–2pm',
    href: null },
];

const FAQS = [
  { q: 'Do I need a referral to book an appointment?',
    a: 'No referral is needed. You can book directly through our website, WhatsApp, or phone. We will guide you through the rest.' },
  { q: 'Is everything I share confidential?',
    a: 'Yes — completely. Professional confidentiality is the foundation of everything we do at Asmira Wellness. Nothing you share leaves the session.' },
  { q: 'Do you offer online sessions?',
    a: 'Yes. All our counselling services are available online via video or voice call — with the same depth and confidentiality as in-person sessions.' },
  { q: 'What happens in a first session?',
    a: 'Your first session is a comfortable, no-pressure intake conversation. We get to know you, understand your situation, and together begin building your personalised plan.' },
  { q: 'How many sessions will I need?',
    a: 'This varies by individual. Many clients notice meaningful change within 4–8 sessions, though some prefer ongoing support. There is no pressure or fixed commitment.' },
  { q: 'What are your fees?',
    a: 'Please contact us directly for current fee information. We believe wellness should be accessible and are happy to discuss options during your first consultation.' },
];

const SESSION_OPTIONS = [
  'Individual Therapy',
  'Couples Counseling',
  'Career Counseling',
  'Child & Adolescent Therapy',
  'Parenting Guidance',
  'Emotional Wellness Session',
  'Other',
];

export default function Contact() {
  const [contactStatus, setContactStatus] = useState('idle');
  const [feedbackStatus, setFeedbackStatus] = useState('idle');
  const [openFaq, setOpenFaq] = useState(null);
  const [rating, setRating] = useState(5);
  const [hoveredStar, setHoveredStar] = useState(0);

  const {
    register: registerContact,
    handleSubmit: handleContact,
    reset: resetContact,
    formState: { errors: contactErrors },
  } = useForm();

  const {
    register: registerFeedback,
    handleSubmit: handleFeedback,
    reset: resetFeedback,
    formState: { errors: feedbackErrors },
  } = useForm();

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
      }),
      { threshold: 0.08 }
    );
    document.querySelectorAll('.reveal').forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const onContactSubmit = async (data) => {
    setContactStatus('loading');
    const result = await sendContactMessage(data);
    if (result.success) { setContactStatus('success'); resetContact(); }
    else { setContactStatus('error'); }
  };

  const onFeedbackSubmit = async (data) => {
    setFeedbackStatus('loading');
    const result = await submitFeedback({ ...data, rating });
    if (result.success) { setFeedbackStatus('success'); resetFeedback(); setRating(5); }
    else { setFeedbackStatus('error'); }
  };

  return (
    <>
      <Helmet>
        <title>Contact Us — Asmira Wellness</title>
        <meta name="description" content="Get in touch with Asmira Wellness. We're here to answer your questions about psychological counselling, emotional wellness, and online sessions." />
        <link rel="canonical" href="https://asmira.com/contact" />
      </Helmet>

      {/* ── HERO ── */}
      <section className={styles.hero} aria-label="Contact page hero">
        <div className={`${styles.heroContent} container`}>
          <span className="eyebrow">We're Here for You</span>
          <h1 className={styles.heroTitle}>
            Let's start your <em>healing journey</em>
          </h1>
          <p className={styles.heroSub}>
            Questions about our services, fees, or what to expect? Our team reads every message and responds within one business day.
          </p>
        </div>
        <div className={styles.heroBg} aria-hidden="true" />
      </section>

      {/* ── MAIN CONTACT AREA ── */}
      <section className={styles.main} aria-labelledby="contact-heading">
        <div className={`${styles.mainInner} container`}>

          {/* Info panel */}
          <aside className={`${styles.info} reveal`}>
            <h2 id="contact-heading" className={styles.infoTitle}>
              Find us <em>here</em>
            </h2>

            <ul className={styles.infoList} role="list">
              {CONTACT_INFO.map((item) => (
                <li key={item.label} className={styles.infoItem}>
                  <span className={styles.infoIcon} aria-hidden="true">{item.icon}</span>
                  <div>
                    <span className={styles.infoLabel}>{item.label}</span>
                    {item.href ? (
                      <a
                        href={item.href}
                        className={styles.infoValue}
                        target={item.href.startsWith('http') ? '_blank' : undefined}
                        rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                      >
                        {item.value}
                      </a>
                    ) : (
                      <span className={styles.infoValue}>{item.value}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {/* Emergency */}
            <div className={styles.emergency} role="complementary" aria-label="Mental health crisis resources">
              <div className={styles.emergencyIcon} aria-hidden="true">🆘</div>
              <div>
                <strong>Mental Health Crisis?</strong>
                <p>
                  Call <a href="tel:14416">14416</a> or{' '}
                  <a href="tel:+91 95122 31430">+91 95122 31430</a> — free, confidential support.
                </p>
              </div>
            </div>

            {/* Map */}
            <div className={styles.mapBox} aria-label="Clinic location">
              <div className={styles.mapIcon} aria-hidden="true">📍</div>
              <strong>Asmira Wellness</strong>
              <span>1st Floor, Shop No:118, M Square Mall</span>
              <span>Tithal Road, Valsad – 396001</span>
              <a
                href="https://www.google.com/maps/place/Asmira+Wellness/@20.6043025,72.9103001,17z"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.mapLink}
              >
                Get Directions →
              </a>
            </div>
          </aside>

          {/* Contact Form */}
          <div className={`${styles.formWrap} reveal`} style={{ transitionDelay: '0.1s' }}>
            {contactStatus === 'success' ? (
              <div className={styles.successState} role="alert" aria-live="polite">
                <div className={styles.successIcon} aria-hidden="true">✦</div>
                <h3>Message Received!</h3>
                <p>
                  Thank you for reaching out to Asmira Wellness. A member of our team will respond within one business day.
                </p>
                <button className={styles.resetBtn} onClick={() => setContactStatus('idle')}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <form
                className={styles.form}
                onSubmit={handleContact(onContactSubmit)}
                noValidate
                aria-label="Contact form"
              >
                <h2 className={styles.formTitle}>Send us a message</h2>

                {contactStatus === 'error' && (
                  <div className={styles.errorBanner} role="alert">
                    Something went wrong. Please email us directly at{' '}
                    <a href="mailto:asmirawellness@gmail.com">asmirawellness@gmail.com</a> or call{' '}
                    <a href="tel:+91 95122 31430">+91 95122 31430</a>.
                  </div>
                )}

                <div className={styles.formRow}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="name">Full Name *</label>
                    <input
                      id="name"
                      className={`${styles.input} ${contactErrors.name ? styles.inputError : ''}`}
                      type="text"
                      autoComplete="name"
                      {...registerContact('name', { required: 'Name is required' })}
                    />
                    {contactErrors.name && (
                      <span className={styles.fieldErr} role="alert">{contactErrors.name.message}</span>
                    )}
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="email">Email Address *</label>
                    <input
                      id="email"
                      className={`${styles.input} ${contactErrors.email ? styles.inputError : ''}`}
                      type="email"
                      autoComplete="email"
                      {...registerContact('email', {
                        required: 'Email is required',
                        pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
                      })}
                    />
                    {contactErrors.email && (
                      <span className={styles.fieldErr} role="alert">{contactErrors.email.message}</span>
                    )}
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="subject">What is this about? *</label>
                  <select
                    id="subject"
                    className={`${styles.input} ${contactErrors.subject ? styles.inputError : ''}`}
                    {...registerContact('subject', { required: 'Please select a subject' })}
                  >
                    <option value="">Select a topic</option>
                    <option value="Appointment Enquiry">Appointment Enquiry</option>
                    <option value="Psychological Counselling">Psychological Counselling</option>
                    <option value="Online Sessions">Online Sessions</option>
                    <option value="Fees & Payment">Fees &amp; Payment</option>
                    <option value="Workshops & Programs">Workshops &amp; Programs</option>
                    <option value="General Question">General Question</option>
                  </select>
                  {contactErrors.subject && (
                    <span className={styles.fieldErr} role="alert">{contactErrors.subject.message}</span>
                  )}
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="phone">
                    Phone / WhatsApp <span style={{ fontWeight: 400, opacity: 0.5 }}>(Optional)</span>
                  </label>
                  <input
                    id="phone"
                    className={styles.input}
                    type="tel"
                    autoComplete="tel"
                    {...registerContact('phone')}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="message">Your Message *</label>
                  <textarea
                    id="message"
                    className={`${styles.input} ${styles.textarea} ${contactErrors.message ? styles.inputError : ''}`}
                    placeholder="Tell us how we can help. Feel free to share as much or as little as you're comfortable with..."
                    rows={5}
                    {...registerContact('message', {
                      required: 'Message is required',
                      minLength: { value: 20, message: 'Please write at least 20 characters' },
                    })}
                  />
                  {contactErrors.message && (
                    <span className={styles.fieldErr} role="alert">{contactErrors.message.message}</span>
                  )}
                </div>

                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={contactStatus === 'loading'}
                >
                  {contactStatus === 'loading' ? (
                    <span className={styles.spinner} aria-label="Sending…" />
                  ) : (
                    'Send Message →'
                  )}
                </button>

                <p className={styles.formNote}>
                  🔒 All communications are completely confidential.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
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
              <li
                key={i}
                className={`${styles.faqItem} reveal`}
                style={{ transitionDelay: `${i * 0.06}s` }}
              >
                <button
                  className={`${styles.faqQ} ${openFaq === i ? styles.faqOpen : ''}`}
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  <span>{faq.q}</span>
                  <span className={styles.faqIcon} aria-hidden="true">
                    {openFaq === i ? '−' : '+'}
                  </span>
                </button>
                <div
                  className={`${styles.faqA} ${openFaq === i ? styles.faqAOpen : ''}`}
                  aria-hidden={openFaq !== i}
                >
                  <p>{faq.a}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── PATIENT FEEDBACK ── */}
      <section className={styles.feedbackSection} aria-labelledby="feedback-heading">
        <div className="container">
          <div className={`${styles.sectionHead} reveal`}>
            <span className="eyebrow">Share Your Experience</span>
            <h2 id="feedback-heading" className={styles.sectionTitle}>
              Patient <em>feedback</em>
            </h2>
            <p className={styles.sectionSub}>
              Had a session with us? We'd love to hear how it went. Your feedback helps us improve and support others.
            </p>
          </div>

          <div className={`${styles.feedbackWrap} reveal`}>
            {feedbackStatus === 'success' ? (
              <div className={styles.successState} role="alert" aria-live="polite">
                <div className={styles.successIcon} aria-hidden="true">✦</div>
                <h3>Thank You!</h3>
                <p>
                  We really appreciate you taking the time to share your experience. Your feedback means the world to us.
                </p>
                <button className={styles.resetBtn} onClick={() => setFeedbackStatus('idle')}>
                  Submit Another Response
                </button>
              </div>
            ) : (
              <form
                className={styles.form}
                onSubmit={handleFeedback(onFeedbackSubmit)}
                noValidate
                aria-label="Patient feedback form"
              >
                {feedbackStatus === 'error' && (
                  <div className={styles.errorBanner} role="alert">
                    Something went wrong. Please try again.
                  </div>
                )}

                <div className={styles.formRow}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="patientName">Your Name *</label>
                    <input
                      id="patientName"
                      className={`${styles.input} ${feedbackErrors.patientName ? styles.inputError : ''}`}
                      type="text"
                      autoComplete="name"
                      {...registerFeedback('patientName', { required: 'Name is required' })}
                    />
                    {feedbackErrors.patientName && (
                      <span className={styles.fieldErr} role="alert">{feedbackErrors.patientName.message}</span>
                    )}
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="fbEmail">
                      Email <span style={{ fontWeight: 400, opacity: 0.5 }}>(Optional)</span>
                    </label>
                    <input
                      id="fbEmail"
                      className={styles.input}
                      type="email"
                      autoComplete="email"
                      {...registerFeedback('email')}
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="fbService">Service You Received *</label>
                  <select
                    id="fbService"
                    className={`${styles.input} ${feedbackErrors.sessionType ? styles.inputError : ''}`}
                    {...registerFeedback('sessionType', { required: 'Please select a service' })}
                  >
                    <option value="">Select the service</option>
                    {SESSION_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {feedbackErrors.sessionType && (
                    <span className={styles.fieldErr} role="alert">{feedbackErrors.sessionType.message}</span>
                  )}
                </div>

                {/* Star rating */}
                <div className={styles.field}>
                  <label className={styles.label}>Overall Rating *</label>
                  <div className={styles.starRow} role="group" aria-label="Rate your experience">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`${styles.star} ${star <= (hoveredStar || rating) ? styles.starFilled : ''}`}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredStar(star)}
                        onMouseLeave={() => setHoveredStar(0)}
                        aria-label={`${star} star${star > 1 ? 's' : ''}`}
                        aria-pressed={rating === star}
                      >
                        ★
                      </button>
                    ))}
                    <span className={styles.ratingLabel}>
                      {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][hoveredStar || rating]}
                    </span>
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="fbFeedback">Your Feedback *</label>
                  <textarea
                    id="fbFeedback"
                    className={`${styles.input} ${styles.textarea} ${feedbackErrors.feedback ? styles.inputError : ''}`}
                    placeholder="Tell us about your experience — what helped, what could be better, or anything you'd like to share..."
                    rows={5}
                    {...registerFeedback('feedback', {
                      required: 'Please share your feedback',
                      minLength: { value: 20, message: 'Please write at least 20 characters' },
                    })}
                  />
                  {feedbackErrors.feedback && (
                    <span className={styles.fieldErr} role="alert">{feedbackErrors.feedback.message}</span>
                  )}
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Would you recommend Asmira Wellness to others?</label>
                  <div className={styles.radioRow}>
                    {[['yes', 'Yes, definitely!'], ['maybe', 'Maybe'], ['no', 'Not at this time']].map(([val, lbl]) => (
                      <label key={val} className={styles.radioLabel}>
                        <input
                          type="radio"
                          value={val}
                          defaultChecked={val === 'yes'}
                          {...registerFeedback('wouldReturn')}
                        />
                        {lbl}
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={feedbackStatus === 'loading'}
                >
                  {feedbackStatus === 'loading' ? (
                    <span className={styles.spinner} aria-label="Submitting…" />
                  ) : (
                    'Submit Feedback →'
                  )}
                </button>

                <p className={styles.formNote}>
                  Your feedback is confidential and helps us serve our clients better. Thank you.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}