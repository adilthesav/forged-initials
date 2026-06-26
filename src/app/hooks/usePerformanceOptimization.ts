import { useEffect } from 'react';

/**
 * Hook to apply various performance optimizations for mobile devices
 */
export function usePerformanceOptimization() {
  useEffect(() => {
    // Detect if user is on a slow connection
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    const isSlowConnection = connection?.effectiveType ? ['slow-2g', '2g', '3g'].includes(connection.effectiveType) : false;

    if (isSlowConnection) {
      // Reduce animation duration on slow connections
      document.documentElement.style.setProperty('--animation-duration', '0.1s');
    }

    // Optimize scroll performance on mobile
    if ('ontouchstart' in window) {
      document.body.classList.add('touch-device');
    }

    // Reduce motion if user prefers
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      document.documentElement.classList.add('reduce-motion');
    }

    // Cleanup
    return () => {
      document.documentElement.style.removeProperty('--animation-duration');
    };
  }, []);
}

/**
 * Hook to debounce scroll events for better performance
 */
export function useOptimizedScroll(callback: () => void, delay: number = 100) {
  useEffect(() => {
    let timeoutId: number;
    
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(callback, delay);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [callback, delay]);
}

/**
 * Hook to detect if element is in viewport (for lazy loading components)
 */
export function useInViewport(ref: React.RefObject<HTMLElement>, options?: IntersectionObserverInit) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add('in-viewport');
        }
      },
      { threshold: 0.1, ...options }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [ref, options]);
}
