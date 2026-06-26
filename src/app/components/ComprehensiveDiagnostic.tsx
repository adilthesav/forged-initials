import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { AlertCircle, CheckCircle2, XCircle, Loader2, Copy } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface TestResult {
  name: string;
  endpoint: string;
  status: 'pending' | 'testing' | 'success' | 'error' | 'network-error';
  message?: string;
  statusCode?: number;
  responseTime?: number;
  errorDetails?: string;
}

export function ComprehensiveDiagnostic() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);
  const [overallStatus, setOverallStatus] = useState<'idle' | 'testing' | 'complete'>('idle');

  const tests: Omit<TestResult, 'status'>[] = [
    { name: 'Health Check', endpoint: '/health' },
    { name: 'Environment Check', endpoint: '/debug-env' },
    { name: 'Test Discord (v1)', endpoint: '/test-discord-notification' },
    { name: 'Test Discord (v2)', endpoint: '/discord/test' },
    { name: 'Test Notification', endpoint: '/test-notification' },
  ];

  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        toast.success('Copied!');
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          toast.success('Copied!');
        } catch {
          toast.error('Please copy manually');
        }
        textArea.remove();
      }
    } catch {
      toast.error('Please copy manually');
    }
  };

  const testEndpoint = async (test: Omit<TestResult, 'status'>): Promise<TestResult> => {
    const url = `https://${projectId}.supabase.co/functions/v1/server${test.endpoint}`;
    const startTime = Date.now();

    try {
      console.log(`Testing: ${test.name} at ${url}`);
      console.log(`🔍 DIAGNOSTIC: Making ${test.endpoint.includes('/discord/test') ? 'POST' : 'GET'} request to ${url}`);
      
      // Determine method based on endpoint
      const method = test.endpoint.includes('/discord/test') ? 'POST' : 'GET';
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      console.log(`✅ RESPONSE RECEIVED: Status ${response.status}, Type: ${response.headers.get('content-type')}`);

      let data: any;
      try {
        data = await response.json();
        console.log('📦 Response data:', data);
      } catch (parseError) {
        console.error('❌ Failed to parse JSON:', parseError);
        data = null;
      }

      if (response.ok) {
        return {
          ...test,
          status: 'success',
          statusCode: response.status,
          responseTime,
          message: `✅ Success (${responseTime}ms)`,
        };
      } else {
        return {
          ...test,
          status: 'error',
          statusCode: response.status,
          responseTime,
          message: `❌ HTTP ${response.status}`,
          errorDetails: data?.error || data?.message || response.statusText,
        };
      }
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      console.error(`❌ REQUEST FAILED for ${test.name}:`, {
        errorName: error.name,
        errorMessage: error.message,
        errorStack: error.stack
      });
      
      // Check if it's a network error
      const isNetworkError = 
        error.name === 'TypeError' || 
        error.message.includes('Failed to fetch') ||
        error.message.includes('NetworkError') ||
        error.message.includes('Network request failed') ||
        error.name === 'AbortError';

      return {
        ...test,
        status: 'network-error',
        responseTime,
        message: isNetworkError 
          ? '🔴 NETWORK ERROR - Endpoint not reachable'
          : '❌ Error',
        errorDetails: error.message + (error.name === 'AbortError' ? ' (Request timed out after 30s)' : ''),
      };
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    setOverallStatus('testing');
    const testResults: TestResult[] = tests.map(t => ({ ...t, status: 'pending' as const }));
    setResults(testResults);

    for (let i = 0; i < tests.length; i++) {
      // Update to "testing"
      testResults[i] = { ...testResults[i], status: 'testing' };
      setResults([...testResults]);

      // Run test
      const result = await testEndpoint(tests[i]);
      testResults[i] = result;
      setResults([...testResults]);

      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    setTesting(false);
    setOverallStatus('complete');

    // Check if all tests passed
    const allPassed = testResults.every(r => r.status === 'success');
    const hasNetworkErrors = testResults.some(r => r.status === 'network-error');

    if (allPassed) {
      toast.success('🎉 All tests passed!');
    } else if (hasNetworkErrors) {
      toast.error('Network errors detected - function may not be deployed');
    } else {
      toast.warning('Some tests failed - see details below');
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-orange-600" />;
      case 'network-error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'testing':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <div className="w-5 h-5 rounded-full bg-gray-300" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'border-green-200 bg-green-50';
      case 'error': return 'border-orange-200 bg-orange-50';
      case 'network-error': return 'border-red-200 bg-red-50';
      case 'testing': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  // Analyze results
  const analyzeResults = () => {
    if (results.length === 0 || overallStatus !== 'complete') return null;

    const networkErrors = results.filter(r => r.status === 'network-error');
    const httpErrors = results.filter(r => r.status === 'error');
    const successes = results.filter(r => r.status === 'success');

    if (networkErrors.length === results.length) {
      return {
        type: 'critical',
        title: '🚨 CRITICAL: Edge Function Not Responding',
        description: 'None of the endpoints are reachable. The function may not be deployed, or there\'s a startup error.',
        solution: [
          '🔍 STEP 1: Check if function is deployed',
          '1. Go to: https://supabase.com/dashboard/project/' + projectId + '/functions',
          '2. Look for a function named "server"',
          '3. Check if it shows as "Deployed" or has any error messages',
          '',
          '🔍 STEP 2: Check function logs for errors',
          '1. Click on the "server" function in the dashboard',
          '2. Go to the "Logs" tab',
          '3. Look for any red error messages',
          '4. Common errors: Module import failures, missing dependencies',
          '',
          '🔍 STEP 3: Check browser console',
          '1. Press F12 to open browser DevTools',
          '2. Go to the "Console" tab',
          '3. Look for CORS errors or network errors',
          '4. Go to the "Network" tab and check the failed request details',
          '',
          '🔧 STEP 4: Try redeploying',
          'If you see errors in the logs, you may need to redeploy:',
          'supabase functions deploy server',
          '',
          '💡 TIP: The most common issue is missing or incorrect imports in the Edge Function code.'
        ]
      };
    }

    if (networkErrors.length > 0) {
      return {
        type: 'warning',
        title: '⚠️ WARNING: Some Endpoints Missing',
        description: `${networkErrors.length} endpoint(s) not responding. You may have deployed an incomplete function.`,
        solution: [
          'Redeploy the complete Edge Function:',
          'supabase functions deploy server',
          '',
          `Missing endpoints: ${networkErrors.map(r => r.endpoint).join(', ')}`
        ]
      };
    }

    if (httpErrors.length > 0 && successes.length > 0) {
      // Check if Discord test failed
      const discordTestFailed = httpErrors.some(r => 
        r.endpoint.includes('/discord') || r.endpoint.includes('/test-notification')
      );
      
      if (discordTestFailed) {
        return {
          type: 'info',
          title: '✅ Function Deployed! Discord Webhook Not Configured',
          description: 'Your Edge Function is successfully deployed and running. The Discord tests failed because the webhook URL hasn\'t been configured yet.',
          solution: [
            '🎉 GREAT NEWS: Your deployment worked!',
            '',
            'To enable Discord notifications:',
            '1. Go to your Discord server',
            '2. Create a webhook URL (Server Settings → Integrations → Webhooks)',
            '3. Copy the webhook URL',
            '4. Go to Supabase Dashboard → Edge Functions → Manage Secrets',
            '5. Add secret: DISCORD_WEBHOOK_URL',
            '6. Paste your webhook URL as the value',
            '',
            'Then redeploy to pick up the secret:',
            'supabase functions deploy server',
            '',
            '💡 TIP: Use the "Discord" tab in the Owner Panel for step-by-step webhook setup!'
          ]
        };
      }
      
      return {
        type: 'info',
        title: '✅ Function Deployed, Some Configuration Needed',
        description: 'The Edge Function is running, but some tests failed. This might be due to missing configuration.',
        solution: [
          'Check that all required secrets are set in Supabase:',
          '• DISCORD_WEBHOOK_URL (for Discord notifications)',
          '• STRIPE_SECRET_KEY (for payments)',
          '• RESEND_API_KEY (for emails)',
          '',
          'After adding secrets, redeploy:',
          'supabase functions deploy server'
        ]
      };
    }

    if (successes.length === results.length) {
      return {
        type: 'success',
        title: '🎉 PERFECT! ALL SYSTEMS OPERATIONAL!',
        description: 'Your Edge Function is fully deployed, all endpoints are responding correctly, and Discord is configured!',
        solution: [
          '✅ Everything is working perfectly!',
          '',
          'Your system is ready to:',
          '• ✅ Accept payments via Stripe',
          '• ✅ Receive Discord notifications for new orders',
          '• ✅ Send tracking emails to customers',
          '• ✅ Generate FedEx shipping labels',
          '',
          '🎯 Next Steps:',
          '1. Go to the "Discord" tab to send a test notification',
          '2. Try placing a test order to see the full workflow',
          '3. Your jewelry business is ready to go live!'
        ]
      };
    }

    return null;
  };

  const analysis = analyzeResults();

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-blue-600" />
          🔬 Complete System Diagnostic
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Test all endpoints to identify deployment issues and verify your setup
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Run Tests Button */}
        <Button 
          onClick={runAllTests}
          disabled={testing}
          className="w-full h-12"
          size="lg"
        >
          {testing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Running Diagnostics...
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 mr-2" />
              🚀 Run Complete Diagnostic
            </>
          )}
        </Button>

        {/* Test Results */}
        {results.length > 0 && (
          <div className="space-y-3">
            <div className="font-semibold text-lg">Test Results:</div>
            {results.map((result, index) => (
              <div
                key={index}
                className={`p-4 border-2 rounded-lg transition-all ${getStatusColor(result.status)}`}
              >
                <div className="flex items-start gap-3">
                  {getStatusIcon(result.status)}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{result.name}</div>
                    <div className="text-sm text-muted-foreground font-mono break-all">
                      {result.endpoint}
                    </div>
                    {result.message && (
                      <div className="text-sm mt-2">{result.message}</div>
                    )}
                    {result.errorDetails && (
                      <div className="text-xs mt-2 text-red-700 bg-red-100 p-2 rounded">
                        Error: {result.errorDetails}
                      </div>
                    )}
                    {result.responseTime !== undefined && (
                      <div className="text-xs text-gray-600 mt-1">
                        Response time: {result.responseTime}ms
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Analysis and Solution */}
        {analysis && (
          <div
            className={`p-6 rounded-lg border-2 ${
              analysis.type === 'success' ? 'border-green-500 bg-green-50' :
              analysis.type === 'critical' ? 'border-red-500 bg-red-50' :
              analysis.type === 'warning' ? 'border-orange-500 bg-orange-50' :
              'border-blue-500 bg-blue-50'
            }`}
          >
            <div className="space-y-4">
              <div className="text-xl font-bold">
                {analysis.title}
              </div>
              <div className="text-sm">
                {analysis.description}
              </div>
              <div className="p-4 bg-white rounded-lg border space-y-2">
                <div className="font-semibold">
                  {analysis.type === 'success' ? '✅ Next Steps:' : '🔧 How to Fix:'}
                </div>
                <div className="space-y-1">
                  {analysis.solution.map((line, index) => {
                    if (line.startsWith('supabase functions deploy')) {
                      return (
                        <div key={index} className="mt-2">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="bg-gray-900 p-3 rounded-lg font-mono text-sm text-green-400 flex-1 break-all select-all cursor-text">
                              {line}
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(line)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="text-xs text-gray-600">
                            💡 Triple-click the command above to select it, then press Ctrl+C (or Cmd+C) to copy
                          </div>
                        </div>
                      );
                    }
                    if (line === '') return <div key={index} className="h-2" />;
                    return (
                      <div key={index} className="text-sm">
                        {line}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="p-4 bg-gray-50 rounded-lg border space-y-3">
          <div className="font-semibold text-sm">📋 Your Configuration:</div>
          <div className="space-y-2 text-xs">
            <div className="flex gap-2">
              <span className="text-gray-600 w-32">Project ID:</span>
              <code className="flex-1 bg-white px-2 py-1 rounded border">{projectId}</code>
            </div>
            <div className="flex gap-2">
              <span className="text-gray-600 w-32">Base URL:</span>
              <code className="flex-1 bg-white px-2 py-1 rounded border break-all">
                https://{projectId}.supabase.co/functions/v1/server
              </code>
            </div>
          </div>
          <div className="text-xs text-gray-600 mt-3 space-y-2">
            <div className="p-3 bg-blue-50 border border-blue-300 rounded">
              <strong className="text-blue-900">🔬 Quick Browser Test:</strong>
              <p className="text-blue-800 mt-1">
                Click this link to test the health endpoint directly in your browser:
              </p>
              <a 
                href={`https://${projectId}.supabase.co/functions/v1/server/health`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all font-mono text-xs block mt-2 p-2 bg-white rounded border"
              >
                https://{projectId}.supabase.co/functions/v1/server/health
              </a>
              <p className="text-blue-700 mt-2 text-xs">
                ✅ If it shows JSON like <code className="bg-white px-1 rounded">&#123;"status":"ok"&#125;</code>, your function IS deployed!<br />
                ❌ If you get an error page or "Function not found", the function is NOT deployed.
              </p>
            </div>
            {results.length > 0 && results.some(r => r.status === 'success') && (
              <div className="p-3 bg-green-50 border border-green-300 rounded mt-2">
                <strong className="text-green-900">🎯 Your function is deployed!</strong>
                <p className="text-green-800 mt-1">
                  If Discord tests are failing, you need to configure the webhook URL. 
                  Head to the <strong>"Discord"</strong> tab for setup instructions!
                </p>
              </div>
            )}
            {results.length > 0 && results.every(r => r.status === 'network-error') && (
              <div className="p-3 bg-red-50 border border-red-300 rounded mt-2">
                <strong className="text-red-900">⚠️ All tests failed!</strong>
                <p className="text-red-800 mt-1">
                  Open your browser's DevTools (F12) and check the Console and Network tabs for error details.<br />
                  Also check your Supabase function logs: 
                  <a 
                    href={`https://supabase.com/dashboard/project/${projectId}/functions`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline ml-1"
                  >
                    View Dashboard →
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
