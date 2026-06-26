import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle2, XCircle, Loader2, AlertCircle, Copy, Check } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

export function EmergencyTest() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const healthUrl = `https://${projectId}.supabase.co/functions/v1/server/health`;
  const debugUrl = `https://${projectId}.supabase.co/functions/v1/server/debug-env`;
  const testUrl = `https://${projectId}.supabase.co/functions/v1/server/discord/test`;

  const runEmergencyTest = async () => {
    setTesting(true);
    const results: any = {
      step1: null,
      step2: null,
      step3: null,
      recommendation: ''
    };

    try {
      // STEP 1: Health check
      console.log('Testing health endpoint...');
      try {
        const healthRes = await fetch(healthUrl, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        });
        
        if (healthRes.ok) {
          const data = await healthRes.json();
          results.step1 = { success: true, data };
        } else {
          results.step1 = { success: false, status: healthRes.status };
        }
      } catch (err: any) {
        results.step1 = { success: false, error: err.message };
      }

      // STEP 2: Environment check
      console.log('Testing environment endpoint...');
      try {
        const debugRes = await fetch(debugUrl, {
          method: 'GET',
          headers: { 
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (debugRes.ok) {
          const data = await debugRes.json();
          results.step2 = { success: true, data };
        } else {
          results.step2 = { success: false, status: debugRes.status };
        }
      } catch (err: any) {
        results.step2 = { success: false, error: err.message };
      }

      // STEP 3: Discord test (only if step 2 succeeded)
      if (results.step2?.success && results.step2?.data?.discord?.configured) {
        console.log('Testing Discord notification...');
        try {
          const testRes = await fetch(testUrl, {
            method: 'POST',
            headers: { 
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (testRes.ok) {
            const data = await testRes.json();
            results.step3 = { success: data.success, data };
          } else {
            const data = await testRes.json();
            results.step3 = { success: false, status: testRes.status, data };
          }
        } catch (err: any) {
          results.step3 = { success: false, error: err.message };
        }
      }

      // Determine recommendation
      if (!results.step1?.success) {
        results.recommendation = 'DEPLOY_FUNCTION';
      } else if (!results.step2?.success) {
        results.recommendation = 'CHECK_ENDPOINTS';
      } else if (!results.step2?.data?.discord?.configured) {
        results.recommendation = 'ADD_SECRET_AND_REDEPLOY';
      } else if (!results.step2?.data?.discord?.startsWithHttp) {
        results.recommendation = 'FIX_SECRET_FORMAT';
      } else if (!results.step3?.success) {
        results.recommendation = 'CHECK_DISCORD_WEBHOOK';
      } else {
        results.recommendation = 'SUCCESS';
      }

      setResult(results);

      if (results.recommendation === 'SUCCESS') {
        toast.success('🎉 EVERYTHING IS WORKING!');
      } else {
        toast.error('Found the issue - see instructions below');
      }

    } catch (error: any) {
      console.error('Test error:', error);
      setResult({ error: error.message, recommendation: 'UNKNOWN_ERROR' });
      toast.error('Test failed');
    } finally {
      setTesting(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Copied to clipboard!');
        return;
      }
      
      // Fallback for browsers that block clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        textArea.remove();
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        toast.success('Copied to clipboard!');
      } catch (err) {
        textArea.remove();
        throw err;
      }
    } catch (err) {
      // Silently fail - user can copy manually
      toast.info('📋 Select the text above and copy manually (Ctrl+C)');
    }
  };

  const getStepIcon = (step: any) => {
    if (!step) return <div className="w-6 h-6 rounded-full bg-gray-300" />;
    if (step.success) return <CheckCircle2 className="w-6 h-6 text-green-600" />;
    return <XCircle className="w-6 h-6 text-red-600" />;
  };

  return (
    <Card className="p-6 border-4 border-red-500">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-red-900 mb-2">
              🚨 EMERGENCY DIAGNOSTIC TEST
            </h3>
            <p className="text-red-800 mb-3">
              Click the button below. I'll test everything and tell you EXACTLY what to do.
            </p>
            <p className="text-sm text-red-700">
              This will take 5 seconds. Stay calm - we'll fix this together. 💪
            </p>
          </div>
        </div>

        <Button 
          onClick={runEmergencyTest}
          disabled={testing}
          className="w-full bg-red-600 hover:bg-red-700 h-14 text-lg"
        >
          {testing ? (
            <>
              <Loader2 className="w-6 h-6 mr-2 animate-spin" />
              Testing Everything (5 seconds)...
            </>
          ) : (
            <>
              <AlertCircle className="w-6 h-6 mr-2" />
              🔍 RUN EMERGENCY TEST NOW
            </>
          )}
        </Button>

        {result && (
          <div className="space-y-4 mt-6">
            {/* Test Results */}
            <div className="p-4 bg-gray-50 border-2 border-gray-300 rounded-lg space-y-3">
              <div className="font-bold text-gray-900 text-lg mb-3">📊 Test Results:</div>
              
              <div className="flex items-center gap-3 p-3 bg-white rounded border">
                {getStepIcon(result.step1)}
                <div className="flex-1">
                  <div className="font-semibold">Step 1: Edge Function Deployed?</div>
                  <div className="text-sm text-gray-600">
                    {result.step1?.success ? '✅ YES - Function is online' : '❌ NO - Function not found'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white rounded border">
                {getStepIcon(result.step2)}
                <div className="flex-1">
                  <div className="font-semibold">Step 2: Endpoints Working?</div>
                  <div className="text-sm text-gray-600">
                    {result.step2?.success ? '✅ YES - Can read configuration' : '❌ NO - Endpoints not responding'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white rounded border">
                {getStepIcon(result.step2?.data?.discord?.configured ? { success: true } : null)}
                <div className="flex-1">
                  <div className="font-semibold">Step 3: Discord Secret Set?</div>
                  <div className="text-sm text-gray-600">
                    {result.step2?.data?.discord?.configured 
                      ? result.step2?.data?.discord?.startsWithHttp
                        ? '✅ YES - Secret is valid'
                        : '⚠️ SECRET INVALID FORMAT'
                      : '❌ NO - Secret not found'}
                  </div>
                </div>
              </div>

              {result.step3 && (
                <div className="flex items-center gap-3 p-3 bg-white rounded border">
                  {getStepIcon(result.step3)}
                  <div className="flex-1">
                    <div className="font-semibold">Step 4: Discord Test Sent?</div>
                    <div className="text-sm text-gray-600">
                      {result.step3?.success ? '✅ YES - Check Discord!' : '❌ NO - Test failed'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* CLEAR INSTRUCTIONS */}
            <div className={`p-6 rounded-lg border-4 ${
              result.recommendation === 'SUCCESS' 
                ? 'bg-green-50 border-green-500' 
                : 'bg-red-50 border-red-500'
            }`}>
              {result.recommendation === 'SUCCESS' && (
                <div>
                  <div className="text-2xl font-bold text-green-900 mb-3">
                    🎉 EVERYTHING IS WORKING PERFECTLY!
                  </div>
                  <p className="text-green-800 mb-4">
                    Your Discord integration is fully operational. Check your Discord channel - you should have received a test notification!
                  </p>
                  <div className="p-3 bg-white border border-green-300 rounded">
                    <div className="font-semibold text-green-900 mb-2">✅ What's Working:</div>
                    <ul className="space-y-1 text-sm text-green-800">
                      <li>• Edge Function deployed and running</li>
                      <li>• Discord webhook secret configured correctly</li>
                      <li>• Test notification sent successfully</li>
                      <li>• All future orders will send notifications automatically</li>
                    </ul>
                  </div>
                </div>
              )}

              {result.recommendation === 'DEPLOY_FUNCTION' && (
                <div>
                  <div className="text-2xl font-bold text-red-900 mb-3">
                    ❌ PROBLEM: Edge Function Not Deployed
                  </div>
                  <p className="text-red-800 mb-4">
                    The function code is not on Supabase servers. You need to deploy it.
                  </p>
                  
                  <div className="p-4 bg-white border-2 border-red-400 rounded-lg mb-4">
                    <div className="font-bold text-red-900 mb-3">🔧 FIX THIS NOW:</div>
                    
                    <div className="mb-4">
                      <div className="text-sm font-semibold text-red-900 mb-2">Option 1: Using Terminal (Fastest)</div>
                      <div className="relative group">
                        <div className="bg-gray-900 p-4 rounded-lg font-mono text-sm text-green-400 select-all cursor-text border-2 border-transparent hover:border-green-500 transition-colors">
                          supabase functions deploy server
                        </div>
                        <div className="text-xs text-red-700 mt-2 flex items-center gap-2">
                          <span className="font-semibold">📋 How to copy:</span>
                          <span>1) Triple-click the box above</span>
                          <span>2) Press Ctrl+C (or Cmd+C)</span>
                        </div>
                      </div>
                      <button
                        onClick={() => copyToClipboard('supabase functions deploy server')}
                        className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1 mt-2 opacity-60"
                      >
                        <Copy className="w-3 h-3" />
                        {copied ? '✓ Copied to clipboard' : 'Or try auto-copy (might not work)'}
                      </button>
                    </div>

                    <div className="text-sm text-red-800 mb-2">
                      Don't have Supabase CLI? Install first:
                    </div>
                    <div className="bg-gray-900 p-4 rounded-lg font-mono text-xs text-blue-400 select-all cursor-text border-2 border-transparent hover:border-blue-500 transition-colors">
                      npm install -g supabase
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      👆 Triple-click to select, then Ctrl+C to copy
                    </div>
                  </div>

                  <div className="p-4 bg-white border border-red-300 rounded-lg">
                    <div className="text-sm font-semibold text-red-900 mb-2">Option 2: Manual Deployment via Dashboard</div>
                    <p className="text-xs text-red-800 mb-2">
                      If you deployed via copy-paste in the Supabase dashboard, you may have missed some files.
                      The function needs ALL these files:
                    </p>
                    <ul className="text-xs text-red-800 space-y-1">
                      <li>• index.tsx (main file)</li>
                      <li>• notifications.tsx</li>
                      <li>• payments.tsx</li>
                      <li>• shipping.tsx</li>
                      <li>• kv_store.tsx</li>
                    </ul>
                  </div>
                </div>
              )}

              {result.recommendation === 'ADD_SECRET_AND_REDEPLOY' && (
                <div>
                  <div className="text-2xl font-bold text-red-900 mb-3">
                    ⚠️ PROBLEM: Discord Secret Not Set
                  </div>
                  <p className="text-red-800 mb-4">
                    The Edge Function is deployed, but it can't see the Discord webhook URL.
                  </p>
                  
                  <div className="p-4 bg-white border-2 border-red-400 rounded-lg mb-4">
                    <div className="font-bold text-red-900 mb-3">🔧 FIX THIS NOW:</div>
                    
                    <div className="mb-4">
                      <div className="text-sm font-semibold text-red-900 mb-2">Step 1: Add the secret</div>
                      <div className="text-xs text-red-800 mb-2">
                        Go to Supabase → Settings → Edge Functions → Secrets
                      </div>
                      <div className="space-y-3 text-xs">
                        <div className="p-3 bg-gray-50 rounded border">
                          <strong className="block mb-2">Name (must be EXACT):</strong>
                          <div className="bg-gray-900 p-3 rounded-lg font-mono text-green-400 select-all cursor-text border-2 border-transparent hover:border-green-500 transition-colors text-center">
                            DISCORD_WEBHOOK_URL
                          </div>
                          <div className="text-xs text-gray-700 mt-2 flex items-center gap-2">
                            <span className="font-semibold">📋</span>
                            <span>Triple-click the box above, then Ctrl+C</span>
                          </div>
                        </div>
                        
                        <div className="p-3 bg-gray-50 rounded border">
                          <strong className="block mb-2">Value (your webhook URL):</strong>
                          <div className="bg-gray-900 p-3 rounded-lg font-mono text-green-400 break-all select-all cursor-text border-2 border-transparent hover:border-green-500 transition-colors text-sm">
                            https://discord.com/api/webhooks/1429540512221630506/t1V3wKmHaOTAuCm64xfKvNrGHR6lFea4jZCEi3cON0rp_RhrtG9JRkZbZNFyG4x8oTta
                          </div>
                          <div className="text-xs text-gray-700 mt-2 flex items-center gap-2">
                            <span className="font-semibold">📋</span>
                            <span>Triple-click the box above, then Ctrl+C</span>
                          </div>
                          <button
                            onClick={() => copyToClipboard('https://discord.com/api/webhooks/1429540512221630506/t1V3wKmHaOTAuCm64xfKvNrGHR6lFea4jZCEi3cON0rp_RhrtG9JRkZbZNFyG4x8oTta')}
                            className="text-gray-600 hover:text-gray-900 flex items-center gap-1 mt-2 text-xs opacity-60"
                          >
                            <Copy className="w-3 h-3" />
                            {copied ? '✓ Copied' : 'Or try auto-copy'}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-red-100 border-2 border-red-400 rounded mb-4">
                      <div className="font-bold text-red-900 mb-2 text-lg">⚠️ CRITICAL STEP 2:</div>
                      <div className="text-sm text-red-800 mb-3">
                        After adding the secret, you MUST redeploy or it won't work:
                      </div>
                      <div className="bg-gray-900 p-4 rounded-lg font-mono text-sm text-green-400 mt-2 select-all cursor-text border-2 border-transparent hover:border-green-500 transition-colors">
                        supabase functions deploy server
                      </div>
                      <div className="text-xs text-gray-700 mt-2 flex items-center gap-2">
                        <span className="font-semibold">📋</span>
                        <span>Triple-click the command above, then Ctrl+C</span>
                      </div>
                    </div>

                    <div className="text-xs text-red-700">
                      Without redeployment, the function won't see the new secret!
                    </div>
                  </div>
                </div>
              )}

              {result.recommendation === 'CHECK_DISCORD_WEBHOOK' && (
                <div>
                  <div className="text-2xl font-bold text-red-900 mb-3">
                    ⚠️ PROBLEM: Discord Webhook Not Responding
                  </div>
                  <p className="text-red-800 mb-4">
                    The webhook URL might be invalid or expired.
                  </p>
                  
                  <div className="p-4 bg-white border-2 border-red-400 rounded-lg">
                    <div className="font-bold text-red-900 mb-3">🔧 FIX THIS NOW:</div>
                    <ol className="list-decimal ml-5 space-y-2 text-sm text-red-800">
                      <li>Go to your Discord server</li>
                      <li>Right-click the channel → Edit Channel → Integrations → Webhooks</li>
                      <li>Check if the webhook still exists</li>
                      <li>If not, create a new one and update the secret</li>
                      <li>Copy the new webhook URL</li>
                      <li>Update DISCORD_WEBHOOK_URL in Supabase</li>
                      <li>Redeploy: <code className="bg-gray-900 px-2 py-1 rounded text-green-400 select-all cursor-text">supabase functions deploy server</code></li>
                    </ol>
                  </div>
                </div>
              )}

              {result.recommendation === 'CHECK_ENDPOINTS' && (
                <div>
                  <div className="text-2xl font-bold text-red-900 mb-3">
                    ⚠️ PROBLEM: Endpoints Not Responding
                  </div>
                  <p className="text-red-800 mb-4">
                    The function is deployed but some endpoints are missing. You may have deployed only the main file.
                  </p>
                  
                  <div className="p-4 bg-white border-2 border-red-400 rounded-lg">
                    <div className="font-bold text-red-900 mb-3">🔧 FIX THIS NOW:</div>
                    <p className="text-sm text-red-800 mb-3">
                      Deploy using the CLI to include ALL files:
                    </p>
                    <div className="bg-gray-900 p-4 rounded-lg font-mono text-sm text-green-400 select-all cursor-text border-2 border-transparent hover:border-green-500 transition-colors">
                      supabase functions deploy server
                    </div>
                    <div className="text-xs text-gray-700 mt-2 flex items-center gap-2">
                      <span className="font-semibold">📋</span>
                      <span>Triple-click the command above, then Ctrl+C</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Debug Info */}
            <details className="text-xs">
              <summary className="cursor-pointer text-gray-700 hover:text-gray-900 font-medium">
                🔍 Show Technical Details (for debugging)
              </summary>
              <pre className="mt-2 p-3 bg-gray-100 rounded border overflow-auto text-xs">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    </Card>
  );
}
