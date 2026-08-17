import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Save, X, RefreshCw, Package, Search, ShoppingBag, Download } from 'lucide-react';

interface Variant {
  vid: string;
  name: string;
  cj_cost?: number;
}

interface Product {
  id?: string;
  name: string;
  description: string;
  price_cents: number;
  image_url: string;
  category: string;
  quantity_remaining: number;
  active: boolean;
  cj_pid?: string;
  cj_vid?: string;
  variants?: Variant[];
}

interface CJProduct {
  pid: string;
  productNameEn: string;
  productImage: string;
  sellPrice: string | number;
  categoryName: string;
}

interface CJVariant {
  vid: string;
  variantNameEn: string;
  variantSellPrice: string | number;
  variantImage?: string;
}

// CJ returns prices as strings — always parse before math
const toNum = (v: any): number => parseFloat(String(v ?? 0)) || 0;

const BLANK: Product = {
  name: '', description: '', price_cents: 0,
  image_url: '', category: 'pendant',
  quantity_remaining: 1, active: true,
};

const ADMIN_TOKEN = 'forgedadmin2026';

async function adminFetch(method: string, body?: object) {
  const res = await fetch('/.netlify/functions/admin-products', {
    method,
    headers: { 'Content-Type': 'application/json', 'x-admin-token': ADMIN_TOKEN },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

async function cjFetch(action: string, extra: object = {}) {
  const res = await fetch('/.netlify/functions/cj-products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-token': ADMIN_TOKEN },
    body: JSON.stringify({ action, ...extra }),
  });
  return res.json();
}

// Strip product name prefix from variant label
function shortVariantName(varName: string, prodName: string): string {
  const cleaned = varName.replace(prodName, '').replace(/^[\s\-–—·|,]+/, '').trim();
  return (cleaned && cleaned.length < varName.length) ? cleaned : varName;
}

// ── ProductForm ──────────────────────────────────────────────────────────────
function ProductForm({ initial, onSave, onCancel, saving }: {
  initial: Product; onSave: (p: Product) => void; onCancel: () => void; saving: boolean;
}) {
  const [form, setForm] = useState(initial);
  const set = (k: keyof Product, v: any) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-5 space-y-4">
      <h3 className="font-bold text-stone-800 text-sm">{form.id ? 'Edit Product' : 'Add New Product'}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-stone-500 mb-1 block">Product Name *</label>
          <input value={form.name} onChange={e => set('name', e.target.value)}
            placeholder="e.g. Gold Initial Ring — Letter A"
            className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:border-amber-400" />
        </div>
        <div>
          <label className="text-xs font-semibold text-stone-500 mb-1 block">Category *</label>
          <select value={form.category} onChange={e => set('category', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:border-amber-400">
            <option value="ring">Ring</option>
            <option value="pendant">Pendant</option>
            <option value="earring">Earring</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-stone-500 mb-1 block">Description</label>
        <textarea value={form.description} onChange={e => set('description', e.target.value)}
          placeholder="Describe the piece…" rows={2}
          className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:border-amber-400 resize-none" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-stone-500 mb-1 block">Price ($) *</label>
          <input type="number" min="0" step="0.01"
            value={(form.price_cents / 100).toFixed(2)}
            onChange={e => set('price_cents', Math.round(parseFloat(e.target.value || '0') * 100))}
            className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:border-amber-400" />
        </div>
        <div>
          <label className="text-xs font-semibold text-stone-500 mb-1 block">Qty in Stock *</label>
          <input type="number" min="0" value={form.quantity_remaining}
            onChange={e => set('quantity_remaining', parseInt(e.target.value || '0'))}
            className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:border-amber-400" />
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-stone-500 mb-1 block">Image URL</label>
        <input value={form.image_url} onChange={e => set('image_url', e.target.value)}
          placeholder="https://…"
          className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:border-amber-400" />
        {form.image_url && <img src={form.image_url} alt="preview" className="mt-2 h-20 w-20 object-cover rounded-lg border border-stone-200" />}
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="active-toggle" checked={form.active}
          onChange={e => set('active', e.target.checked)} className="w-4 h-4 accent-amber-500" />
        <label htmlFor="active-toggle" className="text-xs font-semibold text-stone-600">Listed publicly</label>
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={() => onSave(form)} disabled={saving || !form.name || !form.price_cents}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c96a)', color: '#2a1800' }}>
          <Save className="w-3.5 h-3.5" />{saving ? 'Saving…' : 'Save Product'}
        </button>
        <button onClick={onCancel}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all">
          <X className="w-3.5 h-3.5" /> Cancel
        </button>
      </div>
    </div>
  );
}

// ── CJImportPanel ────────────────────────────────────────────────────────────
function CJImportPanel({ onImported }: { onImported: () => void }) {
  const [keyword, setKeyword] = useState('sterling silver jewelry');
  const [results, setResults] = useState<CJProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [selected, setSelected] = useState<CJProduct | null>(null);
  const [variants, setVariants] = useState<CJVariant[]>([]);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [sellPrice, setSellPrice] = useState(0);
  const [category, setCategory] = useState('pendant');
  const [importing, setImporting] = useState(false);
  const [toast, setToast] = useState('');

  const search = async (p: number) => {
    if (!keyword.trim()) return;
    setSearching(true);
    setSearchError('');
    setSelected(null);
    setResults([]);
    try {
      const data = await cjFetch('search', { keyword, page: p });
      if (data.error) { setSearchError(data.error); }
      else { setResults(data.list || []); setTotal(data.total || 0); }
    } catch (e: any) {
      setSearchError(e.message || 'Search failed');
    }
    setSearching(false);
  };

  const selectProduct = async (product: CJProduct) => {
    setSelected(product);
    setVariants([]);
    setLoadingVariants(true);
    try {
      const data = await cjFetch('variants', { pid: product.pid });
      const list: CJVariant[] = Array.isArray(data) ? data : [];
      setVariants(list);
      // Use first variant's cost as the price hint
      const baseCost = list[0] ? toNum(list[0].variantSellPrice) : toNum(product.sellPrice);
      setSellPrice(Math.ceil(baseCost * 2.5 * 100));
    } catch {
      setSellPrice(Math.ceil(toNum(product.sellPrice) * 2.5 * 100));
    }
    setLoadingVariants(false);
  };

  // Import the product with ALL variants stored — customers choose on storefront
  const doImport = async () => {
    if (!selected) return;
    setImporting(true);
    try {
      await cjFetch('import', {
        product: {
          pid: selected.pid,
          name: selected.productNameEn,
          description: variants.length > 0
            ? `${variants.length} size variants available — choose yours at checkout`
            : '',
          image_url: selected.productImage,
          price_cents: sellPrice,
          category,
          variants: variants.map(v => ({
            vid: v.vid,
            name: v.variantNameEn,
            cj_cost: toNum(v.variantSellPrice),
          })),
        },
      });
      setToast(selected.productNameEn);
      setSelected(null);
      onImported();
      setTimeout(() => setToast(''), 5000);
    } catch (e: any) {
      alert('Import failed: ' + e.message);
    }
    setImporting(false);
  };

  // Live search type hint
  const detectType = (v: string) => {
    const t = v.trim();
    if (/cjdropshipping\.com\/product\/.+-p-(\d+)\.html/i.test(t)) return { label: 'CJ product URL', color: '#7c3aed' };
    if (/^CJ[A-Z0-9]{5,}$/i.test(t)) return { label: 'SKU lookup', color: '#059669' };
    if (/^\d{10,}$/.test(t)) return { label: 'Product ID lookup', color: '#059669' };
    if (t.length > 0) return { label: 'Keyword search', color: '#6b7280' };
    return null;
  };
  const typeHint = detectType(keyword);

  // Representative CJ cost for margin display (cheapest variant)
  const minCost = variants.length > 0
    ? Math.min(...variants.map(v => toNum(v.variantSellPrice)))
    : toNum(selected?.sellPrice ?? 0);
  const markup = minCost > 0 && sellPrice > 0
    ? Math.round((sellPrice / 100 / minCost - 1) * 100)
    : null;

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="space-y-1.5">
        <div className="flex gap-2">
          <input
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { setPage(1); search(1); } }}
            placeholder="Keyword, SKU (CJLX204893911KP), or paste a CJ product URL"
            className="flex-1 px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:border-amber-400"
          />
          <button onClick={() => { setPage(1); search(1); }} disabled={searching}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 transition-all"
            style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c96a)', color: '#2a1800' }}>
            <Search className="w-4 h-4" />
            {searching ? 'Searching…' : 'Search'}
          </button>
        </div>
        <div className="flex items-center gap-3 px-1">
          {typeHint ? (
            <span className="text-[11px] font-medium" style={{ color: typeHint.color }}>
              ↳ {typeHint.label}
            </span>
          ) : (
            <span className="text-[11px] text-stone-400">
              Tip: paste a SKU like <code className="bg-stone-100 px-1 rounded">CJLX204893911KP</code> or a full CJ product URL for exact match
            </span>
          )}
        </div>
      </div>

      {/* Error */}
      {searchError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-xl">
          ⚠️ {searchError} — check that CJ_EMAIL and CJ_API_KEY are set in Netlify env vars.
        </div>
      )}

      {/* Success toast */}
      {toast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-2.5 rounded-xl flex items-center gap-2">
          ✅ Imported — go to <strong>My Products</strong> tab to activate <span className="truncate max-w-[180px] font-semibold">{toast}</span>
        </div>
      )}

      {/* Product detail panel */}
      {selected && (
        <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-start gap-3">
            <img src={selected.productImage} alt="" className="w-16 h-16 object-cover rounded-xl flex-shrink-0 border border-stone-100" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-stone-800 text-sm leading-snug">{selected.productNameEn}</p>
              <p className="text-xs text-stone-400 mt-0.5">CJ base price: ${toNum(selected.sellPrice).toFixed(2)}</p>
            </div>
            <button onClick={() => setSelected(null)} className="p-1 rounded hover:bg-stone-100 flex-shrink-0">
              <X className="w-4 h-4 text-stone-400" />
            </button>
          </div>

          {loadingVariants ? (
            <p className="text-sm text-stone-400 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Loading variants…
            </p>
          ) : (
            <>
              {/* Show all variants as info — all will be imported */}
              {variants.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-stone-500 mb-2">
                    All {variants.length} variants will be imported — customers choose on the product page
                  </p>
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {variants.map(v => {
                      const label = shortVariantName(v.variantNameEn, selected.productNameEn);
                      return (
                        <span key={v.vid}
                          className="px-2.5 py-1 rounded-full text-xs font-medium border border-stone-200 bg-white text-stone-600">
                          {label} · ${toNum(v.variantSellPrice).toFixed(2)}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-stone-500 mb-1 block">Your Sell Price ($) *</label>
                  <input type="number" min="0" step="0.01"
                    value={(sellPrice / 100).toFixed(2)}
                    onChange={e => setSellPrice(Math.round(parseFloat(e.target.value || '0') * 100))}
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:border-amber-400" />
                  {markup !== null && (
                    <p className="text-[10px] mt-0.5" style={{ color: markup >= 0 ? '#6b7280' : '#ef4444' }}>
                      Min CJ cost: ${minCost.toFixed(2)} · {markup >= 0 ? `+${markup}% margin` : `${markup}% below cost!`}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-stone-500 mb-1 block">Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:border-amber-400">
                    <option value="ring">Ring</option>
                    <option value="pendant">Pendant</option>
                    <option value="earring">Earring</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <button onClick={doImport} disabled={importing || !sellPrice}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c96a)', color: '#2a1800' }}>
                <Download className="w-3.5 h-3.5" />
                {importing
                  ? 'Importing…'
                  : variants.length > 0
                    ? `Import with all ${variants.length} variants (saves as hidden)`
                    : 'Import to My Shop (saves as hidden)'}
              </button>
            </>
          )}
        </div>
      )}

      {/* Results grid */}
      {!selected && results.length > 0 && (
        <>
          <p className="text-xs text-stone-400">{total.toLocaleString()} results — page {page}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {results.map(p => (
              <div key={p.pid} className="bg-white border border-stone-100 rounded-xl overflow-hidden hover:border-amber-200 transition-all hover:shadow-md group">
                <div className="aspect-square overflow-hidden bg-stone-50">
                  <img src={p.productImage} alt={p.productNameEn}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-medium text-stone-700 line-clamp-2 leading-snug mb-1">{p.productNameEn}</p>
                  <p className="text-[10px] font-bold mb-2" style={{ color: '#c9a84c' }}>
                    CJ: ${toNum(p.sellPrice).toFixed(2)}
                  </p>
                  <button onClick={() => selectProduct(p)}
                    className="w-full py-1.5 rounded-lg text-[11px] font-semibold transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c96a)', color: '#2a1800' }}>
                    Select
                  </button>
                </div>
              </div>
            ))}
          </div>
          {total > 20 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button disabled={page === 1}
                onClick={() => { const p = page - 1; setPage(p); search(p); }}
                className="px-3 py-1.5 text-xs rounded-lg border border-stone-200 disabled:opacity-40 hover:bg-stone-50">← Prev</button>
              <span className="text-xs text-stone-400">Page {page} of {Math.ceil(total / 20)}</span>
              <button disabled={page * 20 >= total}
                onClick={() => { const p = page + 1; setPage(p); search(p); }}
                className="px-3 py-1.5 text-xs rounded-lg border border-stone-200 disabled:opacity-40 hover:bg-stone-50">Next →</button>
            </div>
          )}
        </>
      )}

      {!searching && results.length === 0 && !selected && !searchError && (
        <div className="text-center py-16 text-stone-300">
          <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">Search the CJ catalog above</p>
          <p className="text-xs mt-1">Try "925 silver ring", "initial pendant", "hoop earrings"</p>
        </div>
      )}
    </div>
  );
}

// ── Main panel ───────────────────────────────────────────────────────────────
export function OwnerProductPanel() {
  const [tab, setTab] = useState<'products' | 'cj'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await adminFetch('GET');
    setProducts(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (product: Product) => {
    setSaving(true);
    try {
      product.id ? await adminFetch('PATCH', product) : await adminFetch('POST', product);
      await load();
      setEditing(null);
      setAdding(false);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await adminFetch('DELETE', { id });
    await load();
  };

  const handleToggleActive = async (product: Product) => {
    await adminFetch('PATCH', { id: product.id, active: !product.active });
    await load();
  };

  const handleStockChange = async (product: Product, delta: number) => {
    const newQty = Math.max(0, product.quantity_remaining + delta);
    await adminFetch('PATCH', { id: product.id, quantity_remaining: newQty });
    setProducts(p => p.map(x => x.id === product.id ? { ...x, quantity_remaining: newQty } : x));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/30 to-white pt-6 pb-20 px-4">
      <div className="max-w-4xl mx-auto">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">Product Management</h1>
            <p className="text-stone-500 text-sm mt-0.5">Manage inventory & import from CJ Dropshipping</p>
          </div>
          <button onClick={load} className="p-2 rounded-lg bg-stone-100 hover:bg-stone-200 transition-all" title="Refresh">
            <RefreshCw className="w-4 h-4 text-stone-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-stone-100 p-1 rounded-xl w-fit">
          {(['products', 'cj'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={tab === t
                ? { background: 'linear-gradient(135deg,#c9a84c,#e8c96a)', color: '#2a1800', boxShadow: '0 2px 8px rgba(201,168,76,0.3)' }
                : { background: 'transparent', color: '#78716c' }}>
              {t === 'products' ? '📦 My Products' : '🔗 Import from CJ'}
            </button>
          ))}
        </div>

        {tab === 'cj' && <CJImportPanel onImported={load} />}

        {tab === 'products' && (
          <>
            <div className="flex justify-end mb-4">
              <button onClick={() => { setAdding(true); setEditing(null); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c96a)', color: '#2a1800' }}>
                <Plus className="w-4 h-4" /> Add Product
              </button>
            </div>

            {adding && (
              <div className="mb-6">
                <ProductForm initial={BLANK} onSave={handleSave} onCancel={() => setAdding(false)} saving={saving} />
              </div>
            )}

            {loading && (
              <div className="text-center py-16 text-stone-400">
                <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin opacity-40" />
                Loading products…
              </div>
            )}

            {!loading && products.length === 0 && !adding && (
              <div className="text-center py-16">
                <Package className="w-12 h-12 mx-auto mb-3 text-stone-200" />
                <p className="text-stone-400 font-medium">No products yet.</p>
                <p className="text-stone-300 text-sm mt-1">Add manually or import from CJ Dropshipping.</p>
              </div>
            )}

            {!loading && products.length > 0 && (
              <div className="space-y-3">
                {products.map(product => (
                  <div key={product.id}>
                    {editing?.id === product.id ? (
                      <ProductForm initial={editing} onSave={handleSave} onCancel={() => setEditing(null)} saving={saving} />
                    ) : (
                      <div className={`bg-white rounded-2xl border p-4 transition-all ${product.active ? 'border-stone-100' : 'border-dashed border-stone-200 opacity-60'}`}>
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-50 flex-shrink-0">
                            {product.image_url
                              ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-stone-200" /></div>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-stone-800 text-sm truncate">{product.name}</span>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
                                style={{ background: 'rgba(201,168,76,0.15)', color: '#8a6010' }}>
                                {product.category}
                              </span>
                              {Array.isArray(product.variants) && product.variants.length > 0 && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-500 border border-blue-100">
                                  {product.variants.length} sizes
                                </span>
                              )}
                              {product.cj_pid && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-500 border border-orange-100">
                                  CJ
                                </span>
                              )}
                              {!product.active && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-400">Hidden</span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-sm font-bold" style={{ color: '#c9a84c' }}>
                                ${(product.price_cents / 100).toFixed(2)}
                              </span>
                              <div className="flex items-center gap-1">
                                <button onClick={() => handleStockChange(product, -1)}
                                  className="w-5 h-5 rounded bg-stone-100 text-stone-600 text-xs font-bold hover:bg-stone-200 flex items-center justify-center">−</button>
                                <span className={`text-xs font-semibold w-8 text-center ${product.quantity_remaining === 0 ? 'text-red-500' : product.quantity_remaining <= 5 ? 'text-amber-600' : 'text-stone-600'}`}>
                                  {product.quantity_remaining}
                                </span>
                                <button onClick={() => handleStockChange(product, 1)}
                                  className="w-5 h-5 rounded bg-stone-100 text-stone-600 text-xs font-bold hover:bg-stone-200 flex items-center justify-center">+</button>
                                <span className="text-xs text-stone-400 ml-1">in stock</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button onClick={() => handleToggleActive(product)}
                              title={product.active ? 'Hide' : 'Show'}
                              className="p-1.5 rounded-lg hover:bg-stone-100 transition-all">
                              {product.active ? <Eye className="w-4 h-4 text-emerald-500" /> : <EyeOff className="w-4 h-4 text-stone-300" />}
                            </button>
                            <button onClick={() => { setEditing(product as Product); setAdding(false); }}
                              className="p-1.5 rounded-lg hover:bg-amber-50 transition-all">
                              <Edit2 className="w-4 h-4 text-amber-600" />
                            </button>
                            <button onClick={() => handleDelete(product.id!, product.name)}
                              className="p-1.5 rounded-lg hover:bg-red-50 transition-all">
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
