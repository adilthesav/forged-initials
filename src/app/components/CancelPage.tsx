import { XCircle } from 'lucide-react';
import { Button } from './ui/button';

export function CancelPage() {
  const handleReturnToOrder = () => {
    // Check if order state exists
    const orderState = localStorage.getItem('forged_order_state');
    console.log('🔄 Return to Order clicked - Order state exists:', orderState ? 'YES' : 'NO');
    
    if (orderState) {
      console.log('📦 Order state found, navigating to restore payment screen');
    } else {
      console.warn('⚠️ No saved order state found - user may have completed or abandoned order');
    }
    
    // Navigate to homepage with restore parameter
    window.location.href = '/?restore=payment#custom-orders';
  };

  const handleGoHome = () => {
    console.log('🏠 Go Home clicked - Clearing order state');
    // Clear any stored order state and navigate to homepage
    localStorage.removeItem('forged_order_state');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="flex justify-center mb-4">
          <XCircle className="w-16 h-16 text-orange-500" />
        </div>
        
        <h1 className="text-2xl mb-2">Payment Cancelled</h1>
        
        <p className="text-muted-foreground mb-6">
          Your payment was cancelled and no charges were made to your account.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            Your custom order is still waiting for you! Feel free to try again when you're ready.
          </p>
        </div>
        
        <div className="space-y-3">
          <Button 
            onClick={handleReturnToOrder}
            className="w-full"
          >
            Return to Order
          </Button>
          
          <Button 
            onClick={handleGoHome}
            variant="outline"
            className="w-full"
          >
            Go to Home
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground mt-6">
          Need help? Contact us on Instagram @forgedinitials or{' '}
          <a 
            href="https://t.me/forgedinitals" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Telegram
          </a>
        </p>
      </div>
    </div>
  );
}