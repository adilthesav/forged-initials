import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Home, Package, Info, HelpCircle, MessageCircle, Sparkles, ShoppingBag, Truck, BookOpen } from 'lucide-react';
const logo = '/logo.png';

interface HeaderProps {
  currentPage: 'home' | 'contact' | 'faq' | 'test' | 'email' | 'track' | 'blog';
  onNavigate: (page: 'home' | 'contact' | 'faq' | 'test' | 'email' | 'track' | 'blog') => void;
}

const NAV_ITEMS = [
  { name: 'Home',          icon: Home,          sectionId: 'home' },
  { name: 'Gallery',       icon: Sparkles,      sectionId: 'gallery' },
  { name: 'Custom Orders', icon: ShoppingBag,   sectionId: 'custom-orders' },
  { name: 'Jewelry Parts', icon: Package,       sectionId: 'jewelry-parts' },
  { name: 'About',         icon: Info,          sectionId: 'about' },
  { name: 'Journal',       icon: BookOpen,      sectionId: null },
  { name: 'Track Order',   icon: Truck,         sectionId: null },
  { name: 'FAQ',           icon: HelpCircle,    sectionId: null },
  { name: 'Contact',       icon: MessageCircle, sectionId: null },
];

const SECTION_ORDER = ['home', 'gallery', 'custom-orders', 'jewelry-parts', 'about'];

const PAGE_TAB: Record<string, string> = {
  contact: 'Contact',
  faq: 'FAQ',
  track: 'Track Order',
  blog: 'Journal',
};

function scrollTop() {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}

export function Header({ currentPage, onNavigate }: HeaderProps) {
  const [scrollTab, setScrollTab] = useState('Home');
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 });
  const navRef = useRef<HTMLDivElement>(null);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const activeTab = currentPage !== 'home' ? (PAGE_TAB[currentPage] ?? 'Home') : scrollTab;

  // Measure and animate pill to active tab
  useLayoutEffect(() => {
    const btn = btnRefs.current[activeTab];
    const nav = navRef.current;
    if (!btn || !nav) return;
    const navLeft = nav.getBoundingClientRect().left;
    const btnRect = btn.getBoundingClientRect();
    setPillStyle({ left: btnRect.left - navLeft, width: btnRect.width });
  }, [activeTab]);

  // Re-measure on resize
  useEffect(() => {
    const onResize = () => {
      const btn = btnRefs.current[activeTab];
      const nav = navRef.current;
      if (!btn || !nav) return;
      const navLeft = nav.getBoundingClientRect().left;
      const btnRect = btn.getBoundingClientRect();
      setPillStyle({ left: btnRect.left - navLeft, width: btnRect.width });
    };
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, [activeTab]);

  // Scroll spy via IntersectionObserver
  useEffect(() => {
    if (currentPage !== 'home') return;

    // Track which sections are visible
    const visible = new Set<string>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) visible.add(e.target.id);
          else visible.delete(e.target.id);
        });

        // Pick the topmost visible section
        for (const id of SECTION_ORDER) {
          if (visible.has(id)) {
            const item = NAV_ITEMS.find(n => n.sectionId === id);
            if (item) { setScrollTab(item.name); return; }
          }
        }
        // Nothing visible = at very top
        setScrollTab('Home');
      },
      {
        // Trigger when section enters the middle band of the viewport
        rootMargin: '-10% 0px -55% 0px',
        threshold: 0,
      }
    );

    SECTION_ORDER.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [currentPage]);

  useEffect(() => {
    if (currentPage === 'home') setScrollTab('Home');
  }, [currentPage]);

  // Click handlers
  const scrollToId = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  const handleClick = (name: string) => {
    if (name === 'Contact')     { onNavigate('contact'); scrollTop(); return; }
    if (name === 'FAQ')         { onNavigate('faq');     scrollTop(); return; }
    if (name === 'Track Order') { onNavigate('track');   scrollTop(); return; }
    if (name === 'Journal')     { onNavigate('blog');    scrollTop(); return; }
    if (name === 'Home')        { onNavigate('home'); scrollTop(); setScrollTab('Home'); return; }

    const item = NAV_ITEMS.find(n => n.name === name);
    if (!item?.sectionId) return;
    if (currentPage !== 'home') {
      onNavigate('home');
      setTimeout(() => scrollToId(item.sectionId!), 160);
    } else {
      scrollToId(item.sectionId);
    }
  };

  const goToOrder = () => {
    if (currentPage !== 'home') { onNavigate('home'); setTimeout(() => scrollToId('custom-orders'), 160); }
    else scrollToId('custom-orders');
  };

  return (
    <header
      className="sticky top-0 left-0 right-0 z-50"
      style={{
        background: 'linear-gradient(180deg,rgba(255,252,248,0.98) 0%,rgba(255,255,255,0.95) 100%)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(201,168,76,0.15)',
        boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
      }}
    >
      {/* Logo + CTA */}
      <div className="container mx-auto px-4 sm:px-6 pt-2.5 pb-1.5 flex items-center justify-between">
        <div
          className="flex items-center gap-2.5 cursor-pointer group"
          onClick={() => { onNavigate('home'); scrollTop(); setScrollTab('Home'); }}
        >
          <div
            className="rounded-xl overflow-hidden transition-all duration-300 group-hover:scale-105"
            style={{
              border: '1.5px solid rgba(201,168,76,0.2)',
              boxShadow: '0 2px 10px rgba(201,168,76,0.1)',
              background: 'linear-gradient(135deg,#fffdf9,#fff)',
            }}
          >
            <img src={logo} alt="Forged Initials" className="h-11 sm:h-12 md:h-14 w-auto block p-1" />
          </div>
          <div className="hidden sm:block leading-tight">
            <p className="text-[9px] tracking-[0.25em] uppercase font-semibold" style={{ color: '#b8952e' }}>Handcrafted</p>
            <p className="text-[9px] tracking-[0.25em] uppercase font-semibold" style={{ color: '#b8952e' }}>Sterling Silver</p>
          </div>
        </div>

        <button
          onClick={goToOrder}
          className="flex-shrink-0 font-semibold tracking-wide text-xs sm:text-sm px-4 sm:px-5 py-2 sm:py-2.5 rounded-full transition-all duration-300 hover:scale-105"
          style={{
            background: 'linear-gradient(135deg,#c9a84c,#e8c96a,#c9a84c)',
            color: '#3a2800',
            boxShadow: '0 3px 14px rgba(201,168,76,0.35)',
            border: '1px solid rgba(201,168,76,0.4)',
          }}
        >
          ✦ Request Order
        </button>
      </div>

      {/* Divider — desktop only */}
      <div className="hidden md:block mx-6" style={{ height: 1, background: 'linear-gradient(90deg,transparent,rgba(201,168,76,0.25),transparent)' }} />

      {/* Nav tabs — desktop only */}
      <div className="hidden md:block overflow-x-auto no-scrollbar">
        <div
          ref={navRef}
          style={{ position: 'relative', display: 'flex', alignItems: 'center',
                   justifyContent: 'center', minWidth: '100%', width: 'max-content',
                   padding: '0 8px' }}
        >
          {/* Single sliding pill — never unmounts, just moves */}
          <motion.span
            aria-hidden
            animate={{ left: pillStyle.left, width: pillStyle.width }}
            transition={{ type: 'spring', stiffness: 420, damping: 36 }}
            style={{
              position: 'absolute',
              top: 4,
              bottom: 4,
              borderRadius: 6,
              background: 'linear-gradient(135deg,rgba(201,168,76,0.2),rgba(232,201,106,0.12))',
              border: '1px solid rgba(201,168,76,0.25)',
              pointerEvents: 'none',
            }}
          />

          {/* Single sliding underline */}
          <motion.span
            aria-hidden
            animate={{
              left: pillStyle.left + 8,
              width: Math.max(0, pillStyle.width - 16),
            }}
            transition={{ type: 'spring', stiffness: 420, damping: 36 }}
            style={{
              position: 'absolute',
              bottom: 0,
              height: 2,
              borderRadius: 9999,
              background: 'linear-gradient(90deg,#c9a84c,#e8c96a)',
              pointerEvents: 'none',
            }}
          />

          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.name;
            return (
              <button
                key={item.name}
                ref={el => { btnRefs.current[item.name] = el; }}
                onClick={() => handleClick(item.name)}
                style={{
                  position: 'relative', zIndex: 1,
                  display: 'flex', alignItems: 'center', gap: 5,
                  whiteSpace: 'nowrap',
                  padding: '10px 12px',
                  fontSize: 12, fontWeight: active ? 600 : 500,
                  border: 'none', background: 'transparent', cursor: 'pointer',
                  color: active ? '#8a6710' : 'rgba(30,20,5,0.45)',
                  transition: 'color 0.2s ease',
                  flexShrink: 0, borderRadius: 6,
                }}
              >
                <Icon style={{
                  width: 13, height: 13, flexShrink: 0,
                  color: active ? '#c9a84c' : 'rgba(30,20,5,0.28)',
                  transition: 'color 0.2s ease',
                }} />
                {item.name}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
