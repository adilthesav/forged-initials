import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { AlertTriangle, Key, ExternalLink, CheckCircle2, Copy } from 'lucide-react';
import { useState } from 'react';

export function StripeKeySetupGuide() {
  const [copied, setCopied] = useState(false);
  const projectId = "vpxuizymtmcnsgmpnhel";
  const webhookUrl = `https://${projectId}.supabase.co/functions/v1/server/stripe-webhook`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-orange-300 bg-orange-50">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <AlertTriangle className="w-8 h-8 text-orange-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="text-xl font-bold text-orange-900 mb-2">
              🔧 Stripe Configuration Required
            </h3>
            <p className="text-orange-800 mb-4">
              The checkout is failing because your Stripe API key is not configured in Supabase.
            </p>

            {/* Step 1 */}
            <div className="mb-4 p-4 bg-white rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <h4 className="font-bold text-orange-900">Get Your Stripe Secret Key</h4>
              </div>
              <p className="text-sm text-gray-700 mb-3 ml-8">
                Go to Stripe Dashboard and copy your secret key:
              </p>
              <div className="ml-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://dashboard.stripe.com/test/apikeys', '_blank')}
                  className="gap-2"
                >
                  <Key className="w-4 h-4" />
                  Open Stripe Dashboard
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
              <div className="ml-8 mt-3 p-2 bg-gray-100 rounded border border-gray-300 text-xs font-mono">
                Look for: <span className="font-bold">Secret key</span> → Click "Reveal test key"
                <br />
                Format: <span className="text-blue-600">sk_test_51ABC...</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="mb-4 p-4 bg-white rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <h4 className="font-bold text-orange-900">Add Key to Supabase</h4>
              </div>
              <p className="text-sm text-gray-700 mb-3 ml-8">
                Add your Stripe key as a secret in your Supabase project:
              </p>
              <div className="ml-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(
                    `https://supabase.com/dashboard/project/${projectId}/settings/functions`,
                    '_blank'
                  )}
                  className="gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Supabase Secrets
                </Button>
              </div>
              <div className="ml-8 mt-3 space-y-2">
                <div className="p-3 bg-gray-50 rounded border border-gray-200">
                  <p className="text-xs font-semibold text-gray-700 mb-1">Secret Name:</p>
                  <code className="text-sm font-mono bg-white px-2 py-1 rounded border">
                    STRIPE_SECRET_KEY
                  </code>
                </div>
                <div className="p-3 bg-gray-50 rounded border border-gray-200">
                  <p className="text-xs font-semibold text-gray-700 mb-1">Secret Value:</p>
                  <code className="text-sm font-mono bg-white px-2 py-1 rounded border">
                    sk_test_YOUR_ACTUAL_KEY_HERE
                  </code>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="mb-4 p-4 bg-white rounded-lg border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <h4 className="font-bold text-orange-900">Test the Checkout</h4>
              </div>
              <p className="text-sm text-gray-700 ml-8">
                After adding the secret, refresh this page and try the checkout again.
              </p>
            </div>

            {/* Optional: Webhook Setup */}
            <details className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <summary className="font-bold text-blue-900 cursor-pointer">
                📡 Optional: Setup Stripe Webhook (for order confirmations)
              </summary>
              <div className="mt-3 space-y-3">
                <p className="text-sm text-blue-800">
                  To receive payment confirmations, add this webhook endpoint in Stripe:
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs font-mono bg-white px-3 py-2 rounded border border-blue-300 overflow-x-auto">
                    {webhookUrl}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(webhookUrl)}
                    className="flex-shrink-0"
                  >
                    {copied ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://dashboard.stripe.com/test/webhooks', '_blank')}
                  className="gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Create Webhook in Stripe
                </Button>
              </div>
            </details>

            {/* Test Cards Info */}
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm font-bold text-green-900 mb-2">💳 Test Cards (Stripe Test Mode)</p>
              <div className="space-y-1 text-xs text-green-800">
                <div>
                  <span className="font-mono font-bold">4242 4242 4242 4242</span> - Success
                </div>
                <div>
                  <span className="font-mono font-bold">4000 0000 0000 0002</span> - Decline
                </div>
                <div className="text-green-700">
                  Use any future date (12/34), any CVC (123), any ZIP (12345)
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
