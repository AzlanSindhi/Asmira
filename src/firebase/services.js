// src/firebase/services.js
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore';
import { db } from './config';

const ADMIN_EMAIL = 'asmirawellness@gmail.com';

// ── helper: send email via EmailJS (free tier, no backend needed) ────────────
// Install: npm install @emailjs/browser
// Sign up at emailjs.com → create service → create template → paste IDs below
// Template variables: {{to_email}}, {{subject}}, {{message}}, {{from_name}}
import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID  = 'service_bcy3era';   // e.g. 'service_abc123'
const EMAILJS_TEMPLATE_ID = 'template_abc456';
const EMAILJS_PUBLIC_KEY  = 'kYw93xA2bcD';   // e.g. 'abc123XYZ'

async function sendEmail({ to, subject, message, fromName = 'Asmira Wellness' }) {
  try {
    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      { to_email: to, subject, message, from_name: fromName },
      EMAILJS_PUBLIC_KEY
    );
  } catch (err) {
    console.warn('Email send failed:', err);
    // Non-fatal — don't block form submission
  }
}

// ── BOOKINGS ─────────────────────────────────────────────────────────────────

export const createBooking = async (bookingData) => {
  try {
    const payload = {
      firstName:       bookingData.firstName       || '',
      lastName:        bookingData.lastName         || '',
      email:           bookingData.email            || '',
      phone:           bookingData.phone            || '',
      dob:             bookingData.dob              || '',
      preferredDate:   bookingData.preferredDate    || '',
      preferredTime:   bookingData.preferredTime    || '',
      appointmentType: bookingData.appointmentType  || 'in-person',
      sessionType:     bookingData.sessionType      || '',
      reason:          bookingData.reason           || '',
      referral:        bookingData.referral         || '',
      status:          'pending',
      createdAt:       serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'bookings'), payload);

    // Notify admin
    const fullName = `${payload.firstName} ${payload.lastName}`;
    await sendEmail({
      to:      ADMIN_EMAIL,
      subject: `New Booking Request – ${fullName}`,
      message: `
New appointment request received on Asmira Wellness:

Name:             ${fullName}
Email:            ${payload.email}
Phone:            ${payload.phone}
Date of Birth:    ${payload.dob || 'Not provided'}
Preferred Date:   ${payload.preferredDate}
Preferred Time:   ${payload.preferredTime || 'Not specified'}
Appointment Type: ${payload.appointmentType}
Service:          ${payload.sessionType}
Reason:           ${payload.reason || 'Not provided'}
Referral:         ${payload.referral || 'Not specified'}

Login to admin dashboard to confirm or manage this booking.
      `.trim(),
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating booking:', error);
    return { success: false, error: error.message };
  }
};

export const subscribeBookings = (callback) => {
  const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(data);
  });
};

export const updateBookingStatus = async (id, status) => {
  try {
    await updateDoc(doc(db, 'bookings', id), { status });
    return { success: true };
  } catch (error) {
    console.error('Error updating booking:', error);
    return { success: false, error: error.message };
  }
};

// Send confirmation email from admin to patient
export const sendConfirmationEmail = async (booking, customMessage) => {
  const fullName = `${booking.firstName} ${booking.lastName}`;
  const defaultMessage = `
Dear ${booking.firstName},

Your appointment at Asmira Wellness has been confirmed.

Details:
  Service:   ${booking.sessionType}
  Date:      ${booking.preferredDate}
  Time:      ${booking.preferredTime || 'To be confirmed'}
  Type:      ${booking.appointmentType}

${customMessage ? `\nNote from our team:\n${customMessage}` : ''}

Please arrive 5–10 minutes early for your first visit.
If you need to reschedule, contact us at ${ADMIN_EMAIL} or call +91 95122 31430.

Warm regards,
Asmira Wellness Team
1st Floor, Shop No:118, M Square Mall, Tithal Road, Valsad – 396001
  `.trim();

  try {
    await sendEmail({
      to:      booking.email,
      subject: `Your Asmira Wellness Appointment is Confirmed — ${booking.preferredDate}`,
      message: defaultMessage,
      fromName: 'Asmira Wellness',
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ── CONTACT MESSAGES ──────────────────────────────────────────────────────────

export const sendContactMessage = async (messageData) => {
  try {
    const payload = {
      name:      messageData.name    || '',
      email:     messageData.email   || '',
      phone:     messageData.phone   || '',
      subject:   messageData.subject || '',
      message:   messageData.message || '',
      read:      false,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'messages'), payload);

    // Notify admin
    await sendEmail({
      to:      ADMIN_EMAIL,
      subject: `New Contact Message – ${payload.subject}`,
      message: `
New message received on Asmira Wellness:

From:    ${payload.name} <${payload.email}>
Phone:   ${payload.phone || 'Not provided'}
Subject: ${payload.subject}

Message:
${payload.message}
      `.trim(),
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error sending message:', error);
    return { success: false, error: error.message };
  }
};

export const subscribeMessages = (callback) => {
  const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(data);
  });
};

export const markMessageRead = async (id) => {
  try {
    await updateDoc(doc(db, 'messages', id), { read: true });
    return { success: true };
  } catch (error) {
    console.error('Error marking read:', error);
    return { success: false, error: error.message };
  }
};

// ── FEEDBACK ──────────────────────────────────────────────────────────────────

export const submitFeedback = async (feedbackData) => {
  try {
    const payload = {
      patientName:  feedbackData.patientName  || '',
      email:        feedbackData.email         || '',
      sessionType:  feedbackData.sessionType   || '',
      rating:       Number(feedbackData.rating) || 5,
      feedback:     feedbackData.feedback      || '',
      wouldReturn:  feedbackData.wouldReturn   || 'yes',
      createdAt:    serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'feedback'), payload);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error submitting feedback:', error);
    return { success: false, error: error.message };
  }
};

export const subscribeFeedback = (callback) => {
  const q = query(collection(db, 'feedback'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(data);
  });
};