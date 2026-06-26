import { useEffect } from 'react';

interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
}

/**
 * Hook to track Core Web Vitals for performance monitoring
 * Logs metrics to console in development mode
 */
export function useWebVitals(enableLogging = false) {
  useEffect(() => {
    // Only track in browsers that support the API
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return;
    }

    const vitalsUrl = 'https://unpkg.com/web-vitals@3/dist/web-vitals.iife.js';

    // Dynamically load web-vitals library
    const loadWebVitals = async () => {
      try {
        // Check if already loaded
        if ((window as any).webVitals) {
          initializeMetrics();
          return;
        }

        // Load the script
        const script = document.createElement('script');
        script.src = vitalsUrl;
        script.async = true;
        script.onload = () => initializeMetrics();
        document.head.appendChild(script);
      } catch (error) {
        if (enableLogging) {
          console.error('Failed to load web-vitals:', error);
        }
      }
    };

    const initializeMetrics = () => {
      const webVitals = (window as any).webVitals;
      if (!webVitals) return;

      const handleMetric = (metric: any) => {
        const { name, value, rating } = metric;

        // Log to console if enabled
        if (enableLogging) {
          const emoji = rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌';
          console.log(`${emoji} ${name}: ${value.toFixed(2)}ms (${rating})`);
        }

        // Send to analytics (if you have an analytics service)
        // Example: sendToAnalytics({ name, value, rating });

        // Store in localStorage for debugging
        try {
          const vitals = JSON.parse(localStorage.getItem('web-vitals') || '[]');
          vitals.push({
            name,
            value: value.toFixed(2),
            rating,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent.substring(0, 50)
          });
          // Keep only last 20 measurements
          if (vitals.length > 20) vitals.shift();
          localStorage.setItem('web-vitals', JSON.stringify(vitals));
        } catch (e) {
          // Ignore localStorage errors
        }
      };

      // Track all Core Web Vitals
      webVitals.onCLS(handleMetric);  // Cumulative Layout Shift
      webVitals.onFID(handleMetric);  // First Input Delay
      webVitals.onLCP(handleMetric);  // Largest Contentful Paint
      webVitals.onFCP(handleMetric);  // First Contentful Paint
      webVitals.onTTFB(handleMetric); // Time to First Byte

      // Also track INP (Interaction to Next Paint) if available
      if (webVitals.onINP) {
        webVitals.onINP(handleMetric);
      }
    };

    // Only load if in development or explicitly enabled
    if (enableLogging || process.env.NODE_ENV === 'development') {
      loadWebVitals();
    }

    return () => {
      // Cleanup if needed
    };
  }, [enableLogging]);
}

/**
 * Get stored Web Vitals from localStorage
 */
export function getStoredWebVitals(): WebVitalsMetric[] {
  try {
    const vitals = localStorage.getItem('web-vitals');
    return vitals ? JSON.parse(vitals) : [];
  } catch {
    return [];
  }
}

/**
 * Clear stored Web Vitals
 */
export function clearWebVitals() {
  try {
    localStorage.removeItem('web-vitals');
  } catch {
    // Ignore
  }
}

/**
 * Get performance insights based on current metrics
 */
export function getPerformanceInsights(): string[] {
  const vitals = getStoredWebVitals();
  const insights: string[] = [];

  if (vitals.length === 0) {
    return ['No performance metrics collected yet'];
  }

  // Analyze LCP (Largest Contentful Paint)
  const lcp = vitals.filter(v => v.name === 'LCP').slice(-1)[0];
  if (lcp) {
    if (lcp.rating === 'poor') {
      insights.push('🐌 Slow page load detected. Consider optimizing images and reducing JavaScript.');
    } else if (lcp.rating === 'good') {
      insights.push('✅ Great page load performance!');
    }
  }

  // Analyze CLS (Cumulative Layout Shift)
  const cls = vitals.filter(v => v.name === 'CLS').slice(-1)[0];
  if (cls) {
    if (cls.rating === 'poor') {
      insights.push('⚠️ Layout shifts detected. Add size attributes to images and reserve space for dynamic content.');
    } else if (cls.rating === 'good') {
      insights.push('✅ Stable layout - no unwanted shifts!');
    }
  }

  // Analyze FID/INP (Interaction responsiveness)
  const fid = vitals.filter(v => v.name === 'FID' || v.name === 'INP').slice(-1)[0];
  if (fid) {
    if (fid.rating === 'poor') {
      insights.push('🖱️ Slow interaction response. Reduce JavaScript execution time.');
    } else if (fid.rating === 'good') {
      insights.push('✅ Fast and responsive interactions!');
    }
  }

  return insights.length > 0 ? insights : ['Performance metrics look good!'];
}
