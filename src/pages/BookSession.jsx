import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { createBooking } from '../firebase/services';
import styles from './BookSession.module.css';
const SESSION_TYPES = [
  {
    cat: 'Psychology',
    value: 'Individual Therapy',
    label: 'Individual Therapy',
    price: '₹900',
    duration: '50 min'
  },
  {
    cat: 'Psychology',
    value: 'Couples Counseling',
    label: 'Couples Counseling',
    price: '₹1100',
    duration: '60 min'
  },
  {
    cat: 'Psychology',
    value: 'Family Therapy',
    label: 'Family Therapy',
    price: '₹1800',
    duration: '90 min'
  },
  {
    cat: 'Psychology',
    value: 'Career Counseling',
    label: 'Career Counseling',
    price: '₹1100',
    duration: '60 min'
  },
  {
    cat: 'Psychology',
    value: 'Child & Adolescent Therapy',
    label: 'Child & Adolescent Therapy',
    price: '₹900',
    duration: '50 min'
  },
  {
    cat: 'Chiropractic',
    value: 'Migraine Relief',
    label: 'Migraine Relief',
    price: '₹1500',
    duration: '45 min'
  },
  {
    cat: 'Chiropractic',
    value: 'Movement Screen',
    label: 'Movement Screen',
    price: '₹1000',
    duration: '60 min'
  },
  {
    cat: 'Chiropractic',
    value: 'Spinal Adjustment',
    label: 'Spinal Adjustment',
    price: '₹1000',
    duration: '30 min'
  },
  {
    cat: 'Chiropractic',
    value: 'Posture Correction',
    label: 'Posture Correction',
    price: '₹1000',
    duration: '45 min'
  },
  {
    cat: 'General',
    value: 'Not sure — need guidance',
    label: 'Not sure — need guidance',
    price: 'Free',
    duration: '15 min'
  },
];

const CAT_COLORS = {
  Psychology:  '#10375C',
  Counselling: '#EB8317',
  Online:      '#1a5276',
  Workshop:    '#c9a000',
};

const STEPS = [
  { num: '01', title: 'Choose a service',     desc: 'Select the type of counselling that best matches your needs.' },
  { num: '02', title: 'Share your details',   desc: 'Tell us about yourself, preferred date, and what brought you in.' },
  { num: '03', title: 'We confirm within 24h',desc: 'Our team reviews your request and confirms your slot by email or phone.' },
  { num: '04', title: 'Begin your journey',   desc: 'Show up, be yourself. We\'ll take care of everything else.' },
];

const GROUPED = SESSION_TYPES.reduce((acc, s) => {
  if (!acc[s.cat]) acc[s.cat] = [];
  acc[s.cat].push(s);
  return acc;
}, {});

export default function BookSession() {
  const [selectedType, setSelectedType] = useState('');
  const [status, setStatus] = useState('idle');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
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

  const onSubmit = async (data) => {
    setStatus('loading');
    // sessionType comes from the picker, not the form fields
    const result = await createBooking({ ...data, sessionType: selectedType });
    if (result.success) {
      setStatus('success');
      reset();
      setSelectedType('');
    } else {
      setStatus('error');
    }
  };

  return (
    <>
      <Helmet>
        <title>Book an Appointment — Asmira Wellness</title>
        <meta
          name="description"
          content="Book a counselling, emotional wellness, or online session at Asmira Wellness, Valsad. New clients welcome. Confirm within 24 hours."
        />
        <link rel="canonical" href="https://asmira.com/book" />
      </Helmet>

      {/* HERO */}
      <section className={styles.hero} aria-label="Book appointment hero">
        <div className={`${styles.heroContent} container`}>
          <span className="eyebrow">New Clients Welcome</span>
          <h1 className={styles.heroTitle}>
            Book your <em>appointment</em>
          </h1>
          <p className={styles.heroSub}>
            Fill in the form below and our team will confirm your appointment within 24 hours via phone or email.
          </p>
          <div className={styles.heroBadges}>
            <span>🔒 Fully Confidential</span>
            <span>💻 Online &amp; In-Person</span>
            <span>📍 Valsad, Gujarat</span>
          </div>
        </div>
        <div className={styles.heroBg} aria-hidden="true" />
      </section>

      {/* STEPS */}
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

      {/* BOOKING AREA */}
      <section className={styles.booking} aria-labelledby="booking-heading">
        <div className={`${styles.bookingInner} container`}>

          {/* Service Picker */}
          <aside className={`${styles.picker} reveal`}>
            <h2 id="booking-heading" className={styles.pickerTitle}>
              Select a <em>service</em>
            </h2>
            <p className={styles.pickerSub}>Choose the session that best fits your situation.</p>

            {Object.entries(GROUPED).map(([cat, items]) => (
              <div key={cat} className={styles.pickerGroup}>
                <div className={styles.pickerCatLabel} style={{ color: CAT_COLORS[cat] }}>
                  {cat}
                </div>
                <ul className={styles.pickerList} role="list">
                  {items.map((s) => (
                    <li key={s.value}>
                      <button
                        type="button"
                        className={`${styles.pickerCard} ${selectedType === s.value ? styles.pickerSelected : ''}`}
                        onClick={() => setSelectedType(s.value)}
                        aria-pressed={selectedType === s.value}
                        style={
                          selectedType === s.value
                            ? { borderColor: CAT_COLORS[cat], background: `${CAT_COLORS[cat]}10` }
                            : {}
                        }
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
                <p>
                  Thank you for choosing Asmira Wellness. Our team will review your request and confirm your appointment within 24 hours via email or phone.
                </p>
                <button className={styles.resetBtn} onClick={() => setStatus('idle')}>
                  Book Another Appointment
                </button>
              </div>
            ) : (
              <form
                className={styles.form}
                onSubmit={handleSubmit(onSubmit)}
                noValidate
                aria-label="Appointment booking form"
              >
                <h2 className={styles.formTitle}>Your Details</h2>

                {status === 'error' && (
                  <div className={styles.errorBanner} role="alert">
                    Something went wrong. Please try again or contact us at{' '}
                    <a href="tel:+91 95122 31430">+91 95122 31430</a>.
                  </div>
                )}

                <div className={styles.formRow}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="firstName">First Name *</label>
                    <input
                      id="firstName"
                      className={`${styles.input} ${errors.firstName ? styles.inputError : ''}`}
                      type="text"
                      autoComplete="given-name"
                      {...register('firstName', { required: 'First name is required' })}
                    />
                    {errors.firstName && (
                      <span className={styles.fieldErr} role="alert">{errors.firstName.message}</span>
                    )}
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="lastName">Last Name *</label>
                    <input
                      id="lastName"
                      className={`${styles.input} ${errors.lastName ? styles.inputError : ''}`}
                      type="text"
                      autoComplete="family-name"
                      {...register('lastName', { required: 'Last name is required' })}
                    />
                    {errors.lastName && (
                      <span className={styles.fieldErr} role="alert">{errors.lastName.message}</span>
                    )}
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="email">Email Address *</label>
                    <input
                      id="email"
                      className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                      type="email"
                      autoComplete="email"
                      {...register('email', {
                        required: 'Email is required',
                        pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
                      })}
                    />
                    {errors.email && (
                      <span className={styles.fieldErr} role="alert">{errors.email.message}</span>
                    )}
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="phone">Phone / WhatsApp *</label>
                    <input
                      id="phone"
                      className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                      type="tel"
                      placeholder="+91 98765 43210"
                      autoComplete="tel"
                      {...register('phone', { required: 'Phone number is required' })}
                    />
                    {errors.phone && (
                      <span className={styles.fieldErr} role="alert">{errors.phone.message}</span>
                    )}
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="dob">Date of Birth</label>
                    <input id="dob" className={styles.input} type="date" {...register('dob')} />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="preferredDate">Preferred Date *</label>
                    <input
                      id="preferredDate"
                      className={`${styles.input} ${errors.preferredDate ? styles.inputError : ''}`}
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      {...register('preferredDate', { required: 'Please choose a date' })}
                    />
                    {errors.preferredDate && (
                      <span className={styles.fieldErr} role="alert">{errors.preferredDate.message}</span>
                    )}
                  </div>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="preferredTime">Preferred Time</label>
                    <select id="preferredTime" className={styles.input} {...register('preferredTime')}>
                      <option value="">Select a time slot</option>
                      <option value="Morning (10am–1pm)">Morning (10am–1pm)</option>
                      <option value="Afternoon (1pm–5pm)">Afternoon (1pm–5pm)</option>
                      <option value="Evening (5pm–8pm)">Evening (5pm–8pm)</option>
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label} htmlFor="appointmentType">Appointment Type</label>
                    <select id="appointmentType" className={styles.input} {...register('appointmentType')}>
                      <option value="In-Person">In-Person (Valsad Studio)</option>
                      <option value="Online — Video Call">Online — Video Call</option>
                      <option value="Online — Voice Call">Online — Voice Call</option>
                    </select>
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="reason">
                    Reason for Visit{' '}
                    <span style={{ fontWeight: 400, opacity: 0.5 }}>(Optional)</span>
                  </label>
                  <textarea
                    id="reason"
                    className={`${styles.input} ${styles.textarea}`}
                    placeholder="Briefly describe what brings you in. This helps us prepare for your appointment..."
                    rows={4}
                    {...register('reason')}
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label} htmlFor="referral">How did you hear about us?</label>
                  <select id="referral" className={styles.input} {...register('referral')}>
                    <option value="">Select an option</option>
                    <option value="Google Search">Google Search</option>
                    <option value="Friend or Family">Friend or Family</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Doctor Referral">Doctor Referral</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className={styles.consentField}>
                  <input
                    id="consent"
                    type="checkbox"
                    className={styles.checkbox}
                    {...register('consent', { required: 'You must consent to proceed' })}
                  />
                  <label htmlFor="consent" className={styles.consentLabel}>
                    I consent to Asmira Wellness storing my personal information for the purpose of this appointment request, in accordance with their Privacy Policy. *
                  </label>
                </div>
                {errors.consent && (
                  <span className={styles.fieldErr} role="alert">{errors.consent.message}</span>
                )}

                {!selectedType && (
                  <p className={styles.sessionNote} role="note">
                    ← Please select a service from the left panel before submitting.
                  </p>
                )}

                <button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={status === 'loading' || !selectedType}
                  aria-disabled={status === 'loading' || !selectedType}
                >
                  {status === 'loading' ? (
                    <span className={styles.spinner} aria-label="Submitting…" />
                  ) : (
                    'Request Appointment →'
                  )}
                </button>

                <p className={styles.formNote}>
                  🔒 Your information is completely confidential. We will never share your details with anyone.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}