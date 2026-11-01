import { useState, useEffect, useCallback } from 'react';
import { getAdminToken, verifyAdminPassword } from '../utils/adminAuth';
import { Plus, Edit2, Trash2, Eye, EyeOff, Save, X, RefreshCw, Package, ExternalLink } from 'lucide-react';

interface Variant {
  vid: string;
  name: string;
  price_cents?: number;
}

type ProductType = 'crafted' | 'selected' | 'promoted';

interface Product {
  id?: string;
  name: string;
  description: string;
  price_cents: number;
  image_url: string;
  category: string;
  quantity_remaining: number;
  active: boolean;
  variants?: Variant[];
  product_type?: ProductType;
  affiliate_url?: string | null;
}

const blankProduct = (product_type: ProductType): Product => ({
  name: '', description: '', price_cents: 0,
  image_url: '', category: 'pendant',
  quantity_remaining: product_type === 'promoted' ? 0 : 1, active: true,
  product_type,
  affiliate_url: null,
});

const isPromoted = (p: Product) => p.product_type === 'promoted';

const TYPE_LABEL: Record<ProductType, string> = {
  crafted: 'Crafted Product',
  selected: 'Selected Product',
  promoted: 'Promoted Product',
};

async function adminFetch(method: string, body?: object) {
  const res = await fetch('/.netlify/functions/admin-products', {
    method,
    headers: { 'Content-Type': 'application/json', 'x-admin-token': getAdminToken() },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || 'The change could not be saved');
  return data;
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

// ── Variant Price Editor (shared by import + edit forms) ──────────────────────
function VariantPriceEditor({
  variants,
  productName,
  prices,
  onPriceChange,
  onBulkApply,
}: {
  variants: { vid: string; name: string }[];
  productName: string;
  prices: Record<string, number>;
  onPriceChange: (vid: string, cents: number) => void;
  onBulkApply: (cents: number) => void;
}) {
  const [bulkVal, setBulkVal] = useState('');

  // Group by color
  const groups = new Map<string, typeof variants>();
  for (const v of variants) {
    const shortName = shortVariantName(v.name, productName);
    const color = getColorGroup(shortName);
    if (!groups.has(color)) groups.set(color, []);
    groups.get(color)!.push(v);
  }

  return (
    <div className="space-y-3">
      {/* Bulk price setter */}
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

      {/* Grouped variant rows */}
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
                const priceCents = prices[v.vid] || 0;
                return (
                  <div key={v.vid} className="flex items-center gap-2 bg-stone-50 hover:bg-amber-50/50 rounded-lg px-3 py-2 transition-colors">
                    <div className="flex-1 min-w-0">
                      <span className="text-xs text-stone-700 font-medium truncate block">{size || shortName}</span>
                    </div>
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
  const set = (k: keyof Product, v: any) => setForm(f => ({ ...f, [k]: v }));

  const promoted = isPromoted(form);
  const hasVariants = Array.isArray(form.variants) && form.variants.length > 0;
  const canSave = !!form.name && (promoted ? !!form.affiliate_url?.trim() : !!form.price_cents);

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

  const variantPricesMap: Record<string, number> = {};
  (form.variants || []).forEach(v => { variantPricesMap[v.vid] = v.price_cents || form.price_cents; });

  return (
    <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-5 space-y-4">
      <h3 className="font-bold text-stone-800 text-sm">{form.id ? 'Edit' : 'Add'} {TYPE_LABEL[form.product_type || 'crafted']}</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-stone-500 mb-1 block">Product Name *</label>
          <input value={form.name} onChange={e => set('name', e.target.value)}
            placeholder={promoted ? 'e.g. Vintage Silver Locket' : form.product_type === 'selected' ? 'e.g. Gold Hoop Earrings' : 'e.g. Silver Letter A Pendant'}
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

      {promoted ? (
        <div>
          <label className="text-xs font-semibold text-stone-500 mb-1 block">Your eBay or Amazon Link *</label>
          <input type="url" value={form.affiliate_url || ''} onChange={e => set('affiliate_url', e.target.value)}
            placeholder="https://…"
            className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:border-amber-400" />
          <p className="text-[10px] text-stone-400 mt-0.5">Use the link from your affiliate account so the sale is credited to you. Customers see the current price on the seller's site.</p>
        </div>
      ) : (
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
      )}

      <div>
        <label className="text-xs font-semibold text-stone-500 mb-1 block">Image URL</label>
        <input value={form.image_url} onChange={e => set('image_url', e.target.value)}
          placeholder="https://…"
          className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:border-amber-400" />
        {form.image_url && <img src={form.image_url} alt="preview" className="mt-2 h-20 w-20 object-cover rounded-lg border border-stone-200" />}
      </div>

      {/* Variant price editor for existing products */}
      {hasVariants && !promoted && (
        <div>
          <label className="text-xs font-semibold text-stone-500 mb-2 block">
            Variant Prices ({form.variants!.length} variants)
          </label>
          <VariantPriceEditor
            variants={form.variants || []}
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
        <button onClick={() => onSave(form)} disabled={saving || !canSave}
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

// ── Main panel ───────────────────────────────────────────────────────────────
export function OwnerProductPanel() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    const saved = getAdminToken();
    if (saved) verifyAdminPassword(saved).then(setAuthed);
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await verifyAdminPassword(password);
    setAuthed(ok);
    setError(!ok);
    if (!ok) setPassword('');
  };

  if (authed) return <ProductPanel />;
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <form onSubmit={submit} className="bg-white rounded-2xl shadow p-8 w-full max-w-sm space-y-3">
        <h1 className="text-xl font-semibold">Owner sign in</h1>
        <input type="password" autoFocus value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Admin password" className="w-full border rounded-lg px-3 py-2" />
        <button type="submit" className="w-full bg-stone-900 text-white rounded-lg py-2 font-semibold">Open</button>
        {error && <p className="text-red-500 text-sm">Incorrect password.</p>}
      </form>
    </div>
  );
}

function ProductPanel() {
  const [tab, setTab] = useState<ProductType>('crafted');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetch('GET');
      setProducts(Array.isArray(data) ? data : []);
    } catch (e: any) {
      alert(e.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const crafted = products.filter(p => (p.product_type || 'crafted') === 'crafted');
  const selected = products.filter(p => p.product_type === 'selected');
  const promoted = products.filter(isPromoted);
  const shown = { crafted, selected, promoted }[tab];

  const handleSave = async (product: Product) => {
    setSaving(true);
    try {
      product.id ? await adminFetch('PATCH', product) : await adminFetch('POST', product);
      await load();
      setEditing(null);
      setAdding(false);
    } catch (e: any) {
      alert(e.message);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await adminFetch('DELETE', { id });
    await load();
  };

  const handleToggleActive = async (product: Product) => {
    try {
      await adminFetch('PATCH', { id: product.id, active: !product.active });
      await load();
    } catch (e: any) {
      alert(e.message);
    }
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
            <p className="text-stone-500 text-sm mt-0.5">Keep what you craft separate from what you promote</p>
          </div>
          <button onClick={load} className="p-2 rounded-lg bg-stone-100 hover:bg-stone-200 transition-all" title="Refresh">
            <RefreshCw className="w-4 h-4 text-stone-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-stone-100 p-1 rounded-xl w-fit flex-wrap">
          {([
            ['crafted', `🔨 Crafted by Us (${crafted.length})`],
            ['selected', `🛍 Selected by Us (${selected.length})`],
            ['promoted', `🔗 Promoted (${promoted.length})`],
          ] as const).map(([t, label]) => (
            <button key={t} onClick={() => { setTab(t); setAdding(false); setEditing(null); }}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={tab === t
                ? { background: 'linear-gradient(135deg,#c9a84c,#e8c96a)', color: '#2a1800', boxShadow: '0 2px 8px rgba(201,168,76,0.3)' }
                : { background: 'transparent', color: '#78716c' }}>
              {label}
            </button>
          ))}
        </div>

        <p className="text-xs text-stone-500 mb-4">
          {tab === 'crafted'
            ? 'Made by you and sold through your own checkout. These show in your shop as handcrafted.'
            : tab === 'selected'
            ? <>Bought from brands, such as on Faire, and shipped by you. These show only on <a href="/selected" className="underline">Selected by Us</a>, labeled as not made by you.</>
            : <>Sold by other sellers through your affiliate links. These show only on <a href="/picks" className="underline">Our Picks</a>, labeled as not made by you.</>}
        </p>

        {(
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
                <ProductForm initial={blankProduct(tab)} onSave={handleSave} onCancel={() => setAdding(false)} saving={saving} />
              </div>
            )}

            {loading && (
              <div className="text-center py-16 text-stone-400">
                <RefreshCw className="w-6 h-6 mx-auto mb-2 animate-spin opacity-40" />
                Loading products…
              </div>
            )}

            {!loading && shown.length === 0 && !adding && (
              <div className="text-center py-16">
                <Package className="w-12 h-12 mx-auto mb-3 text-stone-200" />
                <p className="text-stone-400 font-medium">{`No ${TYPE_LABEL[tab].toLowerCase()}s yet.`}</p>
                <p className="text-stone-300 text-sm mt-1">{tab === 'promoted' ? 'Add a product with your eBay or Amazon link above.' : 'Add your first product above.'}</p>
              </div>
            )}

            {!loading && shown.length > 0 && (
              <div className="space-y-3">
                {shown.map(product => (
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
                              {!product.active && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-400">Hidden</span>
                              )}
                            </div>
                            {isPromoted(product) ? (
                              <a href={product.affiliate_url || '#'} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs text-amber-700 hover:underline mt-1 max-w-full">
                                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{product.affiliate_url}</span>
                              </a>
                            ) : (
                            <div className="flex items-center gap-3 mt-1">
                              {/* Show price range if variants have per-variant prices */}
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
                            )}
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
