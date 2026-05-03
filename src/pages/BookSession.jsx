import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { createBooking } from '../firebase/services';
import styles from './BookSession.module.css';

const SESSION_TYPES = [
  { cat: 'Psychology',    value: 'individual-therapy',  label: 'Individual Therapy',        price: 'From ₹9,999', duration: '50 min' },
  { cat: 'Psychology',    value: 'couples-counseling',  label: 'Couples Counseling',       price: 'From ₹13,299', duration: '75 min' },
  { cat: 'Psychology',    value: 'career-counseling',   label: 'Career Counseling',        price: 'From ₹8,999', duration: '60 min' },
  { cat: 'Psychology',    value: 'child-adolescent',    label: 'Child & Adolescent Therapy', price: 'From ₹10,799', duration: '50 min' },

  { cat: 'Physiotherapy', value: 'sports-rehab',        label: 'Sports Injury Rehab',      price: 'From ₹7,899', duration: '45 min' },
  { cat: 'Physiotherapy', value: 'post-surgical',       label: 'Post-Surgical Recovery',   price: 'From ₹9,199', duration: '45 min' },
  { cat: 'Physiotherapy', value: 'chronic-pain',        label: 'Chronic Pain Management',  price: 'From ₹8,299', duration: '45 min' },

  { cat: 'Chiropractic',  value: 'spinal-adjustment',   label: 'Spinal Adjustment',        price: 'From ₹6,699', duration: '30 min' },
  { cat: 'Chiropractic',  value: 'posture-correction',  label: 'Posture Correction',       price: 'From ₹7,499', duration: '45 min' },
  { cat: 'Chiropractic',  value: 'headache-relief',     label: 'Headache & Migraine Relief', price: 'From ₹6,699', duration: '30 min' },
];

const CAT_COLORS = {
  Psychology:    '#10375C',
  Physiotherapy: '#EB8317',
  Chiropractic:  '#c9a000',
};

const STEPS = [
  { num: '01', title: 'Choose a service', desc: 'Select the discipline and specific treatment that matches your needs.' },
  { num: '02', title: 'Share your details', desc: 'Tell us about yourself, your preferred date, and what brought you in.' },
  { num: '03', title: 'We confirm within 24h', desc: 'Our intake coordinator reviews your request and confirms your slot.' },
  { num: '04', title: 'Begin your healing', desc: 'Attend your first appointment. We\'ll handle everything else.' },
];

const GROUPED = SESSION_TYPES.reduce((acc, s) => {
  if (!acc[s.cat]) acc[s.cat] = [];
  acc[s.cat].push(s);
  return acc;
}, {});

export default function BookSession() {
  const [selectedType, setSelectedType] = useState('');
  const [status, setStatus] = useState('idle');
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
    const result = await createBooking({ ...data, sessionType: selectedType });
    if (result.success) { setStatus('success'); reset(); setSelectedType(''); }
    else { setStatus('error'); }
  };

  return (
    <>
      <Helmet>
        <title>Book an Appointment — Asmira Wellness Clinic</title>
        <meta name="description" content="Book a psychology, physiotherapy, or chiropractic appointment at Asmira Wellness Clinic. New patients welcome. Same-week slots available." />
        <link rel="canonical" href="https://asmira.com/book" />
      </Helmet>

      {/* Hero */}
      <section className={styles.hero} aria-label="Book appointment hero">
        <div className={`${styles.heroContent} container`}>
          <span className="eyebrow">New Patients Welcome</span>
          <h1 className={styles.heroTitle}>Book your <em>appointment</em></h1>
          <p className={styles.heroSub}>
            Same-week slots available. Fill in the form below and our care coordinator will confirm within 24 hours.
          </p>
          <div className={styles.heroBadges}>
            <span>🔒 HIPAA Compliant</span>
            <span>📋 Insurance Accepted</span>
            <span>💻 Telehealth Available</span>
          </div>
        </div>
        <div className={styles.heroBg} aria-hidden="true" />
      </section>

      {/* Steps */}
      <section className={styles.steps} aria-labelledby="steps-heading">
        <div className="container">
          <h2 id="steps-heading" className="sr-only">How booking works</h2>
          <ol className={styles.stepsList} role="list">
            {STEPS.map((s, i) => (
              <li key={s.num} className={`${styles.step} reveal`} style={{ transitionDelay: `${i * 0.08}s` }}>
                <span className={styles.stepNum} aria-hidden="true">{s.num}</span>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepDesc}>{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Booking area */}
      <section className={styles.booking} aria-labelledby="booking-heading">
        <div className={`${styles.bookingInner} container`}>

          {/* Service picker */}
          <aside className={`${styles.picker} reveal`}>
            <h2 id="booking-heading" className={styles.pickerTitle}>
              Select a <em>service</em>
            </h2>
            <p className={styles.pickerSub}>Choose the treatment that best fits your needs.</p>

            {Object.entries(GROUPED).map(([cat, items]) => (
              <div key={cat} className={styles.pickerGroup}>
                <div className={styles.pickerCatLabel} style={{ color: CAT_COLORS[cat] }}>
                  {cat}
                </div>
                <ul className={styles.pickerList} role="list">
                  {items.map(s => (
                    <li key={s.value}>
                      <button
                        type="button"
                        className={`${styles.pickerCard} ${selectedType === s.value ? styles.pickerSelected : ''}`}
                        onClick={() => setSelectedType(s.value)}
                        aria-pressed={selectedType === s.value}
                        style={selectedType === s.value ? { borderColor: CAT_COLORS[cat], background: `${CAT_COLORS[cat]}0e` } : {}}
                      >
                        <div className={styles.pickerInfo}>
                          <strong className={styles.pickerLabel}>{s.label}</strong>
                          <span className={styles.pickerDuration}>{s.duration}</span>
                        </div>
                        <span className={styles.pickerPrice}>{s.price}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </aside>

          {/* Form */}
          <div className={`${styles.formWrap} reveal`} style={{ transitionDelay: '0.1s' }}>
            {status === 'success' ? (
              <div className={styles.successState} role="alert" aria-live="polite">
                <div className={styles.successIcon} aria-hidden="true">✦</div>
                <h3>Appointment Request Received!</h3>
                <p>Thank you for choosing Asmira. Our care coordinator will review your request and confirm your appointment within 24 hours via email or phone.</p>
                <button className={styles.resetBtn} onClick={() => setStatus('idle')}>Book Another Appointment</button>
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Appointment booking form">
                <h2 className={styles.formTitle}>Your Details</h2>

                {status === 'error' && (
                  <div className={styles.errorBanner} role="alert">
                    Something went wrong. Please try again or call us at +1 (123) 456-7890.
                  </div>
                )}

                <div className={styles.formRow}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="firstName">First Name *</label>
                    <input id="firstName" className={`${styles.input} ${errors.firstName ? styles.inputError : ''}`}
                      type="text" placeholder="" autoComplete="given-name"
                      {...register('firstName', { required: 'First name is required' })} />
                    {errors.firstName && <span className={styles.fieldErr} role="alert">{errors.firstName.message}</span>}
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="lastName">Last Name *</label>
                    <input id="lastName" className={`${styles.input} ${errors.lastName ? styles.inputError : ''}`}
                      type="text" placeholder="" autoComplete="family-name"
                      {...register('lastName', { required: 'Last name is required' })} />
                    {errors.lastName && <span className={styles.fieldErr} role="alert">{errors.lastName.message}</span>}
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="email">Email Address *</label>
                    <input id="email" className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                      type="email" placeholder="" autoComplete="email"
                      {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' } })} />
                    {errors.email && <span className={styles.fieldErr} role="alert">{errors.email.message}</span>}
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="phone">Phone Number *</label>
                    <input id="phone" className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                      type="tel" placeholder="+91 12345 67890" autoComplete="tel"
                      {...register('phone', { required: 'Phone number is required' })} />
                    {errors.phone && <span className={styles.fieldErr} role="alert">{errors.phone.message}</span>}
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="dob">Date of Birth</label>
                    <input id="dob" className={styles.input} type="date" {...register('dob')} />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="preferredDate">Preferred Appointment Date *</label>
                    <input id="preferredDate" className={`${styles.input} ${errors.preferredDate ? styles.inputError : ''}`}
                      type="date" min={new Date().toISOString().split('T')[0]}
                      {...register('preferredDate', { required: 'Please choose a date' })} />
                    {errors.preferredDate && <span className={styles.fieldErr} role="alert">{errors.preferredDate.message}</span>}
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="preferredTime">Preferred Time</label>
                  <select id="preferredTime" className={styles.input} {...register('preferredTime')}>
                    <option value="">Select a time slot</option>
                    <option value="morning">Morning (8am – 12pm)</option>
                    <option value="afternoon">Afternoon (12pm – 5pm)</option>
                    <option value="evening">Evening (5pm – 8pm)</option>
                  </select>
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="appointmentType">Appointment Type</label>
                  <select id="appointmentType" className={styles.input} {...register('appointmentType')}>
                    <option value="in-person">In-Person</option>
                    <option value="Online">Online (Video)</option>
                    <option value="phone">Phone Consultation</option>
                  </select>
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="reason">Reason for Visit / Chief Complaint</label>
                  <textarea id="reason" className={`${styles.input} ${styles.textarea}`}
                    placeholder="Briefly describe what brings you in. This helps us prepare for your appointment..."
                    rows={4} {...register('reason')} />
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="referral">How did you hear about Asmira?</label>
                  <select id="referral" className={styles.input} {...register('referral')}>
                    <option value="">Select an option</option>
                    <option value="doctor-referral">Doctor / Medical Referral</option>
                    <option value="google">Google Search</option>
                    <option value="friend">Friend or Family</option>
                    <option value="insurance">Insurance Directory</option>
                    <option value="social-media">Social Media</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className={styles.consentField}>
                  <input id="consent" type="checkbox" className={styles.checkbox}
                    {...register('consent', { required: 'You must consent to proceed' })} />
                  <label htmlFor="consent" className={styles.consentLabel}>
                    I consent to Asmira Wellness Clinic storing and processing my personal data for the purpose of this appointment request, in accordance with their Privacy Policy. *
                  </label>
                </div>
                {errors.consent && <span className={styles.fieldErr} role="alert">{errors.consent.message}</span>}

                {!selectedType && (
                  <p className={styles.sessionNote} role="note">
                    ← Please select a service from the left panel before submitting.
                  </p>
                )}

                <button type="submit" className={styles.submitBtn}
                  disabled={status === 'loading' || !selectedType}
                  aria-disabled={status === 'loading' || !selectedType}>
                  {status === 'loading'
                    ? <span className={styles.spinner} aria-label="Submitting…" />
                    : 'Request Appointment →'}
                </button>

                <p className={styles.formNote}>
                  🔒 Your information is protected under HIPAA. We will never share your data with third parties.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
