import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle2, XCircle, Loader2, ExternalLink } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function QuickConnectionTest() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: string;
    statusCode?: number;
  } | null>(null);

  const healthUrl = `https://${projectId}.supabase.co/functions/v1/server/health`;

  const runTest = async () => {
    setTesting(true);
    setResult(null);

    try {
      console.log('🔍 Testing connection to:', healthUrl);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log('📡 Response received:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Response data:', data);
        
        setResult({
          success: true,
          message: '✅ Edge Function is responding!',
          details: `Status: ${response.status}, Version: ${data.version || 'unknown'}`,
          statusCode: response.status
        });
      } else {
        const text = await response.text();
        console.error('❌ Non-OK response:', text);
        
        setResult({
          success: false,
          message: '⚠️ Function responded but with an error',
          details: `Status ${response.status}: ${text.substring(0, 200)}`,
          statusCode: response.status
        });
      }
    } catch (error: any) {
      console.error('❌ Connection test failed:', error);
      
      let message = '❌ Cannot connect to Edge Function';
      let details = error.message;

      if (error.name === 'AbortError') {
        message = '⏱️ Request timed out';
        details = 'The function did not respond within 10 seconds. It may be starting up or not deployed.';
      } else if (error.message.includes('Failed to fetch')) {
        message = '🔴 Network Error';
        details = 'Cannot reach the Edge Function endpoint. The function may not be deployed, or there\'s a CORS issue.';
      }

      setResult({
        success: false,
        message,
        details,
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🚀 Quick Connection Test
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Test if your Edge Function is deployed and responding
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Button 
            onClick={runTest}
            disabled={testing}
            size="lg"
            className="flex-1"
          >
            {testing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                Test Connection
              </>
            )}
          </Button>
          
          <Button 
            variant="outline"
            size="lg"
            asChild
          >
            <a 
              href={healthUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Open in Browser
            </a>
          </Button>
        </div>

        {result && (
          <div className={`p-4 rounded-lg border-2 ${
            result.success 
              ? 'bg-green-50 border-green-500' 
              : 'bg-red-50 border-red-500'
          }`}>
            <div className="flex items-start gap-3">
              {result.success ? (
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              )}
              <div className="flex-1 space-y-2">
                <div className="font-semibold">{result.message}</div>
                {result.details && (
                  <div className="text-sm">{result.details}</div>
                )}
                {result.statusCode && (
                  <div className="text-xs text-gray-600">
                    HTTP Status: {result.statusCode}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="p-4 bg-gray-50 rounded-lg border text-sm space-y-2">
          <div className="font-semibold">🎯 What this test does:</div>
          <ul className="space-y-1 text-xs ml-4">
            <li>• Connects to your Edge Function's /health endpoint</li>
            <li>• Checks if it's deployed and responding</li>
            <li>• Shows detailed error messages if it fails</li>
          </ul>
          
          <div className="mt-3 pt-3 border-t">
            <div className="font-semibold mb-1">Testing URL:</div>
            <code className="text-xs bg-white px-2 py-1 rounded border block break-all">
              {healthUrl}
            </code>
          </div>
        </div>

        {result && !result.success && (
          <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg space-y-2">
            <div className="font-semibold text-yellow-900">🔧 Troubleshooting Steps:</div>
            <ol className="text-sm text-yellow-800 space-y-1 ml-4 list-decimal">
              <li>
                Check Supabase Dashboard: 
                <a 
                  href={`https://supabase.com/dashboard/project/${projectId}/functions`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline ml-1"
                >
                  View Functions →
                </a>
              </li>
              <li>Look for a function named "server" - it should show as "Active"</li>
              <li>Click on "server" and check the "Logs" tab for errors</li>
              <li>If not deployed, run: <code className="bg-white px-1 rounded">supabase functions deploy server</code></li>
              <li>Press F12 in your browser and check the Console and Network tabs</li>
            </ol>
          </div>
        )}

        {result && result.success && (
          <div className="p-4 bg-green-50 border border-green-300 rounded-lg">
            <div className="font-semibold text-green-900">🎉 Success!</div>
            <p className="text-sm text-green-800 mt-1">
              Your Edge Function is deployed and working. If you're having issues with specific features:
            </p>
            <ul className="text-sm text-green-800 mt-2 ml-4 space-y-1">
              <li>• For Discord notifications, configure the webhook in the "Discord" tab</li>
              <li>• For payments, configure Stripe secrets in Supabase Dashboard</li>
              <li>• Run the full diagnostic for detailed endpoint testing</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
