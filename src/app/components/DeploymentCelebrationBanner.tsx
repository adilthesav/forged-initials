import { CheckCircle2, Rocket, ArrowRight, MessageSquare } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';

interface DeploymentCelebrationBannerProps {
  onSwitchToDiscord?: () => void;
}

export function DeploymentCelebrationBanner({ onSwitchToDiscord }: DeploymentCelebrationBannerProps) {
  const handleRunDiagnostic = () => {
    // Scroll to the diagnostic section
    const diagnosticSection = document.getElementById('comprehensive-diagnostic');
    if (diagnosticSection) {
      diagnosticSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <Card className="border-2 border-green-500 bg-gradient-to-r from-green-50 to-emerald-50">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-green-500 rounded-full">
            <Rocket className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-green-900 mb-2">
              🎉 Edge Function Deployed Successfully!
            </h3>
            <p className="text-green-800 mb-4">
              Great job! Your Edge Function is live on Supabase. The terminal confirmed:
            </p>
            <div className="bg-gray-900 p-4 rounded-lg font-mono text-sm text-green-400 mb-4">
              <div className="text-gray-500 text-xs mb-2">Terminal Output:</div>
              <div>✓ Deployed Functions on project vpxuizymtmcnsgmpnhel: server</div>
              <div>✓ No change found in Function: server</div>
              <div>✓ Version 2.1, 14.47kB</div>
              <div className="text-gray-500 text-xs mt-2">Status: Function is live and ready to accept requests</div>
            </div>

            <div className="bg-white/80 p-4 rounded-lg border-2 border-green-300 mb-4">
              <div className="font-semibold text-green-900 mb-2">✅ What This Means:</div>
              <ul className="space-y-2 text-sm text-green-800">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Your server endpoints are live and ready to handle requests</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Payment processing with Stripe can now work</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Discord notifications will work (after webhook setup)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Shipping label generation is ready</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-300">
              <div className="font-semibold text-blue-900 mb-2">🚀 Next Steps:</div>
              <ol className="list-decimal ml-5 space-y-2 text-sm text-blue-800">
                <li>
                  <strong>Run the diagnostic below</strong> to verify all endpoints are responding
                </li>
                <li>
                  <strong>Configure Discord webhook</strong> (if you haven't already) to receive order notifications
                </li>
                <li>
                  <strong>Test the payment system</strong> to make sure everything works end-to-end
                </li>
              </ol>
              
              <div className="grid grid-cols-2 gap-3 mt-4">
                <Button 
                  onClick={handleRunDiagnostic}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Run Diagnostic
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                {onSwitchToDiscord && (
                  <Button 
                    onClick={onSwitchToDiscord}
                    variant="outline"
                    className="border-green-500 text-green-700 hover:bg-green-50"
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Setup Discord
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
