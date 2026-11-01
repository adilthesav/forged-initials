// What a customer can still do once an order is paid, in one place so every page says the same thing.
export const CONFIRM_BEFORE_PAYING = "I've checked every detail above. I understand that after I pay, this order can't be changed. To make a change, I'd need to cancel it before it ships and place a new request. Once it ships, a refund requires returning it first.";

export function AfterPurchaseNotice({ status }: { status: string }) {
  if (status === 'paid') {
    return (
      <div className="text-sm text-amber-900 bg-amber-50 rounded-lg p-3 text-left space-y-1">
        <p className="font-semibold">This order is locked and can't be changed.</p>
        <p>If something needs to change, you'd have to cancel this order before it ships, then place a new request.</p>
      </div>
    );
  }
  if (status === 'shipped') {
    return (
      <div className="text-sm text-amber-900 bg-amber-50 rounded-lg p-3 text-left space-y-1">
        <p className="font-semibold">This order is on its way, so it can't be changed or cancelled.</p>
        <p>For a refund, contact us for the correct return address and send the order back there. We'll issue the refund once we receive it.</p>
      </div>
    );
  }
  if (status === 'refunded') {
    return <p className="text-sm text-slate-600">This order was refunded. Please contact us if you have questions.</p>;
  }
  return <p className="text-sm text-slate-600">This request was cancelled. Please contact us if you have questions.</p>;
}
