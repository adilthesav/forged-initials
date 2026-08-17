import { useState, useEffect, useCallback } from 'react';
import { ShoppingBag, RefreshCw, Tag, AlertTriangle } from 'lucide-react';

const SUPABASE_URL = 'https://vpxuizymtmcnsgmpnhel.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZweHVpenltdG1jbnNnbXBuaGVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3ODgyMDUsImV4cCI6MjA3NjM2NDIwNX0.zLW_XvdTD6v-xSfCvmvv5GzPkY-si4huEZH65eUOyr4';

interface Variant {
  vid: string;
  name: string;
  cj_cost?: number;
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
}

const CATS = ['All', 'Rings', 'Pendants', 'Earrings', 'Other'];
const CAT_MAP: Record<string, string> = { Rings: 'ring', Pendants: 'pendant', Earrings: 'earring', Other: 'other' };

// Strip the product name prefix from variant names (CJ includes full product title in each variant)
function shortVariantName(variantName: string, productName: string): string {
  const cleaned = variantName.replace(productName, '').replace(/^[\s\-–—·|,]+/, '').trim();
  if (cleaned && cleaned.length < variantName.length) return cleaned;
  // Fallback: last 3 words
  const words = variantName.split(' ');
  return words.slice(Math.max(0, words.length - 3)).join(' ') || variantName;
}

function StockBadge({ qty }: { qty: number }) {
  if (qty === 0) return (
    <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-700 text-white">
      Sold Out
    </span>
  );
  if (qty <= 5) return (
    <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-white flex items-center gap-1">
      <AlertTriangle className="w-2.5 h-2.5" /> Only {qty} left
    </span>
  );
  if (qty <= 10) return (
    <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
      {qty} left
    </span>
  );
  return (
    <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
      In Stock
    </span>
  );
}

function ProductCard({
  product,
  onBuy,
  buying,
  selectedVid,
  onSelectVariant,
}: {
  product: Product;
  onBuy: (p: Product, vid: string) => void;
  buying: boolean;
  selectedVid: string;
  onSelectVariant: (productId: string, vid: string) => void;
}) {
  const soldOut = product.quantity_remaining === 0;
  const hasVariants = Array.isArray(product.variants) && product.variants.length > 0;
  const canBuy = !soldOut && (!hasVariants || !!selectedVid);

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-stone-100 hover:border-amber-200 transition-all duration-300 hover:shadow-xl hover:shadow-amber-900/5 hover:-translate-y-1 flex flex-col">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-stone-50">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${soldOut ? 'opacity-50 grayscale' : ''}`}
            loading="lazy"
          />
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
        <StockBadge qty={product.quantity_remaining} />
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-stone-800 text-sm sm:text-base leading-snug mb-1 group-hover:text-amber-800 transition-colors">
          {product.name}
        </h3>
        {product.description && (
          <p className="text-stone-500 text-xs sm:text-sm leading-relaxed line-clamp-2 mb-2 flex-1">
            {product.description}
          </p>
        )}

        {/* Variant selector */}
        {hasVariants && (
          <div className="mb-3 mt-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 mb-1.5">
              Select Size / Style
            </p>
            <div className="flex flex-wrap gap-1">
              {product.variants!.map(v => {
                const label = shortVariantName(v.name, product.name);
                const isActive = selectedVid === v.vid;
                return (
                  <button
                    key={v.vid}
                    onClick={() => onSelectVariant(product.id, v.vid)}
                    className="px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all duration-150 hover:scale-105"
                    style={isActive
                      ? { background: '#c9a84c', color: '#2a1800', border: '1.5px solid #c9a84c', boxShadow: '0 2px 6px rgba(201,168,76,0.35)' }
                      : { background: 'white', color: '#78716c', border: '1px solid #e7e5e4' }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            {!selectedVid && !soldOut && (
              <p className="text-[10px] text-amber-600 mt-1.5 font-medium">↑ Pick a size to continue</p>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-stone-50">
          <span className="text-lg font-bold" style={{ color: '#c9a84c' }}>
            ${(product.price_cents / 100).toFixed(2)}
          </span>
          <button
            onClick={() => canBuy && !buying && onBuy(product, selectedVid)}
            disabled={!canBuy || buying}
            className="text-xs font-semibold px-4 py-2 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
            style={!canBuy ? {
              background: '#e5e7eb', color: '#9ca3af',
            } : {
              background: 'linear-gradient(135deg,#c9a84c,#e8c96a)',
              color: '#2a1800',
              boxShadow: '0 2px 10px rgba(201,168,76,0.3)',
            }}
          >
            {buying ? 'Loading…' : soldOut ? 'Sold Out' : hasVariants && !selectedVid ? 'Select Size' : 'Buy Now'}
          </button>
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
        <div className="h-3 bg-stone-100 rounded w-full" />
        <div className="h-3 bg-stone-100 rounded w-2/3" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-5 bg-stone-100 rounded w-16" />
          <div className="h-8 bg-stone-100 rounded-full w-20" />
        </div>
      </div>
    </div>
  );
}

export function ShopSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  // selectedVids maps productId → chosen variant vid
  const [selectedVids, setSelectedVids] = useState<Record<string, string>>({});

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/products?active=eq.true&order=created_at.desc`,
        { headers: { 'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${SUPABASE_ANON}` } }
      );
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch {
      setError('Could not load products. Please refresh.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleSelectVariant = (productId: string, vid: string) => {
    setSelectedVids(prev => ({ ...prev, [productId]: vid }));
  };

  const handleBuy = async (product: Product, selectedVid: string) => {
    setBuyingId(product.id);
    try {
      const res = await fetch('/.netlify/functions/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          productName: product.name,
          priceInCents: product.price_cents,
          imageUrl: product.image_url,
          quantity: 1,
          selectedVid: selectedVid || '',
        }),
      });
      const { url, error: err } = await res.json();
      if (err) throw new Error(err);
      window.location.href = url;
    } catch (e: any) {
      alert(e.message || 'Could not start checkout. Please try again.');
      setBuyingId(null);
    }
  };

  const filtered = activeCategory === 'All'
    ? products
    : products.filter(p => p.category === CAT_MAP[activeCategory]);

  const availableCats = CATS.filter(c => {
    if (c === 'All') return true;
    return products.some(p => p.category === CAT_MAP[c]);
  });

  return (
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
            Handcrafted 925 sterling silver jewelry — each piece made with care. Stock is limited, order while available.
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
            <button
              onClick={fetchProducts}
              className="flex items-center gap-2 mx-auto text-amber-700 font-semibold text-sm hover:underline"
            >
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
              <ProductCard
                key={product.id}
                product={product}
                onBuy={handleBuy}
                buying={buyingId === product.id}
                selectedVid={selectedVids[product.id] || ''}
                onSelectVariant={handleSelectVariant}
              />
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
              All pieces are 925 sterling silver · Houston, TX · $10 FedEx Ground shipping
            </p>
          </div>
        )}

      </div>
    </section>
  );
}
