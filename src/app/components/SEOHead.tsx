import { useEffect } from 'react';
import { getSocialShareImage } from './SocialShareImage';
const faviconImage = '/logo.png';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  page?: 'home' | 'contact' | 'about' | 'faq';
  canonicalUrl?: string;
}

export function SEOHead({ 
  title = "Forged Initials - Custom Handcrafted 925 Sterling Silver Letter Jewelry",
  description = "Custom handcrafted 925 sterling silver letter jewelry. Every A–Z initial is made to order — timeless, personal, and designed by Adil Ali at Forged Initials.",
  keywords = "sterling silver jewelry, custom letter jewelry, handcrafted silver, personalized initials, 925 silver letters, custom jewelry Houston, Adil Ali jewelry, letter pendants, initial jewelry, made to order silver",
  ogImage,
  page = 'home',
  canonicalUrl
}: SEOHeadProps) {
  
  // Use improved social share images if no custom image provided
  const socialImage = ogImage || getSocialShareImage(page);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://forgedinitials.com';
  const canonical = canonicalUrl || baseUrl;
  
  useEffect(() => {
    // Update page title
    document.title = title;
    
    // Update meta description
    updateMetaTag('name', 'description', description);
    
    // Update meta keywords
    updateMetaTag('name', 'keywords', keywords);
    
    // Canonical URL (prevent duplicate content)
    updateLinkTag('canonical', canonical);
    
    // Update Open Graph tags (for social media sharing)
    updateMetaTag('property', 'og:title', title);
    updateMetaTag('property', 'og:description', description);
    updateMetaTag('property', 'og:image', socialImage);
    updateMetaTag('property', 'og:image:width', '1200');
    updateMetaTag('property', 'og:image:height', '630');
    updateMetaTag('property', 'og:image:alt', `${title} - Professional jewelry photography`);
    updateMetaTag('property', 'og:type', 'website');
    updateMetaTag('property', 'og:url', canonical);
    updateMetaTag('property', 'og:site_name', 'Forged Initials');
    updateMetaTag('property', 'og:locale', 'en_US');
    
    // Update Twitter Card tags
    updateMetaTag('name', 'twitter:card', 'summary_large_image');
    updateMetaTag('name', 'twitter:title', title);
    updateMetaTag('name', 'twitter:description', description);
    updateMetaTag('name', 'twitter:image', socialImage);
    updateMetaTag('name', 'twitter:image:alt', `${title} - Professional jewelry photography`);
    updateMetaTag('name', 'twitter:site', '@forgedinitials');
    updateMetaTag('name', 'twitter:creator', '@forgedinitials');
    
    // Google Search Console verification
    updateMetaTag('name', 'google-site-verification', 'LKuxnxQps-cP9lEpRARD59aECZTv8_hmrcKheuDMr2s');

    // Additional SEO meta tags
    updateMetaTag('name', 'author', 'Adil Ali');
    updateMetaTag('name', 'robots', 'index, follow, max-image-preview:large');
    updateMetaTag('name', 'viewport', 'width=device-width, initial-scale=1.0');
    updateMetaTag('name', 'theme-color', '#1a1a1a');
    updateMetaTag('name', 'format-detection', 'telephone=no');
    
    // Apple mobile web app tags
    updateMetaTag('name', 'apple-mobile-web-app-capable', 'yes');
    updateMetaTag('name', 'apple-mobile-web-app-status-bar-style', 'black-translucent');
    updateMetaTag('name', 'apple-mobile-web-app-title', 'Forged Initials');
    
    // Preconnect to external domains for better performance
    updatePreconnectTag('https://images.unsplash.com');
    updatePreconnectTag('https://js.stripe.com');
    updatePreconnectTag('https://api.stripe.com');
    
    // DNS prefetch for additional resources
    updateDNSPrefetchTag('https://fonts.googleapis.com');
    
    // Favicon - Standard icon
    updateLinkTag('icon', faviconImage);
    updateFaviconWithType('icon', 'image/png', faviconImage);
    
    // Apple Touch Icon for iOS devices (multiple sizes for better quality)
    updateLinkTag('apple-touch-icon', faviconImage);
    updateLinkTagWithSizes('apple-touch-icon', '180x180', faviconImage);
    updateLinkTagWithSizes('apple-touch-icon', '152x152', faviconImage);
    updateLinkTagWithSizes('apple-touch-icon', '120x120', faviconImage);
    updateLinkTagWithSizes('apple-touch-icon', '76x76', faviconImage);
    
    // Android Chrome icon
    updateLinkTagWithSizes('icon', '192x192', faviconImage);
    updateLinkTagWithSizes('icon', '512x512', faviconImage);
    
  }, [title, description, keywords, socialImage, page, canonical]);
  
  return null; // This component doesn't render anything
}

// Helper function to update or create meta tags
function updateMetaTag(attribute: string, attributeValue: string, content: string) {
  let element = document.querySelector(`meta[${attribute}="${attributeValue}"]`);
  
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, attributeValue);
    document.head.appendChild(element);
  }
  
  element.setAttribute('content', content);
}

// Helper function to update or create link tags (for canonical URL)
function updateLinkTag(rel: string, href: string) {
  let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
  
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  
  element.href = href;
}

// Helper function to update or create favicon with type attribute
function updateFaviconWithType(rel: string, type: string, href: string) {
  let element = document.querySelector(`link[rel="${rel}"][type="${type}"]`) as HTMLLinkElement;
  
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    element.setAttribute('type', type);
    document.head.appendChild(element);
  }
  
  element.href = href;
}

// Helper function to update or create link tags with sizes attribute
function updateLinkTagWithSizes(rel: string, sizes: string, href: string) {
  let element = document.querySelector(`link[rel="${rel}"][sizes="${sizes}"]`) as HTMLLinkElement;
  
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    element.setAttribute('sizes', sizes);
    document.head.appendChild(element);
  }
  
  element.href = href;
}

// Helper function to add preconnect for external domains
function updatePreconnectTag(href: string) {
  let element = document.querySelector(`link[rel="preconnect"][href="${href}"]`) as HTMLLinkElement;
  
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'preconnect');
    element.setAttribute('href', href);
    element.setAttribute('crossorigin', 'anonymous');
    document.head.appendChild(element);
  }
}

// Helper function to add DNS prefetch
function updateDNSPrefetchTag(href: string) {
  let element = document.querySelector(`link[rel="dns-prefetch"][href="${href}"]`) as HTMLLinkElement;
  
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'dns-prefetch');
    element.setAttribute('href', href);
    document.head.appendChild(element);
  }
}

// Preset configurations for different pages
export const SEOPresets = {
  home: {
    title: "Forged Initials - Custom Handcrafted 925 Sterling Silver Letter Jewelry",
    description: "Custom handcrafted 925 sterling silver letter jewelry. Every A–Z initial is made to order — timeless, personal, and designed by Adil Ali at Forged Initials. Plus quality jewelry parts.",
    keywords: "sterling silver jewelry, custom letter jewelry, handcrafted silver, personalized initials, 925 silver letters, custom jewelry Houston, Adil Ali jewelry, letter pendants, initial jewelry, made to order silver"
  },
  contact: {
    title: "Contact Us - Forged Initials | Custom Sterling Silver Jewelry",
    description: "Get in touch with Forged Initials for custom 925 sterling silver letter jewelry. Follow us on Instagram, Facebook, and Twitter for personalized orders and designs.",
    keywords: "contact Forged Initials, custom jewelry orders, Houston silver jewelry, order custom letters, personalized jewelry Houston"
  },
  about: {
    title: "About Adil Ali - Master Craftsman at Forged Initials",
    description: "Meet Adil Ali, the master craftsman behind Forged Initials. Specializing in handcrafted 925 sterling silver letter jewelry, each piece is made to order with precision and care.",
    keywords: "Adil Ali jeweler, Houston craftsman, handcrafted silver jewelry, custom jewelry maker, artisan jeweler, sterling silver artist"
  }
};
