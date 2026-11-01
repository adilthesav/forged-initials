import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { AfterPurchaseNotice, CONFIRM_BEFORE_PAYING } from './AfterPurchaseNotice';

interface PayOrder {
  orderNumber: string;
  status: string;
  expired: boolean;
  name: string;
  shipTo: string[];
  lines: { label: string; quantity: number; cents: number }[];
  subtotalCents: number;
  shippingCents: number;
  adjustmentCents: number;
  adjustmentNote: string;
  totalCents: number;
  editToken: string | null;
}

const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;
const ENDPOINT = '/.netlify/functions/order-pay';
const AFTER_PAYMENT = ['paid', 'shipped', 'refunded'];

export function PayOrderPage() {
  const { token } = useParams();
  const [order, setOrder] = useState<PayOrder | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    // Private links shouldn't show up in search results
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => { meta.remove(); };
  }, []);

  useEffect(() => {
    fetch(`${ENDPOINT}?token=${encodeURIComponent(token || '')}`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || 'This payment link is not valid.');
        setOrder(data.order);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  const pay = async () => {
    setPaying(true);
    setError('');
    try {
      const r = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, confirmed }) });
      const data = await r.json();
      if (!r.ok || !data.url) throw new Error(data.error || 'Could not start checkout.');
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start checkout.');
      setPaying(false);
    }
  };

  return (
    <section className="pt-28 pb-20 px-4 min-h-screen bg-slate-50">
      <Card className="max-w-xl mx-auto">
        <CardContent className="p-6 md:p-8">
          {loading && <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>}

          {!loading && !order && (
            <div className="text-center py-8">
              <h1 className="text-xl font-semibold mb-2">We couldn't open this link</h1>
              <p className="text-slate-600">{error}</p>
            </div>
          )}

          {order && order.status === 'paid' && (
            <div className="text-center py-8">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h1 className="text-xl font-semibold mb-2">Thank you, payment received!</h1>
              <p className="text-slate-600 mb-4">Order {order.orderNumber} is confirmed. We'll be in touch about your piece.</p>
              <AfterPurchaseNotice status="paid" />
              {order.editToken && (
                <p className="mt-3 text-sm">
                  <Link to={`/request/${order.editToken}`} className="text-blue-700 hover:underline">Need to cancel this order?</Link>
                </p>
              )}
            </div>
          )}

          {order && ['shipped', 'refunded'].includes(order.status) && (
            <div className="py-6">
              <h1 className="text-xl font-semibold mb-3 text-center">Order {order.orderNumber}</h1>
              <AfterPurchaseNotice status={order.status} />
            </div>
          )}

          {order && !AFTER_PAYMENT.includes(order.status) && (
            <>
              <h1 className="text-2xl font-semibold mb-1">Review your order</h1>
              <p className="text-sm text-slate-500 mb-6">Order {order.orderNumber} for {order.name}</p>

              <div className="space-y-2 mb-4">
                {order.lines.map((line, i) => (
                  <div key={i} className="flex justify-between text-sm capitalize">
                    <span>{line.label} × {line.quantity}</span>
                    <span>{money(line.cents)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-3 space-y-1 text-sm">
                <div className="flex justify-between"><span>Shipping (FedEx Ground)</span><span>{money(order.shippingCents)}</span></div>
                {order.adjustmentCents !== 0 && (
                  <div className="flex justify-between"><span>{order.adjustmentNote || 'Adjustment'}</span><span>{money(order.adjustmentCents)}</span></div>
                )}
                <div className="flex justify-between text-lg font-semibold pt-2"><span>Total</span><span>{money(order.totalCents)}</span></div>
              </div>

              <div className="mt-5 text-sm text-slate-600">
                <p className="font-medium text-slate-800 mb-1">Ships to</p>
                {order.shipTo.map((line) => <p key={line}>{line}</p>)}
              </div>

              {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

              {order.status === 'approved' && !order.expired ? (
                <>
                  <label className="mt-6 flex gap-3 items-start text-sm text-slate-800 bg-amber-50 border border-amber-300 rounded-lg p-3 cursor-pointer">
                    <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="mt-0.5 w-4 h-4 flex-shrink-0" />
                    <span>{CONFIRM_BEFORE_PAYING}</span>
                  </label>
                  <Button onClick={pay} disabled={paying || !confirmed} className="w-full mt-4" size="lg">
                    {paying ? 'Opening secure checkout…' : `Confirm and pay ${money(order.totalCents)}`}
                  </Button>
                </>
              ) : (
                <p className="mt-6 text-sm text-amber-800 bg-amber-50 rounded-lg p-3">
                  This payment link is no longer active. Please contact us and we'll send you a new one.
                </p>
              )}
              <p className="mt-3 text-xs text-center text-slate-500">Secure payment by Stripe: card, Cash App or Link.</p>
              {order.editToken && (
                <p className="mt-3 text-sm text-center">
                  <Link to={`/request/${order.editToken}`} className="text-blue-700 hover:underline">Need to change something? Edit your request</Link>
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
