import { CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { BookCallLink } from './BookCallLink';

export function SuccessPage() {
  const order = new URLSearchParams(window.location.search).get('order') || '';
  const orderNumber = /^FI-[A-F0-9]{6}$/.test(order) ? order : '';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        
        <h1 className="text-2xl mb-2">Payment Successful!</h1>
        
        <p className="text-muted-foreground mb-6">
          Thank you for your order! We've received your payment and will begin preparing it.
        </p>
        
        {orderNumber && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-green-800">Your order number is</p>
            <p className="text-xl font-semibold text-green-900">{orderNumber}</p>
            <p className="text-sm text-green-800 mt-1">Save it. You'll need it if you contact us about this order.</p>
          </div>
        )}
        {orderNumber && <div className="mb-6"><BookCallLink orderNumber={orderNumber} /></div>}

        <p className="text-sm text-muted-foreground mb-6">
          Your order can't be changed now that it's paid. To change it, contact us to cancel before it ships, then place a new order. Once it ships, a refund requires returning it to the address we give you.
        </p>
        
        <div className="space-y-3">
          <Button 
            onClick={() => window.location.href = '/'}
            className="w-full"
          >
            Return to Home
          </Button>
          
          <Button 
            onClick={() => window.location.href = '/#custom-orders'}
            variant="outline"
            className="w-full"
          >
            Place Another Order
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground mt-6">
          Questions? Contact us on Instagram or TikTok @forgedinitials
        </p>
      </div>
    </div>
  );
}
