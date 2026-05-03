import { 
  collection, 
  addDoc, 
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc
} from 'firebase/firestore';

import { db } from './config';

// CREATE (you already have this)
export const createBooking = async (data) => {
  try {
    const ref = await addDoc(collection(db, 'bookings'), {
      ...data,
      status: 'pending',
      createdAt: serverTimestamp(),
    });
    return { success: true, id: ref.id };
  } catch (e) {
    return { success: false, error: e.message };
  }
};

export const sendContactMessage = async (data) => {
  try {
    const ref = await addDoc(collection(db, 'messages'), {
      ...data,
      read: false,
      createdAt: serverTimestamp(),
    });
    return { success: true, id: ref.id };
  } catch (e) {
    return { success: false, error: e.message };
  }
};

// 🔥 READ BOOKINGS (REALTIME)
export const subscribeBookings = (callback) => {
  const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(data);
  });
};

// 🔥 READ MESSAGES (REALTIME)
export const subscribeMessages = (callback) => {
  const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(data);
  });
};

// 🔄 UPDATE STATUS (admin action)
export const updateBookingStatus = async (id, status) => {
  const ref = doc(db, 'bookings', id);
  await updateDoc(ref, { status });
};

// 🔄 MARK MESSAGE AS READ
export const markMessageRead = async (id) => {
  const ref = doc(db, 'messages', id);
  await updateDoc(ref, { read: true });
};