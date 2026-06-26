import { X, Rocket, CheckCircle2 } from 'lucide-react';
import { Button } from './ui/button';

interface DiscordSetupBannerProps {
  onOpenSetup?: () => void;
}

export function DiscordSetupBanner({ onOpenSetup }: DiscordSetupBannerProps) {
  const handleDismiss = () => {
    localStorage.setItem('discord_setup_banner_dismissed', 'true');
    // Trigger a re-render in parent by dispatching an event
    window.dispatchEvent(new Event('discordBannerDismissed'));
  };

  const handleOpenSetup = () => {
    if (onOpenSetup) {
      onOpenSetup();
    }
  };

  return (
    <div className="relative w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg z-[100]">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
              <Rocket className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <div className="font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Edge Function Deployed Successfully!
              </div>
              <div className="text-sm text-green-50">
                One simple step left: Add your Discord webhook URL and redeploy (takes 2 minutes)
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleOpenSetup}
              variant="secondary"
              size="sm"
              className="bg-white text-green-700 hover:bg-green-50"
            >
              Complete Setup →
            </Button>
            <button
              onClick={handleDismiss}
              className="p-2 hover:bg-green-700 rounded-full transition-colors"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
