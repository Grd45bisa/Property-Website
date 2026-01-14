import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Critical Components (loaded immediately for homepage)
import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Navbar/Navbar';
import Hero from './components/Hero/Hero';
import TrustLogos from './components/TrustLogos/TrustLogos';
import ProblemSolution from './components/ProblemSolution/ProblemSolution';
import Portfolio from './components/Portfolio/Portfolio';
import Process from './components/Process/Process';
import Pricing from './components/Pricing';
import Footer from './components/Footer/Footer';

// Lazy loaded pages for code splitting (reduces initial bundle size)
const PortfolioPage = lazy(() => import('./pages/PortfolioPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const EditTourPage = lazy(() => import('./pages/EditTourPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const BlogListPage = lazy(() => import('./pages/BlogListPage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));
const DemoTourPage = lazy(() => import('./pages/DemoTourPage'));
const TourPage = lazy(() => import('./pages/TourPage'));

// Loading component
const PageLoader: React.FC = () => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
    }}
  >
    <span
      className="material-icons animate-spin"
      style={{ fontSize: '48px', color: '#22c55e' }}
    >
      progress_activity
    </span>
  </div>
);

// Home Page Component
const HomePage: React.FC = () => {
  return (
    <div className="page">
      {/* Skip to Main Content - Accessibility */}
      <a href="#main-content" className="skip-to-content">
        Langsung ke Konten Utama
      </a>
      <Navbar />
      <Hero />
      <TrustLogos />
      <main id="main-content" tabIndex={-1}>
        <ProblemSolution />
        <Portfolio />
        <Process />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/demo" element={<DemoTourPage />} />
          <Route path="/tour/:id" element={<TourPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/editor/:id" element={<EditTourPage />} />
          <Route path="/editor/:id/360" element={<EditTourPage />} />
          <Route path="/editor/:id/share" element={<EditTourPage />} />
          <Route path="/editor/:id/gallery" element={<EditTourPage />} />
          <Route path="/editor/:id/settings" element={<EditTourPage />} />
          <Route path="/blog" element={<BlogListPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;
