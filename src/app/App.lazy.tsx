import { lazy, Suspense } from 'react';
import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Footer } from './components/Footer';
import { SEOHead, SEOPresets } from './components/SEOHead';
import { SchemaMarkup, SchemaTypes } from './components/SchemaMarkup';
import { MobileFloatingNav } from './components/MobileFloatingNav';
import { usePerformanceOptimization } from './hooks/usePerformanceOptimization';
import { MobileOptimizationStatus } from './components/MobileOptimizationStatus';

// Lazy load components that are not immediately visible
const ProductShowcase = lazy(() => import('./components/ProductShowcase').then(m => ({ default: m.ProductShowcase })));
const Features = lazy(() => import('./components/Features').then(m => ({ default: m.Features })));
const About = lazy(() => import('./components/About').then(m => ({ default: m.About })));
const CustomOrder = lazy(() => import('./components/CustomOrder').then(m => ({ default: m.CustomOrder })));
const ShopJewelry = lazy(() => import('./components/ShopJewelry').then(m => ({ default: m.ShopJewelry })));
const JewelryParts = lazy(() => import('./components/JewelryParts').then(m => ({ default: m.JewelryParts })));
const SizeComparison = lazy(() => import('./components/SizeComparison').then(m => ({ default: m.SizeComparison })));
const Contact = lazy(() => import('./components/Contact').then(m => ({ default: m.Contact })));
const FAQPage = lazy(() => import('./components/FAQPage').then(m => ({ default: m.FAQPage })));
const SuccessPage = lazy(() => import('./components/SuccessPage').then(m => ({ default: m.SuccessPage })));
const CancelPage = lazy(() => import('./components/CancelPage').then(m => ({ default: m.CancelPage })));

// Lazy load admin/test components (only for owner mode)
const TestNotification = lazy(() => import('./components/TestNotification').then(m => ({ default: m.TestNotification })));
const TestSystem = lazy(() => import('./components/TestSystem').then(m => ({ default: m.TestSystem })));
const QuickEmailGenerator = lazy(() => import('./components/QuickEmailGenerator').then(m => ({ default: m.QuickEmailGenerator })));
const ConsoleDeploymentGuide = lazy(() => import('./components/ConsoleDeploymentGuide').then(m => ({ default: m.ConsoleDeploymentGuide })));
const DeploymentBanner = lazy(() => import('./components/DeploymentBanner').then(m => ({ default: m.DeploymentBanner })));
const DiscordSetupBanner = lazy(() => import('./components/DiscordSetupBanner').then(m => ({ default: m.DiscordSetupBanner })));
const DeploymentCelebration = lazy(() => import('./components/DeploymentCelebration').then(m => ({ default: m.DeploymentCelebration })));
const SimpleDiscordTest = lazy(() => import('./components/SimpleDiscordTest').then(m => ({ default: m.SimpleDiscordTest })));

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
        </div>
      </div>
    </div>
  );
}

// Forged Initials Main App Component - Optimized with Code Splitting
// Build: 2025-11-09-optimized-code-splitting
export default function App() {
  // Apply performance optimizations
  usePerformanceOptimization();
  const [currentPage, setCurrentPage] = useState<'home' | 'contact' | 'faq' | 'test' | 'email' | 'success' | 'cancel' | 'discord-test'>('home');
  const [showOwnerPanel, setShowOwnerPanel] = useState(false);
  const [showDiscordBanner, setShowDiscordBanner] = useState(false);

  useEffect(() => {
    // Check URL path for success/cancel pages
    const path = window.location.pathname;
    if (path === '/success') {
      setCurrentPage('success');
    } else if (path === '/cancel') {
      setCurrentPage('cancel');
    }

    // Check if owner mode is enabled in localStorage
    const ownerMode = localStorage.getItem('forged_owner_mode');
    if (ownerMode === 'enabled') {
      setShowOwnerPanel(true);
      // Check if Discord setup banner should be shown
      const bannerDismissed = localStorage.getItem('discord_setup_banner_dismissed');
      if (!bannerDismissed) {
        setShowDiscordBanner(true);
      }
    }

    // Listen for custom event to toggle owner mode
    const handleOwnerToggle = () => {
      const currentState = localStorage.getItem('forged_owner_mode') === 'enabled';
      const newState = !currentState;
      localStorage.setItem('forged_owner_mode', newState ? 'enabled' : 'disabled');
      setShowOwnerPanel(newState);
      if (newState) {
        const bannerDismissed = localStorage.getItem('discord_setup_banner_dismissed');
        if (!bannerDismissed) {
          setShowDiscordBanner(true);
        }
      } else {
        setShowDiscordBanner(false);
      }
      console.log('Owner mode:', newState ? 'enabled' : 'disabled');
    };

    // Listen for banner dismiss event
    const handleBannerDismiss = () => {
      setShowDiscordBanner(false);
    };

    window.addEventListener('toggleOwnerMode', handleOwnerToggle);
    window.addEventListener('discordBannerDismissed', handleBannerDismiss);
    
    return () => {
      window.removeEventListener('toggleOwnerMode', handleOwnerToggle);
      window.removeEventListener('discordBannerDismissed', handleBannerDismiss);
    };
  }, []);

  return (
    <div className="min-h-screen">
      {/* Console deployment guide - lazy loaded for owner mode */}
      {showOwnerPanel && (
        <Suspense fallback={null}>
          <ConsoleDeploymentGuide />
        </Suspense>
      )}
      
      {/* Deployment Success Celebration - lazy loaded */}
      {showOwnerPanel && (
        <Suspense fallback={null}>
          <DeploymentCelebration 
            onOpenTest={() => {
              setCurrentPage('test');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </Suspense>
      )}

      {/* Discord Setup Banner - lazy loaded for owner mode */}
      {showDiscordBanner && showOwnerPanel && (
        <Suspense fallback={null}>
          <DiscordSetupBanner onDismiss={() => setShowDiscordBanner(false)} />
        </Suspense>
      )}

      {/* SEO and Schema - Always load immediately */}
      {currentPage === 'home' && (
        <>
          <SEOHead {...SEOPresets.home} page="home" />
          <SchemaMarkup type={SchemaTypes.Organization} />
          <SchemaMarkup type={SchemaTypes.LocalBusiness} />
        </>
      )}
      {currentPage === 'contact' && (
        <SEOHead {...SEOPresets.contact} page="contact" />
      )}
      {currentPage === 'faq' && (
        <>
          <SEOHead 
            title="FAQ - Forged Initials | Frequently Asked Questions"
            description="Find answers to common questions about our custom 925 sterling silver letter jewelry, shipping, returns, and custom orders."
            keywords="jewelry FAQ, custom jewelry questions, sterling silver care, shipping info, return policy"
            page="faq"
          />
          <SchemaMarkup type={SchemaTypes.FAQPage} />
        </>
      )}

      {/* Header - Always visible */}
      <Header currentPage={currentPage} onNavigate={setCurrentPage} />

      {/* Main Content - Conditionally rendered based on page */}
      {currentPage === 'home' && (
        <>
          {/* Hero loads immediately - critical for LCP */}
          <Hero />
          
          {/* Below-the-fold components - lazy loaded */}
          <Suspense fallback={<LoadingFallback />}>
            <ProductShowcase />
          </Suspense>
          
          <Suspense fallback={<LoadingFallback />}>
            <Features />
          </Suspense>
          
          <Suspense fallback={<LoadingFallback />}>
            <ShopJewelry />
          </Suspense>
          
          <Suspense fallback={<LoadingFallback />}>
            <JewelryParts />
          </Suspense>
          
          <Suspense fallback={<LoadingFallback />}>
            <About />
          </Suspense>
          
          <Suspense fallback={<LoadingFallback />}>
            <SizeComparison />
          </Suspense>
          
          <Suspense fallback={<LoadingFallback />}>
            <CustomOrder />
          </Suspense>
        </>
      )}

      {currentPage === 'contact' && (
        <Suspense fallback={<LoadingFallback />}>
          <Contact />
        </Suspense>
      )}

      {currentPage === 'faq' && (
        <Suspense fallback={<LoadingFallback />}>
          <FAQPage />
        </Suspense>
      )}

      {currentPage === 'test' && showOwnerPanel && (
        <Suspense fallback={<LoadingFallback />}>
          <TestSystem onNavigate={setCurrentPage} />
        </Suspense>
      )}

      {currentPage === 'email' && showOwnerPanel && (
        <Suspense fallback={<LoadingFallback />}>
          <QuickEmailGenerator />
        </Suspense>
      )}

      {currentPage === 'success' && (
        <Suspense fallback={<LoadingFallback />}>
          <SuccessPage />
        </Suspense>
      )}

      {currentPage === 'cancel' && (
        <Suspense fallback={<LoadingFallback />}>
          <CancelPage />
        </Suspense>
      )}

      {currentPage === 'discord-test' && showOwnerPanel && (
        <Suspense fallback={<LoadingFallback />}>
          <SimpleDiscordTest />
        </Suspense>
      )}

      {/* Footer and Navigation - Load based on page */}
      {currentPage !== 'test' && currentPage !== 'email' && currentPage !== 'success' && currentPage !== 'cancel' && (
        <>
          <MobileFloatingNav />
          <Footer onNavigate={setCurrentPage} />
        </>
      )}

      {/* Owner Panel Notification - Lazy loaded */}
      {showOwnerPanel && currentPage !== 'test' && currentPage !== 'email' && (
        <Suspense fallback={null}>
          <TestNotification 
            onOpenFullDashboard={() => {
              setCurrentPage('test');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenEmailGenerator={() => {
              setCurrentPage('email');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </Suspense>
      )}
      
      {/* Mobile Optimization Debug Panel - add ?mobile-status=true to URL to view */}
      <MobileOptimizationStatus />
    </div>
  );
}
