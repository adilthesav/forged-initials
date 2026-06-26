import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Loader2, XCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface PaymentFormCheckoutProps {
  formData: {
    customerName: string;
    email: string;
    items: { letter: string; quantity: number; size: string }[];
    material: string;
    details: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    stateOrProvinceCode: string;
    postalCode: string;
    phoneNumber: string;
    pendantStyle?: string; // 'none', 'separated', 'connected', or 'bar'
    hardwareChoice?: string; // 'bails' or 'jump-rings-only'
  };
  amount: number; // Total in dollars (e.g., 11.00)
  hardwareCost?: number; // Hardware cost in dollars
  shippingCost?: number; // Shipping cost in dollars
  assemblyFee?: number; // Assembly fee in dollars
  bailOptions?: { size: string; quantity: number }[];
  prongsOptions?: { size: string; quantity: number }[];
  extraJumpRings?: number;
  onCancel: () => void;
}

export function PaymentFormCheckout({ 
  formData, 
  amount, 
  hardwareCost = 0,
  shippingCost = 10,
  assemblyFee = 0,
  bailOptions = [],
  prongsOptions = [],
  extraJumpRings = 0,
  onCancel 
}: PaymentFormCheckoutProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      console.log('Creating checkout session...', {
        projectId,
        amount,
        formData
      });

      // Calculate item costs
      const itemsCost = amount - hardwareCost - assemblyFee - shippingCost;

      // Build line items for Stripe
      const lineItems = [];

      // Add jewelry items
      if (itemsCost > 0) {
        const lettersList = formData.items
          .map(item => `${item.letter} (${item.size})`)
          .join(', ');
        
        lineItems.push({
          name: `Letters (${formData.items.length})`,
          description: lettersList,
          unitAmount: Math.round(itemsCost * 100), // Convert to cents
          quantity: 1,
        });
      }

      // Add hardware if applicable
      if (hardwareCost > 0) {
        lineItems.push({
          name: 'Hardware',
          description: 'Sterling Silver components',
          unitAmount: Math.round(hardwareCost * 100),
          quantity: 1,
        });
      }

      // Add shipping
      lineItems.push({
        name: 'Shipping (Houston)',
        description: 'FedEx Ground',
        unitAmount: Math.round(shippingCost * 100),
        quantity: 1,
      });

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/create-checkout-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            items: lineItems,
            currency: 'usd',
            customerEmail: formData.email,
            metadata: {
              customerName: formData.customerName,
              material: formData.material,
              details: formData.details,
              addressLine1: formData.addressLine1,
              addressLine2: formData.addressLine2 || '',
              city: formData.city,
              state: formData.stateOrProvinceCode,
              postalCode: formData.postalCode,
              phoneNumber: formData.phoneNumber,
              items: JSON.stringify(formData.items),
              // Include hardware and pendant style data
              bailOptions: JSON.stringify(bailOptions),
              prongsOptions: JSON.stringify(prongsOptions),
              extraJumpRings: String(extraJumpRings),
              pendantStyle: formData.pendantStyle || 'none',
              hardwareChoice: formData.hardwareChoice || 'none',
            },
            successUrl: `${window.location.origin}/success`,
            cancelUrl: `${window.location.origin}/cancel`,
          }),
        }
      );

      console.log('Response status:', response.status, response.statusText);

      if (!response.ok) {
        let errorMessage = 'Failed to create checkout session';
        try {
          const errorData = await response.json();
          console.error('Error response:', errorData);
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          console.error('Failed to parse error response:', e);
          errorMessage = `Server error (${response.status}): ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Checkout session created:', data);

      if (!data.url) {
        throw new Error('No checkout URL received from server');
      }

      // Save order state to localStorage before redirecting to Stripe
      // This ensures the state is preserved when user cancels and returns
      const orderState = {
        formData,
        cartItems: formData.items,
        bailsCart: bailOptions,
        prongsCart: prongsOptions,
        priceBreakdown: {
          lettersCost: amount - hardwareCost - assemblyFee - shippingCost,
          hardwareCost: hardwareCost,
          assemblyFee: assemblyFee,
          shippingFee: shippingCost,
          total: amount
        }
      };
      console.log('💾 Saving order state before Stripe redirect:', orderState);
      localStorage.setItem('forged_order_state', JSON.stringify(orderState));
      console.log('✅ Order state saved - ready for potential return');

      // Redirect to Stripe Checkout
      console.log('Redirecting to:', data.url);
      window.location.href = data.url;

    } catch (err) {
      console.error('Error creating checkout session:', err);
      
      let errorMessage = 'Failed to initialize checkout';
      
      if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to payment server. Please check your internet connection and try again.';
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setIsProcessing(false);
    }
  };

  // Helper to format size display
  const formatSizeDisplay = (size: string): string => {
    const sizeMap: { [key: string]: string } = {
      'extra-small': 'XS',
      'small': 'S',
      'medium': 'M',
      'large': 'L',
      'extra-large': 'XL',
    };
    return sizeMap[size] || size;
  };

  // Helper to get price per size
  const getSizePrice = (size: string): number => {
    const prices: { [key: string]: number } = {
      'extra-small': 1,
      'small': 2,
      'medium': 3,
      'large': 4,
      'extra-large': 5,
    };
    return prices[size] || 0;
  };

  // Helper to format bail size display
  const formatBailSize = (size: string): string => {
    return size.toUpperCase();
  };

  // Helper to get bail price
  const getBailPrice = (size: string): number => {
    const bailPrices: { [key: string]: number } = {
      xs: 1.5,
      s: 2,
      m: 2.5,
      l: 3,
    };
    return bailPrices[size] || 0;
  };

  // Helper to get prong price
  const getProngPrice = (size: string): number => {
    const prongPrices: { [key: string]: number } = {
      xs: 1.25,
      s: 1.75,
      m: 2.25,
      l: 2.75,
    };
    return prongPrices[size] || 0;
  };

  // Calculate total letter count
  const totalLetterCount = formData.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Card>
      <CardContent className="p-8">
        <div className="mb-6">
          <h3 className="text-2xl mb-4">Complete Your Payment</h3>
          
          {/* Detailed Order Summary */}
          <div className="mb-6">
            <h4 className="mb-3">Order Summary</h4>
            <div className="space-y-3">
              {/* Customer Info */}
              <div className="p-3 bg-muted/30 rounded-lg text-sm">
                <div className="flex justify-between mb-1">
                  <span className="text-muted-foreground">Name:</span>
                  <span>{formData.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="text-xs">{formData.email}</span>
                </div>
              </div>

              {/* Letter Items - Detailed Breakdown */}
              <div className="p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-purple-900">Letters ({totalLetterCount}):</span>
                  <span className="font-semibold text-purple-900">${(amount - hardwareCost - assemblyFee - shippingCost).toFixed(2)}</span>
                </div>
                <div className="space-y-2">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center text-sm bg-white p-2 rounded">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-purple-600">{item.letter}</span>
                        <div>
                          <div className="text-muted-foreground">
                            Size: <span className="font-medium text-foreground">{formatSizeDisplay(item.size)}</span> 
                            {' '}(${getSizePrice(item.size)} each)
                          </div>
                          <div className="text-muted-foreground">
                            Quantity: <span className="font-medium text-foreground">{item.quantity}</span>
                          </div>
                        </div>
                      </div>
                      <span className="font-semibold">${(getSizePrice(item.size) * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hardware Details */}
              {hardwareCost > 0 && (
                <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-blue-900">
                      Hardware ({
                        bailOptions.reduce((sum, b) => sum + b.quantity, 0) + 
                        prongsOptions.reduce((sum, p) => sum + p.quantity, 0) + 
                        extraJumpRings
                      } items):
                    </span>
                    <span className="font-semibold text-blue-900">${hardwareCost.toFixed(2)}</span>
                  </div>
                  <div className="space-y-2">
                    {/* Bails breakdown */}
                    {bailOptions.length > 0 && bailOptions.map((bail, index) => (
                      <div key={index} className="flex justify-between items-center text-sm bg-white p-2 rounded">
                        <div>
                          <span className="font-medium">Bail ({formatBailSize(bail.size)})</span>
                          {' '}- ${getBailPrice(bail.size).toFixed(2)} each × {bail.quantity}
                        </div>
                        <span className="font-semibold">${(getBailPrice(bail.size) * bail.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    {/* Prongs breakdown */}
                    {prongsOptions.length > 0 && prongsOptions.map((prong, index) => (
                      <div key={index} className="flex justify-between items-center text-sm bg-white p-2 rounded">
                        <div>
                          <span className="font-medium">Prong ({prong.size.toUpperCase()})</span>
                          {' '}- ${getProngPrice(prong.size).toFixed(2)} each × {prong.quantity}
                        </div>
                        <span className="font-semibold">${(getProngPrice(prong.size) * prong.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    {/* Jump rings breakdown */}
                    {extraJumpRings > 0 && (
                      <div className="flex justify-between items-center text-sm bg-white p-2 rounded">
                        <div>
                          <span className="font-medium">Jump Rings</span>
                          {' '}- $0.50 each × {extraJumpRings}
                        </div>
                        <span className="font-semibold">${(0.5 * extraJumpRings).toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Assembly Fee */}
              {assemblyFee > 0 && (
                <div className="p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-semibold text-yellow-900">⚙️ Assembly Fee</span>
                      <div className="text-xs text-yellow-800 mt-1">
                        {formData.pendantStyle === 'connected' && '(Connected Nameplate)'}
                        {formData.pendantStyle === 'bar' && '(Bar Style)'}
                        {formData.pendantStyle === 'separated' && '(Separated Letters)'}
                      </div>
                    </div>
                    <span className="font-semibold text-yellow-900">${assemblyFee.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Items Subtotal */}
              <div className="p-3 bg-purple-100 border border-purple-300 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Items Subtotal:</span>
                  <span className="font-semibold">${(amount - shippingCost).toFixed(2)}</span>
                </div>
              </div>

              {/* Shipping */}
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <span>Shipping (Houston, TX):</span>
                    <div className="text-xs text-muted-foreground">FedEx Ground - Flat Rate</div>
                  </div>
                  <span>${shippingCost.toFixed(2)}</span>
                </div>
              </div>

              {/* Total */}
              <div className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg border-4 border-purple-700 shadow-lg">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold">Total:</span>
                  <span className="text-2xl font-bold">${amount.toFixed(2)}</span>
                </div>
              </div>

              {/* Calculation Summary */}
              <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs">
                <p className="font-semibold text-gray-700 mb-2">💡 Total Calculation:</p>
                <div className="space-y-1 text-gray-600 font-mono">
                  <div>Letters: ${(amount - hardwareCost - assemblyFee - shippingCost).toFixed(2)}</div>
                  {hardwareCost > 0 && <div>+ Hardware: ${hardwareCost.toFixed(2)}</div>}
                  {assemblyFee > 0 && <div>+ Assembly: ${assemblyFee.toFixed(2)}</div>}
                  <div>+ Shipping: ${shippingCost.toFixed(2)}</div>
                  <div className="border-t border-gray-300 pt-1 mt-1 font-bold text-gray-900">
                    = ${amount.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
            <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-destructive mb-2">{error}</p>
              
              {/* Error-specific help */}
              {(error.includes('connect') || error.includes('fetch') || error.includes('404')) && (
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-900">
                  <p className="mb-1"><strong>Possible issues:</strong></p>
                  <ul className="list-disc list-inside space-y-1 text-yellow-800">
                    <li>Edge Function may not be deployed</li>
                    <li>STRIPE_SECRET_KEY may not be set</li>
                    <li>Check your internet connection</li>
                  </ul>
                  <p className="mt-2 text-blue-800">
                    📖 See <code className="bg-yellow-100 px-1 rounded">STRIPE_QUICK_FIX.md</code> for help
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Security badges */}
        <div className="mb-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>🔒</span>
            <span>Secure Payment</span>
          </div>
          <div className="flex items-center gap-2">
            <span>💳</span>
            <span>Powered by Stripe</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button 
            type="button"
            onClick={handleCheckout}
            disabled={isProcessing}
            size="lg"
            className="flex-1"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirecting to checkout...
              </>
            ) : (
              'Proceed to Checkout'
            )}
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isProcessing}
            size="lg"
            className="flex-1"
          >
            Cancel
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-4">
          You'll be redirected to Stripe's secure checkout page. Your payment information is encrypted and never stored on our servers.
        </p>
      </CardContent>
    </Card>
  );
}