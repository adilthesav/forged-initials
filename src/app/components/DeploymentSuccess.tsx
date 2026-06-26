import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle2, Rocket, Send, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

export function DeploymentSuccess() {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'failed' | null>(null);

  const quickTest = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      // Test the health endpoint
      const healthUrl = `https://${projectId}.supabase.co/functions/v1/server/health`;
      const healthRes = await fetch(healthUrl, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });

      if (!healthRes.ok) {
        throw new Error('Health check failed');
      }

      const healthData = await healthRes.json();
      console.log('Health check:', healthData);

      // Test the Discord debug endpoint
      const debugUrl = `https://${projectId}.supabase.co/functions/v1/server/debug-env`;
      const debugRes = await fetch(debugUrl, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!debugRes.ok) {
        throw new Error('Debug endpoint failed');
      }

      const debugData = await debugRes.json();
      console.log('Debug check:', debugData);

      // Check if Discord is configured
      if (debugData?.discord?.configured && debugData?.discord?.startsWithHttp) {
        // Try sending a test notification
        const testUrl = `https://${projectId}.supabase.co/functions/v1/server/discord/test`;
        const testRes = await fetch(testUrl, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        });

        if (testRes.ok) {
          setTestResult('success');
          toast.success('🎉 Everything is working! Check your Discord channel!');
        } else {
          setTestResult('failed');
          toast.error('Discord webhook test failed. Check your webhook URL.');
        }
      } else {
        // Function deployed but Discord not configured
        setTestResult('failed');
        toast.warning('⚠️ Function deployed but Discord secret not set. See instructions below.');
      }
    } catch (error) {
      console.error('Test error:', error);
      setTestResult('failed');
      toast.error('Test failed. See console for details.');
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-500">
      <div className="space-y-4">
        {/* Success Header */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Rocket className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-green-900 mb-2">
              ✅ Edge Function Deployed Successfully!
            </h3>
            <p className="text-green-800 mb-3">
              Your Supabase Edge Function is now live and running on the cloud.
            </p>
            <div className="text-sm text-green-700 space-y-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Function: <code className="bg-white px-2 py-0.5 rounded">server</code></span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Project: <code className="bg-white px-2 py-0.5 rounded">{projectId}</code></span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Version: <code className="bg-white px-2 py-0.5 rounded">2.1</code></span>
              </div>
            </div>
          </div>
        </div>

        {/* Test Button */}
        <div className="p-4 bg-white rounded-lg border-2 border-green-300">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="font-semibold text-gray-900 mb-1">
                🧪 Quick Verification Test
              </div>
              <div className="text-sm text-gray-600">
                Test your Discord integration and confirm everything is working
              </div>
            </div>
            <Button
              onClick={quickTest}
              disabled={testing}
              className="bg-green-600 hover:bg-green-700"
            >
              {testing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Run Test
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Test Result */}
        {testResult === 'success' && (
          <div className="p-4 bg-green-100 border-2 border-green-400 rounded-lg">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-green-900 mb-1">
                  🎉 Perfect! Everything Is Working!
                </div>
                <div className="text-sm text-green-800">
                  Your Discord integration is fully operational. Check your Discord channel - you should have received a test notification! All future orders will automatically send notifications.
                </div>
              </div>
            </div>
          </div>
        )}

        {testResult === 'failed' && (
          <div className="p-4 bg-red-100 border-2 border-red-400 rounded-lg">
            <div className="flex items-start gap-3">
              <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-red-900 mb-2">
                  ⚠️ Discord Secret Needs Setup
                </div>
                <div className="text-sm text-red-800 mb-3">
                  Your Edge Function is deployed, but the Discord webhook secret isn't configured yet. Follow these steps:
                </div>
                
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="font-semibold text-red-900 mb-1">Step 1: Add Secret in Supabase</div>
                    <div className="text-red-800 mb-2">Go to: Supabase Dashboard → Settings → Edge Functions → Secrets</div>
                    <div className="p-3 bg-white rounded border">
                      <div className="font-mono text-xs mb-1">Name:</div>
                      <div className="bg-gray-900 p-2 rounded font-mono text-green-400 text-sm select-all">
                        DISCORD_WEBHOOK_URL
                      </div>
                    </div>
                    <div className="p-3 bg-white rounded border mt-2">
                      <div className="font-mono text-xs mb-1">Value (your webhook URL):</div>
                      <div className="bg-gray-900 p-2 rounded font-mono text-green-400 text-xs break-all select-all">
                        https://discord.com/api/webhooks/YOUR_WEBHOOK_HERE
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-red-50 rounded border-2 border-red-300">
                    <div className="font-semibold text-red-900 mb-1">⚠️ Step 2: Redeploy (CRITICAL!)</div>
                    <div className="text-red-800 mb-2">After adding the secret, you MUST redeploy:</div>
                    <div className="bg-gray-900 p-2 rounded font-mono text-green-400 text-sm select-all">
                      supabase functions deploy server
                    </div>
                  </div>

                  <div>
                    <div className="font-semibold text-red-900">Step 3: Test Again</div>
                    <div className="text-red-800">Click the "Run Test" button above to verify</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="p-4 bg-blue-50 border border-blue-300 rounded-lg">
          <div className="font-semibold text-blue-900 mb-2">📋 What's Next?</div>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Click "Run Test" above to verify your Discord integration</li>
            <li>• If the test succeeds, you're all set! Orders will notify automatically</li>
            <li>• If it fails, follow the setup instructions shown above</li>
            <li>• Keep this panel open if you need to troubleshoot</li>
          </ul>
        </div>
      </div>
    </Card>
  );
}
