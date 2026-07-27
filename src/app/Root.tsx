import { useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobileFloatingNav } from './components/MobileFloatingNav';
import { ConsoleDeploymentGuide } from './components/ConsoleDeploymentGuide';
import { DeploymentBanner } from './components/DeploymentBanner';
import { SEOHead, SEOPresets } from './components/SEOHead';
import { SchemaMarkup, SchemaTypes } from './components/SchemaMarkup';
import { TestNotification } from './components/TestNotification';
import { usePerformanceOptimization } from './hooks/usePerformanceOptimization';

type Page = 'home' | 'contact' | 'faq' | 'track' | 'blog' | 'test' | 'email';

function pathToPage(pathname: string): Page {
  if (pathname === '/contact') return 'contact';
  if (pathname === '/faq') return 'faq';
  if (pathname === '/track') return 'track';
  if (pathname.startsWith('/blog')) return 'blog';
  if (pathname === '/test') return 'test';
  if (pathname === '/email') return 'email';
  return 'home';
}

const PAGE_TO_PATH: Record<Page, string> = {
  home: '/',
  contact: '/contact',
  faq: '/faq',
  track: '/track',
  blog: '/blog',
  test: '/test',
  email: '/email',
};

export function Root() {
  usePerformanceOptimization();
  const location = useLocation();
  const navigate = useNavigate();
  const [showOwnerPanel, setShowOwnerPanel] = useState(false);

  const currentPage = pathToPage(location.pathname);

  const handleNavigate = (page: Page) => {
    navigate(PAGE_TO_PATH[page] ?? '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.documentElement.scrollTop = 0;
  };

  useEffect(() => {
    const ownerMode = localStorage.getItem('forged_owner_mode');
    if (ownerMode === 'enabled') setShowOwnerPanel(true);

    const handleOwnerToggle = () => {
      const current = localStorage.getItem('forged_owner_mode') === 'enabled';
      const next = !current;
      localStorage.setItem('forged_owner_mode', next ? 'enabled' : 'disabled');
      setShowOwnerPanel(next);
    };

    window.addEventListener('toggleOwnerMode', handleOwnerToggle);
    return () => window.removeEventListener('toggleOwnerMode', handleOwnerToggle);
  }, []);

  return (
    <div className="min-h-screen">
      <ConsoleDeploymentGuide />
      <DeploymentBanner />

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
      {currentPage === 'track' && (
        <SEOHead
          title="Track Your Order - Forged Initials"
          description="Track your custom jewelry order status and shipping information"
          keywords="track order, order status, shipping tracking, delivery status"
          page="track"
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

      <Header currentPage={currentPage} onNavigate={handleNavigate} />

      <main>
        <Outlet />
      </main>

      {currentPage === 'home' && <MobileFloatingNav />}

      <MobileBottomNav currentPage={currentPage} onNavigate={handleNavigate} />

      {currentPage !== 'test' && currentPage !== 'email' && (
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
