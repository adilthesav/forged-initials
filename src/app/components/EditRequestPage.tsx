import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { CheckCircle2, Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { AfterPurchaseNotice } from './AfterPurchaseNotice';

interface Letter { letter: string; size: string; quantity: number }
interface Part { size: string; quantity: number }
interface Option { value: string; label: string; cents: number }
interface EditableOrder {
  orderNumber: string;
  status: string;
  editable: boolean;
  phoneOrder?: boolean;
  cancelRequested?: boolean;
  updatedAt?: string;
  customer: { name: string; email: string; phone: string; addressLine1: string; addressLine2: string; city: string; state: string; postalCode: string };
  notes: string;
  letters: Letter[];
  bails: Part[];
  prongs: Part[];
  shippingCents: number;
  adjustmentCents: number;
  adjustmentNote: string;
  options: { letterSizes: Option[]; bails: Option[]; prongs: Option[] };
}

const ENDPOINT = '/.netlify/functions/order-edit';
const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;
const price = (cents: number) => (cents % 100 ? money(cents) : `$${cents / 100}`);
const centsFor = (options: Option[], size: string) => options.find((o) => o.value === size)?.cents || 0;
const input = 'w-full border rounded-lg px-3 py-2 bg-white';
const rowField = 'border rounded-lg px-2 py-2 bg-white text-sm';

export function EditRequestPage() {
  const { token } = useParams();
  const [order, setOrder] = useState<EditableOrder | null>(null);
  const [form, setForm] = useState({ customerName: '', email: '', phoneNumber: '', addressLine1: '', addressLine2: '', city: '', stateOrProvinceCode: '', postalCode: '', details: '' });
  const [letters, setLetters] = useState<Letter[]>([]);
  const [bails, setBails] = useState<Part[]>([]);
  const [prongs, setProngs] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Private links shouldn't show up in search results or leak to other sites
    const tags = [['robots', 'noindex, nofollow'], ['referrer', 'no-referrer']].map(([name, content]) => {
      const meta = document.createElement('meta');
      meta.name = name;
      meta.content = content;
      document.head.appendChild(meta);
      return meta;
    });
    return () => tags.forEach((meta) => meta.remove());
  }, []);

  const show = (next: EditableOrder) => {
    setOrder(next);
    if (!next.editable) return;
    const c = next.customer;
    setForm({ customerName: c.name, email: c.email, phoneNumber: c.phone, addressLine1: c.addressLine1, addressLine2: c.addressLine2, city: c.city, stateOrProvinceCode: c.state, postalCode: c.postalCode, details: next.notes });
    setLetters(next.letters);
    setBails(next.bails);
    setProngs(next.prongs);
  };

  useEffect(() => {
    fetch(`${ENDPOINT}?token=${encodeURIComponent(token || '')}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || 'This link is not valid.');
        show(data.order);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved('');
    try {
      const r = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, expectedUpdatedAt: order?.updatedAt, ...form, letters, bails, prongs }),
      });
      const data = await r.json();
      if (data.order) show(data.order);
      if (!r.ok) throw new Error(data.error || 'Could not save your changes.');
      setSaved(data.changed ? 'Saved! We can see your changes and will review them.' : 'There was nothing new to save.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your changes.');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (saved || error) resultRef.current?.scrollIntoView({ block: 'center' });
  }, [saved, error]);

  const requestCancel = async () => {
    if (!window.confirm(`Ask us to cancel order ${order?.orderNumber}? To make changes afterward, you'd need to place a new request.`)) return;
    setSaving(true);
    setError('');
    try {
      const r = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, action: 'request-cancel' }) });
      const data = await r.json();
      if (data.order) setOrder(data.order);
      if (!r.ok) throw new Error(data.error || 'Could not send your request.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send your request.');
    } finally {
      setSaving(false);
    }
  };

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [key]: e.target.value });
  const subtotal = order?.editable
    ? letters.reduce((sum, l) => sum + centsFor(order.options.letterSizes, l.size) * (l.quantity || 0), 0)
      + bails.reduce((sum, b) => sum + centsFor(order.options.bails, b.size) * (b.quantity || 0), 0)
      + prongs.reduce((sum, p) => sum + centsFor(order.options.prongs, p.size) * (p.quantity || 0), 0)
    : 0;

  return (
    <section className="pt-28 pb-20 px-4 min-h-screen bg-slate-50">
      <Card className="max-w-xl mx-auto">
        <CardContent className="p-4 sm:p-6 md:p-8">
          {loading && <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>}

          {!loading && !order && (
            <div className="text-center py-8">
              <h1 className="text-xl font-semibold mb-2">We couldn't open this link</h1>
              <p className="text-slate-600">{error}</p>
            </div>
          )}

          {order && !order.editable && (
            <div className="text-center py-8">
              {order.status === 'paid' && <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />}
              <h1 className="text-xl font-semibold mb-3">Order {order.orderNumber} can't be edited</h1>
              <AfterPurchaseNotice status={order.status} />
              {order.status === 'paid' && (order.cancelRequested ? (
                <p className="mt-4 text-sm text-green-700 bg-green-50 rounded-lg p-3">We received your cancellation request. We'll review it and contact you about your refund.</p>
              ) : (
                <Button type="button" variant="outline" disabled={saving} className="w-full mt-4" onClick={requestCancel}>Request to cancel this order</Button>
              ))}
              {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            </div>
          )}

          {order?.editable && (
            <form onSubmit={save} className="space-y-6">
              <div>
                <h1 className="text-2xl font-semibold mb-1">Edit your request</h1>
                <p className="text-sm text-slate-500">Request {order.orderNumber}. Nothing is charged when you save.</p>
                {order.status === 'approved' && (
                  <p className="mt-3 text-sm text-amber-800 bg-amber-50 rounded-lg p-3">
                    We've already sent your payment link. If you save a change, that link will stop working and we'll send a new one after we review it.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <p className="font-medium">Letters</p>
                {letters.map((l, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input aria-label="Letter" required value={l.letter} maxLength={1} className={`${rowField} w-12 text-center uppercase`} onChange={(e) => setLetters(letters.map((x, j) => (j === i ? { ...x, letter: e.target.value.toUpperCase().replace(/[^A-Z]/g, '') } : x)))} />
                    <select aria-label="Size" value={l.size} className={`${rowField} flex-1 min-w-0 capitalize`} onChange={(e) => setLetters(letters.map((x, j) => (j === i ? { ...x, size: e.target.value } : x)))}>
                      {order.options.letterSizes.map((o) => <option key={o.value} value={o.value}>{o.label} ({price(o.cents)})</option>)}
                    </select>
                    <input aria-label="Quantity" required type="number" min={1} max={500} value={l.quantity || ''} className={`${rowField} w-16`} onChange={(e) => setLetters(letters.map((x, j) => (j === i ? { ...x, quantity: Number(e.target.value) } : x)))} />
                    <button type="button" aria-label="Remove letter" onClick={() => setLetters(letters.filter((_, j) => j !== i))}><Trash2 className="w-4 h-4 text-red-500" /></button>
                  </div>
                ))}
                <button type="button" className="text-sm text-blue-700 flex items-center gap-1" onClick={() => setLetters([...letters, { letter: '', size: 'medium', quantity: 1 }])}>
                  <Plus className="w-4 h-4" /> Add a letter
                </button>
              </div>

              <PartRows title="Sterling silver bails" noun="bail" parts={bails} setParts={setBails} options={order.options.bails} />
              <PartRows title="Sterling silver prongs" noun="prong" parts={prongs} setParts={setProngs} options={order.options.prongs} />

              <label className="block text-sm font-medium">Special requests or notes
                <textarea value={form.details} maxLength={1000} rows={3} className={`${input} mt-1 font-normal`} onChange={set('details')} />
              </label>

              <div className="space-y-3">
                <p className="font-medium">Your details</p>
                <label className="block text-sm">Full name
                  <input required value={form.customerName} maxLength={100} autoComplete="name" className={`${input} mt-1`} onChange={set('customerName')} />
                </label>
                <label className="block text-sm">Email
                  <input required={!order.phoneOrder} type="email" value={form.email} maxLength={200} autoComplete="email" className={`${input} mt-1`} onChange={set('email')} />
                </label>
                <label className="block text-sm">Phone
                  <input type="tel" value={form.phoneNumber} maxLength={30} autoComplete="tel" className={`${input} mt-1`} onChange={set('phoneNumber')} />
                </label>
              </div>

              <div className="space-y-3">
                <p className="font-medium">Shipping address (U.S. only)</p>
                {order.phoneOrder && !form.addressLine1 && <p className="text-sm text-slate-500">You can leave this blank and enter it at checkout.</p>}
                <label className="block text-sm">Street address
                  <input required={!order.phoneOrder} value={form.addressLine1} maxLength={150} autoComplete="address-line1" className={`${input} mt-1`} onChange={set('addressLine1')} />
                </label>
                <label className="block text-sm">Apartment, suite, etc. (optional)
                  <input value={form.addressLine2} maxLength={150} autoComplete="address-line2" className={`${input} mt-1`} onChange={set('addressLine2')} />
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <label className="block text-sm col-span-2 sm:col-span-1">City
                    <input required={!order.phoneOrder || !!form.addressLine1} value={form.city} maxLength={80} autoComplete="address-level2" className={`${input} mt-1`} onChange={set('city')} />
                  </label>
                  <label className="block text-sm">State
                    <input required={!order.phoneOrder || !!form.addressLine1} value={form.stateOrProvinceCode} maxLength={2} placeholder="TX" autoComplete="address-level1" className={`${input} mt-1 uppercase`} onChange={set('stateOrProvinceCode')} />
                  </label>
                  <label className="block text-sm">ZIP code
                    <input required={!order.phoneOrder || !!form.addressLine1} value={form.postalCode} maxLength={12} autoComplete="postal-code" className={`${input} mt-1`} onChange={set('postalCode')} />
                  </label>
                </div>
              </div>

              <div className="border-t pt-3 space-y-1 text-sm">
                <div className="flex justify-between"><span>Items</span><span>{money(subtotal)}</span></div>
                <div className="flex justify-between"><span>Shipping (FedEx Ground)</span><span>{money(order.shippingCents)}</span></div>
                {order.adjustmentCents !== 0 && (
                  <div className="flex justify-between"><span>{order.adjustmentNote || 'Adjustment'}</span><span>{money(order.adjustmentCents)}</span></div>
                )}
                <div className="flex justify-between text-lg font-semibold pt-2"><span>Estimated total</span><span>{money(subtotal + order.shippingCents + order.adjustmentCents)}</span></div>
                <p className="text-xs text-slate-500">We'll confirm the final price when we review your changes.</p>
              </div>

              <div ref={resultRef}>
                {error && <p className="text-sm text-red-600">{error}</p>}
                {saved && <p className="text-sm text-green-700 bg-green-50 rounded-lg p-3">{saved}</p>}
              </div>
              <Button type="submit" disabled={saving} className="w-full" size="lg">{saving ? 'Saving…' : 'Save my changes'}</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

function PartRows({ title, noun, parts, setParts, options }: { title: string; noun: string; parts: Part[]; setParts: (p: Part[]) => void; options: Option[] }) {
  return (
    <div className="space-y-2">
      <p className="font-medium">{title}</p>
      {parts.map((p, i) => (
        <div key={i} className="flex gap-2 items-center">
          <select aria-label={`${noun} size`} value={p.size} className={`${rowField} flex-1 min-w-0`} onChange={(e) => setParts(parts.map((x, j) => (j === i ? { ...x, size: e.target.value } : x)))}>
            {options.map((o) => <option key={o.value} value={o.value}>{o.label} ({price(o.cents)})</option>)}
          </select>
          <input aria-label="Quantity" required type="number" min={1} max={500} value={p.quantity || ''} className={`${rowField} w-16`} onChange={(e) => setParts(parts.map((x, j) => (j === i ? { ...x, quantity: Number(e.target.value) } : x)))} />
          <button type="button" aria-label={`Remove ${noun}`} onClick={() => setParts(parts.filter((_, j) => j !== i))}><Trash2 className="w-4 h-4 text-red-500" /></button>
        </div>
      ))}
      <button type="button" className="text-sm text-blue-700 flex items-center gap-1" onClick={() => setParts([...parts, { size: options[0].value, quantity: 1 }])}>
        <Plus className="w-4 h-4" /> Add a {noun}
      </button>
    </div>
  );
}
