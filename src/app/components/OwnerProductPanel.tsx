import { useState, useEffect, useCallback } from 'react';
import { getAdminToken, verifyAdminPassword } from '../utils/adminAuth';
import { Plus, Edit2, Trash2, Eye, EyeOff, Save, X, RefreshCw, Package, Type } from 'lucide-react';

// ── Personalization config (shared with ShopSection via localStorage) ─────────
const PRODUCT_CONFIG_KEY = 'forged_product_config';

interface PersonalizationConfig {
  enabled: boolean;
  label: string;
  shopify_url?: string;
}

function loadConfig(): Record<string, PersonalizationConfig> {
  try {
    const raw = localStorage.getItem(PRODUCT_CONFIG_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveConfig(cfg: Record<string, PersonalizationConfig>) {
  localStorage.setItem(PRODUCT_CONFIG_KEY, JSON.stringify(cfg));
}

interface Variant {
  vid: string;
  name: string;
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
  variants?: Variant[];
}

const BLANK: Product = {
  name: '', description: '', price_cents: 0,
  image_url: '', category: 'pendant',
  quantity_remaining: 1, active: true,
};

async function adminFetch(method: string, body?: object) {
  const res = await fetch('/.netlify/functions/admin-products', {
    method,
    headers: { 'Content-Type': 'application/json', 'x-admin-token': getAdminToken() },
    body: body ? JSON.stringify(body) : undefined,
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

      {/* Variant price editor for existing products */}
      {hasVariants && (
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

// ── PersonalizationPanel ──────────────────────────────────────────────────────
function PersonalizationPanel() {
  const [config, setConfig] = useState<Record<string, PersonalizationConfig>>(loadConfig);
  const [newProductId, setNewProductId] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newPersonEnabled, setNewPersonEnabled] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const addRule = () => {
    const id = newProductId.trim();
    const url = newUrl.trim();
    if (!id || !url) return;
    const next = {
      ...config,
      [id]: {
        enabled: newPersonEnabled,
        label: newLabel.trim() || 'Enter your text',
        shopify_url: url,
      },
    };
    setConfig(next);
    saveConfig(next);
    setNewProductId('');
    setNewUrl('');
    setNewLabel('');
    setNewPersonEnabled(false);
    showToast('Redirect rule saved');
  };

  const removeRule = (id: string) => {
    const next = { ...config };
    delete next[id];
    setConfig(next);
    saveConfig(next);
    showToast('Rule removed');
  };

  const updateRule = (id: string, updates: Partial<PersonalizationConfig>) => {
    const next = { ...config, [id]: { ...config[id], ...updates } };
    setConfig(next);
    saveConfig(next);
  };

  const rules = Object.entries(config);

  return (
    <div className="space-y-5">
      <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-xs text-stone-500 leading-relaxed">
        Paste a Shopify product page URL and the product ID it matches in your shop. When a customer clicks "Buy Now" it redirects directly to that page. Optionally enable a personalization text field on the product modal.
      </div>

      {/* ── Add form ── */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 space-y-4">
        <h3 className="font-bold text-stone-800 text-sm">Add Redirect</h3>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1.5 block">
            Product ID
            <span className="normal-case tracking-normal font-normal text-stone-300 ml-1">— found in My Products (copy ID from edit form) or use shopify_XXXXX</span>
          </label>
          <input
            value={newProductId}
            onChange={e => setNewProductId(e.target.value)}
            placeholder="e.g. shopify_9876543210 or a UUID"
            className="w-full px-3 py-2 text-sm font-mono border border-stone-200 rounded-xl bg-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200 transition-all"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1.5 block">
            Shopify Product URL
          </label>
          <input
            type="url"
            value={newUrl}
            onChange={e => setNewUrl(e.target.value)}
            placeholder="https://shop.forged-initials.com/products/your-product"
            className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl bg-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-200 transition-all"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <input
            type="checkbox"
            id="new-person-toggle"
            checked={newPersonEnabled}
            onChange={e => setNewPersonEnabled(e.target.checked)}
            className="w-4 h-4 accent-amber-500"
          />
          <label htmlFor="new-person-toggle" className="text-xs font-semibold text-stone-600">
            Enable personalization text input on this product
          </label>
        </div>

        {newPersonEnabled && (
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1.5 block">
              Label shown to customer
            </label>
            <input
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              placeholder="e.g. Enter your initials"
              className="w-full px-3 py-2 text-sm border border-stone-200 rounded-xl bg-white focus:outline-none focus:border-amber-400 transition-all"
            />
          </div>
        )}

        <button
          onClick={addRule}
          disabled={!newProductId.trim() || !newUrl.trim()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 hover:scale-105"
          style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c96a)', color: '#2a1800' }}
        >
          <Plus className="w-4 h-4" /> Save Redirect
        </button>
      </div>

      {/* ── Existing rules ── */}
      {rules.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-stone-400">
            Active Rules ({rules.length})
          </p>
          {rules.map(([id, cfg]) => (
            <div key={id} className="bg-white border border-stone-100 rounded-2xl p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-mono text-stone-400 truncate select-all">{id}</p>
                  {cfg.shopify_url && (
                    <a
                      href={cfg.shopify_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-amber-600 hover:underline truncate block mt-0.5"
                    >
                      → {cfg.shopify_url}
                    </a>
                  )}
                </div>
                <button
                  onClick={() => removeRule(id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 flex-shrink-0 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => updateRule(id, { enabled: !cfg.enabled })}
                  className="relative w-9 h-5 rounded-full transition-all duration-200 flex-shrink-0"
                  style={{ background: cfg.enabled ? '#c9a84c' : '#e7e5e4' }}
                >
                  <span
                    className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200"
                    style={{ left: cfg.enabled ? '17px' : '2px' }}
                  />
                </button>
                <span className="text-xs text-stone-500">
                  {cfg.enabled ? 'Personalization text on' : 'Personalization text off'}
                </span>
              </div>

              {cfg.enabled && (
                <input
                  value={cfg.label || ''}
                  onChange={e => updateRule(id, { label: e.target.value })}
                  placeholder="Label shown to customer"
                  className="w-full px-3 py-1.5 text-xs border border-stone-200 rounded-lg bg-white focus:outline-none focus:border-amber-400 transition-all"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {rules.length === 0 && (
        <div className="text-center py-14 text-stone-300">
          <Type className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium text-stone-400">No redirect rules yet.</p>
          <p className="text-xs text-stone-300 mt-1">Add one above to send "Buy Now" straight to a Shopify product page.</p>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white text-sm font-medium px-5 py-3 rounded-full shadow-xl">
          {toast}
        </div>
      )}
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
  const [tab, setTab] = useState<'products' | 'personalization'>('products');
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
            <p className="text-stone-500 text-sm mt-0.5">Manage your products and inventory</p>
          </div>
          <button onClick={load} className="p-2 rounded-lg bg-stone-100 hover:bg-stone-200 transition-all" title="Refresh">
            <RefreshCw className="w-4 h-4 text-stone-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-stone-100 p-1 rounded-xl w-fit flex-wrap">
          {([
            ['products', '📦 My Products'],
            ['personalization', '✏️ Personalization'],
          ] as const).map(([t, label]) => (
            <button key={t} onClick={() => setTab(t)}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={tab === t
                ? { background: 'linear-gradient(135deg,#c9a84c,#e8c96a)', color: '#2a1800', boxShadow: '0 2px 8px rgba(201,168,76,0.3)' }
                : { background: 'transparent', color: '#78716c' }}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'personalization' && <PersonalizationPanel />}

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
                <p className="text-stone-300 text-sm mt-1">Add your first product above.</p>
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
                              {!product.active && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-400">Hidden</span>
                              )}
                            </div>
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
