import { useState, useEffect } from 'react';
import { ArrowUp, Mail, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

export function MobileFloatingNav() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let timeoutId: number;
    
    const toggleVisibility = () => {
      // Debounce scroll events for better performance
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        if (window.pageYOffset > 300) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      }, 100);
    };

    // Use passive listener for better scroll performance
    window.addEventListener('scroll', toggleVisibility, { passive: true });
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const scrollToOrders = () => {
    const element = document.getElementById('custom-orders');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Floating Action Buttons */}
      <div
        className={`fixed bottom-6 right-6 z-40 md:hidden transition-all duration-300 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'
        }`}
      >
        <div className="flex flex-col gap-3 items-end">
          {/* Request Order Button - Primary CTA */}
          <div className="relative group">
            <Button
              onClick={scrollToOrders}
              className="h-16 w-16 rounded-2xl shadow-xl hover:shadow-2xl transition-all active:scale-95 bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 border-2 border-white/20"
              size="icon"
            >
              <div className="relative">
                <Mail className="w-7 h-7" />
                <Sparkles className="w-3 h-3 absolute -top-1 -right-1 animate-pulse" />
              </div>
            </Button>
            {/* Tooltip */}
            <div className="absolute right-20 top-1/2 -translate-y-1/2 bg-black/90 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none backdrop-blur-sm">
              Add to Order
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rotate-45 w-2 h-2 bg-black/90"></div>
            </div>
          </div>
          
          {/* Scroll to Top Button */}
          <div className="relative group">
            <Button
              onClick={scrollToTop}
              variant="secondary"
              className="h-14 w-14 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 border-2 border-primary/30 bg-white/95 hover:bg-white backdrop-blur-sm"
              size="icon"
            >
              <ArrowUp className="w-5 h-5 text-primary" />
            </Button>
            {/* Tooltip */}
            <div className="absolute right-20 top-1/2 -translate-y-1/2 bg-black/90 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none backdrop-blur-sm">
              Back to Top
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rotate-45 w-2 h-2 bg-black/90"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
