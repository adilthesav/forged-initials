import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Bell, CheckCircle2, XCircle, Loader2, Key, Settings, Mail } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info.tsx';

interface TestNotificationProps {
  onOpenFullDashboard?: () => void;
  onOpenEmailGenerator?: () => void;
}

export function TestNotification({ onOpenFullDashboard, onOpenEmailGenerator }: TestNotificationProps) {
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [envCheck, setEnvCheck] = useState<any>(null);
  const [checkingEnv, setCheckingEnv] = useState(false);

  const checkEnvironment = async () => {
    setCheckingEnv(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/debug-env`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setEnvCheck(data);
      } else {
        setEnvCheck({ error: 'Failed to check environment' });
      }
    } catch (error) {
      console.error('Error checking environment:', error);
      setEnvCheck({ error: 'Request failed' });
    } finally {
      setCheckingEnv(false);
    }
  };

  const sendTestNotification = async () => {
    setIsSending(true);
    setResult(null);

    try {
      // Call our simple working Discord function!
      const testOrder = {
        orderId: 'TEST-' + Date.now(),
        customerName: 'Adil (TEST ORDER)',
        email: 'adilthesav@gmail.com',
        paymentMethod: 'Test Button',
        total: '42.00',
        items: [
          { letter: 'A', quantity: 1, size: 'Medium' },
          { letter: 'D', quantity: 1, size: 'Medium' },
          { letter: 'I', quantity: 1, size: 'Medium' },
          { letter: 'L', quantity: 1, size: 'Medium' },
        ]
      };

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/discord-notify`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(testOrder),
        }
      );

      if (response.ok) {
        setResult({
          success: true,
          message: '✅ SUCCESS! Discord notification sent! Check your Discord channel! 🎉',
        });
      } else {
        const error = await response.json();
        setResult({
          success: false,
          message: `❌ Error: ${error.error || 'Unknown error'}`,
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: `❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm">
      <Card className="border-2 shadow-lg">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Admin Tools</h3>
            </div>
          </div>
          
          {onOpenEmailGenerator && (
            <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-lg">
              <p className="text-xs text-gray-800">
                <strong>✉️ Quick Email Generator</strong> - Send receipts (📧) + tracking (📦) in 30 seconds!
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Button
              onClick={checkEnvironment}
              disabled={checkingEnv}
              variant="outline"
              className="w-full"
              size="sm"
            >
              {checkingEnv ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4 mr-2" />
                  Check Config
                </>
              )}
            </Button>

            <Button
              onClick={sendTestNotification}
              disabled={isSending}
              className="w-full"
              size="sm"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4 mr-2" />
                  Test Discord
                </>
              )}
            </Button>

            {onOpenEmailGenerator && (
              <Button
                onClick={() => {
                  onOpenEmailGenerator();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                variant="default"
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0"
                size="sm"
              >
                <Mail className="w-4 h-4 mr-2" />
                ✉️ Quick Email Generator
              </Button>
            )}

            {onOpenFullDashboard && (
              <Button
                onClick={() => {
                  onOpenFullDashboard();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                variant="outline"
                className="w-full"
                size="sm"
              >
                <Settings className="w-4 h-4 mr-2" />
                🧪 Full Testing Dashboard
              </Button>
            )}
          </div>

          {envCheck && (
            <div className="text-xs space-y-2 p-3 bg-muted rounded">
              <div className="font-semibold">Configuration Status:</div>
              {envCheck.stripe && (
                <div className={envCheck.stripe.isValid ? 'text-green-600' : 'text-red-600'}>
                  🔑 Stripe: {envCheck.stripe.isValid ? '✅ Valid' : '❌ Invalid'}
                  {!envCheck.stripe.isValid && envCheck.stripe.preview && (
                    <div className="text-xs mt-1">Preview: {envCheck.stripe.preview}</div>
                  )}
                </div>
              )}
              {envCheck.discord && (
                <div className={envCheck.discord.configured ? 'text-green-600' : 'text-gray-500'}>
                  💬 Discord: {envCheck.discord.configured ? '✅ Set' : '⚠️ Not set'}
                </div>
              )}
              {envCheck.fedex && (
                <div className={envCheck.fedex.configured ? 'text-green-600' : 'text-gray-500'}>
                  📦 FedEx: {envCheck.fedex.configured ? '✅ Set' : '⚠️ Not set'}
                </div>
              )}
            </div>
          )}

          {result && (
            <div
              className={`p-3 rounded-lg text-sm flex items-start gap-2 ${
                result.success
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              {result.success ? (
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <p className={result.success ? 'text-green-800' : 'text-red-800'}>
                {result.message}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}