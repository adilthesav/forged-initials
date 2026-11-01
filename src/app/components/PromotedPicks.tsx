import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { ExternalLink, ShoppingBag } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Pick {
  id: string;
  name: string;
  description: string;
  image_url: string;
  category: string;
  affiliate_url: string;
}

const DISCLOSURE = 'We may earn a commission if you buy through these links, at no extra cost to you.';

// Only https links ever become a button
function safeLink(url: string): URL | null {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'https:' ? parsed : null;
  } catch {
    return null;
  }
}

function sellerName(link: URL): string {
  const host = link.hostname.toLowerCase();
  if (/(^|\.)ebay\.[a-z.]+$/.test(host) || host === 'ebay.us') return 'eBay';
  if (/(^|\.)amazon\.[a-z.]+$/.test(host) || host === 'amzn.to') return 'Amazon';
  return 'the seller';
}

export function PromotedPicks() {
  const [picks, setPicks] = useState<Pick[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(
      `https://${projectId}.supabase.co/rest/v1/products?active=eq.true&product_type=eq.promoted&order=created_at.desc&select=id,name,description,image_url,category,affiliate_url`,
      { headers: { apikey: publicAnonKey, Authorization: `Bearer ${publicAnonKey}` } }
    )
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => setPicks(Array.isArray(data) ? data : []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-12 md:py-20 bg-gradient-to-b from-stone-50/50 to-white min-h-[60vh]">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-10 md:mb-14">
          <p className="text-[10px] tracking-[0.35em] uppercase font-bold mb-3" style={{ color: '#c9a84c' }}>
            ✦ From Other Sellers ✦
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-stone-800 mb-4 tracking-tight">Our Picks</h1>
          <p className="text-stone-500 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            Jewelry we like from other sellers. These pieces aren't made by Forged Initials, and you buy them directly from the seller.
          </p>
          <p className="text-stone-400 text-xs mt-3">{DISCLOSURE}</p>
          <Link to="/" className="inline-block mt-4 text-sm font-semibold text-amber-700 hover:underline">
            See what we handcraft →
          </Link>
        </div>

        {error && <p className="text-center text-stone-400 py-16">Could not load our picks. Please refresh.</p>}

        {!loading && !error && picks.length === 0 && (
          <div className="text-center py-16">
            <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-stone-200" />
            <p className="text-stone-400 font-medium">New picks are coming soon.</p>
          </div>
        )}

        {picks.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {picks.map(pick => {
              const link = safeLink(pick.affiliate_url);
              if (!link) return null;
              return (
                <a
                  key={pick.id}
                  href={link.href}
                  target="_blank"
                  rel="sponsored nofollow noopener noreferrer"
                  className="group bg-white rounded-2xl overflow-hidden border border-stone-100 hover:border-amber-200 transition-all duration-300 hover:shadow-xl flex flex-col"
                >
                  <div className="aspect-square overflow-hidden bg-stone-50">
                    {pick.image_url ? (
                      <img src={pick.image_url} alt={pick.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-12 h-12 text-stone-200" />
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1 gap-1">
                    <h2 className="font-bold text-stone-800 text-sm sm:text-base leading-snug line-clamp-2">{pick.name}</h2>
                    {pick.description && <p className="text-xs text-stone-500 leading-relaxed line-clamp-3">{pick.description}</p>}
                    <span className="mt-auto pt-3 inline-flex items-center gap-1.5 text-xs font-bold text-amber-700">
                      View on {sellerName(link)} <ExternalLink className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
