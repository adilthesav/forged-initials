import { AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface ErrorFixBannerProps {
  onNavigate: () => void;
}

export function ErrorFixBanner({ onNavigate }: ErrorFixBannerProps) {
  return (
    <Card className="border-4 border-red-500 bg-red-50 p-6 shadow-xl">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-9 h-9 text-white" />
        </div>
        <div className="flex-1">
          <div className="text-2xl font-bold text-red-900 mb-2">
            🚨 Getting "Failed to Fetch" Errors?
          </div>
          <p className="text-red-800 mb-4">
            Click the button below to run a complete diagnostic. I'll test everything and tell you EXACTLY what to do to fix it. Takes 10 seconds.
          </p>
          <Button 
            onClick={onNavigate}
            size="lg"
            className="bg-red-600 hover:bg-red-700 h-12 px-8"
          >
            <AlertCircle className="w-5 h-5 mr-2" />
            🔬 Fix My Errors Now
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <div className="mt-3 text-sm text-red-700 space-y-1">
            <p>✅ This diagnostic will:</p>
            <ul className="list-disc list-inside ml-2 space-y-1">
              <li>Test all your Edge Function endpoints</li>
              <li>Identify exactly what's not working</li>
              <li>Give you copy-paste commands to fix it</li>
              <li>Verify your Discord and Stripe setup</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
}
