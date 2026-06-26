import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle2, AlertCircle, Copy, ExternalLink, Loader2 } from 'lucide-react';

export function DeployDiscordFix() {
  const [step, setStep] = useState(1);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const dashboardUrl = "https://supabase.com/dashboard/project/_/functions";

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
            <span className="text-3xl">🤖</span>
          </div>
          <h1 className="text-3xl mb-2">Deploy Discord Bot Fix</h1>
          <p className="text-gray-600">No terminal needed - Use Supabase Dashboard</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  step >= s
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
              </div>
              {s < 5 && (
                <div
                  className={`w-12 h-1 mx-2 transition-all ${
                    step > s ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <Card className="p-8 mb-6">
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🔍</span>
                </div>
                <div>
                  <h2 className="text-2xl mb-2">What's Wrong?</h2>
                  <p className="text-gray-600 mb-4">
                    Your Discord bot is crashing because it expects a single "size" field, but your pricing system now has per-item sizes (XS, S, M, L, XL).
                  </p>
                </div>
              </div>

              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>Current Issue:</strong> Discord bot crashes when trying to access <code>order.size</code> which doesn't exist
                </AlertDescription>
              </Alert>

              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>The Fix:</strong> Updated to show sizes per item: <code>A (XS) ×2, B (L) ×3</code>
                </AlertDescription>
              </Alert>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">What Was Fixed:</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Removed references to <code>order.size</code> and <code>data.size</code>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Added size field to each LetterItem
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Updated Discord messages to show sizes per item
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Fixed receipt email calls
                  </li>
                </ul>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🌐</span>
                </div>
                <div>
                  <h2 className="text-2xl mb-2">Open Supabase Dashboard</h2>
                  <p className="text-gray-600 mb-4">
                    Click the button below to open your Supabase Edge Functions page
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-lg border-2 border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800 mb-2">Supabase Edge Functions</p>
                    <p className="text-sm text-gray-600">
                      This will open in a new tab
                    </p>
                  </div>
                  <Button
                    size="lg"
                    onClick={() => window.open(dashboardUrl, '_blank')}
                    className="gap-2"
                  >
                    Open Dashboard
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Note:</strong> You'll need to be logged into your Supabase account. If you're not logged in, you'll be prompted to sign in first.
                </AlertDescription>
              </Alert>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3">What you'll see:</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>✓ List of your Edge Functions</p>
                  <p>✓ A function called <strong>"server"</strong></p>
                  <p>✓ Deploy buttons and options</p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🔄</span>
                </div>
                <div>
                  <h2 className="text-2xl mb-2">Find the "server" Function</h2>
                  <p className="text-gray-600 mb-4">
                    Locate and open the server edge function
                  </p>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 p-4">
                  <p className="font-semibold">Edge Functions Dashboard</p>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center text-white">
                        ƒ
                      </div>
                      <div>
                        <p className="font-semibold">server</p>
                        <p className="text-sm text-gray-600">Edge Function</p>
                      </div>
                    </div>
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      Active
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <span>👉</span> What to do:
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  <li>Look for the function named <strong>"server"</strong></li>
                  <li>Click on it to open the function details</li>
                  <li>You'll see deployment options and version history</li>
                </ol>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📤</span>
                </div>
                <div>
                  <h2 className="text-2xl mb-2">Deploy the Updated Function</h2>
                  <p className="text-gray-600 mb-4">
                    Actually, the code is already updated in your files! You just need to trigger a redeploy.
                  </p>
                </div>
              </div>

              <Alert className="bg-yellow-50 border-yellow-200">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <strong>Important:</strong> The fixes are already in your <code>/supabase/functions/server/notifications.tsx</code> file. You just need to deploy them to make them live.
                </AlertDescription>
              </Alert>

              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border-2 border-green-200">
                <h3 className="font-semibold mb-4 text-lg">Option 1: Use GitHub Integration (Recommended)</h3>
                <div className="space-y-3">
                  <p className="text-sm text-gray-700">If your project is connected to GitHub:</p>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ml-4">
                    <li>Commit your changes to GitHub</li>
                    <li>Push to your main/master branch</li>
                    <li>Supabase will auto-deploy the function</li>
                  </ol>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-200">
                <h3 className="font-semibold mb-4 text-lg">Option 2: Manual File Upload</h3>
                <div className="space-y-3">
                  <p className="text-sm text-gray-700">Upload the updated files directly:</p>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ml-4">
                    <li>Click "Deploy new version" or "Update function"</li>
                    <li>Upload the files from <code>/supabase/functions/server/</code></li>
                    <li>Include: <code>index.tsx</code>, <code>notifications.tsx</code>, <code>payments.tsx</code>, <code>shipping.tsx</code>, <code>kv_store.tsx</code></li>
                    <li>Click "Deploy"</li>
                  </ol>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Files to Upload:</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-white rounded border">
                    <code className="text-sm">supabase/functions/server/notifications.tsx</code>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Updated ✓</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded border">
                    <code className="text-sm">supabase/functions/server/index.tsx</code>
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Required</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded border">
                    <code className="text-sm">supabase/functions/server/payments.tsx</code>
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Required</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">✅</span>
                </div>
                <div>
                  <h2 className="text-2xl mb-2">Test the Fix!</h2>
                  <p className="text-gray-600 mb-4">
                    Verify that your Discord bot is working correctly
                  </p>
                </div>
              </div>

              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Deployment Complete!</strong> Your Discord bot should now be working without crashes.
                </AlertDescription>
              </Alert>

              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-lg border-2 border-purple-200">
                <h3 className="font-semibold mb-4">Test Your Discord Notifications:</h3>
                <div className="space-y-4">
                  <div className="bg-white p-4 rounded-lg border">
                    <p className="font-medium mb-2">1. Create a Test Order</p>
                    <p className="text-sm text-gray-600">
                      Go through your website and create an order with different sizes (e.g., A=XS, B=Large, C=Medium)
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <p className="font-medium mb-2">2. Check Discord</p>
                    <p className="text-sm text-gray-600">
                      Look for a message in your Discord channel
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <p className="font-medium mb-2">3. Verify Format</p>
                    <p className="text-sm text-gray-600">
                      Should show: <code>A (XS) ×2, B (L) ×3</code> with sizes clearly displayed
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold mb-4">Expected Discord Message:</h3>
                <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                  <div className="mb-4">
                    <span className="text-purple-400">🔔 New Custom Order Received!</span>
                  </div>
                  <div className="mb-2">
                    <strong>Customer:</strong> John Doe
                  </div>
                  <div className="mb-4">
                    <strong>Email:</strong> john@example.com
                  </div>
                  <div className="mb-2">
                    <strong>🆔 Order ID</strong>
                  </div>
                  <div className="bg-gray-800 p-2 rounded mb-4">
                    FI-20251109-ABC123
                  </div>
                  <div className="mb-2">
                    <strong>💎 Order Details</strong>
                  </div>
                  <div className="ml-4 space-y-1">
                    <div><strong>Letters:</strong> <span className="text-green-400">A (XS) ×2, B (L) ×3, C (M) ×1</span></div>
                    <div><strong>Total Pieces:</strong> 6</div>
                    <div><strong>Material:</strong> 925 Sterling Silver</div>
                  </div>
                  <div className="mt-4">
                    <strong>💰 Amount</strong>
                  </div>
                  <div className="text-xl text-green-400">
                    $18.00 USD
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                  Success Checklist:
                </h3>
                <ul className="space-y-2 text-sm text-gray-700 ml-6">
                  <li>✓ Discord message received</li>
                  <li>✓ Letter sizes shown correctly (e.g., A (XS) ×2)</li>
                  <li>✓ No "undefined" or crash errors</li>
                  <li>✓ Customer information displays</li>
                  <li>✓ Total amount is correct</li>
                </ul>
              </div>
            </div>
          )}
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
          >
            Previous
          </Button>
          <Button
            onClick={() => setStep(Math.min(5, step + 1))}
            disabled={step === 5}
            className="gap-2"
          >
            {step === 5 ? 'Complete!' : 'Next Step'}
            {step < 5 && '→'}
          </Button>
        </div>

        {/* Quick Links */}
        <Card className="mt-8 p-6 bg-gray-50">
          <h3 className="font-semibold mb-4">Quick Links:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => window.open('https://supabase.com/dashboard/project/_/functions', '_blank')}
              className="gap-2 justify-start"
            >
              <ExternalLink className="w-4 h-4" />
              Supabase Functions
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open('https://supabase.com/dashboard/project/_/logs/edge-functions', '_blank')}
              className="gap-2 justify-start"
            >
              <ExternalLink className="w-4 h-4" />
              Function Logs
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open('https://discord.com/channels/@me', '_blank')}
              className="gap-2 justify-start"
            >
              <ExternalLink className="w-4 h-4" />
              Check Discord
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open('https://supabase.com/dashboard/project/_/settings/api', '_blank')}
              className="gap-2 justify-start"
            >
              <ExternalLink className="w-4 h-4" />
              API Settings
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
