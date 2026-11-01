import { useEffect, useState } from 'react';
import { Copy, Loader2, Plus, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';

interface Letter { letter: string; size: string; quantity: number }
interface Part { size: string; quantity: number }
interface CustomerEdit {
  at: string;
  changes: { field: string; before: string; after: string }[];
  totalBeforeCents: number;
  totalAfterCents: number;
  closedPaymentLink: boolean;
}
interface Order {
  id: string;
  orderNumber: string;
  status: 'requested' | 'approved' | 'paid' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  customer: { name: string; email: string; phone: string; addressLine1: string; addressLine2: string; city: string; state: string; postalCode: string };
  notes: string;
  customerNotes?: string;
  letters: Letter[];
  bails: Part[];
  prongs: Part[];
  adjustmentCents: number;
  adjustmentNote?: string;
  ownerNotes?: string;
  linkExpiresAt?: string | null;
  price: { totalCents: number };
  payUrl: string | null;
  editUrl: string | null;
  customerEdits?: CustomerEdit[];
  editsUnreviewed?: boolean;
}

const ENDPOINT = '/.netlify/functions/admin-orders';
const TOKEN_KEY = 'fi_orders_token';
const SIZES = ['extra-small', 'small', 'medium', 'large', 'extra-large'];
const STATUS_STYLES: Record<Order['status'], string> = {
  requested: 'bg-amber-100 text-amber-800',
  approved: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  cancelled: 'bg-slate-200 text-slate-600',
};
const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;

function getSavedToken() {
  try { return sessionStorage.getItem(TOKEN_KEY) || ''; } catch { return ''; }
}

export function OwnerOrdersPanel() {
  const [token, setToken] = useState(getSavedToken);
  const [password, setPassword] = useState('');
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState('');

  const load = async (authToken: string) => {
    setError('');
    const r = await fetch(ENDPOINT, { headers: { 'x-orders-token': authToken } });
    if (r.status === 401) {
      setToken('');
      try { sessionStorage.removeItem(TOKEN_KEY); } catch { /* storage unavailable */ }
      setError('Incorrect password.');
      return;
    }
    if (!r.ok) { setError('Could not load orders.'); return; }
    setOrders((await r.json()).orders);
    setToken(authToken);
    try { sessionStorage.setItem(TOKEN_KEY, authToken); } catch { /* storage unavailable */ }
  };

  useEffect(() => { if (token) load(token); }, []);

  const replace = (next: Order) => setOrders((all) => (all || []).map((o) => (o.id === next.id ? next : o)));

  if (!token || !orders) {
    return (
      <section className="pt-32 pb-20 px-4 min-h-screen">
        <Card className="max-w-sm mx-auto">
          <CardContent className="p-6">
            <h1 className="text-xl font-semibold mb-4">Order requests</h1>
            {token ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <form onSubmit={(e) => { e.preventDefault(); load(password); }} className="space-y-3">
                <input type="password" autoFocus value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full border rounded-lg px-3 py-2" />
                <Button type="submit" className="w-full">Open</Button>
              </form>
            )}
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="pt-28 pb-20 px-4 min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto space-y-4">
        <h1 className="text-2xl font-semibold">Order requests</h1>
        {orders.length === 0 && <p className="text-slate-500">No requests yet.</p>}
        {orders.map((order) => <OrderCard key={order.id} order={order} token={token} onChange={replace} />)}
      </div>
    </section>
  );
}

function OrderCard({ order, token, onChange }: { order: Order; token: string; onChange: (o: Order) => void }) {
  const [letters, setLetters] = useState(order.letters);
  const [bails, setBails] = useState(order.bails);
  const [prongs, setProngs] = useState(order.prongs);
  const [adjustment, setAdjustment] = useState(String((order.adjustmentCents || 0) / 100));
  const [adjustmentNote, setAdjustmentNote] = useState(order.adjustmentNote || '');
  const [ownerNotes, setOwnerNotes] = useState(order.ownerNotes || '');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const editable = order.status === 'requested';
  const c = order.customer;

  // Show the latest saved version, which may include the customer's own changes
  useEffect(() => {
    setLetters(order.letters);
    setBails(order.bails);
    setProngs(order.prongs);
    setAdjustment(String((order.adjustmentCents || 0) / 100));
    setAdjustmentNote(order.adjustmentNote || '');
    setOwnerNotes(order.ownerNotes || '');
  }, [order.updatedAt]);

  const act = async (action: string, extra: object = {}) => {
    setBusy(true);
    setMessage('');
    try {
      const r = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-orders-token': token },
        body: JSON.stringify({ id: order.id, action, ...extra }),
      });
      const data = await r.json();
      if (data.order) onChange(data.order);
      if (!r.ok) throw new Error(data.error || 'That did not work.');
      return data.order as Order;
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'That did not work.');
      return null;
    } finally {
      setBusy(false);
    }
  };

  const edits = () => ({ expectedUpdatedAt: order.updatedAt, letters, bails, prongs, adjustmentDollars: Number(adjustment) || 0, adjustmentNote, ownerNotes });
  const save = async () => { if (await act('update', edits())) setMessage('Saved.'); };
  const approve = async () => {
    const saved = await act('update', edits());
    if (saved) await act('approve', { expectedUpdatedAt: saved.updatedAt });
  };
  const reopen = () => { if (window.confirm('The current payment link will stop working. Continue?')) act('reopen'); };
  const cancel = () => { if (window.confirm(`Cancel order ${order.orderNumber}?`)) act('cancel'); };
  const copy = async (link: string | null) => {
    if (!link) return;
    try { await navigator.clipboard.writeText(link); setMessage('Link copied.'); }
    catch { setMessage('Could not copy. Select the link and copy it by hand.'); }
  };

  const field = 'border rounded px-2 py-1 text-sm bg-white disabled:bg-slate-100';

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="font-semibold">{order.orderNumber}</span>
            <span className="text-xs text-slate-500 ml-2">{new Date(order.createdAt).toLocaleString()}</span>
          </div>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${STATUS_STYLES[order.status]}`}>{order.status}</span>
        </div>

        <div className="text-sm text-slate-700">
          <p className="font-medium">{c.name}</p>
          <p>{c.email}{c.phone ? ` · ${c.phone}` : ''}</p>
          <p>{[c.addressLine1, c.addressLine2, c.city, c.state, c.postalCode].filter(Boolean).join(', ')}</p>
          {order.notes && <p className="mt-2 p-2 bg-slate-100 rounded">{order.notes}</p>}
          {order.customerNotes && <p className="mt-2 p-2 bg-slate-100 rounded"><span className="font-medium">Customer's note:</span> {order.customerNotes}</p>}
        </div>

        <CustomerEdits edits={order.customerEdits || []} unreviewed={!!order.editsUnreviewed} busy={busy} onReviewed={() => act('reviewed')} />

        <div className="space-y-2">
          <p className="text-sm font-medium">Letters</p>
          {letters.map((l, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input aria-label="Letter" disabled={!editable} value={l.letter} maxLength={1} className={`${field} w-12 uppercase`} onChange={(e) => setLetters(letters.map((x, j) => (j === i ? { ...x, letter: e.target.value } : x)))} />
              <select aria-label="Size" disabled={!editable} value={l.size} className={field} onChange={(e) => setLetters(letters.map((x, j) => (j === i ? { ...x, size: e.target.value } : x)))}>
                {SIZES.map((s) => <option key={s} value={s}>{s.replace('-', ' ')}</option>)}
              </select>
              <input aria-label="Quantity" disabled={!editable} type="number" min={1} value={l.quantity} className={`${field} w-20`} onChange={(e) => setLetters(letters.map((x, j) => (j === i ? { ...x, quantity: Number(e.target.value) } : x)))} />
              {editable && <button type="button" aria-label="Remove letter" onClick={() => setLetters(letters.filter((_, j) => j !== i))}><Trash2 className="w-4 h-4 text-red-500" /></button>}
            </div>
          ))}
          {editable && (
            <button type="button" className="text-sm text-blue-700 flex items-center gap-1" onClick={() => setLetters([...letters, { letter: 'A', size: 'medium', quantity: 1 }])}>
              <Plus className="w-4 h-4" /> Add letter
            </button>
          )}
        </div>

        <PartRows title="Bails" parts={bails} setParts={setBails} sizes={['xs', 's', 'm', 'l']} editable={editable} field={field} />
        <PartRows title="Prongs" parts={prongs} setParts={setProngs} sizes={['half-carat', '1-carat']} labels={{ 'half-carat': '½ carat', '1-carat': '1 carat' }} editable={editable} field={field} />

        <div className="grid sm:grid-cols-2 gap-2">
          <label className="text-sm">Price adjustment ($, can be negative)
            <input disabled={!editable} type="number" step="0.01" value={adjustment} className={`${field} w-full mt-1`} onChange={(e) => setAdjustment(e.target.value)} />
          </label>
          <label className="text-sm">Reason the customer will see
            <input disabled={!editable} value={adjustmentNote} className={`${field} w-full mt-1`} onChange={(e) => setAdjustmentNote(e.target.value)} />
          </label>
        </div>
        <label className="text-sm block">Private notes
          <textarea disabled={!editable} value={ownerNotes} rows={2} className={`${field} w-full mt-1`} onChange={(e) => setOwnerNotes(e.target.value)} />
        </label>

        <p className="font-semibold">Total: {money(order.price.totalCents)}{editable && <span className="font-normal text-xs text-slate-500"> (updates when saved)</span>}</p>

        {order.status === 'approved' && order.payUrl && (
          <div className="bg-blue-50 rounded-lg p-3 text-sm">
            <p className="font-medium mb-1">Payment link{order.linkExpiresAt ? `, expires ${new Date(order.linkExpiresAt).toLocaleDateString()}` : ''}</p>
            <p className="break-all mb-2">{order.payUrl}</p>
            <Button type="button" size="sm" variant="outline" onClick={() => copy(order.payUrl)}><Copy className="w-4 h-4 mr-1" /> Copy link</Button>
          </div>
        )}

        {(editable || order.status === 'approved') && order.editUrl && (
          <div className="bg-slate-100 rounded-lg p-3 text-sm">
            <p className="font-medium mb-1">Customer edit link</p>
            <p className="text-slate-600 mb-2">Send this so the customer can change their own request. Anyone with the link can see and edit it.</p>
            <p className="break-all mb-2">{order.editUrl}</p>
            <Button type="button" size="sm" variant="outline" onClick={() => copy(order.editUrl)}><Copy className="w-4 h-4 mr-1" /> Copy edit link</Button>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {editable && <Button type="button" disabled={busy} variant="outline" onClick={save}>Save changes</Button>}
          {editable && <Button type="button" disabled={busy} onClick={approve}>Approve & create payment link</Button>}
          {order.status === 'approved' && <Button type="button" disabled={busy} variant="outline" onClick={reopen}>Reopen to edit</Button>}
          {(editable || order.status === 'approved') && <Button type="button" disabled={busy} variant="outline" onClick={cancel}>Cancel order</Button>}
        </div>
        {message && <p className="text-sm text-slate-600">{message}</p>}
      </CardContent>
    </Card>
  );
}

function CustomerEdits({ edits, unreviewed, busy, onReviewed }: { edits: CustomerEdit[]; unreviewed: boolean; busy: boolean; onReviewed: () => void }) {
  if (!edits.length) return null;
  return (
    <div className={`rounded-lg p-3 text-sm space-y-3 border ${unreviewed ? 'bg-amber-50 border-amber-300' : 'bg-slate-50 border-slate-200'}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold">{unreviewed ? 'The customer changed this request' : `Customer changes (${edits.length})`}</p>
        {unreviewed && <Button type="button" size="sm" variant="outline" disabled={busy} onClick={onReviewed}>Mark as reviewed</Button>}
      </div>
      {[...edits].reverse().map((edit) => (
        <div key={edit.at} className="space-y-1">
          <p className="text-xs text-slate-500">
            {new Date(edit.at).toLocaleString()} · Total {money(edit.totalBeforeCents)} → {money(edit.totalAfterCents)}
            {edit.closedPaymentLink ? ' · Payment link turned off' : ''}
          </p>
          {edit.changes.map((change) => (
            <p key={change.field}>
              <span className="font-medium">{change.field}:</span>{' '}
              <span className="text-slate-500 line-through">{change.before || 'none'}</span>{' → '}
              <span>{change.after || 'none'}</span>
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}

function PartRows({ title, parts, setParts, sizes, labels, editable, field }: {
  title: string; parts: Part[]; setParts: (p: Part[]) => void; sizes: string[]; labels?: Record<string, string>; editable: boolean; field: string;
}) {
  if (!parts.length && !editable) return null;
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{title}</p>
      {parts.map((p, i) => (
        <div key={i} className="flex gap-2 items-center">
          <select aria-label={`${title} size`} disabled={!editable} value={p.size} className={field} onChange={(e) => setParts(parts.map((x, j) => (j === i ? { ...x, size: e.target.value } : x)))}>
            {sizes.map((s) => <option key={s} value={s}>{labels?.[s] || s.toUpperCase()}</option>)}
          </select>
          <input aria-label="Quantity" disabled={!editable} type="number" min={1} value={p.quantity} className={`${field} w-20`} onChange={(e) => setParts(parts.map((x, j) => (j === i ? { ...x, quantity: Number(e.target.value) } : x)))} />
          {editable && <button type="button" aria-label={`Remove from ${title}`} onClick={() => setParts(parts.filter((_, j) => j !== i))}><Trash2 className="w-4 h-4 text-red-500" /></button>}
        </div>
      ))}
      {editable && (
        <button type="button" className="text-sm text-blue-700 flex items-center gap-1" onClick={() => setParts([...parts, { size: sizes[0], quantity: 1 }])}>
          <Plus className="w-4 h-4" /> Add to {title.toLowerCase()}
        </button>
      )}
    </div>
  );
}
