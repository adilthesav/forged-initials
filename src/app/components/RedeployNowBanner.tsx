import { Card } from './ui/card';
import { Button } from './ui/button';
import { AlertTriangle, Terminal } from 'lucide-react';
import { useState } from 'react';

export function RedeployNowBanner() {
  const [copied, setCopied] = useState(false);

  const copyCommand = async () => {
    await navigator.clipboard.writeText('supabase functions deploy server');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-4 border-orange-600 bg-gradient-to-r from-orange-50 to-red-50 p-8 shadow-2xl">
      <div className="flex items-start gap-6">
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center animate-pulse">
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>
        </div>
        
        <div className="flex-1 space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-orange-900 mb-2">
              🚨 CRITICAL: You Must Redeploy NOW!
            </h2>
            <p className="text-lg text-orange-800">
              I just added new endpoints to fix the "Failed to fetch" error. You need to redeploy the Edge Function immediately for the Discord integration to work.
            </p>
          </div>

          <div className="bg-white border-2 border-orange-400 rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-3 mb-3">
              <Terminal className="w-6 h-6 text-orange-700" />
              <div className="font-bold text-orange-900 text-lg">Run this command NOW:</div>
            </div>
            
            <div className="flex items-center gap-3">
              <code className="flex-1 bg-gray-900 text-green-400 px-6 py-4 rounded-lg text-lg font-mono">
                supabase functions deploy server
              </code>
              <Button
                onClick={copyCommand}
                size="lg"
                className="bg-orange-600 hover:bg-orange-700"
              >
                {copied ? '✓ Copied!' : 'Copy Command'}
              </Button>
            </div>
          </div>

          <div className="bg-orange-100 border-2 border-orange-300 rounded-lg p-4">
            <div className="font-bold text-orange-900 mb-2">What I Fixed:</div>
            <ul className="list-disc ml-6 space-y-1 text-orange-800">
              <li>✅ Added <code className="bg-orange-200 px-2 py-0.5 rounded">/discord/check-webhook</code> endpoint to verify webhook configuration</li>
              <li>✅ Added <code className="bg-orange-200 px-2 py-0.5 rounded">/discord/send-test</code> endpoint to send test Discord notifications</li>
              <li>✅ Fixed frontend to call the correct endpoints</li>
              <li>✅ Fixed all React Dialog ref warnings and accessibility issues</li>
            </ul>
          </div>

          <div className="bg-green-100 border-2 border-green-400 rounded-lg p-4">
            <div className="font-bold text-green-900 mb-2">After Redeployment:</div>
            <ol className="list-decimal ml-6 space-y-1 text-green-800">
              <li>Hard refresh this page (Cmd+Shift+R or Ctrl+Shift+R)</li>
              <li>Go to the Discord tab in Testing System</li>
              <li>Click "🔍 Check Webhook Status" - should show ✅</li>
              <li>Click "🚀 Send Test to Discord"</li>
              <li>Check your Discord channel for the test notification! 🎉</li>
            </ol>
          </div>
        </div>
      </div>
    </Card>
  );
}
