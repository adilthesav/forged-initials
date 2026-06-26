import { CheckCircle } from 'lucide-react';
import { Button } from './ui/button';

export function SuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        
        <h1 className="text-2xl mb-2">Payment Successful!</h1>
        
        <p className="text-muted-foreground mb-6">
          Thank you for your order! We've received your payment and will begin crafting your custom jewelry.
        </p>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-green-800">
            You'll receive an order confirmation email shortly with your order details and tracking information once your item ships.
          </p>
        </div>
        
        <div className="space-y-3">
          <Button 
            onClick={() => window.location.href = '/'}
            className="w-full"
          >
            Return to Home
          </Button>
          
          <Button 
            onClick={() => window.location.href = '/#custom-order'}
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
