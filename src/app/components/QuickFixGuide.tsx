import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { AlertCircle, CheckCircle2, Copy, Terminal } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner@2.0.3';

export function QuickFixGuide() {
  const copyToClipboard = async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard!');
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          toast.success('Copied to clipboard!');
        } catch {
          toast.info('Please copy manually (Ctrl+C)');
        }
        textArea.remove();
      }
    } catch {
      toast.info('Please copy manually (Ctrl+C)');
    }
  };

  return (
    <Card className="border-2 border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Terminal className="w-5 h-5" />
          🛠️ Quick Fix Reference Guide
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-blue-800 mb-4">
          Common solutions for "Failed to fetch" errors:
        </div>

        {/* Problem 1 */}
        <div className="bg-white rounded-lg p-4 border-2 border-red-200 space-y-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold text-red-900">Problem: Edge Function Not Deployed</div>
              <div className="text-sm text-red-700 mt-1">All tests fail with network errors</div>
            </div>
          </div>
          
          <div className="pl-7 space-y-2">
            <div className="text-sm font-medium text-gray-900">Solution:</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-900 p-3 rounded-lg">
                <code className="text-sm text-green-400 font-mono select-all">
                  supabase functions deploy server
                </code>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => copyToClipboard('supabase functions deploy server')}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-xs text-gray-600">
              💡 Run this in your terminal where your project is located
            </div>
          </div>
        </div>

        {/* Problem 2 */}
        <div className="bg-white rounded-lg p-4 border-2 border-orange-200 space-y-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold text-orange-900">Problem: Discord Secret Not Set</div>
              <div className="text-sm text-orange-700 mt-1">Function deployed but Discord tests fail</div>
            </div>
          </div>
          
          <div className="pl-7 space-y-2">
            <div className="text-sm font-medium text-gray-900">Solution (2 steps):</div>
            
            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-700">Step 1: Add Secret in Supabase Dashboard</div>
              <div className="bg-gray-100 p-3 rounded text-xs space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold w-24">Name:</span>
                  <code className="flex-1 bg-white px-2 py-1 rounded border select-all">
                    DISCORD_WEBHOOK_URL
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard('DISCORD_WEBHOOK_URL')}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold w-24">Value:</span>
                  <code className="flex-1 bg-white px-2 py-1 rounded border break-all select-all text-xs">
                    https://discord.com/api/webhooks/YOUR_WEBHOOK_URL
                  </code>
                </div>
              </div>
              
              <div className="text-xs font-semibold text-gray-700 mt-3">Step 2: Redeploy</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-900 p-2 rounded-lg">
                  <code className="text-xs text-green-400 font-mono select-all">
                    supabase functions deploy server
                  </code>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard('supabase functions deploy server')}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Problem 3 */}
        <div className="bg-white rounded-lg p-4 border-2 border-yellow-200 space-y-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold text-yellow-900">Problem: Stripe Not Configured</div>
              <div className="text-sm text-yellow-700 mt-1">Payment initialization fails</div>
            </div>
          </div>
          
          <div className="pl-7 space-y-2">
            <div className="text-sm font-medium text-gray-900">Solution:</div>
            <div className="text-xs text-gray-700 space-y-2">
              <div>1. Go to Supabase Dashboard → Settings → Edge Functions → Secrets</div>
              <div className="flex items-center gap-2">
                <span className="font-semibold">Add secret:</span>
                <code className="bg-white px-2 py-1 rounded border select-all">
                  STRIPE_SECRET_KEY
                </code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard('STRIPE_SECRET_KEY')}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <div>2. Value should be your Stripe API key (starts with sk_test_ or sk_live_)</div>
              <div>3. Redeploy the function</div>
            </div>
          </div>
        </div>

        {/* Success Case */}
        <div className="bg-green-50 rounded-lg p-4 border-2 border-green-300 space-y-2">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold text-green-900">All Tests Passing?</div>
              <div className="text-sm text-green-700 mt-1">
                Great! Your system is fully configured and ready to accept orders. 🎉
              </div>
            </div>
          </div>
        </div>

        {/* Additional Help */}
        <div className="pt-4 border-t space-y-2">
          <div className="text-sm font-semibold text-gray-900">📚 Need More Help?</div>
          <ul className="text-xs text-gray-700 space-y-1 ml-4">
            <li>• Make sure you have Supabase CLI installed: <code className="bg-gray-100 px-1 rounded">npm install -g supabase</code></li>
            <li>• Your project must be linked: <code className="bg-gray-100 px-1 rounded">supabase link</code></li>
            <li>• Check Supabase Dashboard → Edge Functions to verify deployment status</li>
            <li>• After adding/changing secrets, always redeploy for changes to take effect</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
