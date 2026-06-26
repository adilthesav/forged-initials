import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { 
  Elements, 
  PaymentElement, 
  useStripe, 
  useElements 
} from '@stripe/react-stripe-js';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { EDGE_FUNCTION_BASE_URL, SUPABASE_ANON_KEY } from '../lib/api-config';

// Initialize Stripe with your publishable key
const STRIPE_PUBLISHABLE_KEY = 'pk_live_tcL93G36b40Vqf5oQNd4QWRu00UVi2Nqcg';

const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);

interface PaymentFormProps {
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
    // Hardware and pendant style
    bailOptions?: { size: string; quantity: number }[];
    extraJumpRings?: number;
    pendantStyle?: string;
    hardwareChoice?: string;
  };
  amount: number;
  onSuccess: (orderId?: string) => void;
  onCancel: () => void;
}

function CheckoutForm({ formData, onSuccess, onCancel }: Omit<PaymentFormProps, 'amount'>) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}?payment=success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setErrorMessage(error.message || 'Payment failed');
        setIsProcessing(false);
      } else {
        onSuccess();
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred');
      setIsProcessing(false);
      console.error('Payment error:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      
      {errorMessage && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
          <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{errorMessage}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Button 
          type="submit" 
          disabled={!stripe || isProcessing}
          size="lg"
          className="flex-1"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Complete Payment'
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

      <p className="text-xs text-center text-muted-foreground">
        Your payment information is secure and encrypted. We never store your card details.
      </p>
    </form>
  );
}

export function PaymentForm({ formData, amount, onSuccess, onCancel }: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [diagnosticInfo, setDiagnosticInfo] = useState<any>(null);

  useEffect(() => {
    // First, test if the Edge Function is accessible
    testConnection().then(isConnected => {
      if (isConnected) {
        createPaymentIntent();
      } else {
        setError('Cannot connect to payment server. The Edge Function may not be deployed or is not accessible.');
        setLoading(false);
      }
    });
  }, []);

  const testConnection = async (): Promise<boolean> => {
    try {
      console.log('Testing Edge Function connection...');
      const response = await fetch(
        `${EDGE_FUNCTION_BASE_URL}/health`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
        }
      );
      console.log('Health check response:', response.status, response.statusText);
      return response.ok;
    } catch (err) {
      console.error('Health check failed:', err);
      return false;
    }
  };

  const runDiagnostics = async () => {
    setLoading(true);
    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      tests: {}
    };

    // Test 1: Health endpoint
    try {
      const healthResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/health`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );
      diagnostics.tests.health = {
        status: healthResponse.status,
        ok: healthResponse.ok,
        result: healthResponse.ok ? 'PASS ✅' : 'FAIL ❌'
      };
    } catch (err) {
      diagnostics.tests.health = {
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error',
        result: 'FAIL ❌'
      };
    }

    // Test 2: Debug environment endpoint
    try {
      const debugResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/debug-env`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );
      const debugData = await debugResponse.json();
      diagnostics.tests.debugEnv = {
        status: debugResponse.status,
        ok: debugResponse.ok,
        stripeConfigured: debugData?.stripe?.configured || false,
        stripeValid: debugData?.stripe?.isValid || false,
        result: (debugData?.stripe?.configured && debugData?.stripe?.isValid) ? 'PASS ✅' : 'FAIL ❌ - Stripe not configured'
      };
    } catch (err) {
      diagnostics.tests.debugEnv = {
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error',
        result: 'FAIL ❌'
      };
    }

    // Test 3: Price endpoint (simpler than payment intent)
    try {
      const priceResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/get-price`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            material: 'sterling-silver',
            items: [{ letter: 'A', quantity: 1, size: 'medium' }]
          }),
        }
      );
      diagnostics.tests.priceEndpoint = {
        status: priceResponse.status,
        ok: priceResponse.ok,
        result: priceResponse.ok ? 'PASS ✅' : 'FAIL ❌'
      };
    } catch (err) {
      diagnostics.tests.priceEndpoint = {
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error',
        result: 'FAIL ❌'
      };
    }

    console.log('Diagnostic Results:', diagnostics);
    setDiagnosticInfo(diagnostics);
    setLoading(false);
  };

  const createPaymentIntent = async () => {
    try {
      console.log('Creating payment intent...', {
        projectId,
        formDataKeys: Object.keys(formData),
        amount
      });

      const response = await fetch(
        `${EDGE_FUNCTION_BASE_URL}/create-payment-intent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            ...formData,
            currency: 'usd',
          }),
        }
      );

      console.log('Response status:', response.status, response.statusText);

      if (!response.ok) {
        let errorMessage = 'Failed to create payment';
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
      console.log('Payment intent created successfully:', { orderId: data.orderId });
      setClientSecret(data.clientSecret);
      setOrderId(data.orderId);
      setLoading(false);
    } catch (err) {
      console.error('Error creating payment intent:', err);
      
      // Provide more specific error messages
      let errorMessage = 'Failed to initialize payment';
      
      if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to payment server. Please check your internet connection and try again.';
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Preparing payment...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <XCircle className="w-12 h-12 text-destructive" />
            <div className="text-center">
              <h3 className="mb-2">Payment initialization failed</h3>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              
              {/* Show helpful tips based on error type */}
              {error.includes('connect') || error.includes('fetch') ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4 text-left">
                  <p className="text-sm text-yellow-900 mb-2">
                    <strong>Possible issues:</strong>
                  </p>
                  <ul className="text-xs text-yellow-800 list-disc list-inside space-y-1">
                    <li>Check your internet connection</li>
                    <li>Edge Function may not be deployed</li>
                    <li>CORS settings may need adjustment</li>
                  </ul>
                </div>
              ) : error.includes('Stripe') || error.includes('configured') ? (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4 text-left">
                  <p className="text-sm text-yellow-900 mb-2">
                    <strong>Stripe Configuration Issue:</strong>
                  </p>
                  <ul className="text-xs text-yellow-800 list-disc list-inside space-y-1">
                    <li>Ensure STRIPE_SECRET_KEY is set in Supabase Edge Function secrets</li>
                    <li>Verify the Stripe API key is valid (starts with sk_test_ or sk_live_)</li>
                    <li>Check Edge Function logs for detailed errors</li>
                  </ul>
                </div>
              ) : null}
              
              {/* Diagnostic Information */}
              {diagnosticInfo && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg mb-4 text-left max-w-lg">
                  <p className="text-sm mb-3">
                    <strong>🔍 Diagnostic Results:</strong>
                  </p>
                  
                  {diagnosticInfo.tests.health && (
                    <div className="mb-2">
                      <p className="text-xs">
                        <strong>Health Check:</strong> {diagnosticInfo.tests.health.result}
                      </p>
                      {diagnosticInfo.tests.health.error && (
                        <p className="text-xs text-red-600 ml-4">Error: {diagnosticInfo.tests.health.error}</p>
                      )}
                    </div>
                  )}
                  
                  {diagnosticInfo.tests.debugEnv && (
                    <div className="mb-2">
                      <p className="text-xs">
                        <strong>Stripe Configuration:</strong> {diagnosticInfo.tests.debugEnv.result}
                      </p>
                      {diagnosticInfo.tests.debugEnv.error && (
                        <p className="text-xs text-red-600 ml-4">Error: {diagnosticInfo.tests.debugEnv.error}</p>
                      )}
                      {!diagnosticInfo.tests.debugEnv.stripeConfigured && (
                        <p className="text-xs text-orange-600 ml-4">⚠️ STRIPE_SECRET_KEY not set in Edge Function secrets</p>
                      )}
                    </div>
                  )}
                  
                  {diagnosticInfo.tests.priceEndpoint && (
                    <div className="mb-2">
                      <p className="text-xs">
                        <strong>API Endpoint:</strong> {diagnosticInfo.tests.priceEndpoint.result}
                      </p>
                      {diagnosticInfo.tests.priceEndpoint.error && (
                        <p className="text-xs text-red-600 ml-4">Error: {diagnosticInfo.tests.priceEndpoint.error}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button onClick={() => { setError(null); setLoading(true); createPaymentIntent(); }}>
                    Try Again
                  </Button>
                  <Button onClick={onCancel} variant="outline">Go Back</Button>
                </div>
                <Button onClick={runDiagnostics} variant="secondary" size="sm" className="w-full">
                  🔍 Run Quick Diagnostics
                </Button>
                
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded text-center">
                  <p className="text-xs text-blue-900 mb-2">
                    <strong>💡 Need more detailed diagnostics?</strong>
                  </p>
                  <p className="text-xs text-blue-800 mb-2">
                    Click the copyright text at the bottom of the page <strong>5 times</strong> to open the Testing Dashboard, then go to the <strong>"💳 Stripe"</strong> tab for comprehensive setup verification.
                  </p>
                  <p className="text-xs text-blue-700">
                    Or see <code className="bg-blue-100 px-1 rounded">STRIPE_QUICK_FIX.md</code> for step-by-step instructions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!clientSecret) {
    return null;
  }

  const options = {
    clientSecret,
    appearance: {
      theme: 'stripe' as const,
    },
  };

  return (
    <Card>
      <CardContent className="p-8">
        <div className="mb-6">
          <h3 className="text-2xl mb-2">Complete Your Order</h3>
          <p className="text-muted-foreground">
            Total: <span className="text-xl">${amount.toFixed(2)} USD</span>
          </p>
        </div>

        <Elements stripe={stripePromise} options={options}>
          <CheckoutForm 
            formData={formData} 
            onSuccess={() => {
              // Pass the orderId to the parent component
              onSuccess(orderId || undefined);
            }} 
            onCancel={onCancel} 
          />
        </Elements>
      </CardContent>
    </Card>
  );
}