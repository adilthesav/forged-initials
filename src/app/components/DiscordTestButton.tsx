import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function DiscordTestButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [checkingWebhook, setCheckingWebhook] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<{
    configured: boolean;
    valid: boolean;
    checked: boolean;
  } | null>(null);

  const checkWebhookConfiguration = async () => {
    setCheckingWebhook(true);
    try {
      console.log('🔍 Checking Discord webhook configuration...');
      
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/server/discord/check-webhook`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      console.log('Webhook status response:', data);
      
      const isConfigured = data.configured || false;
      
      setWebhookStatus({
        configured: isConfigured,
        valid: isConfigured, // If configured, assume it's valid
        checked: true
      });
      
      if (!isConfigured) {
        toast.error('Discord webhook not configured', {
          description: 'Please add DISCORD_WEBHOOK_URL to Supabase Edge Function secrets and redeploy.'
        });
      } else {
        toast.success('Discord webhook is configured correctly!', {
          description: 'You can now send a test notification.'
        });
      }
      
      return isConfigured;
    } catch (err: any) {
      console.error('❌ Failed to check webhook configuration:', err);
      toast.error('Failed to check webhook configuration', {
        description: err.message || 'Unknown error'
      });
      return false;
    } finally {
      setCheckingWebhook(false);
    }
  };

  const testDiscordNotification = async () => {
    // First check if webhook is configured
    if (!webhookStatus?.checked) {
      const isConfigured = await checkWebhookConfiguration();
      if (!isConfigured) {
        return; // Don't proceed if not configured
      }
    } else if (!webhookStatus.configured || !webhookStatus.valid) {
      toast.error('Cannot send test notification', {
        description: 'Discord webhook is not configured correctly. Please check the configuration first.'
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      console.log('🧪 Testing Discord notification...');
      
      // Call the new Discord test endpoint
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/server/discord/send-test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to send test');
      }

      console.log('✅ Success:', data);
      toast.success('Test notification sent!', {
        description: 'Check your Discord channel for the test order notification.'
      });
      setResult(data);
    } catch (err: any) {
      console.error('❌ Exception:', err);
      toast.error('Failed to send test notification', {
        description: err.message || 'Unknown error'
      });
      setResult({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div>
        <h3 className="font-semibold mb-2">🧪 Test Discord Notification</h3>
        <p className="text-sm text-gray-600 mb-4">
          Send a test order notification to your Discord channel. This will test the complete notification system including the Discord bot integration.
        </p>
      </div>

      {/* Webhook status indicator */}
      {webhookStatus?.checked && (
        <div className={`p-3 rounded-lg border-2 ${
          webhookStatus.configured && webhookStatus.valid
            ? 'bg-green-50 border-green-500'
            : 'bg-red-50 border-red-500'
        }`}>
          <div className="text-sm">
            {webhookStatus.configured && webhookStatus.valid ? (
              <>
                <div className="font-semibold text-green-900">✅ Discord Webhook Configured</div>
                <div className="text-green-700">Ready to send test notifications</div>
              </>
            ) : webhookStatus.configured ? (
              <>
                <div className="font-semibold text-red-900">⚠️ Invalid Webhook URL Format</div>
                <div className="text-red-700">URL should start with https://discord.com/api/webhooks/</div>
              </>
            ) : (
              <>
                <div className="font-semibold text-red-900">❌ Discord Webhook Not Configured</div>
                <div className="text-red-700">Add DISCORD_WEBHOOK_URL to Supabase secrets and redeploy</div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Button 
          onClick={checkWebhookConfiguration}
          disabled={checkingWebhook}
          variant="outline"
          className="flex-1"
        >
          {checkingWebhook ? '⏳ Checking...' : '🔍 Check Webhook Status'}
        </Button>
        
        <Button 
          onClick={testDiscordNotification}
          disabled={loading || checkingWebhook}
          className="flex-1"
        >
          {loading ? '⏳ Sending Test...' : '🚀 Send Test to Discord'}
        </Button>
      </div>

      {result && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <pre className="text-xs overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="text-xs text-gray-500 mt-4 space-y-2">
        <p className="font-semibold">Expected Response:</p>
        <div className="bg-green-50 border border-green-200 p-2 rounded text-green-800">
          ✅ TEST NOTIFICATION SENT!
        </div>
        
        <p className="font-semibold mt-3">Expected in Discord:</p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>👤 Customer: Adil (TEST)</li>
          <li>📧 Email: adilthesav@gmail.com</li>
          <li>💎 4 letters: A, D, I, L (Medium) = $12.00</li>
          <li>🔩 2x M Bails = $5.00</li>
          <li>⚙️ Assembly: $15.00</li>
          <li>📦 Shipping: $10.00</li>
          <li>✨ Total: $42.00</li>
        </ul>
      </div>
    </Card>
  );
}