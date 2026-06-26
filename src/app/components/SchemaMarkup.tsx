import { useEffect } from 'react';

interface SchemaMarkupProps {
  type?: 'homepage' | 'product' | 'faq' | 'contact';
}

export function SchemaMarkup({ type = 'homepage' }: SchemaMarkupProps) {
  
  useEffect(() => {
    // Remove any existing schema markup
    const existingSchema = document.querySelectorAll('script[type="application/ld+json"]');
    existingSchema.forEach(script => script.remove());
    
    // Add new schema based on type
    const schemas = getSchemaForType(type);
    schemas.forEach(schema => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(schema);
      document.head.appendChild(script);
    });
    
    return () => {
      // Cleanup on unmount
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      scripts.forEach(script => script.remove());
    };
  }, [type]);
  
  return null;
}

function getSchemaForType(type: string) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://forgedinitials.com';
  
  const schemas = [];
  
  // Local Business Schema (always include)
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "JewelryStore",
    "name": "Forged Initials",
    "description": "Custom handcrafted 925 sterling silver letter jewelry. Every A–Z initial is made to order.",
    "url": baseUrl,
    "logo": `${baseUrl}/logo.png`,
    "image": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&h=630&fit=crop",
    "telephone": "Contact via social media",
    "email": "forgedinitals@outlook.com",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Houston",
      "addressRegion": "TX",
      "addressCountry": "US"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "29.7604",
      "longitude": "-95.3698"
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "00:00",
      "closes": "23:59"
    },
    "priceRange": "$$$",
    "paymentAccepted": "Credit Card, Cash App, Link",
    "currenciesAccepted": "USD",
    "areaServed": {
      "@type": "City",
      "name": "Houston",
      "containedIn": {
        "@type": "State",
        "name": "Texas"
      }
    },
    "founder": {
      "@type": "Person",
      "name": "Adil Ali",
      "jobTitle": "Master Craftsman & Founder"
    },
    "sameAs": [
      "https://instagram.com/forgedinitials",
      "https://facebook.com/forgedinitials",
      "https://twitter.com/forgedinitials"
    ]
  };
  
  schemas.push(localBusinessSchema);
  
  // Organization Schema
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Forged Initials",
    "url": baseUrl,
    "logo": `${baseUrl}/logo.png`,
    "description": "Custom handcrafted 925 sterling silver letter jewelry made to order by Adil Ali",
    "founder": {
      "@type": "Person",
      "name": "Adil Ali"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "availableLanguage": "English",
      "areaServed": "US"
    },
    "sameAs": [
      "https://instagram.com/forgedinitials",
      "https://facebook.com/forgedinitials",
      "https://twitter.com/forgedinitials"
    ]
  };
  
  schemas.push(organizationSchema);
  
  // Type-specific schemas
  if (type === 'homepage') {
    // Website Schema
    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Forged Initials",
      "url": baseUrl,
      "description": "Custom handcrafted 925 sterling silver letter jewelry",
      "publisher": {
        "@type": "Organization",
        "name": "Forged Initials",
        "logo": {
          "@type": "ImageObject",
          "url": `${baseUrl}/logo.png`
        }
      }
    };
    schemas.push(websiteSchema);
  }
  
  if (type === 'product') {
    // Product Schema for jewelry
    const productSchema = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "Custom Sterling Silver Letter Jewelry",
      "description": "Handcrafted 925 sterling silver letter jewelry. Choose from A-Z, available in Small, Medium, and Large sizes.",
      "image": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=800&fit=crop",
      "brand": {
        "@type": "Brand",
        "name": "Forged Initials"
      },
      "manufacturer": {
        "@type": "Organization",
        "name": "Forged Initials"
      },
      "material": "925 Sterling Silver",
      "offers": {
        "@type": "Offer",
        "price": "3.00",
        "priceCurrency": "USD",
        "availability": "https://schema.org/PreOrder",
        "priceValidUntil": "2026-12-31",
        "itemCondition": "https://schema.org/NewCondition",
        "seller": {
          "@type": "Organization",
          "name": "Forged Initials"
        },
        "shippingDetails": {
          "@type": "OfferShippingDetails",
          "shippingRate": {
            "@type": "MonetaryAmount",
            "value": "10.00",
            "currency": "USD"
          },
          "shippingDestination": {
            "@type": "DefinedRegion",
            "addressCountry": "US",
            "addressRegion": "TX"
          },
          "deliveryTime": {
            "@type": "ShippingDeliveryTime",
            "businessDays": {
              "@type": "OpeningHoursSpecification",
              "dayOfWeek": "https://schema.org/BusinessDays"
            },
            "cutoffTime": "17:00",
            "handlingTime": {
              "@type": "QuantitativeValue",
              "minValue": 2,
              "maxValue": 5,
              "unitCode": "DAY"
            },
            "transitTime": {
              "@type": "QuantitativeValue",
              "minValue": 3,
              "maxValue": 7,
              "unitCode": "DAY"
            }
          }
        }
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "5",
        "reviewCount": "12"
      }
    };
    schemas.push(productSchema);
  }
  
  if (type === 'faq') {
    // FAQ Schema
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What materials are used in your jewelry?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "All our jewelry is crafted from 925 Sterling Silver, ensuring quality and durability. Each piece is handcrafted by Adil Ali with precision and care."
          }
        },
        {
          "@type": "Question",
          "name": "How much does each letter cost?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We offer five sizes with fixed pricing: Extra Small ($1), Small ($2), Medium ($3), Large ($4), and Extra Large ($5) per piece. Shipping is a flat $10 via FedEx Ground to Houston."
          }
        },
        {
          "@type": "Question",
          "name": "Can I order multiple letters?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! You can order multiple letters with individual quantities and sizes. For example, you could order A×30 (Medium), B×42 (Large), D×11 (Small) all in one order. Each letter can have its own quantity and size."
          }
        },
        {
          "@type": "Question",
          "name": "What sizes are available?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We offer five sizes: Extra Small ($1), Small ($2), Medium ($3), Large ($4), and Extra Large ($5) per piece. Each letter in your order can have its own individual size!"
          }
        },
        {
          "@type": "Question",
          "name": "Where do you ship to?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We currently only ship to Houston, Texas via FedEx Ground for a flat rate of $10. We specialize in serving the Houston community."
          }
        },
        {
          "@type": "Question",
          "name": "How do I place an order?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Select your desired letters (A-Z) and quantities, choose your size (Small/Medium/Large), enter your Houston shipping address, and pay securely via Stripe checkout (Card, Cash App, or Link). You'll receive a confirmation email with your order details."
          }
        },
        {
          "@type": "Question",
          "name": "How can I contact you?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We prefer communication through social media for order inquiries and custom requests. Follow us on Instagram, Facebook, or Twitter @forgedinitials."
          }
        },
        {
          "@type": "Question",
          "name": "How long does production take?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Each piece is handcrafted to order. Production typically takes 2-5 business days, with delivery within 3-7 days after shipping via FedEx Ground to Houston."
          }
        },
        {
          "@type": "Question",
          "name": "Is this real sterling silver?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes! All our jewelry is made from genuine 925 Sterling Silver. This means it contains 92.5% pure silver, which is the standard for quality sterling silver jewelry."
          }
        },
        {
          "@type": "Question",
          "name": "What payment methods do you accept?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "We accept all major credit cards, Cash App, and Link through our secure Stripe checkout for convenient payment options."
          }
        }
      ]
    };
    schemas.push(faqSchema);
  }
  
  // Breadcrumb Schema (for all pages)
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": baseUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": type === 'contact' ? 'Contact' : type === 'faq' ? 'FAQ' : 'Shop',
        "item": `${baseUrl}/${type}`
      }
    ]
  };
  
  if (type !== 'homepage') {
    schemas.push(breadcrumbSchema);
  }
  
  return schemas;
}

// Export schema types for use in components
export const SchemaTypes = {
  HOMEPAGE: 'homepage' as const,
  PRODUCT: 'product' as const,
  FAQ: 'faq' as const,
  CONTACT: 'contact' as const,
};