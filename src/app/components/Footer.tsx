import { Instagram, Facebook, Twitter, Send, ArrowRight } from 'lucide-react';
import { useState } from 'react';

interface FooterProps {
  onNavigate: (page: 'home' | 'contact' | 'test' | 'track' | 'blog') => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const [clickCount, setClickCount] = useState(0);

  const nav = (page: 'home' | 'contact' | 'track') => {
    onNavigate(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOwnerActivation = () => {
    const n = clickCount + 1;
    setClickCount(n);
    if (n === 5) { window.dispatchEvent(new Event('toggleOwnerMode')); setClickCount(0); }
    setTimeout(() => setClickCount(0), 2000);
  };

  const links = [
    { label: 'Gallery',        href: '#gallery' },
    { label: 'Custom Orders',  href: '#custom-orders' },
    { label: 'Jewelry Parts',  href: '#jewelry-parts' },
    { label: 'About Us',       href: '#about' },
    { label: 'Track Order',    action: () => nav('track') },
    { label: 'Contact Us',     action: () => nav('contact') },
    { label: 'Journal',        action: () => onNavigate('blog') },
  ];

  const socials = [
    { icon: Instagram, href: 'https://www.instagram.com/forged_initials/', label: 'Instagram' },
    { icon: Facebook,  href: 'https://www.facebook.com/share/1GG4H5dfQx/?mibextid=wwXIfr', label: 'Facebook' },
    { icon: Twitter,   href: 'https://x.com/forged_initails?s=21', label: 'Twitter/X' },
    { icon: Send,      href: 'https://t.me/adilali08', label: 'Telegram' },
  ];

  return (
    <footer style={{ background: 'linear-gradient(135deg,#0a0a0a 0%,#1a1a2e 100%)' }}>
      <div className="container mx-auto px-5 sm:px-6 py-12 md:py-16">

        {/* Top section */}
        <div className="flex flex-col md:flex-row gap-10 md:gap-16 mb-10 md:mb-12">

          {/* Brand */}
          <div className="md:max-w-xs">
            <div className="flex items-center gap-2.5 mb-4">
              <img src="/logo.png" alt="Forged Initials" className="h-10 w-auto rounded-lg" />
              <span className="text-white font-bold text-lg">Forged Initials</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed mb-5">
              Handcrafted 925 sterling silver letter jewelry made to order. Every piece tells your story.
            </p>
            {/* Socials */}
            <div className="flex gap-2.5">
              {socials.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
                  style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
                >
                  <Icon className="w-4 h-4 text-white/70" />
                </a>
              ))}
            </div>
          </div>

          {/* Links — 2 columns on mobile, inline on desktop */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3">
            {links.map(({ label, href, action }) => (
              action
                ? <button key={label} onClick={action} className="text-left text-sm text-white/50 hover:text-white transition-colors">{label}</button>
                : <a key={label} href={href} className="text-sm text-white/50 hover:text-white transition-colors">{label}</a>
            ))}
          </div>

          {/* CTA */}
          <div className="md:max-w-[220px]">
            <p className="text-white/70 text-sm font-semibold mb-2">Ready to order?</p>
            <p className="text-white/40 text-xs mb-4 leading-relaxed">Custom letters handcrafted just for you. Houston delivery only.</p>
            <a
              href="#custom-orders"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105"
              style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c96a)', color: '#2a1800' }}
            >
              Request Order <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px mb-6" style={{ background: 'rgba(255,255,255,0.06)' }} />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-white/30">
          <p onClick={handleOwnerActivation} className="cursor-default select-none">
            © 2025 Forged Initials. All rights reserved.
          </p>
          <div className="flex gap-5">
            <a href="#privacy"   className="hover:text-white/60 transition-colors">Privacy</a>
            <a href="#terms"     className="hover:text-white/60 transition-colors">Terms</a>
            <a href="#shipping"  className="hover:text-white/60 transition-colors">Shipping</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
