import { Card } from './ui/card';
import { Button } from './ui/button';
import { AlertTriangle, ExternalLink, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { projectId } from '../utils/supabase/info';

export function RedeploymentReminder() {
  const [copied, setCopied] = useState(false);

  const copyCommand = async () => {
    await navigator.clipboard.writeText('supabase functions deploy server');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-2 border-orange-500 bg-orange-50 p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <AlertTriangle className="w-8 h-8 text-orange-600" />
        </div>
        <div className="flex-1 space-y-4">
          <div>
            <h3 className="font-semibold text-orange-900 text-lg mb-2">
              🚨 Critical: Redeploy After Adding Secrets!
            </h3>
            <p className="text-orange-800 mb-3">
              After adding the <code className="bg-orange-100 px-2 py-0.5 rounded">DISCORD_WEBHOOK_URL</code> secret 
              to Supabase, you <strong>MUST redeploy</strong> the Edge Function. The function continues running with 
              the old configuration until redeployed!
            </p>
          </div>

          <div className="bg-white border border-orange-300 rounded-lg p-4 space-y-3">
            <div className="font-semibold text-orange-900 flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              How to Redeploy:
            </div>
            
            <div className="space-y-2">
              <div className="text-sm">
                <div className="font-medium text-orange-900 mb-1">Option 1: Via Supabase CLI</div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-gray-900 text-green-400 px-3 py-2 rounded text-xs font-mono">
                    supabase functions deploy server
                  </code>
                  <Button
                    onClick={copyCommand}
                    variant="outline"
                    size="sm"
                    className="flex-shrink-0"
                  >
                    {copied ? '✓ Copied!' : 'Copy'}
                  </Button>
                </div>
              </div>

              <div className="text-sm">
                <div className="font-medium text-orange-900 mb-1">Option 2: Via Supabase Dashboard</div>
                <ol className="list-decimal ml-5 space-y-1 text-orange-800">
                  <li>Go to Edge Functions → server</li>
                  <li>Click the "Deploy" or "Redeploy" button</li>
                  <li>Wait for deployment to complete (~30 seconds)</li>
                </ol>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  asChild
                >
                  <a 
                    href={`https://supabase.com/dashboard/project/${projectId}/functions`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open Supabase Dashboard
                  </a>
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-orange-100 border border-orange-300 rounded-lg p-3">
            <div className="text-sm text-orange-900">
              <div className="font-semibold mb-1">⚡ Why This Happens:</div>
              <p className="text-xs">
                Supabase Edge Functions run in isolated containers. When you add a secret, 
                it's stored in Supabase's database, but the running function container doesn't 
                automatically restart. Redeploying creates a new container with the updated secrets.
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-orange-300">
            <div className="text-xs text-orange-700 space-y-1">
              <div className="font-semibold">✅ After Redeployment:</div>
              <ul className="list-disc ml-5 space-y-0.5">
                <li>Click "Check Webhook Status" to verify the secret is loaded</li>
                <li>If status shows ✅, click "Send Test to Discord"</li>
                <li>Check your Discord channel for the test notification</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
