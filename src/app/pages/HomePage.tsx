import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { Hero } from '../components/Hero';
import { Features } from '../components/Features';
import { ShopSection } from '../components/ShopSection';
import { ProductShowcase } from '../components/ProductShowcase';
import { SizeComparison } from '../components/SizeComparison';
import { JewelryParts } from '../components/JewelryParts';
import { About } from '../components/About';
import { CustomOrder } from '../components/CustomOrder';

// Links like /#custom-orders go straight to that section. The page grows as
// products and images load, so this repeats until the visitor scrolls, taps or types.
function useScrollToHash() {
  const { hash } = useLocation();

  useEffect(() => {
    const id = hash.slice(1);
    if (!id) return;
    const go = () => document.getElementById(id)?.scrollIntoView();
    const timers = [0, 500, 1500, 3000].map((ms) => setTimeout(go, ms));
    const stop = () => timers.forEach(clearTimeout);
    const events = ['wheel', 'pointerdown', 'keydown'];
    events.forEach((name) => window.addEventListener(name, stop, { once: true, passive: true }));
    return () => {
      stop();
      events.forEach((name) => window.removeEventListener(name, stop));
    };
  }, [hash]);
}

export function HomePage() {
  useScrollToHash();

  return (
    <>
      <Hero />
      <Features />
      <ShopSection />
      <ProductShowcase />
      <SizeComparison />
      <JewelryParts />
      <About />
      <CustomOrder />
    </>
  );
}
