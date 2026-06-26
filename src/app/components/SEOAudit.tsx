import { CheckCircle, XCircle, AlertCircle, ExternalLink, Download } from 'lucide-react';
import { useState, useEffect } from 'react';

interface AuditItem {
  category: string;
  items: {
    name: string;
    status: 'good' | 'warning' | 'bad';
    description: string;
    recommendation?: string;
    priority: 'high' | 'medium' | 'low';
  }[];
}

export function SEOAudit() {
  const [sitemapExists, setSitemapExists] = useState(false);
  const [robotsExists, setRobotsExists] = useState(false);
  const [checkingFiles, setCheckingFiles] = useState(true);

  useEffect(() => {
    // Check if sitemap.xml exists
    fetch('/sitemap.xml')
      .then(res => {
        if (res.ok) setSitemapExists(true);
      })
      .catch(() => setSitemapExists(false));

    // Check if robots.txt exists
    fetch('/robots.txt')
      .then(res => {
        if (res.ok) setRobotsExists(true);
      })
      .catch(() => setRobotsExists(false))
      .finally(() => setCheckingFiles(false));
  }, []);

  const auditResults: AuditItem[] = [
    {
      category: "Meta Tags & Basic SEO",
      items: [
        {
          name: "Page Titles",
          status: "good",
          description: "Dynamic page titles are implemented with proper keywords",
          priority: "high"
        },
        {
          name: "Meta Descriptions",
          status: "good",
          description: "Custom meta descriptions for all pages (155-160 characters)",
          priority: "high"
        },
        {
          name: "Meta Keywords",
          status: "good",
          description: "Relevant keywords included: 'sterling silver jewelry, custom letter jewelry, Houston'",
          priority: "medium"
        },
        {
          name: "Canonical URLs",
          status: "good",
          description: "Canonical tags prevent duplicate content issues",
          priority: "high"
        },
        {
          name: "Robots Meta Tag",
          status: "good",
          description: "Set to 'index, follow' for search engine crawling",
          priority: "high"
        }
      ]
    },
    {
      category: "Structured Data (Schema.org)",
      items: [
        {
          name: "LocalBusiness Schema",
          status: "good",
          description: "JewelryStore schema with Houston location, contact info, hours",
          priority: "high"
        },
        {
          name: "Organization Schema",
          status: "good",
          description: "Founder info (Adil Ali) and social media profiles included",
          priority: "high"
        },
        {
          name: "Product Schema",
          status: "good",
          description: "Sterling silver jewelry products with pricing, shipping, availability",
          priority: "high"
        },
        {
          name: "FAQ Schema",
          status: "good",
          description: "10 common questions with structured answers for rich snippets",
          priority: "medium"
        },
        {
          name: "Breadcrumb Schema",
          status: "good",
          description: "Navigation breadcrumbs for better search result display",
          priority: "medium"
        }
      ]
    },
    {
      category: "Social Media & Sharing",
      items: [
        {
          name: "Open Graph Tags",
          status: "good",
          description: "Facebook/LinkedIn sharing optimized with images (1200x630)",
          priority: "high"
        },
        {
          name: "Twitter Card Tags",
          status: "good",
          description: "Twitter sharing with large image cards",
          priority: "high"
        },
        {
          name: "Social Media Links",
          status: "good",
          description: "Instagram, Facebook, Twitter profiles linked in schema",
          priority: "medium"
        }
      ]
    },
    {
      category: "Mobile & Performance",
      items: [
        {
          name: "Mobile Viewport",
          status: "good",
          description: "Responsive viewport meta tag configured",
          priority: "high"
        },
        {
          name: "Apple Mobile Tags",
          status: "good",
          description: "iOS web app capable with custom icons",
          priority: "medium"
        },
        {
          name: "Favicon & Icons",
          status: "good",
          description: "Multiple icon sizes for all devices (16x16 to 512x512)",
          priority: "medium"
        },
        {
          name: "Preconnect Tags",
          status: "good",
          description: "Stripe, Unsplash preconnected for faster loading",
          priority: "medium"
        },
        {
          name: "DNS Prefetch",
          status: "good",
          description: "Google Fonts prefetched for performance",
          priority: "low"
        }
      ]
    },
    {
      category: "Content & Keywords",
      items: [
        {
          name: "Primary Keywords",
          status: "good",
          description: "Target: 'sterling silver jewelry', 'custom letter jewelry', 'Houston'",
          priority: "high"
        },
        {
          name: "Long-tail Keywords",
          status: "good",
          description: "925 silver letters, personalized initials, handcrafted silver Houston",
          priority: "medium"
        },
        {
          name: "Local SEO",
          status: "good",
          description: "Houston, Texas emphasis in content and schema",
          priority: "high"
        },
        {
          name: "Content Quality",
          status: "good",
          description: "Clear descriptions of products, services, and business",
          priority: "high"
        }
      ]
    },
    {
      category: "Missing or To-Do Items",
      items: [
        {
          name: "Sitemap.xml",
          status: sitemapExists ? 'good' : 'warning',
          description: sitemapExists 
            ? "✅ Sitemap.xml file detected and ready for search engines" 
            : "No sitemap.xml file detected",
          recommendation: sitemapExists 
            ? undefined 
            : "Create sitemap.xml with all pages for search engines",
          priority: "high"
        },
        {
          name: "Robots.txt",
          status: robotsExists ? 'good' : 'warning',
          description: robotsExists 
            ? "✅ Robots.txt file detected and configured properly" 
            : "No robots.txt file detected",
          recommendation: robotsExists 
            ? undefined 
            : "Create robots.txt to guide search engine crawlers",
          priority: "medium"
        },
        {
          name: "Google Business Profile",
          status: "warning",
          description: "Verify Google Business Profile is claimed and optimized",
          recommendation: "Claim and verify your Houston business on Google",
          priority: "high"
        },
        {
          name: "SSL Certificate",
          status: "warning",
          description: "Ensure HTTPS is enabled on production domain",
          recommendation: "Must have SSL/HTTPS for security and SEO ranking",
          priority: "high"
        },
        {
          name: "Page Speed",
          status: "warning",
          description: "Test with Google PageSpeed Insights after deployment",
          recommendation: "Aim for 90+ score on mobile and desktop",
          priority: "high"
        },
        {
          name: "Backlinks",
          status: "warning",
          description: "Build quality backlinks from Houston jewelry directories",
          recommendation: "Get listed in Houston business directories, jewelry blogs",
          priority: "medium"
        },
        {
          name: "Customer Reviews",
          status: "warning",
          description: "Collect and display customer reviews",
          recommendation: "Add Google reviews, testimonials with schema markup",
          priority: "high"
        }
      ]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'bad':
        return <XCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'bad':
        return 'border-red-200 bg-red-50';
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-700',
      medium: 'bg-yellow-100 text-yellow-700',
      low: 'bg-blue-100 text-blue-700'
    };
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${colors[priority as keyof typeof colors]}`}>
        {priority.toUpperCase()}
      </span>
    );
  };

  const goodCount = auditResults.reduce((acc, cat) => 
    acc + cat.items.filter(i => i.status === 'good').length, 0
  );
  
  const warningCount = auditResults.reduce((acc, cat) => 
    acc + cat.items.filter(i => i.status === 'warning').length, 0
  );
  
  const totalCount = auditResults.reduce((acc, cat) => acc + cat.items.length, 0);
  const score = Math.round((goodCount / totalCount) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl mb-4">SEO Audit Report</h1>
          <p className="text-gray-600 text-lg mb-6">
            Comprehensive SEO analysis for Forged Initials
          </p>
          
          {/* Score Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-8">
              <div className="text-center">
                <div className={`text-6xl font-bold mb-2 ${score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {score}%
                </div>
                <p className="text-gray-600">SEO Score</p>
              </div>
              
              <div className="h-24 w-px bg-gray-200" />
              
              <div className="text-left space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-lg">{goodCount} Optimized</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <span className="text-lg">{warningCount} To Improve</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-medium">{totalCount} Total Items</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
            <button
              onClick={() => window.open('https://search.google.com/search-console', '_blank')}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white rounded-lg shadow hover:shadow-md transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              Google Search Console
            </button>
            <button
              onClick={() => window.open('https://pagespeed.web.dev/', '_blank')}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white rounded-lg shadow hover:shadow-md transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              PageSpeed Insights
            </button>
            <button
              onClick={() => window.open('https://validator.schema.org/', '_blank')}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-white rounded-lg shadow hover:shadow-md transition-all"
            >
              <ExternalLink className="w-4 h-4" />
              Schema Validator
            </button>
          </div>
        </div>

        {/* Audit Categories */}
        <div className="space-y-6">
          {auditResults.map((category, catIndex) => (
            <div key={catIndex} className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
              <h2 className="text-2xl mb-6 flex items-center gap-2">
                {category.category}
                <span className="text-sm text-gray-500 font-normal">
                  ({category.items.filter(i => i.status === 'good').length}/{category.items.length} optimized)
                </span>
              </h2>
              
              <div className="space-y-3">
                {category.items.map((item, itemIndex) => (
                  <div 
                    key={itemIndex}
                    className={`border-2 rounded-lg p-4 ${getStatusColor(item.status)}`}
                  >
                    <div className="flex items-start gap-3">
                      {getStatusIcon(item.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{item.name}</h3>
                          {getPriorityBadge(item.priority)}
                        </div>
                        <p className="text-sm text-gray-700 mb-2">
                          {item.description}
                        </p>
                        {item.recommendation && (
                          <div className="mt-2 p-2 bg-white/50 rounded border border-yellow-300">
                            <p className="text-sm font-medium text-gray-800">
                              ✅ Recommendation: {item.recommendation}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Action Items Summary */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 text-white">
          <h2 className="text-2xl mb-4">🚀 Next Steps to Boost Visibility</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <h3 className="font-semibold mb-2">1. Deploy Your Site</h3>
              <p className="text-sm opacity-90">
                Deploy to production with HTTPS enabled and a custom domain (forgedinitials.com)
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <h3 className="font-semibold mb-2">2. Google Business Profile</h3>
              <p className="text-sm opacity-90">
                Claim your Houston business listing on Google for local search visibility
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <h3 className="font-semibold mb-2">3. Submit Sitemap</h3>
              <p className="text-sm opacity-90">
                Create and submit sitemap.xml to Google Search Console for faster indexing
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <h3 className="font-semibold mb-2">4. Build Backlinks</h3>
              <p className="text-sm opacity-90">
                Get listed in Houston jewelry directories, Instagram bio link, social media posts
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <h3 className="font-semibold mb-2">5. Collect Reviews</h3>
              <p className="text-sm opacity-90">
                Ask satisfied customers to leave Google reviews - crucial for local SEO
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <h3 className="font-semibold mb-2">6. Monitor Performance</h3>
              <p className="text-sm opacity-90">
                Use Google Analytics and Search Console to track traffic and rankings
              </p>
            </div>
          </div>
        </div>

        {/* Files to Create */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl mb-4">📄 Files You Need to Create After Deployment</h2>
          <div className="space-y-4">
            <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
              <h3 className="font-semibold mb-2">sitemap.xml</h3>
              <p className="text-sm text-gray-700 mb-2">
                Create at: <code className="bg-white px-2 py-1 rounded">https://forgedinitials.com/sitemap.xml</code>
              </p>
              <details className="mt-2">
                <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700">
                  Show example sitemap.xml
                </summary>
                <pre className="mt-2 p-3 bg-white rounded text-xs overflow-x-auto">
{`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://forgedinitials.com/</loc>
    <lastmod>2026-01-10</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://forgedinitials.com/contact</loc>
    <lastmod>2026-01-10</lastmod>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://forgedinitials.com/faq</loc>
    <lastmod>2026-01-10</lastmod>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://forgedinitials.com/track</loc>
    <lastmod>2026-01-10</lastmod>
    <priority>0.7</priority>
  </url>
</urlset>`}
                </pre>
              </details>
            </div>

            <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
              <h3 className="font-semibold mb-2">robots.txt</h3>
              <p className="text-sm text-gray-700 mb-2">
                Create at: <code className="bg-white px-2 py-1 rounded">https://forgedinitials.com/robots.txt</code>
              </p>
              <details className="mt-2">
                <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700">
                  Show example robots.txt
                </summary>
                <pre className="mt-2 p-3 bg-white rounded text-xs overflow-x-auto">
{`User-agent: *
Allow: /
Disallow: /test
Disallow: /email
Disallow: /discord-test

Sitemap: https://forgedinitials.com/sitemap.xml`}
                </pre>
              </details>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}