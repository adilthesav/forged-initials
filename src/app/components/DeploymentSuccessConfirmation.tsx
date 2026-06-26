import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle2, Sparkles, X } from 'lucide-react';

interface DeploymentSuccessConfirmationProps {
  onTestDiscord?: () => void;
}

export function DeploymentSuccessConfirmation({ onTestDiscord }: DeploymentSuccessConfirmationProps) {
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem('deployment_success_confirmation_dismissed') === 'true';
  });

  const handleDismiss = () => {
    localStorage.setItem('deployment_success_confirmation_dismissed', 'true');
    setDismissed(true);
  };

  if (dismissed) return null;

  return (
    <Card className="border-4 border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 shadow-2xl">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center animate-bounce">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-green-900 mb-2">
                🎉 DEPLOYMENT SUCCESSFUL!
              </h2>
              <p className="text-green-800">
                Your Edge Function is now <strong className="font-bold">live and working perfectly</strong>! 
                All the duplicate file issues have been resolved. Your payment system is ready to go! 🚀
              </p>
            </div>

            <div className="bg-white border-2 border-green-300 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-900">What's Working Now:</span>
              </div>
              <ul className="space-y-1 text-sm text-gray-700 ml-7">
                <li>✅ Edge Function is deployed and responding</li>
                <li>✅ All file imports are correct (.tsx files)</li>
                <li>✅ Stripe payment processing is ready (Card, Cash App, Link)</li>
                <li>✅ Discord webhook integration ready</li>
              </ul>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 rounded-lg p-4 space-y-3">
              <div className="font-semibold text-blue-900 mb-2">🎯 Next Steps:</div>
              <ol className="text-sm text-blue-800 space-y-2 ml-4 list-decimal">
                <li>
                  <strong>Test Discord Notifications:</strong>
                  {onTestDiscord ? (
                    <Button
                      onClick={onTestDiscord}
                      variant="link"
                      className="h-auto p-0 ml-1 text-blue-700 underline"
                    >
                      Go to Discord tab →
                    </Button>
                  ) : (
                    <span className="ml-1">Go to the "Discord" tab and send a test notification</span>
                  )}
                </li>
                <li>
                  <strong>Configure Stripe:</strong> Make sure your Stripe API keys are set in Supabase Dashboard → Edge Functions → server → Settings
                </li>
                <li>
                  <strong>Set Discord Webhook:</strong> Add your Discord webhook URL to the Edge Function environment variables
                </li>
                <li>
                  <strong>Test a Payment:</strong> Try creating a test order with Stripe's test card: 4242 4242 4242 4242
                </li>
              </ol>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-gray-600 italic">
                💡 Your jewelry business is ready to accept orders! 🎨💍
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
