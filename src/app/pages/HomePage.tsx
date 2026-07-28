import { Hero } from '../components/Hero';
import { Features } from '../components/Features';
import { ProductShowcase } from '../components/ProductShowcase';
import { SizeComparison } from '../components/SizeComparison';
import { JewelryParts } from '../components/JewelryParts';
import { About } from '../components/About';
import { CustomOrder } from '../components/CustomOrder';

export function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <ProductShowcase />
      <SizeComparison />
      <JewelryParts />
      <About />
      <CustomOrder />
    </>
  );
}
