import { Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import BookSession from './pages/BookSession';
import Contact from './pages/Contact';
import AdminDashboard from './pages/Admindashboard';

// Layout for normal pages
function MainLayout({ children }) {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main id="main-content">{children}</main>
      <Footer />
    </>
  );
}

// Layout for admin (no header/footer)
function AdminLayout({ children }) {
  return <main id="main-content">{children}</main>;
}

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          <MainLayout>
            <Home />
          </MainLayout>
        }
      />
      <Route
        path="/about"
        element={
          <MainLayout>
            <About />
          </MainLayout>
        }
      />
      <Route
        path="/services"
        element={
          <MainLayout>
            <Services />
          </MainLayout>
        }
      />
      <Route
        path="/book"
        element={
          <MainLayout>
            <BookSession />
          </MainLayout>
        }
      />
      <Route
        path="/contact"
        element={
          <MainLayout>
            <Contact />
          </MainLayout>
        }
      />

      {/* Admin Route (NO Navbar/Footer) */}
      <Route
        path="/admin"
        element={
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        }
      />
    </Routes>
  );
}