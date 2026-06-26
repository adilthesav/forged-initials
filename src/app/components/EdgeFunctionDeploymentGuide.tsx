import { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle2, XCircle, AlertCircle, ExternalLink, Copy, Loader2, Terminal, Upload, Github } from 'lucide-react';

export function EdgeFunctionDeploymentGuide() {
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);
  const [deployed, setDeployed] = useState<boolean | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const checkDeployment = async () => {
    setChecking(true);
    try {
      // Try to reach the edge function
      const response = await fetch(
        `https://${window.location.hostname.includes('localhost') ? 'YOUR_PROJECT_ID' : window.location.hostname.split('.')[0]}.supabase.co/functions/v1/server/health`,
        { method: 'GET' }
      );
      setDeployed(response.ok);
    } catch (error) {
      setDeployed(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkDeployment();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
            <span className="text-4xl">🚨</span>
          </div>
          <h1 className="text-4xl mb-2">Edge Function Not Deployed!</h1>
          <p className="text-gray-600 text-lg">Your code is ready, but it needs to be deployed to Supabase Cloud</p>
        </div>

        {/* Deployment Status */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl">Deployment Status</h3>
              <Button onClick={checkDeployment} disabled={checking} variant="outline" size="sm">
                {checking ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  'Check Again'
                )}
              </Button>
            </div>

            {deployed === null ? (
              <Alert>
                <Loader2 className="h-4 w-4 animate-spin" />
                <AlertDescription>Checking deployment status...</AlertDescription>
              </Alert>
            ) : deployed ? (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>✅ Deployed!</strong> Your Edge Function is live and working.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert className="bg-red-50 border-red-200">
                <XCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  <strong>❌ Not Deployed</strong> - Your Edge Function is not accessible. Deploy it using one of the methods below.
                </AlertDescription>
              </Alert>
            )}

            {/* Error Explanation */}
            {!deployed && deployed !== null && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-900 mb-2">
                  <strong>Why you're seeing "Not found" errors:</strong>
                </p>
                <ul className="text-sm text-yellow-800 space-y-1 ml-4">
                  <li>• Your code files exist on your computer ✅</li>
                  <li>• But they're not uploaded to Supabase Cloud ❌</li>
                  <li>• The website can't find the function → "Not found"</li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Deployment Methods */}
        <div className="grid gap-6">
          {/* Method 1: CLI (Recommended) */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Terminal className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl">Method 1: Supabase CLI</h3>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                      RECOMMENDED ⭐
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Deploy with one command (30 seconds)</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Step 1: Open Terminal/Command Prompt</p>
                  <p className="text-xs text-gray-600 mb-3">
                    Navigate to your project folder
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Step 2: Run this command:</p>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm flex items-center justify-between">
                    <code>supabase functions deploy server</code>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard('supabase functions deploy server')}
                      className="text-white hover:bg-gray-800"
                    >
                      {copied ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Step 3: Wait for success message:</p>
                  <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                    <p className="text-sm text-green-800 font-mono">
                      ✅ Deployed Function server version: v1.2.3
                    </p>
                  </div>
                </div>

                <Alert className="bg-blue-50 border-blue-200">
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 text-sm">
                    <strong>Don't have Supabase CLI?</strong> Install it first:
                    <br />
                    Mac: <code className="bg-blue-100 px-1 rounded">brew install supabase/tap/supabase</code>
                    <br />
                    Windows: <code className="bg-blue-100 px-1 rounded">scoop install supabase</code>
                    <br />
                    Or: <code className="bg-blue-100 px-1 rounded">npm install -g supabase</code>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          {/* Method 2: GitHub Auto-Deploy */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Github className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl">Method 2: GitHub Auto-Deploy</h3>
                    <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-semibold">
                      EASIEST
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">If you have GitHub connected (fully automatic)</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Step 1: Push to GitHub</p>
                  <div className="bg-gray-900 text-gray-100 p-3 rounded-lg font-mono text-sm space-y-1">
                    <div>git add .</div>
                    <div>git commit -m "Deploy edge function"</div>
                    <div>git push</div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard('git add .\ngit commit -m "Deploy edge function"\ngit push')}
                    className="mt-2"
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy Commands
                  </Button>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Step 2: Wait for Auto-Deploy</p>
                  <p className="text-sm text-gray-600">
                    Supabase will automatically detect changes and deploy (2-3 minutes)
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Step 3: Verify</p>
                  <Button
                    onClick={() => window.open('https://supabase.com/dashboard/project/_/functions', '_blank')}
                    className="w-full"
                    variant="outline"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Check Deployment in Dashboard
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Method 3: Dashboard Upload */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Upload className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="text-xl mb-1">Method 3: Manual Upload</h3>
                  <p className="text-sm text-gray-600">Upload files directly via Supabase Dashboard</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Step 1: Open Edge Functions Dashboard</p>
                  <Button
                    onClick={() => window.open('https://supabase.com/dashboard/project/_/functions', '_blank')}
                    className="w-full"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Supabase Functions
                  </Button>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Step 2: Create/Update Function</p>
                  <ul className="text-sm text-gray-600 space-y-1 ml-4">
                    <li>• Click "New Function" or find "server" function</li>
                    <li>• Click "Deploy new version"</li>
                  </ul>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Step 3: Upload These Files</p>
                  <div className="bg-gray-50 p-3 rounded-lg border space-y-1">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <code>supabase/functions/server/index.tsx</code>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <code>supabase/functions/server/notifications.tsx</code>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <code>supabase/functions/server/payments.tsx</code>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <code>supabase/functions/server/shipping.tsx</code>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <code>supabase/functions/server/kv_store.tsx</code>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Step 4: Deploy</p>
                  <p className="text-sm text-gray-600">
                    Click "Deploy" and wait 30-60 seconds
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* After Deployment */}
        <Card className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <h3 className="text-xl mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              After Deployment
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-2xl">1️⃣</span>
                <div>
                  <p className="font-medium">Verify Deployment</p>
                  <p className="text-sm text-gray-600">Function should show "Active" status in dashboard</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">2️⃣</span>
                <div>
                  <p className="font-medium">Set Environment Variables</p>
                  <p className="text-sm text-gray-600">Add DISCORD_WEBHOOK_URL and STRIPE_SECRET_KEY</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">3️⃣</span>
                <div>
                  <p className="font-medium">Test Discord Notification</p>
                  <p className="text-sm text-gray-600">Use the Test System to verify it works</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">4️⃣</span>
                <div>
                  <p className="font-medium">Test Payment Flow</p>
                  <p className="text-sm text-gray-600">Create a test order to confirm everything works</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            onClick={() => window.open('https://supabase.com/dashboard/project/_/functions', '_blank')}
            className="h-auto py-4 flex-col gap-2"
          >
            <ExternalLink className="w-5 h-5" />
            <span>Edge Functions</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open('https://supabase.com/dashboard/project/_/logs/edge-functions', '_blank')}
            className="h-auto py-4 flex-col gap-2"
          >
            <ExternalLink className="w-5 h-5" />
            <span>Function Logs</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open('https://supabase.com/dashboard/project/_/settings/api', '_blank')}
            className="h-auto py-4 flex-col gap-2"
          >
            <ExternalLink className="w-5 h-5" />
            <span>Add Secrets</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
