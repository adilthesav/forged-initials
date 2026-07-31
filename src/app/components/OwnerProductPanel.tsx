import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Save, X, RefreshCw, Package, Lock } from 'lucide-react';

interface Product {
  id?: string;
  name: string;
  description: string;
  price_cents: number;
  image_url: string;
  category: string;
  quantity_remaining: number;
  active: boolean;
}

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
          placeholder="Describe the piece — size, style, material details…"
          rows={2} className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:border-amber-400 resize-none" />
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
          <label className="text-xs font-semibold text-stone-500 mb-1 block">Quantity in Stock *</label>
          <input type="number" min="0" value={form.quantity_remaining}
            onChange={e => set('quantity_remaining', parseInt(e.target.value || '0'))}
            className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:border-amber-400" />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-stone-500 mb-1 block">Image URL</label>
        <input value={form.image_url} onChange={e => set('image_url', e.target.value)}
          placeholder="https://… paste a direct image link"
          className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white focus:outline-none focus:border-amber-400" />
        {form.image_url && (
          <img src={form.image_url} alt="preview" className="mt-2 h-20 w-20 object-cover rounded-lg border border-stone-200" />
        )}
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="active-toggle" checked={form.active}
          onChange={e => set('active', e.target.checked)} className="w-4 h-4 accent-amber-500" />
        <label htmlFor="active-toggle" className="text-xs font-semibold text-stone-600">
          Listed publicly (customers can see & buy this)
        </label>
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

function LoginGate({ onUnlock }: { onUnlock: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const attempt = () => {
    if (password === ADMIN_TOKEN) {
      sessionStorage.setItem('fi_admin', 'yes');
      onUnlock();
    } else {
      setError(true);
      setShake(true);
      setPassword('');
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50/30 to-white px-4">
      <div
        className={`bg-white rounded-3xl border border-stone-100 shadow-xl p-8 w-full max-w-sm text-center transition-all ${shake ? 'animate-[wiggle_0.4s_ease]' : ''}`}
        style={{ boxShadow: '0 8px 40px rgba(201,168,76,0.1)' }}
      >
        <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c96a)' }}>
          <Lock className="w-7 h-7 text-amber-900" />
        </div>

        <h2 className="text-xl font-bold text-stone-800 mb-1">Admin Access</h2>
        <p className="text-stone-400 text-sm mb-6">Enter your password to manage products</p>

        <input
          type="password"
          value={password}
          onChange={e => { setPassword(e.target.value); setError(false); }}
          onKeyDown={e => e.key === 'Enter' && attempt()}
          placeholder="••••••••••••"
          autoFocus
          className={`w-full px-4 py-3 text-sm border rounded-xl text-center tracking-widest focus:outline-none mb-2 transition-all ${
            error ? 'border-red-300 bg-red-50 text-red-600' : 'border-stone-200 focus:border-amber-400'
          }`}
        />

        {error && (
          <p className="text-red-400 text-xs mb-3">Incorrect password. Try again.</p>
        )}

        <button
          onClick={attempt}
          className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105 active:scale-95 mt-2"
          style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c96a)', color: '#2a1800', boxShadow: '0 3px 14px rgba(201,168,76,0.3)' }}
        >
          Unlock Panel
        </button>

        <p className="text-stone-300 text-[10px] mt-4">Forged Initials · Owner Portal</p>
      </div>
    </div>
  );
}

export function OwnerProductPanel() {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem('fi_admin') === 'yes');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!unlocked) return <LoginGate onUnlock={() => setUnlocked(true)} />;

  const load = async () => {
    setLoading(true);
    const data = await adminFetch('GET');
    setProducts(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (product: Product) => {
    setSaving(true);
    try {
      if (product.id) await adminFetch('PATCH', product);
      else await adminFetch('POST', product);
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
            <p className="text-stone-500 text-sm mt-0.5">Add, edit, and manage your shop inventory</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { sessionStorage.removeItem('fi_admin'); setUnlocked(false); }}
              className="p-2 rounded-lg bg-stone-100 hover:bg-stone-200 transition-all" title="Lock panel">
              <Lock className="w-4 h-4 text-stone-400" />
            </button>
            <button onClick={load} className="p-2 rounded-lg bg-stone-100 hover:bg-stone-200 transition-all" title="Refresh">
              <RefreshCw className="w-4 h-4 text-stone-500" />
            </button>
            <button onClick={() => { setAdding(true); setEditing(null); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg,#c9a84c,#e8c96a)', color: '#2a1800' }}>
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>
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
            <p className="text-stone-300 text-sm mt-1">Click "Add Product" to list your first item.</p>
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
                            style={{ background: 'rgba(201,168,76,0.15)', color: '#8a6010' }}>{product.category}</span>
                          {!product.active && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-400">Hidden</span>}
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm font-bold" style={{ color: '#c9a84c' }}>${(product.price_cents / 100).toFixed(2)}</span>
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
                        <button onClick={() => handleToggleActive(product)} title={product.active ? 'Hide' : 'Show'}
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
      </div>
    </div>
  );
}
