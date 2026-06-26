import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { AlertCircle, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function DiagnosticPanel() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runDiagnostic = async () => {
    setTesting(true);
    setResult(null);

    try {
      console.log('🔍 Testing Edge Function endpoint...');
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/test-notification`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Response data:', data);
        
        setResult({
          success: true,
          status: response.status,
          data: data,
          hasPricing: !!data.itemizedPricing,
          message: data.message
        });
      } else {
        const errorText = await response.text();
        console.error('❌ Error response:', errorText);
        
        setResult({
          success: false,
          status: response.status,
          error: errorText,
          message: 'Edge Function returned an error'
        });
      }
    } catch (error) {
      console.error('❌ Request failed:', error);
      
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Cannot connect to Edge Function'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-500" />
          Edge Function Diagnostic
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-lg">
          <div className="font-semibold text-purple-900 mb-2">🎯 Testing the Email Backup</div>
          <p className="text-sm text-purple-800 mb-2">
            This diagnostic checks if your Edge Function is returning the itemized pricing data needed for the green embed (customer email backup).
          </p>
          <p className="text-sm text-purple-700">
            <strong>Expected:</strong> "Itemized Pricing: Present" ✅
          </p>
        </div>

        <Button
          onClick={runDiagnostic}
          disabled={testing}
          className="w-full"
        >
          {testing ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Run Diagnostic Test
            </>
          )}
        </Button>

        {result && (
          <div className="space-y-3">
            <div className={`p-4 rounded-lg border-2 ${
              result.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start gap-2">
                {result.success ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className={`font-medium ${result.success ? 'text-green-900' : 'text-red-900'}`}>
                    {result.message}
                  </div>
                  {result.status && (
                    <div className="text-sm mt-1 text-muted-foreground">
                      HTTP Status: {result.status}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {result.success && (
              <div className="space-y-2">
                <div className={`p-3 rounded ${
                  result.hasPricing ? 'bg-green-100 border border-green-300' : 'bg-yellow-100 border border-yellow-300'
                }`}>
                  <div className="flex items-center gap-2">
                    {result.hasPricing ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-green-900 font-medium">
                          ✅ Itemized Pricing: Present
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-yellow-600" />
                        <span className="text-yellow-900 font-medium">
                          ⚠️ Itemized Pricing: MISSING
                        </span>
                      </>
                    )}
                  </div>
                  <div className="text-sm mt-2 text-muted-foreground">
                    {result.hasPricing ? (
                      'Green embed should appear in Discord!'
                    ) : (
                      'This is why green embed is missing. Edge Function needs to be redeployed with updated code.'
                    )}
                  </div>
                </div>

                {result.data && (
                  <details className="text-xs">
                    <summary className="cursor-pointer font-medium p-2 bg-muted rounded hover:bg-muted/80">
                      View Full Response Data
                    </summary>
                    <pre className="mt-2 p-3 bg-slate-900 text-slate-100 rounded overflow-auto max-h-64">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {!result.success && (
              <div className="p-3 bg-slate-100 rounded text-sm">
                <div className="font-medium mb-2">Possible Causes:</div>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Edge Function is not deployed</li>
                  <li>Edge Function deployment failed</li>
                  <li>Old code is deployed (before email backup fix)</li>
                  <li>Network/connection issue</li>
                </ul>
                <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                  <div className="font-medium text-blue-900">Solution:</div>
                  <div className="text-blue-800 text-sm mt-1">
                    See <code className="bg-blue-100 px-1 rounded">DEPLOY_EDGE_FUNCTION.md</code> for deployment instructions.
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
          <div className="font-medium text-blue-900 mb-1">Expected Result:</div>
          <div className="text-blue-800">
            If working correctly, the response should include <code className="bg-blue-100 px-1 rounded">itemizedPricing</code> with:
          </div>
          <ul className="list-disc list-inside mt-2 text-blue-700 text-xs space-y-1">
            <li>items array with letter, quantity, itemTotal</li>
            <li>subtotal: $199.20</li>
            <li>shipping: $10.00</li>
            <li>total: $209.00</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
