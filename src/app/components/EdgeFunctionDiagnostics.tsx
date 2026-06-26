import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle2, XCircle, AlertCircle, Loader2, ExternalLink, RefreshCw } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

export function EdgeFunctionDiagnostics() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runDiagnostics = async () => {
    setTesting(true);
    const diagnosticResults: any = {
      timestamp: new Date().toISOString(),
      tests: []
    };

    try {
      // Test 1: Check if Edge Function is reachable (health endpoint)
      console.log('🔍 Test 1: Checking Edge Function health endpoint...');
      
      const healthUrl = `https://${projectId}.supabase.co/functions/v1/server/health`;
      console.log('Health URL:', healthUrl);
      
      try {
        const healthResponse = await fetch(healthUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          }
        });

        const healthData = await healthResponse.json();
        
        diagnosticResults.tests.push({
          name: 'Health Check',
          status: healthResponse.ok ? 'pass' : 'fail',
          url: healthUrl,
          statusCode: healthResponse.status,
          data: healthData,
          message: healthResponse.ok 
            ? `✅ Edge Function is deployed and running (v${healthData.version || 'unknown'})`
            : `❌ Edge Function returned HTTP ${healthResponse.status}`
        });

        console.log('Health check result:', healthData);
      } catch (healthError: any) {
        diagnosticResults.tests.push({
          name: 'Health Check',
          status: 'error',
          url: healthUrl,
          error: healthError.message,
          message: `❌ Cannot reach Edge Function: ${healthError.message}`
        });
        console.error('Health check error:', healthError);
      }

      // Test 2: Check debug-env endpoint
      console.log('🔍 Test 2: Checking debug-env endpoint...');
      
      const debugUrl = `https://${projectId}.supabase.co/functions/v1/server/debug-env`;
      console.log('Debug URL:', debugUrl);
      
      try {
        const debugResponse = await fetch(debugUrl, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        });

        const debugData = await debugResponse.json();
        
        diagnosticResults.tests.push({
          name: 'Environment Check',
          status: debugResponse.ok ? 'pass' : 'fail',
          url: debugUrl,
          statusCode: debugResponse.status,
          data: debugData,
          message: debugResponse.ok 
            ? `✅ Environment endpoint working`
            : `❌ Environment endpoint returned HTTP ${debugResponse.status}`
        });

        // Check Discord webhook configuration
        if (debugData.discord) {
          diagnosticResults.tests.push({
            name: 'Discord Webhook Config',
            status: debugData.discord.configured && debugData.discord.startsWithHttp ? 'pass' : 'fail',
            data: {
              configured: debugData.discord.configured,
              validFormat: debugData.discord.startsWithHttp,
              preview: debugData.discord.preview
            },
            message: debugData.discord.configured && debugData.discord.startsWithHttp
              ? '✅ Discord webhook is configured correctly'
              : debugData.discord.configured
              ? '⚠️ Discord webhook configured but invalid format'
              : '❌ Discord webhook not found - need to redeploy after adding secret'
          });
        }

        console.log('Debug check result:', debugData);
      } catch (debugError: any) {
        diagnosticResults.tests.push({
          name: 'Environment Check',
          status: 'error',
          url: debugUrl,
          error: debugError.message,
          message: `❌ Cannot reach debug-env endpoint: ${debugError.message}`
        });
        console.error('Debug check error:', debugError);
      }

      // Test 3: Try OPTIONS request (CORS preflight)
      console.log('🔍 Test 3: Testing CORS...');
      
      try {
        const corsResponse = await fetch(healthUrl, {
          method: 'OPTIONS',
          headers: {
            'Origin': window.location.origin,
            'Access-Control-Request-Method': 'GET',
            'Access-Control-Request-Headers': 'authorization,content-type'
          }
        });

        diagnosticResults.tests.push({
          name: 'CORS Check',
          status: corsResponse.ok ? 'pass' : 'warn',
          statusCode: corsResponse.status,
          message: corsResponse.ok 
            ? '✅ CORS is configured correctly'
            : '⚠️ CORS preflight returned non-OK status (might still work)'
        });
      } catch (corsError: any) {
        diagnosticResults.tests.push({
          name: 'CORS Check',
          status: 'error',
          error: corsError.message,
          message: `⚠️ CORS test failed: ${corsError.message}`
        });
      }

      setResults(diagnosticResults);

      // Show summary toast
      const failedTests = diagnosticResults.tests.filter((t: any) => t.status === 'fail' || t.status === 'error');
      if (failedTests.length === 0) {
        toast.success('✅ All diagnostics passed!');
      } else {
        toast.error(`❌ ${failedTests.length} test(s) failed`);
      }

    } catch (error: any) {
      console.error('Diagnostic error:', error);
      diagnosticResults.error = error.message;
      setResults(diagnosticResults);
      toast.error('Diagnostic test failed');
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warn':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'pass':
        return 'bg-green-50 border-green-200';
      case 'fail':
        return 'bg-red-50 border-red-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warn':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">🔧 Edge Function Diagnostics</h3>
          <p className="text-sm text-gray-600">
            Run comprehensive tests to diagnose Edge Function connectivity and configuration issues.
          </p>
        </div>

        <Button 
          onClick={runDiagnostics}
          disabled={testing}
          className="w-full"
        >
          {testing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Running Diagnostics...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              🔍 Run Full Diagnostic Test
            </>
          )}
        </Button>

        {results && (
          <div className="space-y-3 mt-4">
            <div className="text-xs text-gray-500">
              Test run at: {new Date(results.timestamp).toLocaleString()}
            </div>

            {/* Connection Info */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs">
              <div className="font-medium text-blue-900 mb-2">📡 Connection Details:</div>
              <div className="space-y-1 text-blue-800 font-mono">
                <div>Project ID: {projectId}</div>
                <div>Base URL: https://{projectId}.supabase.co/functions/v1/server</div>
                <div>Auth Key: {publicAnonKey.substring(0, 20)}...</div>
              </div>
            </div>

            {/* Test Results */}
            {results.tests.map((test: any, index: number) => (
              <div key={index} className={`p-4 border rounded ${getStatusBg(test.status)}`}>
                <div className="flex items-start gap-3">
                  {getStatusIcon(test.status)}
                  <div className="flex-1">
                    <div className="font-semibold mb-1">
                      {test.name}
                    </div>
                    <div className="text-sm mb-2">
                      {test.message}
                    </div>

                    {test.url && (
                      <div className="text-xs text-gray-600 mb-2">
                        URL: <code className="bg-white px-1 rounded">{test.url}</code>
                      </div>
                    )}

                    {test.statusCode && (
                      <div className="text-xs text-gray-600 mb-2">
                        HTTP Status: <span className="font-mono">{test.statusCode}</span>
                      </div>
                    )}

                    {test.error && (
                      <div className="text-xs text-red-700 bg-white p-2 rounded border border-red-300 mb-2">
                        Error: {test.error}
                      </div>
                    )}

                    {test.data && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-gray-700 hover:text-gray-900">
                          View details
                        </summary>
                        <pre className="mt-2 p-2 bg-white rounded border overflow-auto text-xs">
                          {JSON.stringify(test.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Recommendations */}
            {results.tests.some((t: any) => t.status === 'fail' || t.status === 'error') && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded">
                <div className="font-semibold text-amber-900 mb-2">💡 Troubleshooting Steps:</div>
                <ol className="list-decimal ml-5 space-y-2 text-sm text-amber-800">
                  {results.tests.find((t: any) => t.name === 'Health Check' && t.status !== 'pass') && (
                    <li>
                      <strong>Edge Function not reachable:</strong>
                      <div className="ml-4 mt-1 space-y-1 text-xs">
                        <div>• Deploy the Edge Function using: <code className="bg-white px-1">supabase functions deploy server</code></div>
                        <div>• Or use the Supabase Dashboard to deploy</div>
                        <div>• Check Edge Function logs for errors</div>
                      </div>
                    </li>
                  )}
                  
                  {results.tests.find((t: any) => t.name === 'Discord Webhook Config' && t.status !== 'pass') && (
                    <li>
                      <strong>Discord webhook not configured:</strong>
                      <div className="ml-4 mt-1 space-y-1 text-xs">
                        <div>• Add DISCORD_WEBHOOK_URL to Supabase Edge Function secrets</div>
                        <div>• MUST redeploy the Edge Function after adding the secret</div>
                        <div>• Secret name must be exactly: <code className="bg-white px-1">DISCORD_WEBHOOK_URL</code></div>
                      </div>
                    </li>
                  )}
                  
                  <li>
                    <a
                      href={`https://supabase.com/dashboard/project/${projectId}/functions`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-amber-900 hover:text-amber-700 underline"
                    >
                      Open Supabase Edge Functions
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                </ol>
              </div>
            )}

            {/* Success message */}
            {results.tests.every((t: any) => t.status === 'pass' || t.status === 'warn') && (
              <div className="p-4 bg-green-50 border border-green-200 rounded">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <div className="font-semibold text-green-900 mb-1">✅ All Systems Operational!</div>
                    <p className="text-sm text-green-800">
                      Your Edge Function is deployed correctly and the Discord webhook is configured. 
                      You can now proceed to send test notifications!
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
