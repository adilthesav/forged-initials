import { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, RefreshCw, Tag, AlertTriangle, X } from 'lucide-react';

const SUPABASE_URL = 'https://vpxuizymtmcnsgmpnhel.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZweHVpenltdG1jbnNnbXBuaGVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3ODgyMDUsImV4cCI6MjA3NjM2NDIwNX0.zLW_XvdTD6v-xSfCvmvv5GzPkY-si4huEZH65eUOyr4';

interface Variant {
  vid: string;
  name: string;
  cj_cost?: number;
  price_cents?: number;
  warehouseCountryCode?: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price_cents: number;
  image_url: string;
  category: string;
  quantity_remaining: number;
  active: boolean;
  variants?: Variant[];
  source?: 'supabase' | 'shopify';
}

const CATS = ['All', 'Rings', 'Pendants', 'Earrings', 'Other'];
const CAT_MAP: Record<string, string> = { Rings: 'ring', Pendants: 'pendant', Earrings: 'earring', Other: 'other' };

const PRODUCT_CONFIG_KEY = 'forged_product_config';

interface PersonalizationConfig {
  enabled: boolean;
  label: string;
  shopify_url?: string;
}

function getPersonalizationConfig(productId: string): PersonalizationConfig | null {
  try {
    const raw = localStorage.getItem(PRODUCT_CONFIG_KEY);
    if (!raw) return null;
    const cfg = JSON.parse(raw);
    return cfg[productId] ?? null;
  } catch {
    return null;
  }
}

function shortVariantName(variantName: string, productName: string): string {
  const cleaned = variantName.replace(productName, '').replace(/^[\s\-–—·|,]+/, '').trim();
  if (cleaned && cleaned.length < variantName.length) return cleaned;
  const words = variantName.split(' ');
  return words.slice(Math.max(0, words.length - 3)).join(' ') || variantName;
}

function getColorGroup(shortName: string): string {
  const match = shortName.match(/^(Rose\s+Gold|Rose\s+gold|Gold|Silver|Black|White|Blue|Red|Green|Purple|Bronze|Copper)/i);
  if (match) {
    const raw = match[1];
    return raw.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  }
  return shortName.split(' ')[0] || 'Style';
}

function getSizeLabel(shortName: string, colorGroup: string): string {
  const after = shortName.slice(colorGroup.length).replace(/^[\s\-]+/, '').trim();
  return after.replace(/\s*(Yards?)\s*/gi, '').replace(/^Size\s*/i, '').trim() || after;
}

type VariantGroup = { variant: Variant; shortName: string; size: string }[];

function buildGroups(variants: Variant[], productName: string): Map<string, VariantGroup> {
  const map = new Map<string, VariantGroup>();
  for (const v of variants) {
    const shortName = shortVariantName(v.name, productName);
    const color = getColorGroup(shortName);
    const size = getSizeLabel(shortName, color);
    if (!map.has(color)) map.set(color, []);
    map.get(color)!.push({ variant: v, shortName, size });
  }
  return map;
}

// ── Product Modal ─────────────────────────────────────────────────────────────
function ProductModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const [selectedVid, setSelectedVid] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [buying, setBuying] = useState(false);
  const [personText, setPersonText] = useState('');

  const personConfig = getPersonalizationConfig(product.id);

  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
  const groups = hasVariants ? buildGroups(product.variants!, product.name) : new Map<string, VariantGroup>();
  const colorKeys = [...groups.keys()];

  useEffect(() => {
    if (colorKeys.length > 0) setSelectedColor(colorKeys[0]);
    setQuantity(1);
  }, [product.id]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', esc);
    return () => { document.body.style.overflow = ''; window.removeEventListener('keydown', esc); };
  }, [onClose]);

  const variantsInColor = groups.get(selectedColor) || [];
  const selectedVariant = product.variants?.find(v => v.vid === selectedVid);
  const currentPrice = selectedVariant?.price_cents ?? product.price_cents;
  const soldOut = product.quantity_remaining === 0;
  const maxQty = Math.max(1, product.quantity_remaining);
  const hasDirectUrl = !!personConfig?.shopify_url;
  const canBuy = !soldOut && (!hasVariants || !!selectedVid || hasDirectUrl);

  const allPrices = hasVariants
    ? product.variants!.map(v => v.price_cents || product.price_cents)
    : [product.price_cents];
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const pricesVary = minPrice !== maxPrice;

  const handleBuy = async () => {
    if (!canBuy || buying) return;
    setBuying(true);

    if (product.source === 'shopify') {
      if (personConfig?.shopify_url) {
        window.location.href = personConfig.shopify_url;
        return;
      }
      const variantId = selectedVid || product.variants?.[0]?.vid || '';
      if (!variantId) {
        alert('Please select a variant to continue.');
        setBuying(false);
        return;
      }
      const baseUrl = `https://shop.forged-initials.com/cart/${variantId}:${quantity}`;
      const personLabel = personConfig?.label || 'Personalization';
      const url = personText.trim()
        ? `${baseUrl}?note=${encodeURIComponent(`${personLabel}: ${personText.trim()}`)}`
        : baseUrl;
      window.location.href = url;
      return;
    }

    try {
      const res = await fetch('/.netlify/functions/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          priceInCents: currentPrice,
          imageUrl: product.image_url,
          quantity,
          selectedVid: selectedVid || '',
        }),
      });
      const { url, error: err } = await res.json();
      if (err) throw new Error(err);
      window.location.href = url;
    } catch (e: any) {
      alert(e.message || 'Could not start checkout. Please try again.');
      setBuying(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(15,12,9,0.72)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white w-full sm:max-w-2xl sm:rounded-3xl overflow-hidden flex flex-col sm:flex-row"
        style={{ maxHeight: '95vh' }}
      >
        {/* Left: Image */}
        <div className="relative sm:w-5/12 flex-shrink-0 bg-stone-100">
          <div className="w-full aspect-square sm:h-full sm:aspect-auto relative">
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingBag className="w-16 h-16 text-stone-200" />
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white transition-all"
          >
            <X className="w-4 h-4 text-stone-700" />
          </button>
        </div>

        {/* Right: Details */}
        <div className="flex-1 overflow-y-auto flex flex-col p-5 sm:p-7 gap-4">

          <div className="flex items-center justify-between">
            <span
              className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full capitalize"
              style={{ background: 'rgba(201,168,76,0.15)', color: '#8a6010' }}
            >
              {product.category}
            </span>
            {soldOut ? (
              <span className="text-[10px] font-bold text-red-500">Sold Out</span>
            ) : product.quantity_remaining <= 5 ? (
              <span className="text-[10px] font-bold text-amber-600 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Only {product.quantity_remaining} left
              </span>
            ) : (
              <span className="text-[10px] font-bold text-emerald-600">✓ In Stock</span>
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold text-stone-800 leading-snug">{product.name}</h2>
            {product.description && (
              <p className="text-stone-500 text-sm mt-1.5 leading-relaxed">{product.description}</p>
            )}
          </div>

          <div className="border-t border-stone-100" />

          {hasVariants && colorKeys.length > 0 && (
            <div className="space-y-4">
              {colorKeys.length > 1 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">
                    Color / Style
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {colorKeys.map(color => (
                      <button
                        key={color}
                        onClick={() => { setSelectedColor(color); setSelectedVid(''); }}
                        className="px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150"
                        style={selectedColor === color
                          ? { background: '#1c1209', color: '#e8c96a', border: '1.5px solid #1c1209' }
                          : { background: 'white', color: '#78716c', border: '1px solid #e7e5e4' }}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {variantsInColor.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-2">
                    Size
                    {selectedVariant && (
                      <span className="normal-case tracking-normal font-normal text-stone-500 ml-1.5">
                        — {shortVariantName(selectedVariant.name, product.name)}
                      </span>
                    )}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {variantsInColor.map(({ variant, size }) => {
                      const vPrice = variant.price_cents || product.price_cents;
                      const isActive = selectedVid === variant.vid;
                      const showPrice = pricesVary;
                      return (
                        <button
                          key={variant.vid}
                          onClick={() => setSelectedVid(variant.vid)}
                          className="flex flex-col items-center justify-center px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-150 hover:scale-105 min-w-[2.5rem]"
                          style={isActive
                            ? { background: '#c9a84c', color: '#2a1800', border: '1.5px solid #c9a84c', boxShadow: '0 2px 10px rgba(201,168,76,0.4)' }
                            : { background: 'white', color: '#57534e', border: '1px solid #e7e5e4' }}
                        >
                          <span>{size || '—'}</span>
                          {showPrice && (
                            <span className="text-[9px] opacity-70 leading-tight">${(vPrice / 100).toFixed(2)}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {!selectedVid && !soldOut && !hasDirectUrl && (
                    <p className="text-[11px] text-amber-600 mt-2 font-medium">↑ Select your size to continue</p>
                  )}
                </div>
              )}
            </div>
          )}

          {!soldOut && (
            <div className="flex items-center gap-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 whitespace-nowrap">Qty</p>
              <div className="flex items-center gap-1 bg-stone-50 rounded-xl border border-stone-200 p-1">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-stone-700 font-bold text-base hover:bg-amber-50 disabled:opacity-30 transition-all"
                >−</button>
                <span className="w-8 text-center text-sm font-bold text-stone-800 tabular-nums">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}
                  disabled={quantity >= maxQty}
                  className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center text-stone-700 font-bold text-base hover:bg-amber-50 disabled:opacity-30 transition-all"
                >+</button>
              </div>
              {product.quantity_remaining <= 10 && (
                <span className="text-[10px] text-stone-400">{product.quantity_remaining} available</span>
              )}
            </div>
          )}

          {personConfig?.enabled && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1.5">
                {personConfig.label || 'Personalization'}
              </p>
              <input
                type="text"
                value={personText}
                onChange={e => setPersonText(e.target.value)}
                maxLength={40}
                placeholder="e.g. AB, Mom, Forever…"
                className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl bg-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200 transition-all"
              />
              <p className="text-[10px] text-stone-400 mt-1">{personText.length}/40 · Added to your order note</p>
            </div>
          )}

          <div className="flex-1 min-h-4" />

          <div className="space-y-3">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-3xl font-bold" style={{ color: '#c9a84c' }}>
                ${(currentPrice / 100).toFixed(2)}
              </span>
              {quantity > 1 && (
                <span className="text-sm font-semibold text-stone-500">
                  × {quantity} = <span style={{ color: '#c9a84c' }}>${((currentPrice * quantity) / 100).toFixed(2)}</span>
                </span>
              )}
              {hasVariants && !selectedVid && pricesVary && (
                <span className="text-sm text-stone-400">— prices vary by size</span>
              )}
            </div>

            <button
              onClick={handleBuy}
              disabled={!canBuy || buying}
              className="w-full py-3.5 rounded-2xl text-sm font-bold tracking-wide transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={!canBuy ? {
                background: '#f3f4f6', color: '#9ca3af',
              } : {
                background: 'linear-gradient(135deg,#c9a84c,#e8c96a)',
                color: '#2a1800',
                boxShadow: '0 4px 18px rgba(201,168,76,0.38)',
              }}
            >
              {buying ? 'Loading…' : soldOut ? 'Sold Out' : hasDirectUrl ? 'Shop on Forged Initials →' : hasVariants && !selectedVid ? 'Select a Size to Continue' : quantity > 1 ? `Buy ${quantity} → $${((currentPrice * quantity) / 100).toFixed(2)}` : 'Buy Now →'}
            </button>

            <p className="text-[10px] text-center text-stone-400 leading-relaxed">
              {product.source === 'shopify'
                ? '18k gold-plated stainless steel · Fulfilled by CJ · Ships 7–15 days'
                : '18k gold-plated stainless steel · Ships 5–7 business days · Houston, TX'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Product Card ──────────────────────────────────────────────────────────────
function ProductCard({ product, onClick }: { product: Product; onClick: () => void }) {
  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
  const soldOut = product.quantity_remaining === 0;

  const allPrices = hasVariants
    ? product.variants!.map(v => v.price_cents || product.price_cents)
    : [product.price_cents];
  const minPrice = Math.min(...allPrices);
  const maxPrice = Math.max(...allPrices);
  const priceLabel = minPrice === maxPrice
    ? `$${(minPrice / 100).toFixed(2)}`
    : `from $${(minPrice / 100).toFixed(2)}`;

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-stone-100 hover:border-amber-200 transition-all duration-300 hover:shadow-xl hover:shadow-amber-900/5 hover:-translate-y-1 flex flex-col"
    >
      <div className="relative aspect-square overflow-hidden bg-stone-50">
        {product.image_url ? (
          <>
            <img
              src={product.image_url}
              alt={product.name}
              className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${soldOut ? 'opacity-50 grayscale' : ''}`}
              loading="lazy"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-stone-900/0 group-hover:bg-stone-900/25 transition-all duration-300">
              <span className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-white text-xs font-bold bg-stone-900/70 px-4 py-2 rounded-full tracking-wide">
                View Details
              </span>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-stone-200" />
          </div>
        )}

        <span
          className="absolute top-2 left-2 text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full capitalize"
          style={{ background: 'rgba(201,168,76,0.9)', color: '#2a1800' }}
        >
          {product.category}
        </span>

        {soldOut ? (
          <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-700 text-white">
            Sold Out
          </span>
        ) : product.quantity_remaining <= 5 ? (
          <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white flex items-center gap-1">
            <AlertTriangle className="w-2.5 h-2.5" /> Only {product.quantity_remaining} left
          </span>
        ) : null}
      </div>

      <div className="p-4 flex flex-col flex-1 gap-1">
        <h3 className="font-bold text-stone-800 text-sm sm:text-base leading-snug group-hover:text-amber-800 transition-colors line-clamp-2">
          {product.name}
        </h3>

        {hasVariants && (
          <p className="text-[11px] text-stone-400 font-medium">
            {product.variants!.length} styles available
          </p>
        )}

        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="text-base font-bold" style={{ color: '#c9a84c' }}>
            {priceLabel}
          </span>
          <span className="text-[11px] font-semibold text-amber-700 group-hover:text-amber-900 transition-colors">
            View →
          </span>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-stone-100 animate-pulse">
      <div className="aspect-square bg-stone-100" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-stone-100 rounded w-3/4" />
        <div className="h-3 bg-stone-100 rounded w-1/2" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-5 bg-stone-100 rounded w-16" />
          <div className="h-4 bg-stone-100 rounded w-10" />
        </div>
      </div>
    </div>
  );
}

// ── Shop Section ──────────────────────────────────────────────────────────────
export function ShopSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [error, setError] = useState('');
  const [openProduct, setOpenProduct] = useState<Product | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [supaResult, shopifyResult] = await Promise.allSettled([
        fetch(
          `${SUPABASE_URL}/rest/v1/products?active=eq.true&order=created_at.desc&select=id,name,description,price_cents,image_url,category,quantity_remaining,active,variants`,
          { headers: { 'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${SUPABASE_ANON}` } }
        ).then(r => r.json()),
        fetch('/.netlify/functions/shopify-products').then(r => r.json()),
      ]);

      const supaProducts: Product[] = supaResult.status === 'fulfilled' && Array.isArray(supaResult.value)
        ? supaResult.value
        : [];

      const shopifyRaw = shopifyResult.status === 'fulfilled' ? (shopifyResult.value.products || []) : [];
      const shopifyProducts: Product[] = shopifyRaw.map((p: any) => ({
        id: `shopify_${p.shopify_id}`,
        name: p.name,
        description: p.description,
        price_cents: p.price_cents,
        image_url: p.image_url,
        category: p.category || 'other',
        quantity_remaining: p.variants?.reduce((sum: number, v: any) => sum + (v.inventory_quantity || 0), 0) || 999,
        active: true,
        source: 'shopify' as const,
        variants: p.variants,
      }));

      setProducts([...supaProducts, ...shopifyProducts]);
    } catch {
      setError('Could not load products. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const filtered = activeCategory === 'All'
    ? products
    : products.filter(p => p.category === CAT_MAP[activeCategory]);

  const availableCats = CATS.filter(c => {
    if (c === 'All') return true;
    return products.some(p => p.category === CAT_MAP[c]);
  });

  return (
    <>
      <section id="shop" className="py-12 md:py-20 bg-gradient-to-b from-stone-50/50 to-white">
        <div className="container mx-auto px-4 max-w-6xl">

          <div className="text-center mb-10 md:mb-14">
            <p className="text-[10px] tracking-[0.35em] uppercase font-bold mb-3" style={{ color: '#c9a84c' }}>
              ✦ Limited Supply ✦
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-stone-800 mb-4 tracking-tight">
              Shop Our Collection
            </h2>
            <p className="text-stone-500 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              Waterproof. Tarnish-free. Hypoallergenic. Premium stainless steel jewelry built to last — stock is limited.
            </p>
          </div>

          {availableCats.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 mb-8 justify-center flex-wrap">
              {availableCats.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-200"
                  style={
                    activeCategory === cat
                      ? { background: 'linear-gradient(135deg,#c9a84c,#e8c96a)', color: '#2a1800', border: '1px solid rgba(201,168,76,0.4)', boxShadow: '0 2px 8px rgba(201,168,76,0.3)' }
                      : { background: 'white', color: '#78716c', border: '1px solid #e7e5e4' }
                  }
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-10">
              <p className="text-stone-400 mb-3">{error}</p>
              <button onClick={fetchProducts} className="flex items-center gap-2 mx-auto text-amber-700 font-semibold text-sm hover:underline">
                <RefreshCw className="w-4 h-4" /> Try again
              </button>
            </div>
          )}

          {loading && !error && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filtered.map(product => (
                <ProductCard key={product.id} product={product} onClick={() => setOpenProduct(product)} />
              ))}
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div className="text-center py-20">
              <ShoppingBag className="w-12 h-12 mx-auto mb-4 text-stone-200" />
              <p className="text-stone-400 font-medium mb-1">
                {activeCategory === 'All' ? 'No products listed yet.' : `No ${activeCategory} available right now.`}
              </p>
              {activeCategory !== 'All' && (
                <button onClick={() => setActiveCategory('All')} className="text-amber-600 text-sm font-semibold hover:underline mt-2">
                  View all items
                </button>
              )}
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="mt-10 text-center">
              <p className="text-stone-400 text-xs flex items-center justify-center gap-1.5">
                <Tag className="w-3 h-3" />
                18k gold-plated stainless steel · Waterproof · Houston, TX · $10 FedEx Ground shipping
              </p>
            </div>
          )}

        </div>
      </section>

      {openProduct && (
        <ProductModal product={openProduct} onClose={() => setOpenProduct(null)} />
      )}
    </>
  );
}
