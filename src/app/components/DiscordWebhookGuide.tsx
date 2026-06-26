import { Card } from './ui/card';
import { CheckCircle2, Copy, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner@2.0.3';

export function DiscordWebhookGuide() {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="p-6 space-y-4">
      <div>
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          🔗 Discord Webhook Setup
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Follow these steps to set up your Discord webhook URL in Supabase.
        </p>
      </div>

      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            📋 Step 1: Get Discord Webhook URL
          </div>
          <ol className="list-decimal ml-5 space-y-2 text-sm text-blue-800">
            <li>Open your Discord server</li>
            <li>Go to Server Settings → Integrations → Webhooks</li>
            <li>Click "New Webhook" or select an existing one</li>
            <li>Choose the channel where you want order notifications (e.g., #orders or #general)</li>
            <li>Click "Copy Webhook URL"</li>
          </ol>
          <div className="mt-3 text-xs text-blue-700">
            The webhook URL should look like: <code className="bg-blue-100 px-1">https://discord.com/api/webhooks/...</code>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
            🔐 Step 2: Add to Supabase Edge Function Secrets
          </div>
          <ol className="list-decimal ml-5 space-y-2 text-sm text-purple-800">
            <li>Go to your Supabase Dashboard</li>
            <li>Navigate to: Project Settings → Edge Functions → Manage secrets</li>
            <li>Click "Add new secret"</li>
            <li>
              <div className="flex items-center gap-2 mt-2">
                <span>Name:</span>
                <code className="bg-purple-100 px-2 py-1 rounded">DISCORD_WEBHOOK_URL</code>
                <button
                  onClick={() => copyToClipboard('DISCORD_WEBHOOK_URL')}
                  className="text-purple-600 hover:text-purple-800"
                  title="Copy to clipboard"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </li>
            <li>Value: Paste your Discord webhook URL</li>
            <li>Click "Add secret"</li>
          </ol>
          
          <div className="mt-4 bg-white border border-purple-300 rounded p-3">
            <div className="text-xs font-semibold text-purple-900 mb-2">📌 Important Note:</div>
            <p className="text-xs text-purple-700">
              After adding the secret, the Edge Function will automatically use it. No need to redeploy!
            </p>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="font-semibold text-green-900 mb-2 flex items-center gap-2">
            ✅ Step 3: Test the Integration
          </div>
          <ol className="list-decimal ml-5 space-y-2 text-sm text-green-800">
            <li>Once the webhook URL is added as a secret, click the "🚀 Send Test to Discord" button above</li>
            <li>Check your Discord channel for the test notification</li>
            <li>You should see a beautiful green embed with test order details</li>
          </ol>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="font-semibold text-yellow-900 mb-2">
            ⚠️ Troubleshooting
          </div>
          <ul className="list-disc ml-5 space-y-1 text-sm text-yellow-800">
            <li>If you see "Failed to fetch", make sure the Edge Function is deployed (see Deployment Checker above)</li>
            <li>If the test succeeds but no Discord message appears, verify the webhook URL is correct</li>
            <li>Make sure the webhook channel permissions allow the webhook to post messages</li>
            <li>Check the Edge Function logs in Supabase Dashboard → Edge Functions → Logs</li>
          </ul>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            🔗 Quick Links
          </div>
          <div className="space-y-2">
            <a
              href="https://discord.com/channels/@me"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="w-4 h-4" />
              Open Discord
            </a>
            <a
              href={`https://supabase.com/dashboard/project/vpxuizymtmcnsgmpnhel/settings/functions`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="w-4 h-4" />
              Supabase Edge Functions Settings
            </a>
            <a
              href={`https://supabase.com/dashboard/project/vpxuizymtmcnsgmpnhel/logs/edge-functions`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
            >
              <ExternalLink className="w-4 h-4" />
              Edge Function Logs
            </a>
          </div>
        </div>
      </div>
    </Card>
  );
}
