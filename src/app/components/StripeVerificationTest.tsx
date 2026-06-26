import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function StripeVerificationTest() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runFullTest = async () => {
    setTesting(true);
    setResults(null);

    const testResults: any = {
      timestamp: new Date().toISOString(),
      tests: {}
    };

    try {
      // Test 1: Health Check
      console.log('🏥 Running health check...');
      try {
        const healthResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/server/health`,
          {
            method: 'GET',
            headers: { Authorization: `Bearer ${publicAnonKey}` },
          }
        );
        testResults.tests.health = {
          status: healthResponse.status,
          ok: healthResponse.ok,
          message: healthResponse.ok ? 'Edge Function is running ✅' : 'Edge Function not responding ❌'
        };
      } catch (err) {
        testResults.tests.health = {
          ok: false,
          error: err instanceof Error ? err.message : 'Unknown error',
          message: 'Cannot connect to Edge Function ❌'
        };
      }

      // Test 2: Debug Environment (Check Stripe Secret Key)
      console.log('🔐 Checking Stripe configuration...');
      try {
        const debugResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/server/debug-env`,
          {
            method: 'GET',
            headers: { Authorization: `Bearer ${publicAnonKey}` },
          }
        );
        const debugData = await debugResponse.json();
        
        const stripeConfigured = debugData?.stripe?.configured || false;
        const stripeValid = debugData?.stripe?.isValid || false;
        const startsWithSkLive = debugData?.stripe?.startsWithSkLive || false;
        const preview = debugData?.stripe?.preview || 'Not set';
        
        testResults.tests.stripeConfig = {
          ok: stripeConfigured && stripeValid,
          configured: stripeConfigured,
          isValid: stripeValid,
          isLiveKey: startsWithSkLive,
          preview: preview,
          message: (stripeConfigured && stripeValid) 
            ? `Stripe Secret Key configured correctly ✅ (${startsWithSkLive ? 'LIVE mode' : 'TEST mode'})` 
            : 'Stripe Secret Key not configured or invalid ❌'
        };
      } catch (err) {
        testResults.tests.stripeConfig = {
          ok: false,
          error: err instanceof Error ? err.message : 'Unknown error',
          message: 'Failed to check Stripe configuration ❌'
        };
      }

      // Test 3: Price Calculation (Tests backend logic)
      console.log('💰 Testing price calculation...');
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
              items: [
                { letter: 'A', quantity: 1, size: 'medium' }
              ]
            }),
          }
        );
        
        if (priceResponse.ok) {
          const priceData = await priceResponse.json();
          testResults.tests.pricing = {
            ok: true,
            total: priceData.total,
            breakdown: priceData,
            message: `Price calculation working ✅ (Total: $${priceData.total})`
          };
        } else {
          const errorText = await priceResponse.text();
          testResults.tests.pricing = {
            ok: false,
            error: errorText,
            message: 'Price calculation failed ❌'
          };
        }
      } catch (err) {
        testResults.tests.pricing = {
          ok: false,
          error: err instanceof Error ? err.message : 'Unknown error',
          message: 'Price calculation endpoint error ❌'
        };
      }

      // Test 4: Payment Flow Test (Without actual Stripe call)
      console.log('💳 Testing payment flow...');
      try {
        const flowResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/server/test-payment-flow`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({
              customerName: 'Test Customer',
              email: 'test@example.com',
              items: [{ letter: 'A', quantity: 1, size: 'medium' }],
              material: 'sterling-silver'
            }),
          }
        );
        
        if (flowResponse.ok) {
          const flowData = await flowResponse.json();
          testResults.tests.paymentFlow = {
            ok: true,
            message: 'Payment flow endpoint working ✅',
            data: flowData
          };
        } else {
          testResults.tests.paymentFlow = {
            ok: false,
            message: 'Payment flow endpoint failed ❌'
          };
        }
      } catch (err) {
        testResults.tests.paymentFlow = {
          ok: false,
          error: err instanceof Error ? err.message : 'Unknown error',
          message: 'Payment flow endpoint error ❌'
        };
      }

      setResults(testResults);
    } catch (error) {
      console.error('Test suite error:', error);
      setResults({
        error: error instanceof Error ? error.message : 'Unknown error',
        tests: testResults.tests
      });
    } finally {
      setTesting(false);
    }
  };

  const allTestsPassed = results?.tests && Object.values(results.tests).every((test: any) => test.ok);

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-blue-500" />
          Stripe Configuration Verification
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900 mb-2">
            <strong>✨ Just added your Stripe Secret Key?</strong>
          </p>
          <p className="text-sm text-blue-800">
            Run this test to verify everything is configured correctly and your payment system is ready to go!
          </p>
        </div>

        <Button
          onClick={runFullTest}
          disabled={testing}
          size="lg"
          className="w-full"
        >
          {testing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              🔍 Run Full Verification Test
            </>
          )}
        </Button>

        {results && (
          <div className="space-y-3 mt-6">
            {/* Overall Status */}
            <div className={`p-4 rounded-lg border-2 ${
              allTestsPassed 
                ? 'bg-green-50 border-green-300' 
                : 'bg-yellow-50 border-yellow-300'
            }`}>
              <div className="flex items-center gap-2">
                {allTestsPassed ? (
                  <>
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-900">
                        🎉 All Tests Passed!
                      </p>
                      <p className="text-sm text-green-800">
                        Your Stripe integration is fully configured and ready to accept payments.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                    <div>
                      <p className="font-semibold text-yellow-900">
                        ⚠️ Some Tests Failed
                      </p>
                      <p className="text-sm text-yellow-800">
                        Review the details below to fix the issues.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Individual Test Results */}
            {results.tests.health && (
              <div className={`p-3 rounded border ${
                results.tests.health.ok 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start gap-2">
                  {results.tests.health.ok ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm">1. Edge Function Health Check</p>
                    <p className="text-sm text-muted-foreground">{results.tests.health.message}</p>
                    {results.tests.health.error && (
                      <p className="text-xs text-red-600 mt-1">Error: {results.tests.health.error}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {results.tests.stripeConfig && (
              <div className={`p-3 rounded border ${
                results.tests.stripeConfig.ok 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start gap-2">
                  {results.tests.stripeConfig.ok ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm">2. Stripe Secret Key Configuration</p>
                    <p className="text-sm text-muted-foreground">{results.tests.stripeConfig.message}</p>
                    {results.tests.stripeConfig.configured && (
                      <div className="mt-1 text-xs">
                        <p className="text-muted-foreground">
                          Key Preview: <code className="bg-slate-100 px-1 rounded">{results.tests.stripeConfig.preview}</code>
                        </p>
                        {results.tests.stripeConfig.isLiveKey && (
                          <p className="text-orange-600 mt-1">
                            ⚠️ Using LIVE Stripe key - real payments will be processed!
                          </p>
                        )}
                      </div>
                    )}
                    {!results.tests.stripeConfig.ok && (
                      <div className="mt-2 p-2 bg-white/50 rounded text-xs">
                        <p className="font-medium mb-1">How to fix:</p>
                        <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                          <li>Go to Supabase Dashboard → Edge Functions → Secrets</li>
                          <li>Add a new secret named: <code className="bg-slate-100 px-1">STRIPE_SECRET_KEY</code></li>
                          <li>Paste your Stripe secret key (starts with sk_test_ or sk_live_)</li>
                          <li>Save and wait 10-30 seconds for the function to reload</li>
                        </ol>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {results.tests.pricing && (
              <div className={`p-3 rounded border ${
                results.tests.pricing.ok 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start gap-2">
                  {results.tests.pricing.ok ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm">3. Price Calculation</p>
                    <p className="text-sm text-muted-foreground">{results.tests.pricing.message}</p>
                    {results.tests.pricing.breakdown && (
                      <details className="mt-2 text-xs">
                        <summary className="cursor-pointer text-blue-600 hover:text-blue-700">
                          View pricing breakdown
                        </summary>
                        <pre className="mt-1 p-2 bg-slate-900 text-slate-100 rounded overflow-auto">
{JSON.stringify(results.tests.pricing.breakdown, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            )}

            {results.tests.paymentFlow && (
              <div className={`p-3 rounded border ${
                results.tests.paymentFlow.ok 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start gap-2">
                  {results.tests.paymentFlow.ok ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-sm">4. Payment Flow Endpoint</p>
                    <p className="text-sm text-muted-foreground">{results.tests.paymentFlow.message}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Next Steps */}
            {allTestsPassed && (
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg">
                <p className="font-semibold text-green-900 mb-2">🚀 Ready to Go!</p>
                <p className="text-sm text-green-800 mb-3">
                  Your payment system is fully configured. Here's what you can do now:
                </p>
                <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside">
                  <li>Go to the Custom Order page</li>
                  <li>Fill out a test order</li>
                  <li>Click "Continue to Payment"</li>
                  <li>You should see the Stripe payment form! 🎉</li>
                </ol>
                <p className="text-xs text-green-700 mt-3">
                  💡 <strong>Tip:</strong> Use Stripe test card <code className="bg-green-100 px-1 rounded">4242 4242 4242 4242</code> with any future expiry date and any CVC to test payments.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
