/**
 * Social Share Image Component
 * 
 * This component doesn't render anything visible on the page.
 * It generates a proper Open Graph image URL for social media sharing.
 * 
 * For production, you would:
 * 1. Create a 1200x630px branded image with your logo and product
 * 2. Upload it to your hosting
 * 3. Replace the Unsplash URL with your custom image
 */

interface SocialShareConfig {
  title: string;
  description: string;
  imageUrl?: string;
  imageAlt?: string;
}

export function getSocialShareImage(page: 'home' | 'contact' | 'product' | 'about'): string {
  // For now, using high-quality Unsplash images
  // Replace these with your custom branded images in production
  
  const images = {
    home: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&h=630&fit=crop&q=80',
    contact: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=1200&h=630&fit=crop&q=80',
    product: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=1200&h=630&fit=crop&q=80',
    about: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=1200&h=630&fit=crop&q=80'
  };
  
  return images[page] || images.home;
}

export const socialSharePresets: Record<string, SocialShareConfig> = {
  home: {
    title: "Forged Initials - Custom Handcrafted 925 Sterling Silver Letter Jewelry",
    description: "Custom handcrafted 925 sterling silver letter jewelry. Every A–Z initial is made to order — timeless, personal, and designed by Adil Ali.",
    imageUrl: getSocialShareImage('home'),
    imageAlt: "Handcrafted sterling silver letter jewelry on elegant background"
  },
  contact: {
    title: "Contact Forged Initials - Custom Sterling Silver Jewelry",
    description: "Get in touch for custom handcrafted 925 sterling silver letter jewelry. Follow us on Instagram, Facebook, and Twitter for personalized orders.",
    imageUrl: getSocialShareImage('contact'),
    imageAlt: "Contact us for custom jewelry inquiries"
  },
  product: {
    title: "Custom Letter Jewelry - 925 Sterling Silver | Forged Initials",
    description: "Choose from A-Z letters in Small, Medium, or Large. Each piece handcrafted from 925 sterling silver. $3 per letter + flat $10 shipping to Houston.",
    imageUrl: getSocialShareImage('product'),
    imageAlt: "Sterling silver letter jewelry collection"
  },
  about: {
    title: "About Adil Ali - Master Craftsman at Forged Initials",
    description: "Meet the artisan behind Forged Initials. Specializing in handcrafted 925 sterling silver letter jewelry, each piece made with precision and care.",
    imageUrl: getSocialShareImage('about'),
    imageAlt: "Adil Ali crafting custom sterling silver jewelry"
  }
};

/**
 * Instructions for creating your custom Open Graph image:
 * 
 * 1. Size: 1200 x 630 pixels (Facebook/LinkedIn standard)
 * 2. Format: JPG or PNG (JPG recommended for smaller file size)
 * 3. File size: Under 1MB for fast loading
 * 
 * Design suggestions:
 * - Feature your actual product photos (A-Z letters)
 * - Include "Forged Initials" branding
 * - Add tagline: "Custom Handcrafted 925 Sterling Silver"
 * - Use your brand colors (amber/gold on dark background)
 * - Keep text large and readable (min 40px font size)
 * - Leave "safe zones" on edges (avoid cropping)
 * 
 * Safe zones:
 * - Facebook: 1200x630 (no cropping)
 * - Twitter: 1200x600 (crops 15px top/bottom)
 * - LinkedIn: 1200x627 (crops slightly)
 * 
 * Upload to:
 * - Your website's /public/images/ folder
 * - Or use a CDN like Cloudinary
 * 
 * Then update the imageUrl in socialSharePresets above.
 */

export default { getSocialShareImage, socialSharePresets };
