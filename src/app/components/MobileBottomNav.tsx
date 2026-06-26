import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home, Sparkles, ShoppingBag, Package,
  Info, BookOpen, Truck, HelpCircle, MessageCircle, X, MoreHorizontal
} from 'lucide-react';

type Page = 'home' | 'contact' | 'faq' | 'test' | 'email' | 'track' | 'blog';

interface Props {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}

// 5 primary tabs always visible in the bar
const PRIMARY = [
  { name: 'Home',          icon: Home,         page: 'home'    as Page, sectionId: 'home' },
  { name: 'Gallery',       icon: Sparkles,     page: null,             sectionId: 'gallery' },
  { name: 'Order',         icon: ShoppingBag,  page: null,             sectionId: 'custom-orders' },
  { name: 'Contact',       icon: MessageCircle,page: 'contact' as Page, sectionId: null },
  { name: 'More',          icon: MoreHorizontal,page: null,            sectionId: null },
];

// All tabs shown in the "More" drawer
const ALL_TABS = [
  { name: 'Home',          icon: Home,          page: 'home'    as Page, sectionId: 'home' },
  { name: 'Gallery',       icon: Sparkles,      page: null,              sectionId: 'gallery' },
  { name: 'Custom Orders', icon: ShoppingBag,   page: null,              sectionId: 'custom-orders' },
  { name: 'Jewelry Parts', icon: Package,       page: null,              sectionId: 'jewelry-parts' },
  { name: 'About',         icon: Info,          page: null,              sectionId: 'about' },
  { name: 'Journal',       icon: BookOpen,      page: 'blog'    as Page, sectionId: null },
  { name: 'Track Order',   icon: Truck,         page: 'track'   as Page, sectionId: null },
  { name: 'FAQ',           icon: HelpCircle,    page: 'faq'     as Page, sectionId: null },
  { name: 'Contact',       icon: MessageCircle, page: 'contact' as Page, sectionId: null },
];

const PAGE_TAB: Record<string, string> = {
  contact: 'Contact', faq: 'FAQ', track: 'Track Order', blog: 'Journal',
};

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

export function MobileBottomNav({ currentPage, onNavigate }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrollTab, setScrollTab] = useState('Home');

  const activeTab = currentPage !== 'home'
    ? (PAGE_TAB[currentPage] ?? 'Home')
    : scrollTab;

  // Scroll spy
  useEffect(() => {
    if (currentPage !== 'home') return;
    const sections = ['home', 'gallery', 'custom-orders', 'jewelry-parts', 'about'];
    const detect = () => {
      const trigger = window.scrollY + window.innerHeight * 0.4;
      let winner = 'Home';
      const tabMap: Record<string, string> = {
        'home': 'Home', 'gallery': 'Gallery', 'custom-orders': 'Order',
        'jewelry-parts': 'Jewelry Parts', 'about': 'About',
      };
      for (const id of sections) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top + window.scrollY;
        if (top <= trigger) winner = tabMap[id] ?? winner;
      }
      setScrollTab(winner);
    };
    detect();
    window.addEventListener('scroll', detect, { passive: true });
    return () => window.removeEventListener('scroll', detect);
  }, [currentPage]);

  useEffect(() => {
    if (currentPage === 'home') setScrollTab('Home');
  }, [currentPage]);

  // Close drawer on outside tap / scroll
  useEffect(() => {
    if (!drawerOpen) return;
    const close = () => setDrawerOpen(false);
    window.addEventListener('scroll', close, { passive: true });
    return () => window.removeEventListener('scroll', close);
  }, [drawerOpen]);

  const handleTab = (tab: typeof ALL_TABS[0]) => {
    setDrawerOpen(false);
    if (tab.page) {
      onNavigate(tab.page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab.sectionId) {
      if (currentPage !== 'home') {
        onNavigate('home');
        setTimeout(() => scrollToSection(tab.sectionId!), 160);
      } else {
        scrollToSection(tab.sectionId);
      }
    }
  };

  const isActive = (name: string) => {
    if (name === 'More') return drawerOpen;
    if (name === 'Order') return activeTab === 'Order' || activeTab === 'Custom Orders';
    return activeTab === name;
  };

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 md:hidden"
            style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
            onClick={() => setDrawerOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Bottom drawer — all tabs */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            key="drawer"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 380, damping: 38 }}
            className="fixed bottom-[72px] left-0 right-0 z-50 md:hidden rounded-t-3xl overflow-hidden"
            style={{
              background: 'rgba(255,252,248,0.98)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 -8px 40px rgba(0,0,0,0.12)',
              border: '1px solid rgba(201,168,76,0.15)',
            }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(0,0,0,0.12)' }} />
            </div>

            <div className="flex items-center justify-between px-5 py-2">
              <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#b8952e' }}>Navigate</p>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.06)' }}
              >
                <X className="w-3.5 h-3.5 text-stone-500" />
              </button>
            </div>

            {/* 3-column grid of all tabs */}
            <div className="grid grid-cols-3 gap-1.5 px-4 pb-5 pt-1">
              {ALL_TABS.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.name || (tab.name === 'Custom Orders' && activeTab === 'Order');
                return (
                  <button
                    key={tab.name}
                    onClick={() => handleTab(tab)}
                    className="flex flex-col items-center gap-1.5 py-3.5 px-2 rounded-2xl transition-all duration-150 active:scale-95"
                    style={{
                      background: active
                        ? 'linear-gradient(135deg,rgba(201,168,76,0.18),rgba(232,201,106,0.1))'
                        : 'rgba(0,0,0,0.03)',
                      border: active ? '1px solid rgba(201,168,76,0.3)' : '1px solid transparent',
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        background: active
                          ? 'linear-gradient(135deg,#c9a84c,#e8c96a)'
                          : 'rgba(0,0,0,0.06)',
                      }}
                    >
                      <Icon
                        className="w-5 h-5"
                        style={{ color: active ? '#2a1800' : 'rgba(30,20,5,0.45)' }}
                      />
                    </div>
                    <span
                      className="text-[10px] font-semibold text-center leading-tight"
                      style={{ color: active ? '#8a6710' : 'rgba(30,20,5,0.5)' }}
                    >
                      {tab.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed bottom bar */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
        style={{
          background: 'rgba(255,252,248,0.96)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(201,168,76,0.15)',
          boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <div className="flex items-center justify-around px-2 h-[64px]">
          {PRIMARY.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.name);
            const isMore = tab.name === 'More';

            return (
              <button
                key={tab.name}
                onClick={() => {
                  if (isMore) {
                    setDrawerOpen(v => !v);
                  } else {
                    handleTab(tab as any);
                  }
                }}
                className="flex flex-col items-center justify-center gap-0.5 flex-1 h-full relative transition-all duration-150 active:scale-90"
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {/* Active indicator dot */}
                {active && !isMore && (
                  <motion.div
                    layoutId="bottom-active-dot"
                    className="absolute top-1 w-1 h-1 rounded-full"
                    style={{ background: '#c9a84c' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}

                {/* Icon container */}
                <div
                  className="w-10 h-8 rounded-xl flex items-center justify-center transition-all duration-200"
                  style={{
                    background: active
                      ? 'linear-gradient(135deg,rgba(201,168,76,0.2),rgba(232,201,106,0.1))'
                      : 'transparent',
                    transform: active ? 'translateY(-1px)' : 'none',
                  }}
                >
                  <Icon
                    style={{
                      width: 20, height: 20,
                      color: active ? '#c9a84c' : 'rgba(30,20,5,0.35)',
                      transition: 'color 0.2s ease',
                    }}
                  />
                </div>

                {/* Label */}
                <span
                  className="text-[10px] font-semibold tracking-tight"
                  style={{
                    color: active ? '#8a6710' : 'rgba(30,20,5,0.4)',
                    transition: 'color 0.2s ease',
                  }}
                >
                  {tab.name}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom spacer so content isn't hidden under the bar */}
      <div className="h-[64px] md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom,0px)' }} />
    </>
  );
}
