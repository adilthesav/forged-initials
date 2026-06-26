import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle2, ExternalLink, Loader2, AlertCircle, XCircle, Rocket } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';
import { EdgeFunctionDiagnostics } from './EdgeFunctionDiagnostics';

export function FinalDiscordSetup() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [checking, setChecking] = useState(false);
  const [testing, setTesting] = useState(false);
  const [envStatus, setEnvStatus] = useState<any>(null);
  const [testResult, setTestResult] = useState<any>(null);

  const checkWebhookConfig = async () => {
    setChecking(true);
    setEnvStatus(null);
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/debug-env`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setEnvStatus(data);
        
        if (data.discord?.configured && data.discord?.startsWithHttp) {
          toast.success('Discord webhook is configured correctly!');
          setCurrentStep(3);
        } else if (data.discord?.configured) {
          toast.error('Discord webhook URL format is invalid');
        } else {
          toast.error('Discord webhook URL not found');
        }
      } else {
        setEnvStatus({ error: `HTTP ${response.status}` });
        toast.error('Failed to check configuration');
      }
    } catch (error: any) {
      setEnvStatus({ error: error.message });
      toast.error('Connection error');
    } finally {
      setChecking(false);
    }
  };

  const sendTestNotification = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/discord/test`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setTestResult({ success: true, message: 'Test notification sent!' });
        toast.success('🎉 Test Discord notification sent successfully! Check your Discord channel.');
      } else {
        setTestResult({ 
          success: false, 
          message: data.message || 'Failed to send test notification' 
        });
        toast.error('Failed to send test notification');
      }
    } catch (error: any) {
      setTestResult({ 
        success: false, 
        message: error.message || 'Connection error' 
      });
      toast.error('Connection error');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Rocket className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-green-900 mb-2">
              ✅ Edge Function Deployed Successfully!
            </h2>
            <p className="text-green-800">
              Your Discord bot Edge Function has been deployed to Supabase. 
              Now complete the final step to start receiving order notifications in Discord.
            </p>
          </div>
        </div>
      </Card>

      {/* Progress Steps */}
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                currentStep >= step
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'bg-white border-gray-300 text-gray-400'
              }`}>
                {currentStep > step ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <span className="font-semibold">{step}</span>
                )}
              </div>
              <div className="text-xs mt-2 text-center">
                {step === 1 && 'Setup Webhook'}
                {step === 2 && 'Verify Config'}
                {step === 3 && 'Test & Done'}
              </div>
            </div>
            {step < 3 && (
              <div className={`flex-1 h-0.5 mx-2 ${
                currentStep > step ? 'bg-green-500' : 'bg-gray-300'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Setup Discord Webhook */}
      <Card className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            currentStep >= 1 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
          }`}>
            1
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-2">Add Discord Webhook URL to Supabase</h3>
            
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="font-medium text-blue-900 mb-3">Get Your Discord Webhook URL:</div>
                <ol className="list-decimal ml-5 space-y-2 text-sm text-blue-800">
                  <li>Open your Discord server</li>
                  <li>Right-click the channel where you want notifications (e.g., #orders)</li>
                  <li>Click "Edit Channel" → "Integrations" → "Webhooks"</li>
                  <li>Click "New Webhook" (or use an existing one)</li>
                  <li>Click "Copy Webhook URL"</li>
                </ol>
                <div className="mt-3 text-xs text-blue-700 bg-blue-100 p-2 rounded">
                  URL format: <code>https://discord.com/api/webhooks/[ID]/[TOKEN]</code>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="font-medium text-purple-900 mb-3">Add to Supabase Edge Function Secrets:</div>
                <ol className="list-decimal ml-5 space-y-2 text-sm text-purple-800">
                  <li>
                    <a
                      href={`https://supabase.com/dashboard/project/${projectId}/settings/functions`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 underline"
                    >
                      Open Supabase Edge Functions Settings
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </li>
                  <li>Click on the "Secrets" or "Manage secrets" tab</li>
                  <li>Click "Add new secret"</li>
                  <li>
                    <div className="mt-2 space-y-1">
                      <div>
                        <span className="font-medium">Name:</span>{' '}
                        <code className="bg-purple-100 px-2 py-1 rounded text-xs">DISCORD_WEBHOOK_URL</code>
                      </div>
                      <div>
                        <span className="font-medium">Value:</span> Paste your Discord webhook URL
                      </div>
                    </div>
                  </li>
                  <li>Click "Add secret" or "Save"</li>
                  <li className="font-medium text-purple-900">
                    ⚠️ CRITICAL: Redeploy the Edge Function to activate the secret:
                    <div className="mt-2 ml-4 space-y-1 font-normal">
                      <div>• Click on the "server" function in the functions list</div>
                      <div>• Click the "Redeploy" or "Deploy" button at the top</div>
                      <div>• Wait for deployment to complete (~10-30 seconds)</div>
                      <div>• You'll see a green success message when done</div>
                    </div>
                  </li>
                </ol>
                <div className="mt-3 bg-white border border-purple-300 rounded p-3">
                  <div className="text-xs font-medium text-purple-900 mb-1">💡 Important:</div>
                  <ul className="text-xs text-purple-700 space-y-1 list-disc ml-4">
                    <li>The secret name must be exactly <code className="bg-purple-100 px-1">DISCORD_WEBHOOK_URL</code> (case-sensitive)</li>
                    <li className="font-medium text-purple-900">Without redeploying, the Edge Function won't see the new secret!</li>
                    <li>Redeployment takes seconds and causes no downtime</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={() => setCurrentStep(2)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  I've Added the Secret →
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Step 2: Verify Configuration */}
      {currentStep >= 2 && (
        <Card className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              currentStep >= 2 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
            }`}>
              2
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Verify Configuration</h3>
              <p className="text-sm text-gray-600 mb-4">
                Check that the Discord webhook URL was added correctly to Supabase.
              </p>

              <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-medium mb-1 text-amber-900">⚠️ Did you redeploy the Edge Function?</div>
                    <p className="text-sm text-amber-800 mb-3">
                      After adding the DISCORD_WEBHOOK_URL secret, you MUST redeploy the "server" Edge Function 
                      in Supabase for the changes to take effect. Without redeployment, verification will fail.
                    </p>
                    <a
                      href={`https://supabase.com/dashboard/project/${projectId}/functions`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm rounded-md transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Open Edge Functions to Redeploy
                    </a>
                  </div>
                </div>
              </div>

              <Button 
                onClick={checkWebhookConfig}
                disabled={checking}
                className="w-full mb-4"
              >
                {checking ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Checking Configuration...
                  </>
                ) : (
                  '🔍 Verify Discord Webhook Configuration'
                )}
              </Button>

              {envStatus && (
                <div className="space-y-3">
                  {envStatus.error ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 text-red-800 mb-3">
                        <XCircle className="w-5 h-5" />
                        <span className="font-semibold">Connection Error</span>
                      </div>
                      <p className="text-sm text-red-700 mb-3">{envStatus.error}</p>
                      <div className="mt-3 p-3 bg-white border border-red-300 rounded">
                        <div className="font-medium text-red-900 mb-2">💡 Most Common Cause:</div>
                        <p className="text-sm text-red-800 mb-2">
                          You added the DISCORD_WEBHOOK_URL secret but forgot to <strong>redeploy the Edge Function</strong>.
                        </p>
                        <div className="text-xs text-red-700 space-y-1">
                          <div className="font-medium">Quick Fix:</div>
                          <div>1. Go to Supabase → Edge Functions</div>
                          <div>2. Click on "server" function</div>
                          <div>3. Click "Redeploy" button</div>
                          <div>4. Wait ~30 seconds</div>
                          <div>5. Try verification again</div>
                        </div>
                      </div>
                    </div>
                  ) : envStatus.discord ? (
                    <div className={`p-4 rounded-lg border ${
                      envStatus.discord.configured && envStatus.discord.startsWithHttp
                        ? 'bg-green-50 border-green-200'
                        : envStatus.discord.configured
                        ? 'bg-orange-50 border-orange-200'
                        : 'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-start gap-2">
                        {envStatus.discord.configured && envStatus.discord.startsWithHttp ? (
                          <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                        ) : envStatus.discord.configured ? (
                          <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="font-semibold mb-2">
                            {envStatus.discord.configured && envStatus.discord.startsWithHttp
                              ? '✅ Discord Webhook Configured Correctly!'
                              : envStatus.discord.configured
                              ? '⚠️ Invalid Webhook URL Format'
                              : '❌ Discord Webhook Not Found'}
                          </div>
                          <div className="text-sm space-y-1">
                            <div>
                              <span className="text-gray-600">Configured:</span>{' '}
                              <span className={envStatus.discord.configured ? 'text-green-700' : 'text-red-700'}>
                                {envStatus.discord.configured ? 'Yes ✓' : 'No ✗'}
                              </span>
                            </div>
                            {envStatus.discord.configured && (
                              <>
                                <div>
                                  <span className="text-gray-600">Valid Format:</span>{' '}
                                  <span className={envStatus.discord.startsWithHttp ? 'text-green-700' : 'text-red-700'}>
                                    {envStatus.discord.startsWithHttp ? 'Yes ✓' : 'No ✗'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600">Preview:</span>{' '}
                                  <code className="text-xs bg-white px-2 py-1 rounded border">
                                    {envStatus.discord.preview}
                                  </code>
                                </div>
                              </>
                            )}
                          </div>

                          {!envStatus.discord.configured && (
                            <div className="mt-3 p-3 bg-white border rounded text-sm">
                              <div className="font-medium text-red-900 mb-2">Action Required:</div>
                              <div className="text-red-800 space-y-2">
                                <p>The DISCORD_WEBHOOK_URL secret was not found. This usually means:</p>
                                <ol className="list-decimal ml-5 space-y-1">
                                  <li>You haven't added the secret yet (go back to Step 1)</li>
                                  <li className="font-medium">You added it but forgot to REDEPLOY the Edge Function</li>
                                </ol>
                                <p className="font-medium mt-2">
                                  Remember: Supabase Edge Functions must be redeployed after adding secrets!
                                </p>
                              </div>
                            </div>
                          )}

                          {envStatus.discord.configured && !envStatus.discord.startsWithHttp && (
                            <div className="mt-3 p-3 bg-white border rounded text-sm">
                              <div className="font-medium text-orange-900 mb-1">Invalid Format:</div>
                              <p className="text-orange-800">
                                The webhook URL should start with "https://discord.com/api/webhooks/". 
                                Please check the value in Supabase.
                              </p>
                            </div>
                          )}

                          {envStatus.discord.configured && envStatus.discord.startsWithHttp && (
                            <div className="mt-3 p-3 bg-white border border-green-300 rounded text-sm">
                              <div className="font-medium text-green-900 mb-1">Ready to Test!</div>
                              <p className="text-green-800">
                                Your Discord webhook is configured correctly. Proceed to Step 3 to test it.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Step 3: Test */}
      {currentStep >= 3 && (
        <Card className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              currentStep >= 3 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
            }`}>
              3
            </div>
            <div className="flex-1">
              <h3 className="font-semibold mb-2">Send Test Notification</h3>
              <p className="text-sm text-gray-600 mb-4">
                Send a test order notification to verify everything is working correctly.
              </p>

              <Button 
                onClick={sendTestNotification}
                disabled={testing}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                {testing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending Test to Discord...
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4 mr-2" />
                    🚀 Send Test Discord Notification
                  </>
                )}
              </Button>

              {testResult && (
                <div className={`mt-4 p-4 rounded-lg border ${
                  testResult.success
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-start gap-2">
                    {testResult.success ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className={`font-semibold ${
                        testResult.success ? 'text-green-900' : 'text-red-900'
                      }`}>
                        {testResult.success ? '🎉 Success!' : '❌ Test Failed'}
                      </div>
                      <p className={`text-sm mt-1 ${
                        testResult.success ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {testResult.message}
                      </p>
                      {testResult.success && (
                        <div className="mt-3 p-3 bg-white border border-green-300 rounded">
                          <div className="font-medium text-green-900 mb-1">✅ Integration Complete!</div>
                          <p className="text-sm text-green-800">
                            Check your Discord channel for the test notification. You'll now receive beautiful 
                            order notifications every time a customer completes a payment!
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Help Links */}
      <Card className="p-4 bg-gray-50">
        <div className="text-sm">
          <div className="font-medium text-gray-900 mb-2">Quick Links:</div>
          <div className="space-y-1">
            <a
              href={`https://supabase.com/dashboard/project/${projectId}/settings/functions`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="w-3 h-3" />
              Supabase Edge Functions Settings
            </a>
            <a
              href={`https://supabase.com/dashboard/project/${projectId}/logs/edge-functions`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="w-3 h-3" />
              Edge Function Logs
            </a>
            <a
              href="https://discord.com/channels/@me"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="w-3 h-3" />
              Open Discord
            </a>
          </div>
        </div>
      </Card>
    </div>
  );
}
