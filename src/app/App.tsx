import { useState, useEffect } from 'react';

import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductShowcase } from './components/ProductShowcase';
import { Features } from './components/Features';
import { About } from './components/About';
import { CustomOrder } from './components/CustomOrder';
import { JewelryParts } from './components/JewelryParts';
import { SizeComparison } from './components/SizeComparison';
import { Footer } from './components/Footer';
import { Contact } from './components/Contact';
import { TestNotification } from './components/TestNotification';
import { TestSystem } from './components/TestSystem';
import { QuickEmailGenerator } from './components/QuickEmailGenerator';
import { TrackOrder } from './components/TrackOrder';
import { SuccessPage } from './components/SuccessPage';
import { CancelPage } from './components/CancelPage';
import { FAQPage } from './components/FAQPage';
import { BlogPage } from './components/BlogPage';
import { SEOHead, SEOPresets } from './components/SEOHead';
import { SchemaMarkup, SchemaTypes } from './components/SchemaMarkup';
import { MobileFloatingNav } from './components/MobileFloatingNav';
import { MobileBottomNav } from './components/MobileBottomNav';
import { ConsoleDeploymentGuide } from './components/ConsoleDeploymentGuide';
import { DeploymentBanner } from './components/DeploymentBanner';
import { usePerformanceOptimization } from './hooks/usePerformanceOptimization';

// Forged Initials Main App Component
// Build: 2025-11-09-fully-optimized
export default function App() {
  // Apply performance optimizations
  usePerformanceOptimization();
  const [currentPage, setCurrentPage] = useState<'home' | 'contact' | 'faq' | 'test' | 'email' | 'success' | 'cancel' | 'track' | 'seo-audit' | 'blog'>('home');
  const [showOwnerPanel, setShowOwnerPanel] = useState(false);

  const handleNavigate = (page: 'home' | 'contact' | 'faq' | 'test' | 'email' | 'success' | 'cancel' | 'track' | 'seo-audit' | 'blog') => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.documentElement.scrollTop = 0;
  };

  useEffect(() => {
    // Check URL path for success/cancel pages
    const path = window.location.pathname;
    if (path === '/success') {
      setCurrentPage('success');
    } else if (path === '/cancel') {
      setCurrentPage('cancel');
    } else if (path === '/track' || path.startsWith('/track/')) {
      setCurrentPage('track');
    }

    // Check if owner mode is enabled in localStorage
    const ownerMode = localStorage.getItem('forged_owner_mode');
    if (ownerMode === 'enabled') {
      setShowOwnerPanel(true);
    }

    // Listen for custom event to toggle owner mode
    const handleOwnerToggle = () => {
      const currentState = localStorage.getItem('forged_owner_mode') === 'enabled';
      const newState = !currentState;
      localStorage.setItem('forged_owner_mode', newState ? 'enabled' : 'disabled');
      setShowOwnerPanel(newState);
      console.log('Owner mode:', newState ? 'enabled' : 'disabled');
    };

    window.addEventListener('toggleOwnerMode', handleOwnerToggle);
    
    return () => {
      window.removeEventListener('toggleOwnerMode', handleOwnerToggle);
    };
  }, []);

  return (
    <div className="min-h-screen">
      {/* Console deployment guide - shows helpful messages in browser console */}
      <ConsoleDeploymentGuide />
      
      {/* Setup status banners - only shown if there are issues */}
      <DeploymentBanner />
      
      {/* Dynamic SEO meta tags based on current page */}
      {currentPage === 'home' && (
        <>
          <SEOHead {...SEOPresets.home} page="home" />
          <SchemaMarkup type={SchemaTypes.HOMEPAGE} />
        </>
      )}
      {currentPage === 'contact' && (
        <>
          <SEOHead {...SEOPresets.contact} page="contact" />
          <SchemaMarkup type={SchemaTypes.CONTACT} />
        </>
      )}
      {currentPage === 'faq' && (
        <>
          <SEOHead 
            title="Frequently Asked Questions - Forged Initials"
            description="Find answers to common questions about our handcrafted sterling silver letter jewelry, pricing, shipping, materials, and custom orders."
            keywords="FAQ, questions, answers, sterling silver jewelry, custom jewelry, jewelry pricing, shipping Houston"
            page="faq"
          />
          <SchemaMarkup type={SchemaTypes.FAQ} />
        </>
      )}
      {currentPage === 'test' && (
        <SEOHead 
          title="Testing Dashboard - Forged Initials"
          description="Internal testing and order management dashboard"
          keywords="admin, testing"
        />
      )}
      {currentPage === 'email' && (
        <SEOHead 
          title="Email Generator - Forged Initials"
          description="Quick email generation tool for customer communications"
          keywords="admin, email generator"
        />
      )}
      {currentPage === 'success' && (
        <SEOHead 
          title="Order Success - Forged Initials"
          description="Your order has been successfully placed"
          keywords="order success, payment complete"
        />
      )}
      {currentPage === 'cancel' && (
        <SEOHead 
          title="Order Cancelled - Forged Initials"
          description="Your order was cancelled"
          keywords="order cancelled, payment cancelled"
        />
      )}
      {currentPage === 'track' && (
        <SEOHead 
          title="Track Your Order - Forged Initials"
          description="Track your custom jewelry order status and shipping information"
          keywords="track order, order status, shipping tracking, delivery status"
          page="track"
        />
      )}
      {currentPage === 'seo-audit' && (
        <SEOHead 
          title="SEO Audit - Forged Initials"
          description="Analyze and improve your website's SEO performance"
          keywords="SEO, audit, performance, optimization"
        />
      )}
      
      {currentPage === 'blog' && (
        <SEOHead
          title="The Forged Journal — Sterling Silver Tips, Craft & Style | Forged Initials"
          description="Read the Forged Initials blog for expert tips on sterling silver care, custom jewelry gift guides, behind-the-scenes craft stories, and style inspiration."
          keywords="sterling silver blog, jewelry care tips, custom jewelry guide, silver jewelry style, handcrafted jewelry Houston"
          page="home"
        />
      )}

      {currentPage !== 'success' && currentPage !== 'cancel' && (
        <Header currentPage={currentPage} onNavigate={handleNavigate} />
      )}
      
      <main>
        {currentPage === 'success' ? (
          <SuccessPage />
        ) : currentPage === 'cancel' ? (
          <CancelPage />
        ) : currentPage === 'home' ? (
          <>
            <Hero />
            <Features />
            <ProductShowcase />
            <SizeComparison />
            <JewelryParts />
            <About />
            <CustomOrder />
          </>
        ) : currentPage === 'contact' ? (
          <div className="pt-20">
            <Contact />
          </div>
        ) : currentPage === 'faq' ? (
          <FAQPage />
        ) : currentPage === 'email' ? (
          <div className="pt-20 pb-20 bg-gradient-to-b from-green-50 to-emerald-50 min-h-screen">
            <QuickEmailGenerator onNavigate={handleNavigate} />
          </div>
        ) : currentPage === 'track' ? (
          <TrackOrder />
        ) : currentPage === 'blog' ? (
          <BlogPage onNavigate={handleNavigate} />
        ) : (
          <div className="pt-20 pb-20 bg-slate-50 min-h-screen">
            <TestSystem onNavigate={handleNavigate} />
          </div>
        )}
      </main>
      
      {currentPage === 'home' && <MobileFloatingNav />}

      {currentPage !== 'success' && currentPage !== 'cancel' && (
        <MobileBottomNav currentPage={currentPage} onNavigate={handleNavigate} />
      )}
      
      {currentPage !== 'test' && currentPage !== 'email' && currentPage !== 'success' && currentPage !== 'cancel' && (
        <Footer onNavigate={handleNavigate} />
      )}
      {showOwnerPanel && currentPage !== 'test' && currentPage !== 'email' && (
        <TestNotification 
          onOpenFullDashboard={() => handleNavigate('test')}
          onOpenEmailGenerator={() => handleNavigate('email')}
        />
      )}
      
    </div>
  );
}