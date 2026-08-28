import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Save, X, RefreshCw, Package, Search, ShoppingBag, Download } from 'lucide-react';

interface Variant {
  vid: string;
  name: string;
  cj_cost?: number;
  price_cents?: number;
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

interface CJProductDetail {
  pid: string;
  productNameEn: string;
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
  warehouseCountryCode?: string;
}

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

function shortVariantName(varName: string, prodName: string): string {
  const cleaned = varName.replace(prodName, '').replace(/^[\s\-–—·|,]+/, '').trim();
  return (cleaned && cleaned.length < varName.length) ? cleaned : varName;
}

function getColorGroup(shortName: string): string {
  const match = shortName.match(/^(Rose\s+Gold|Gold|Silver|Black|White|Blue|Red|Green|Purple)/i);
  if (match) return match[1].charAt(0).toUpperCase() + match[1].slice(1).toLowerCase();
  return shortName.split(' ')[0] || 'Style';
}

function getSizeLabel(shortName: string, colorGroup: string): string {
  const after = shortName.slice(colorGroup.length).replace(/^[\s\-]+/, '').trim();
  return after.replace(/\s*(Yards?)\s*/gi, '').replace(/^Size\s*/i, '').trim() || after;
}

// ── Variant Price Editor ──────────────────────────────────────────────────────
function VariantPriceEditor({
  variants,
  productName,
  prices,
  onPriceChange,
  onBulkApply,
}: {
  variants: { vid: string; name: string; cj_cost?: number; variantSellPrice?: string | number; warehouseCountryCode?: string }[];
  productName: string;
  prices: Record<string, number>;
  onPriceChange: (vid: string, cents: number) => void;
  onBulkApply: (cents: number) => void;
}) {
  const [bulkVal, setBulkVal] = useState('');

  const groups = new Map<string, typeof variants>();
  for (const v of variants) {
    const shortName = shortVariantName(v.name, productName);
    const color = getColorGroup(shortName);
    if (!groups.has(color)) groups.set(color, []);
    groups.get(color)!.push(v);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
        <span className="text-xs text-stone-600 font-semibold whitespace-nowrap">Set all to:</span>
        <div className="flex items-center gap-1">
          <span className="text-xs text-stone-400">$</span>
          <input
            type="number" min="0" step="0.01" placeholder="19.99"
            value={bulkVal}
            onChange={e => setBulkVal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { onBulkApply(Math.round(parseFloat(bulkVal || '0') * 100)); setBulkVal(''); } }}
            className="w-20 px-2 py-1 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:border-amber-400"
          />
        </div>
        <button
          onClick={() => { onBulkApply(Math.round(parseFloat(bulkVal || '0') * 100)); setBulkVal(''); }}
          disabled={!bulkVal}
          className="px-3 py-1 text-xs font-semibold rounded-lg transition-all disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c96a)', color: '#2a1800' }}
        >
          Apply to All
        </button>
      </div>

      <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
        {[...groups.entries()].map(([color, groupVars]) => (
          <div key={color}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1.5">
              {color} <span className="text-stone-300 normal-case tracking-normal font-normal">({groupVars.length})</span>
            </p>
            <div className="space-y-1">
              {groupVars.map(v => {
                const shortName = shortVariantName(v.name, productName);
                const size = getSizeLabel(shortName, color);
                const cjCost = toNum(v.cj_cost ?? v.variantSellPrice ?? 0);
                const priceCents = prices[v.vid] || 0;
                return (
                  <div key={v.vid} className="flex items-center gap-2 bg-stone-50 hover:bg-amber-50/50 rounded-lg px-3 py-2 transition-colors">
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-stone-700 font-medium truncate block">{size || shortName}</span>
                      <span className="text-[9px] font-mono text-stone-300 truncate block select-all" title="CJ Variant ID (VID/SKU)">{v.vid}</span>
                    </div>
                    {v.warehouseCountryCode && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-stone-200 text-stone-500 whitespace-nowrap">
                        {v.warehouseCountryCode === 'US' ? '🇺🇸 US' : '🇨🇳 CN'}
                      </span>
                    )}
                    {cjCost > 0 && (
                      <span className="text-[10px] text-stone-400 whitespace-nowrap">CJ ${cjCost.toFixed(2)}</span>
                    )}
                    <span className="text-stone-300 text-xs">→</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-stone-400">$</span>
                      <input
                        type="number" min="0" step="0.01"
                        value={priceCents > 0 ? (priceCents / 100).toFixed(2) : ''}
                        placeholder="0.00"
                        onChange={e => onPriceChange(v.vid, Math.round(parseFloat(e.target.value || '0') * 100))}
                        className="w-16 px-1.5 py-0.5 text-xs border border-stone-200 rounded bg-white focus:outline-none focus:border-amber-400 text-right"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ProductForm ──────────────────────────────────────────────────────────────
function ProductForm({ initial, onSave, onCancel, saving }: {
  initial: Product; onSave: (p: Product) => void; onCancel: () => void; saving: boolean;
}) {
  const [form, setForm] = useState<Product>(initial);
  const [spuLookup, setSpuLookup] = useState<{ status: 'idle' | 'loading' | 'ok' | 'error'; name?: string }>({ status: 'idle' });
  const set = (k: keyof Product, v: any) => setForm(f => ({ ...f, [k]: v }));

  const hasVariants = Array.isArray(form.variants) && form.variants.length > 0;

  const updateVariantPrice = (vid: string, price_cents: number) => {
    setForm(f => ({
      ...f,
      variants: (f.variants || []).map(v => v.vid === vid ? { ...v, price_cents } : v),
    }));
  };

  const applyBulkToVariants = (cents: number) => {
    if (!cents) return;
    setForm(f => ({
      ...f,
      variants: (f.variants || []).map(v => ({ ...v, price_cents: cents })),
    }));
  };

  const verifySPU = async () => {
    const input = form.cj_pid?.trim();
    if (!input) return;
    setSpuLookup({ status: 'loading' });
    try {
      const data = await cjFetch('search', { keyword: input });
      const match = data.list?.[0];
      if (match?.pid) {
        // Keep what the user typed (e.g. CJLX1683903) — only normalize if they pasted a URL
        const isCJCode = /^CJ[A-Za-z0-9]+$/i.test(input);
        if (!isCJCode) set('cj_pid', match.pid);
        setSpuLookup({ status: 'ok', name: match.productNameEn });
      } else {
        setSpuLookup({ status: 'error' });
      }
    } catch {
      setSpuLookup({ status: 'error' });
    }
  };

  const variantPricesMap: Record<string, number> = {};
  (form.variants || []).forEach(v => { variantPricesMap[v.vid] = v.price_cents || form.price_cents; });

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
          <label className="text-xs font-semibold text-stone-500 mb-1 block">
            {hasVariants ? 'Base / Default Price ($)' : 'Price ($) *'}
          </label>
          <input type="number" min="0" step="0.01"
            value={(form.price_cents / 100).toFixed(2)}
            onChange={e => set('price_cents', Math.round(parseFloat(e.target.value || '0') * 100))}
            className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:border-amber-400" />
          {hasVariants && (
            <p className="text-[10px] text-stone-400 mt-0.5">Used as fallback if a variant has no price set</p>
          )}
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

      {/* CJ SPU field */}
      <div>
        <label className="text-xs font-semibold text-stone-500 mb-1 block">
          CJ SPU (Product ID)
          <span className="ml-1 font-normal text-stone-400">— paste from CJ dashboard</span>
        </label>
        <div className="flex gap-2">
          <input
            value={form.cj_pid || ''}
            onChange={e => { set('cj_pid', e.target.value); setSpuLookup({ status: 'idle' }); }}
            placeholder="e.g. CJLX1683903 or paste a CJ product URL"
            className="flex-1 px-3 py-2 text-sm font-mono border border-stone-200 rounded-lg bg-white focus:outline-none focus:border-amber-400"
          />
          <button
            type="button"
            onClick={verifySPU}
            disabled={!form.cj_pid?.trim() || spuLookup.status === 'loading'}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-stone-200 bg-white hover:bg-stone-50 disabled:opacity-40 transition-all whitespace-nowrap"
          >
            {spuLookup.status === 'loading'
              ? <><RefreshCw className="w-3 h-3 animate-spin" /> Checking…</>
              : <><Search className="w-3 h-3" /> Verify from CJ</>}
          </button>
        </div>
        {spuLookup.status === 'ok' && (
          <p className="text-[11px] text-emerald-600 mt-1 font-medium">
            ✓ Confirmed: <span className="font-normal">{spuLookup.name}</span>
            <span className="ml-1.5 text-emerald-500 font-mono">{form.cj_pid}</span>
          </p>
        )}
        {spuLookup.status === 'error' && (
          <p className="text-[11px] text-red-500 mt-1">⚠ Not found on CJ — check the SPU and try again</p>
        )}
        <p className="text-[10px] text-stone-400 mt-0.5">
          On CJ dashboard → My Products → copy the SPU shown below the product name (e.g. <span className="font-mono">CJLX1683903</span>)
        </p>
      </div>

      {hasVariants && (
        <div>
          <label className="text-xs font-semibold text-stone-500 mb-2 block">
            Variant Prices ({form.variants!.length} variants)
          </label>
          <VariantPriceEditor
            variants={(form.variants || []).map(v => ({ vid: v.vid, name: v.name, cj_cost: v.cj_cost, warehouseCountryCode: (v as any).warehouseCountryCode }))}
            productName={form.name}
            prices={variantPricesMap}
            onPriceChange={updateVariantPrice}
            onBulkApply={applyBulkToVariants}
          />
        </div>
      )}

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
  const [variantPrices, setVariantPrices] = useState<Record<string, number>>({});
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
    } catch (e: any) { setSearchError(e.message || 'Search failed'); }
    setSearching(false);
  };

  const selectProduct = async (product: CJProduct) => {
    setSelected(product);
    setVariants([]);
    setVariantPrices({});
    setLoadingVariants(true);
    try {
      const data = await cjFetch('variants', { pid: product.pid });
      const list: CJVariant[] = Array.isArray(data) ? data : [];
      setVariants(list);
      const defaultPrices: Record<string, number> = {};
      list.forEach(v => {
        defaultPrices[v.vid] = Math.ceil(toNum(v.variantSellPrice) * 2.5 * 100);
      });
      setVariantPrices(defaultPrices);
    } catch {
      setVariantPrices({});
    }
    setLoadingVariants(false);
  };

  const doImport = async () => {
    if (!selected) return;
    setImporting(true);
    try {
      await cjFetch('import', {
        product: {
          pid: selected.pid,
          name: selected.productNameEn,
          description: variants.length > 0
            ? `${variants.length} variants available — choose your size and style`
            : '',
          image_url: selected.productImage,
          price_cents: variants.length > 0
            ? Math.min(...variants.map(v => variantPrices[v.vid] || Math.ceil(toNum(selected.sellPrice) * 2.5 * 100)))
            : Math.ceil(toNum(selected.sellPrice) * 2.5 * 100),
          category,
          variants: variants.map(v => ({
            vid: v.vid,
            name: v.variantNameEn,
            cj_cost: toNum(v.variantSellPrice),
            price_cents: variantPrices[v.vid] || Math.ceil(toNum(v.variantSellPrice) * 2.5 * 100),
            warehouseCountryCode: v.warehouseCountryCode || 'CN',
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

  const detectType = (v: string) => {
    const t = v.trim();
    if (/cjdropshipping\.com\/product\/.+-p-(\d+)\.html/i.test(t)) return { label: 'CJ product URL — direct lookup', color: '#7c3aed' };
    if (/^CJ[A-Za-z]{1,4}\d+$/i.test(t)) return { label: 'SPU — keyword search on CJ', color: '#059669' };
    if (/^CJ[A-Za-z0-9]{5,}$/i.test(t)) return { label: 'VID/SKU — keyword search on CJ', color: '#059669' };
    if (/^\d{10,}$/.test(t)) return { label: 'Numeric ID — direct lookup', color: '#059669' };
    if (t.length > 0) return { label: 'Keyword search', color: '#6b7280' };
    return null;
  };
  const typeHint = detectType(keyword);

  const setPricesCount = variants.filter(v => (variantPrices[v.vid] || 0) > 0).length;
  const minPrice = variants.length > 0
    ? Math.min(...variants.map(v => variantPrices[v.vid] || 0).filter(Boolean))
    : 0;
  const maxPrice = variants.length > 0
    ? Math.max(...variants.map(v => variantPrices[v.vid] || 0))
    : 0;

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <div className="flex gap-2">
          <input
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { setPage(1); search(1); } }}
            placeholder="SPU (CJLX1683903), VID/SKU, keyword, or CJ product URL"
            className="flex-1 px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:border-amber-400"
          />
          <button onClick={() => { setPage(1); search(1); }} disabled={searching}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 transition-all"
            style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c96a)', color: '#2a1800' }}>
            <Search className="w-4 h-4" />
            {searching ? 'Searching…' : 'Search'}
          </button>
        </div>
        <div className="px-1">
          {typeHint ? (
            <span className="text-[11px] font-medium" style={{ color: typeHint.color }}>↳ {typeHint.label}</span>
          ) : (
            <span className="text-[11px] text-stone-400">
              Tip: paste an SPU like <code className="bg-stone-100 px-1 rounded">CJLX1683903</code> for exact match
            </span>
          )}
        </div>
      </div>

      {searchError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2.5 rounded-xl">
          ⚠️ {searchError}
        </div>
      )}

      {toast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-2.5 rounded-xl">
          ✅ Imported — go to <strong>My Products</strong> tab to activate it
        </div>
      )}

      {selected && (
        <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-start gap-3">
            <img src={selected.productImage} alt="" className="w-16 h-16 object-cover rounded-xl flex-shrink-0 border border-stone-100" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-stone-800 text-sm leading-snug">{selected.productNameEn}</p>
              <p className="text-xs text-stone-400 mt-0.5">CJ base: ${toNum(selected.sellPrice).toFixed(2)}</p>
              <p className="text-[10px] font-mono text-stone-400 mt-0.5 select-all">SPU: {selected.pid}</p>
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
              <div className="grid grid-cols-2 gap-3">
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
                {variants.length > 0 && setPricesCount > 0 && (
                  <div className="flex flex-col justify-center">
                    <p className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider">Price range</p>
                    <p className="text-sm font-bold" style={{ color: '#c9a84c' }}>
                      {minPrice === maxPrice
                        ? `$${(minPrice / 100).toFixed(2)}`
                        : `$${(minPrice / 100).toFixed(2)} – $${(maxPrice / 100).toFixed(2)}`}
                    </p>
                    <p className="text-[10px] text-stone-400">{setPricesCount}/{variants.length} priced</p>
                  </div>
                )}
              </div>

              {variants.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-stone-500 mb-2 block">
                    Set prices per variant ({variants.length} total)
                  </label>
                  <VariantPriceEditor
                    variants={variants.map(v => ({
                      vid: v.vid,
                      name: v.variantNameEn,
                      variantSellPrice: v.variantSellPrice,
                      warehouseCountryCode: v.warehouseCountryCode,
                    }))}
                    productName={selected.productNameEn}
                    prices={variantPrices}
                    onPriceChange={(vid, cents) => setVariantPrices(p => ({ ...p, [vid]: cents }))}
                    onBulkApply={cents => {
                      if (!cents) return;
                      const all: Record<string, number> = {};
                      variants.forEach(v => { all[v.vid] = cents; });
                      setVariantPrices(all);
                    }}
                  />
                </div>
              )}

              <button onClick={doImport} disabled={importing || setPricesCount === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c96a)', color: '#2a1800' }}>
                <Download className="w-3.5 h-3.5" />
                {importing
                  ? 'Importing…'
                  : variants.length > 0
                    ? `Import with all ${variants.length} variants (saves as hidden)`
                    : 'Import to My Shop (saves as hidden)'}
              </button>
              {variants.length > 0 && setPricesCount === 0 && (
                <p className="text-xs text-amber-600">↑ Set at least one price above to import</p>
              )}
            </>
          )}
        </div>
      )}

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
                  <p className="text-[10px] font-bold mb-1" style={{ color: '#c9a84c' }}>CJ: ${toNum(p.sellPrice).toFixed(2)}</p>
                  <p className="text-[9px] font-mono text-stone-300 mb-2 truncate select-all" title="SPU">{p.pid}</p>
                  <button onClick={() => selectProduct(p)}
                    className="w-full py-1.5 rounded-lg text-[11px] font-semibold transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c96a)', color: '#2a1800' }}>
                    Select & Price
                  </button>
                </div>
              </div>
            ))}
          </div>
          {total > 20 && (
            <div className="flex items-center justify-center gap-3 pt-2">
              <button disabled={page === 1} onClick={() => { const p = page - 1; setPage(p); search(p); }}
                className="px-3 py-1.5 text-xs rounded-lg border border-stone-200 disabled:opacity-40 hover:bg-stone-50">← Prev</button>
              <span className="text-xs text-stone-400">Page {page} of {Math.ceil(total / 20)}</span>
              <button disabled={page * 20 >= total} onClick={() => { const p = page + 1; setPage(p); search(p); }}
                className="px-3 py-1.5 text-xs rounded-lg border border-stone-200 disabled:opacity-40 hover:bg-stone-50">Next →</button>
            </div>
          )}
        </>
      )}

      {!searching && results.length === 0 && !selected && !searchError && (
        <div className="text-center py-16 text-stone-300">
          <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">Search the CJ catalog above</p>
          <p className="text-xs mt-1">Try "925 silver ring", "initial pendant", or paste an SPU like CJLX1683903</p>
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
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-500 border border-orange-100">CJ</span>
                              )}
                              {!product.active && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-400">Hidden</span>
                              )}
                            </div>
                            {product.cj_pid && (
                              <p className="text-[10px] font-mono text-stone-400 mt-0.5 leading-tight">
                                <span className="text-stone-300">SPU:</span> <span className="text-stone-500 select-all">{product.cj_pid}</span>
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-1">
                              {Array.isArray(product.variants) && product.variants.length > 0 ? (() => {
                                const prices = product.variants!.filter(v => v.price_cents).map(v => v.price_cents!);
                                if (prices.length === 0) return (
                                  <span className="text-sm font-bold" style={{ color: '#c9a84c' }}>
                                    ${(product.price_cents / 100).toFixed(2)}
                                  </span>
                                );
                                const min = Math.min(...prices);
                                const max = Math.max(...prices);
                                return (
                                  <span className="text-sm font-bold" style={{ color: '#c9a84c' }}>
                                    {min === max ? `$${(min / 100).toFixed(2)}` : `$${(min / 100).toFixed(2)}–$${(max / 100).toFixed(2)}`}
                                  </span>
                                );
                              })() : (
                                <span className="text-sm font-bold" style={{ color: '#c9a84c' }}>
                                  ${(product.price_cents / 100).toFixed(2)}
                                </span>
                              )}
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
