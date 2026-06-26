import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle, XCircle, Loader2, Copy, Check } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface TestResult {
  endpoint: string;
  url: string;
  status: 'pending' | 'testing' | 'success' | 'failed';
  statusCode?: number;
  message?: string;
  response?: any;
}

export function QuickFix404() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [testing, setTesting] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const baseUrl = `https://${projectId}.supabase.co/functions/v1/server`;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const testEndpoint = async (endpoint: string, method: 'GET' | 'POST' = 'GET', body?: any): Promise<TestResult> => {
    const url = `${baseUrl}${endpoint}`;
    const result: TestResult = {
      endpoint,
      url,
      status: 'testing',
    };

    try {
      const options: RequestInit = {
        method,
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
      };

      if (body) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(url, options);
      const data = await response.json();

      result.statusCode = response.status;
      result.response = data;

      if (response.ok) {
        result.status = 'success';
        result.message = `✅ ${response.status} OK`;
      } else {
        result.status = 'failed';
        result.message = `❌ ${response.status} ${response.statusText}`;
      }
    } catch (error: any) {
      result.status = 'failed';
      result.message = `❌ ${error.message}`;
    }

    return result;
  };

  const runAllTests = async () => {
    setTesting(true);
    setResults([]);

    const tests: TestResult[] = [];

    // Test 1: Health
    console.log('Testing health endpoint...');
    const healthResult = await testEndpoint('/health');
    tests.push(healthResult);
    setResults([...tests]);

    // Test 2: Debug Env
    console.log('Testing debug-env endpoint...');
    const debugResult = await testEndpoint('/debug-env');
    tests.push(debugResult);
    setResults([...tests]);

    // Test 3: Get Price
    console.log('Testing get-price endpoint...');
    const priceResult = await testEndpoint('/get-price', 'POST', {
      material: 'sterling-silver',
      items: [{ letter: 'A', quantity: 1, size: 'medium' }],
      pendantStyle: 'none',
      bailOptions: [],
      extraJumpRings: 0
    });
    tests.push(priceResult);
    setResults([...tests]);

    // Test 4: Test Payment Flow
    console.log('Testing test-payment-flow endpoint...');
    const flowResult = await testEndpoint('/test-payment-flow', 'POST', {
      customerName: 'Test User',
      email: 'test@example.com',
      items: [{ letter: 'A', quantity: 1, size: 'medium' }]
    });
    tests.push(flowResult);
    setResults([...tests]);

    setTesting(false);
  };

  const getConsoleCommand = (endpoint: string, method: 'GET' | 'POST' = 'GET', body?: any) => {
    const url = `${baseUrl}${endpoint}`;
    
    if (method === 'GET') {
      return `fetch('${url}', {
  headers: { Authorization: 'Bearer ${publicAnonKey}' }
}).then(r => r.json()).then(console.log).catch(console.error);`;
    } else {
      return `fetch('${url}', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer ${publicAnonKey}'
  },
  body: JSON.stringify(${JSON.stringify(body, null, 2)})
}).then(r => r.json()).then(console.log).catch(console.error);`;
    }
  };

  const allPassed = results.length > 0 && results.every(r => r.status === 'success');
  const anyFailed = results.some(r => r.status === 'failed');

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>🚨 Quick 404 Fix Tool</CardTitle>
        <CardDescription>
          Test all Edge Function endpoints and get instant diagnostic results
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Run Tests Button */}
        <div className="flex gap-3">
          <Button 
            onClick={runAllTests} 
            disabled={testing}
            size="lg"
            className="flex-1"
          >
            {testing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>Run All Endpoint Tests</>
            )}
          </Button>
        </div>

        {/* Results Summary */}
        {results.length > 0 && (
          <div className={`p-4 rounded-lg border-2 ${
            allPassed ? 'bg-green-50 border-green-500' :
            anyFailed ? 'bg-red-50 border-red-500' :
            'bg-gray-50 border-gray-300'
          }`}>
            <div className="flex items-center gap-3">
              {allPassed ? (
                <>
                  <CheckCircle className="h-6 w-6 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">✅ All Tests Passed!</p>
                    <p className="text-sm text-green-700">
                      Your Edge Function is working correctly. No 404 errors detected.
                    </p>
                  </div>
                </>
              ) : anyFailed ? (
                <>
                  <XCircle className="h-6 w-6 text-red-600" />
                  <div>
                    <p className="font-medium text-red-900">❌ Some Tests Failed</p>
                    <p className="text-sm text-red-700">
                      See details below and follow the fix instructions.
                    </p>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        )}

        {/* Test Results */}
        {results.map((result, index) => (
          <div 
            key={index} 
            className={`border rounded-lg p-4 space-y-3 ${
              result.status === 'success' ? 'border-green-300 bg-green-50' :
              result.status === 'failed' ? 'border-red-300 bg-red-50' :
              'border-gray-300'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                {result.status === 'testing' && <Loader2 className="h-5 w-5 animate-spin text-blue-500 mt-0.5" />}
                {result.status === 'success' && <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />}
                {result.status === 'failed' && <XCircle className="h-5 w-5 text-red-600 mt-0.5" />}
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium break-all">
                    {result.endpoint}
                  </h3>
                  <p className="text-xs text-muted-foreground break-all mt-1">
                    {result.url}
                  </p>
                  {result.message && (
                    <p className="text-sm mt-2">{result.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Response Details */}
            {result.response && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                  View Response Data
                </summary>
                <pre className="text-xs mt-2 p-3 bg-white rounded overflow-auto max-h-40 border">
                  {JSON.stringify(result.response, null, 2)}
                </pre>
              </details>
            )}

            {/* Console Command */}
            <details>
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
                Test in Browser Console
              </summary>
              <div className="mt-2 relative">
                <pre className="text-xs p-3 bg-gray-900 text-green-400 rounded overflow-auto max-h-60">
                  {getConsoleCommand(
                    result.endpoint,
                    result.endpoint === '/get-price' || result.endpoint === '/test-payment-flow' ? 'POST' : 'GET',
                    result.endpoint === '/get-price' ? {
                      material: 'sterling-silver',
                      items: [{ letter: 'A', quantity: 1, size: 'medium' }],
                      pendantStyle: 'none',
                      bailOptions: [],
                      extraJumpRings: 0
                    } : result.endpoint === '/test-payment-flow' ? {
                      customerName: 'Test User',
                      email: 'test@example.com',
                      items: [{ letter: 'A', quantity: 1, size: 'medium' }]
                    } : undefined
                  )}
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute top-2 right-2 h-8"
                  onClick={() => copyToClipboard(
                    getConsoleCommand(
                      result.endpoint,
                      result.endpoint === '/get-price' || result.endpoint === '/test-payment-flow' ? 'POST' : 'GET',
                      result.endpoint === '/get-price' ? {
                        material: 'sterling-silver',
                        items: [{ letter: 'A', quantity: 1, size: 'medium' }],
                        pendantStyle: 'none',
                        bailOptions: [],
                        extraJumpRings: 0
                      } : result.endpoint === '/test-payment-flow' ? {
                        customerName: 'Test User',
                        email: 'test@example.com',
                        items: [{ letter: 'A', quantity: 1, size: 'medium' }]
                      } : undefined
                    ),
                    result.endpoint
                  )}
                >
                  {copied === result.endpoint ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </details>
          </div>
        ))}

        {/* Fix Instructions */}
        {anyFailed && (
          <div className="border-t pt-6 space-y-4">
            <h3 className="font-medium text-lg">🛠️ How to Fix 404 Errors</h3>
            
            <div className="space-y-3 text-sm">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="font-medium text-yellow-900 mb-2">⚠️ Edge Function Not Deployed or Out of Date</p>
                <p className="text-yellow-800 mb-3">
                  Your Edge Function code exists but isn't deployed to Supabase yet, or needs redeployment.
                </p>
                <div className="space-y-2">
                  <p className="font-medium text-yellow-900">Option 1: Use the deployment script</p>
                  <pre className="text-xs p-3 bg-yellow-900 text-yellow-100 rounded overflow-auto">
                    {`cd "/Users/adilali/Documents/webcontents/web files/forged-initials-site"
bash redeploy-server.sh`}
                  </pre>
                  
                  <p className="font-medium text-yellow-900 mt-3">Option 2: Manual deployment</p>
                  <pre className="text-xs p-3 bg-yellow-900 text-yellow-100 rounded overflow-auto">
                    {`cd "/Users/adilali/Documents/webcontents/web files/forged-initials-site"
supabase functions deploy server --project-ref vpxuizymtmcnsgmpnhel --no-verify-jwt`}
                  </pre>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-medium text-blue-900 mb-2">📚 More Help Available</p>
                <ul className="text-blue-800 space-y-1 list-disc list-inside">
                  <li>See <code className="bg-blue-100 px-1 rounded">FIX_404_QUICK_GUIDE.md</code> for detailed instructions</li>
                  <li>Check <code className="bg-blue-100 px-1 rounded">START_HERE_404_FIX.md</code> for step-by-step guide</li>
                  <li>Use the "🔍 Frontend Configuration Verification" tool below for comprehensive testing</li>
                </ul>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="font-medium mb-2">🔍 Check Supabase Dashboard</p>
                <ol className="text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Go to <a href="https://supabase.com/dashboard/project/vpxuizymtmcnsgmpnhel" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Supabase Dashboard</a></li>
                  <li>Click "Edge Functions" in left sidebar</li>
                  <li>Click "server" function</li>
                  <li>Check "Invocations" tab to see if requests are arriving</li>
                  <li>Check "Logs" tab for error messages</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Success Next Steps */}
        {allPassed && (
          <div className="border-t pt-6 space-y-4">
            <h3 className="font-medium text-lg">✅ Next Steps</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>✅ All endpoints are working correctly!</p>
              <p>You can now:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Test custom orders and payments in your app</li>
                <li>Configure Stripe with your secret key (see "💳 Stripe" tab)</li>
                <li>Test Discord notifications (see "🔔 Discord" tab)</li>
                <li>Set up FedEx shipping (see "📦 Shipping" tab)</li>
              </ul>
            </div>
          </div>
        )}

        {/* Configuration Info */}
        <div className="border-t pt-6 space-y-3">
          <h3 className="font-medium">📋 Configuration</h3>
          <div className="space-y-2 text-sm">
            <div className="p-3 bg-gray-50 rounded">
              <p className="font-medium mb-1">Project ID:</p>
              <code className="text-xs break-all">{projectId}</code>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <p className="font-medium mb-1">Edge Function Base URL:</p>
              <code className="text-xs break-all">{baseUrl}</code>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
