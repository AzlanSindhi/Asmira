// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import Navbar       from './components/Navbar';
import Footer       from './components/Footer';
import ScrollToTop  from './components/ScrollToTop';
import Home         from './pages/Home';
import About        from './pages/About';
import Services     from './pages/Services';
import BookSession  from './pages/BookSession';
import Contact      from './pages/Contact';
import AdminDashboard from './pages/AdminDashboard';

// Admin route is excluded from the shared Navbar/Footer layout
function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Admin — no navbar/footer */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Public pages */}
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
        <Route path="/services" element={<PublicLayout><Services /></PublicLayout>} />
        <Route path="/book" element={<PublicLayout><BookSession /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
      </Routes>
    </>
  );
}