import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { CheckCircle2, XCircle, Loader2, AlertTriangle, Copy, Check } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function PaymentDiagnostics() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const runFullDiagnostics = async () => {
    setTesting(true);
    setResults(null);

    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      environment: {
        projectId,
        url: `https://${projectId}.supabase.co`,
        hasAnonKey: !!publicAnonKey,
        anonKeyLength: publicAnonKey?.length || 0
      },
      tests: {}
    };

    console.log('🔍 Starting comprehensive payment diagnostics...');
    console.log('Project ID:', projectId);
    console.log('Anon Key Length:', publicAnonKey?.length);

    // Test 1: Basic Health Check
    try {
      console.log('Test 1: Health Check');
      const healthUrl = `https://${projectId}.supabase.co/functions/v1/server/health`;
      console.log('Health URL:', healthUrl);
      
      const healthResponse = await fetch(healthUrl, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      
      console.log('Health Response:', healthResponse.status, healthResponse.statusText);
      
      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        diagnostics.tests.health = {
          status: 'pass',
          statusCode: healthResponse.status,
          data: healthData,
          message: '✅ Edge Function is accessible'
        };
      } else {
        diagnostics.tests.health = {
          status: 'fail',
          statusCode: healthResponse.status,
          message: `❌ Edge Function returned ${healthResponse.status}`
        };
      }
    } catch (err) {
      console.error('Health check error:', err);
      const isFetchError = err instanceof TypeError && err.message.includes('fetch');
      diagnostics.tests.health = {
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error',
        message: isFetchError 
          ? '❌ Failed to fetch - Edge Function NOT DEPLOYED' 
          : '❌ Cannot connect to Edge Function',
        recommendation: isFetchError
          ? 'DEPLOY NOW: Run "supabase functions deploy server"'
          : 'Edge Function may not be deployed or is unreachable',
        deploymentInstructions: isFetchError ? {
          step1: 'supabase login',
          step2: 'supabase link --project-ref vpxuizymtmcnsgmpnhel',
          step3: 'supabase functions deploy server',
          guide: 'See DEPLOY_EDGE_FUNCTION_NOW.md for detailed instructions'
        } : null
      };
    }

    // Test 2: Environment Variables Check
    try {
      console.log('Test 2: Environment Variables');
      const envUrl = `https://${projectId}.supabase.co/functions/v1/server/debug-env`;
      console.log('Env URL:', envUrl);
      
      const envResponse = await fetch(envUrl, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${publicAnonKey}`,
        },
      });
      
      console.log('Env Response:', envResponse.status, envResponse.statusText);
      
      if (envResponse.ok) {
        const envData = await envResponse.json();
        console.log('Env Data:', envData);
        
        const stripeOk = envData.stripe?.configured && envData.stripe?.isValid;
        
        diagnostics.tests.stripe = {
          status: stripeOk ? 'pass' : 'fail',
          statusCode: envResponse.status,
          configured: envData.stripe?.configured,
          valid: envData.stripe?.isValid,
          keyType: envData.stripe?.startsWithSkLive ? 'Live' : 'Test',
          preview: envData.stripe?.preview,
          message: stripeOk 
            ? `✅ Stripe configured (${envData.stripe?.startsWithSkLive ? 'LIVE' : 'TEST'} mode)`
            : '❌ Stripe not configured or invalid',
          recommendation: !stripeOk ? 'Add STRIPE_SECRET_KEY to Edge Function secrets' : null
        };
      } else {
        diagnostics.tests.stripe = {
          status: 'fail',
          statusCode: envResponse.status,
          message: '❌ Cannot check Stripe configuration'
        };
      }
    } catch (err) {
      console.error('Env check error:', err);
      diagnostics.tests.stripe = {
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error',
        message: '❌ Environment check failed'
      };
    }

    // Test 3: Price Calculation (Tests backend without Stripe)
    try {
      console.log('Test 3: Price Calculation');
      const priceUrl = `https://${projectId}.supabase.co/functions/v1/server/get-price`;
      console.log('Price URL:', priceUrl);
      
      const priceResponse = await fetch(priceUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          material: 'sterling-silver',
          items: [{ letter: 'A', quantity: 1, size: 'medium' }]
        }),
      });
      
      console.log('Price Response:', priceResponse.status, priceResponse.statusText);
      
      if (priceResponse.ok) {
        const priceData = await priceResponse.json();
        console.log('Price Data:', priceData);
        
        diagnostics.tests.pricing = {
          status: 'pass',
          statusCode: priceResponse.status,
          data: priceData,
          message: `✅ Price calculation works (Total: $${priceData.total})`
        };
      } else {
        const errorText = await priceResponse.text();
        diagnostics.tests.pricing = {
          status: 'fail',
          statusCode: priceResponse.status,
          error: errorText,
          message: '❌ Price calculation failed'
        };
      }
    } catch (err) {
      console.error('Price check error:', err);
      diagnostics.tests.pricing = {
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error',
        message: '❌ Price endpoint error'
      };
    }

    // Test 4: Payment Intent Creation (This is what's actually failing)
    try {
      console.log('Test 4: Payment Intent Creation');
      const paymentUrl = `https://${projectId}.supabase.co/functions/v1/server/create-payment-intent`;
      console.log('Payment URL:', paymentUrl);
      
      const paymentResponse = await fetch(paymentUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({
          customerName: 'Test Customer',
          email: 'test@example.com',
          items: [{ letter: 'A', quantity: 1, size: 'medium' }],
          material: 'sterling-silver',
          details: 'Test order',
          currency: 'usd',
          addressLine1: '123 Test St',
          city: 'Houston',
          stateOrProvinceCode: 'TX',
          postalCode: '77001',
          phoneNumber: '5551234567'
        }),
      });
      
      console.log('Payment Response:', paymentResponse.status, paymentResponse.statusText);
      
      if (paymentResponse.ok) {
        const paymentData = await paymentResponse.json();
        console.log('Payment Data:', paymentData);
        
        diagnostics.tests.payment = {
          status: 'pass',
          statusCode: paymentResponse.status,
          hasClientSecret: !!paymentData.clientSecret,
          orderId: paymentData.orderId,
          amount: paymentData.amount,
          message: '✅ Payment intent creation works!',
          note: 'Your Stripe integration is fully functional'
        };
      } else {
        const errorText = await paymentResponse.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { rawError: errorText };
        }
        
        console.error('Payment Error:', errorData);
        
        diagnostics.tests.payment = {
          status: 'fail',
          statusCode: paymentResponse.status,
          error: errorData,
          message: '❌ Payment intent creation failed',
          recommendation: 'Check Stripe secret key configuration'
        };
      }
    } catch (err) {
      console.error('Payment check error:', err);
      diagnostics.tests.payment = {
        status: 'error',
        error: err instanceof Error ? err.message : 'Unknown error',
        message: '❌ Payment endpoint error',
        recommendation: 'Network or CORS issue'
      };
    }

    // Test 5: CORS Check
    diagnostics.tests.cors = {
      status: diagnostics.tests.health?.status === 'pass' ? 'pass' : 'unknown',
      message: diagnostics.tests.health?.status === 'pass' 
        ? '✅ CORS is working'
        : '⚠️ CORS status unknown'
    };

    // Overall Assessment
    const allPassed = Object.values(diagnostics.tests).every((test: any) => test.status === 'pass');
    diagnostics.overall = {
      status: allPassed ? 'ready' : 'issues',
      message: allPassed 
        ? '🎉 All tests passed! Payment system is ready.'
        : '⚠️ Some issues detected. Review the results below.',
      readyForProduction: allPassed
    };

    console.log('📊 Diagnostics complete:', diagnostics);
    setResults(diagnostics);
    setTesting(false);
  };

  const copyToClipboard = () => {
    const text = JSON.stringify(results, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-50 border-green-200';
      case 'fail':
        return 'bg-red-50 border-red-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-yellow-50 border-yellow-200';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔍 Payment System Diagnostics
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Run comprehensive tests to identify payment initialization issues
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={runFullDiagnostics}
          disabled={testing}
          size="lg"
          className="w-full"
        >
          {testing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Running Diagnostics...
            </>
          ) : (
            <>
              🔍 Run Full Diagnostics
            </>
          )}
        </Button>

        {results && (
          <div className="space-y-4">
            {/* Overall Status */}
            <div className={`p-4 rounded-lg border-2 ${
              results.overall.status === 'ready' 
                ? 'bg-green-50 border-green-300' 
                : 'bg-yellow-50 border-yellow-300'
            }`}>
              <div className="flex items-start gap-3">
                {results.overall.status === 'ready' ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                )}
                <div>
                  <p className="font-semibold text-lg">{results.overall.message}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Timestamp: {new Date(results.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Individual Tests */}
            {results.tests.health && (
              <div className={`p-3 rounded border ${getStatusColor(results.tests.health.status)}`}>
                <div className="flex items-start gap-2">
                  {getStatusBadge(results.tests.health.status)}
                  <div className="flex-1">
                    <p className="font-medium text-sm">1. Edge Function Health</p>
                    <p className="text-xs mt-1">{results.tests.health.message}</p>
                    {results.tests.health.statusCode && (
                      <p className="text-xs text-muted-foreground">Status: {results.tests.health.statusCode}</p>
                    )}
                    {results.tests.health.recommendation && (
                      <p className="text-xs text-orange-600 mt-2">💡 {results.tests.health.recommendation}</p>
                    )}
                    {results.tests.health.deploymentInstructions && (
                      <div className="mt-3 p-3 bg-red-900 text-white rounded">
                        <p className="font-semibold text-sm mb-2">🚀 DEPLOY EDGE FUNCTION NOW:</p>
                        <div className="space-y-2 text-xs font-mono">
                          <div className="bg-black/30 p-2 rounded">
                            <p className="text-red-200">1. Login:</p>
                            <p className="text-white">{results.tests.health.deploymentInstructions.step1}</p>
                          </div>
                          <div className="bg-black/30 p-2 rounded">
                            <p className="text-red-200">2. Link project:</p>
                            <p className="text-white">{results.tests.health.deploymentInstructions.step2}</p>
                          </div>
                          <div className="bg-black/30 p-2 rounded">
                            <p className="text-red-200">3. Deploy:</p>
                            <p className="text-white">{results.tests.health.deploymentInstructions.step3}</p>
                          </div>
                        </div>
                        <p className="text-xs text-red-200 mt-2">
                          📖 {results.tests.health.deploymentInstructions.guide}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {results.tests.stripe && (
              <div className={`p-3 rounded border ${getStatusColor(results.tests.stripe.status)}`}>
                <div className="flex items-start gap-2">
                  {getStatusBadge(results.tests.stripe.status)}
                  <div className="flex-1">
                    <p className="font-medium text-sm">2. Stripe Configuration</p>
                    <p className="text-xs mt-1">{results.tests.stripe.message}</p>
                    {results.tests.stripe.configured !== undefined && (
                      <div className="text-xs mt-1 space-y-1">
                        <p>Configured: {results.tests.stripe.configured ? '✅' : '❌'}</p>
                        <p>Valid: {results.tests.stripe.valid ? '✅' : '❌'}</p>
                        {results.tests.stripe.preview && (
                          <p>Key: {results.tests.stripe.preview}</p>
                        )}
                      </div>
                    )}
                    {results.tests.stripe.recommendation && (
                      <div className="mt-2 p-2 bg-white rounded text-xs">
                        <p className="font-medium text-orange-900">💡 Fix:</p>
                        <p className="text-orange-800">{results.tests.stripe.recommendation}</p>
                        <p className="text-orange-700 mt-1">
                          Go to: Supabase Dashboard → Edge Functions → Secrets → Add STRIPE_SECRET_KEY
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {results.tests.pricing && (
              <div className={`p-3 rounded border ${getStatusColor(results.tests.pricing.status)}`}>
                <div className="flex items-start gap-2">
                  {getStatusBadge(results.tests.pricing.status)}
                  <div className="flex-1">
                    <p className="font-medium text-sm">3. Price Calculation</p>
                    <p className="text-xs mt-1">{results.tests.pricing.message}</p>
                  </div>
                </div>
              </div>
            )}

            {results.tests.payment && (
              <div className={`p-3 rounded border ${getStatusColor(results.tests.payment.status)}`}>
                <div className="flex items-start gap-2">
                  {getStatusBadge(results.tests.payment.status)}
                  <div className="flex-1">
                    <p className="font-medium text-sm">4. Payment Intent Creation</p>
                    <p className="text-xs mt-1">{results.tests.payment.message}</p>
                    {results.tests.payment.note && (
                      <p className="text-xs text-green-700 mt-1">🎉 {results.tests.payment.note}</p>
                    )}
                    {results.tests.payment.error && (
                      <details className="mt-2 text-xs">
                        <summary className="cursor-pointer text-red-600 font-medium">View Error Details</summary>
                        <pre className="mt-1 p-2 bg-red-900 text-red-100 rounded overflow-auto max-h-32">
                          {JSON.stringify(results.tests.payment.error, null, 2)}
                        </pre>
                      </details>
                    )}
                    {results.tests.payment.recommendation && (
                      <p className="text-xs text-orange-600 mt-2">💡 {results.tests.payment.recommendation}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {results.tests.cors && (
              <div className={`p-3 rounded border ${getStatusColor(results.tests.cors.status)}`}>
                <div className="flex items-start gap-2">
                  {getStatusBadge(results.tests.cors.status)}
                  <div className="flex-1">
                    <p className="font-medium text-sm">5. CORS Configuration</p>
                    <p className="text-xs mt-1">{results.tests.cors.message}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                onClick={copyToClipboard}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Results
                  </>
                )}
              </Button>
              <Button
                onClick={runFullDiagnostics}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Run Again
              </Button>
            </div>

            {/* Environment Info */}
            <details className="text-xs">
              <summary className="cursor-pointer font-medium p-2 bg-muted rounded hover:bg-muted/80">
                View Environment Info
              </summary>
              <div className="mt-2 p-3 bg-slate-900 text-slate-100 rounded">
                <p>Project ID: {results.environment.projectId}</p>
                <p>URL: {results.environment.url}</p>
                <p>Has Anon Key: {results.environment.hasAnonKey ? '✅' : '❌'}</p>
                <p>Anon Key Length: {results.environment.anonKeyLength}</p>
              </div>
            </details>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
