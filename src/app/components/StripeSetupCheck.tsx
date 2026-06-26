import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle2, XCircle, AlertCircle, Loader2, RefreshCw, ExternalLink } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function StripeSetupCheck() {
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runChecks = async () => {
    setChecking(true);
    const checkResults: any = {
      timestamp: new Date().toISOString(),
      checks: {}
    };

    // Check 1: Edge Function Health
    try {
      const healthResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/health`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );
      
      if (healthResponse.ok) {
        checkResults.checks.edgeFunction = {
          status: 'pass',
          message: 'Edge Function is deployed and accessible',
          details: await healthResponse.json()
        };
      } else {
        checkResults.checks.edgeFunction = {
          status: 'fail',
          message: `Edge Function returned status ${healthResponse.status}`,
          details: null
        };
      }
    } catch (err) {
      checkResults.checks.edgeFunction = {
        status: 'fail',
        message: 'Cannot connect to Edge Function',
        error: err instanceof Error ? err.message : 'Unknown error',
        recommendation: 'Deploy the Edge Function using: supabase functions deploy server'
      };
    }

    // Check 2: Environment Variables
    try {
      const envResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/debug-env`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );
      
      if (envResponse.ok) {
        const envData = await envResponse.json();
        
        // Check Stripe configuration
        if (envData.stripe?.configured && envData.stripe?.isValid) {
          checkResults.checks.stripe = {
            status: 'pass',
            message: 'Stripe API key is configured and valid',
            details: {
              keyType: envData.stripe.startsWithSkLive ? 'Live Key (sk_live_)' : 'Test Key (sk_test_)',
              keyLength: envData.stripe.length
            }
          };
        } else if (envData.stripe?.configured && !envData.stripe?.isValid) {
          checkResults.checks.stripe = {
            status: 'fail',
            message: 'Stripe API key is set but INVALID',
            details: envData.stripe,
            recommendation: 'The key must start with sk_test_ or sk_live_. Please check your Stripe API key.'
          };
        } else {
          checkResults.checks.stripe = {
            status: 'fail',
            message: 'Stripe API key is NOT configured',
            recommendation: 'Set STRIPE_SECRET_KEY in Supabase Edge Function secrets'
          };
        }
      } else {
        checkResults.checks.stripe = {
          status: 'unknown',
          message: 'Could not check Stripe configuration',
          details: `Status: ${envResponse.status}`
        };
      }
    } catch (err) {
      checkResults.checks.stripe = {
        status: 'fail',
        message: 'Error checking environment variables',
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }

    // Check 3: Test Payment Flow (without actual Stripe call)
    try {
      const testResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/test-payment-flow`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            customerName: 'Test User',
            email: 'test@example.com',
            items: [{ letter: 'A', quantity: 1, size: 'medium' }],
            material: 'sterling-silver'
          }),
        }
      );
      
      if (testResponse.ok) {
        checkResults.checks.apiEndpoint = {
          status: 'pass',
          message: 'API endpoints are working correctly',
          details: await testResponse.json()
        };
      } else {
        checkResults.checks.apiEndpoint = {
          status: 'fail',
          message: `API test failed with status ${testResponse.status}`,
          details: null
        };
      }
    } catch (err) {
      checkResults.checks.apiEndpoint = {
        status: 'fail',
        message: 'Cannot reach API endpoints',
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }

    // Check 4: CORS
    checkResults.checks.cors = {
      status: checkResults.checks.edgeFunction?.status === 'pass' ? 'pass' : 'fail',
      message: checkResults.checks.edgeFunction?.status === 'pass' 
        ? 'CORS is configured correctly' 
        : 'CORS may not be configured'
    };

    console.log('Setup check results:', checkResults);
    setResults(checkResults);
    setChecking(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-50 border-green-200';
      case 'fail':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-yellow-50 border-yellow-200';
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-4">
          <h3 className="text-xl mb-2">🔧 Stripe Payment Setup Verification</h3>
          <p className="text-sm text-muted-foreground">
            Run this check to verify your Stripe payment integration is configured correctly.
          </p>
        </div>

        {/* Show deployment help if checks failed */}
        {results && Object.values(results.checks).some((check: any) => check.status === 'fail') && (
          <div className="mb-4 p-4 bg-orange-50 border-2 border-orange-300 rounded-lg">
            <p className="font-semibold text-orange-900 mb-2">⚠️ Edge Function Not Deployed?</p>
            <p className="text-sm text-orange-800 mb-3">
              If you see "Failed to fetch" or "Cannot connect to Edge Function", you need to deploy the Edge Function first.
            </p>
            <div className="text-sm text-orange-900 bg-white p-3 rounded border border-orange-200">
              <p className="font-semibold mb-2">Quick Deploy:</p>
              <code className="text-xs block bg-orange-50 p-2 rounded mb-1">supabase login</code>
              <code className="text-xs block bg-orange-50 p-2 rounded mb-1">supabase link</code>
              <code className="text-xs block bg-orange-50 p-2 rounded mb-1">supabase functions deploy server</code>
              <code className="text-xs block bg-orange-50 p-2 rounded">supabase secrets set STRIPE_SECRET_KEY=your_key</code>
              <p className="text-xs mt-2 text-orange-700">
                📚 See <strong>DEPLOY_NOW.md</strong> for detailed instructions
              </p>
            </div>
          </div>
        )}

        <Button 
          onClick={runChecks} 
          disabled={checking}
          className="mb-4"
        >
          {checking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Checks...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Run Setup Checks
            </>
          )}
        </Button>

        {results && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <h4 className="font-semibold">Results:</h4>
              <span className="text-xs text-muted-foreground">
                {new Date(results.timestamp).toLocaleString()}
              </span>
            </div>

            {/* Edge Function Check */}
            {results.checks.edgeFunction && (
              <div className={`p-4 border rounded-lg ${getStatusColor(results.checks.edgeFunction.status)}`}>
                <div className="flex items-start gap-3">
                  {getStatusIcon(results.checks.edgeFunction.status)}
                  <div className="flex-1">
                    <p className="font-medium text-sm">Edge Function Deployment</p>
                    <p className="text-xs mt-1">{results.checks.edgeFunction.message}</p>
                    {results.checks.edgeFunction.error && (
                      <>
                        <p className="text-xs text-red-600 mt-1">Error: {results.checks.edgeFunction.error}</p>
                        {results.checks.edgeFunction.error.includes('fetch') && (
                          <div className="mt-3 p-3 bg-white rounded border border-red-300">
                            <p className="text-xs font-semibold text-red-900 mb-2">🚨 This is a deployment issue!</p>
                            <p className="text-xs text-red-800 mb-2">
                              The Edge Function hasn't been deployed to Supabase yet. Deploy it now:
                            </p>
                            <div className="space-y-1">
                              <code className="text-xs block bg-red-50 px-2 py-1 rounded">1. supabase login</code>
                              <code className="text-xs block bg-red-50 px-2 py-1 rounded">2. supabase link</code>
                              <code className="text-xs block bg-red-50 px-2 py-1 rounded">3. supabase functions deploy server</code>
                              <code className="text-xs block bg-red-50 px-2 py-1 rounded">4. supabase secrets set STRIPE_SECRET_KEY=sk_test_...</code>
                            </div>
                            <p className="text-xs text-red-700 mt-2">
                              📖 Full guide: <strong>DEPLOY_NOW.md</strong>
                            </p>
                          </div>
                        )}
                      </>
                    )}
                    {results.checks.edgeFunction.recommendation && !results.checks.edgeFunction.error?.includes('fetch') && (
                      <p className="text-xs text-orange-700 mt-2 font-medium">
                        💡 {results.checks.edgeFunction.recommendation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Stripe Configuration Check */}
            {results.checks.stripe && (
              <div className={`p-4 border rounded-lg ${getStatusColor(results.checks.stripe.status)}`}>
                <div className="flex items-start gap-3">
                  {getStatusIcon(results.checks.stripe.status)}
                  <div className="flex-1">
                    <p className="font-medium text-sm">Stripe API Configuration</p>
                    <p className="text-xs mt-1">{results.checks.stripe.message}</p>
                    {results.checks.stripe.details?.keyType && (
                      <p className="text-xs mt-1">Key Type: {results.checks.stripe.details.keyType}</p>
                    )}
                    {results.checks.stripe.recommendation && (
                      <div className="mt-2 p-2 bg-white rounded border border-orange-300">
                        <p className="text-xs text-orange-900 font-medium mb-1">
                          💡 How to Fix:
                        </p>
                        <p className="text-xs text-orange-800">{results.checks.stripe.recommendation}</p>
                        <div className="mt-2 text-xs text-orange-800">
                          <p className="font-medium">Steps:</p>
                          <ol className="list-decimal list-inside space-y-1 ml-2">
                            <li>Go to https://dashboard.stripe.com/apikeys</li>
                            <li>Copy your Secret Key (starts with sk_test_ or sk_live_)</li>
                            <li>In Supabase Dashboard → Edge Functions → Secrets</li>
                            <li>Add: STRIPE_SECRET_KEY = your-key-here</li>
                            <li>Redeploy: supabase functions deploy server</li>
                          </ol>
                          <div className="mt-3 flex flex-col gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="w-full text-xs"
                              onClick={() => window.open(`https://supabase.com/dashboard/project/${projectId}/functions`, '_blank')}
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Open Supabase Edge Functions
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="w-full text-xs"
                              onClick={() => window.open('https://dashboard.stripe.com/apikeys', '_blank')}
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Get Stripe API Keys
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* API Endpoint Check */}
            {results.checks.apiEndpoint && (
              <div className={`p-4 border rounded-lg ${getStatusColor(results.checks.apiEndpoint.status)}`}>
                <div className="flex items-start gap-3">
                  {getStatusIcon(results.checks.apiEndpoint.status)}
                  <div className="flex-1">
                    <p className="font-medium text-sm">API Endpoints</p>
                    <p className="text-xs mt-1">{results.checks.apiEndpoint.message}</p>
                    {results.checks.apiEndpoint.error && (
                      <p className="text-xs text-red-600 mt-1">Error: {results.checks.apiEndpoint.error}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* CORS Check */}
            {results.checks.cors && (
              <div className={`p-4 border rounded-lg ${getStatusColor(results.checks.cors.status)}`}>
                <div className="flex items-start gap-3">
                  {getStatusIcon(results.checks.cors.status)}
                  <div className="flex-1">
                    <p className="font-medium text-sm">CORS Configuration</p>
                    <p className="text-xs mt-1">{results.checks.cors.message}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Overall Status */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="font-medium text-sm text-blue-900 mb-2">📋 Summary</p>
              {Object.values(results.checks).every((check: any) => check.status === 'pass') ? (
                <p className="text-sm text-blue-800">
                  ✅ All checks passed! Your Stripe payment integration is configured correctly.
                </p>
              ) : (
                <div className="text-sm text-blue-800">
                  <p className="mb-2">⚠️ Some issues were found. Please review the failed checks above.</p>
                  <p className="text-xs">
                    Fix the issues and run the checks again to verify.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
