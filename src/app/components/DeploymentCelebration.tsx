import { useState, useEffect } from 'react';
import { X, Rocket, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';

interface DeploymentCelebrationProps {
  onOpenTest?: () => void;
}

export function DeploymentCelebration({ onOpenTest }: DeploymentCelebrationProps) {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if this is the first time seeing the site after deployment
    const hasSeenCelebration = localStorage.getItem('deployment_celebration_seen');
    const ownerMode = localStorage.getItem('forged_owner_mode');
    
    // Only show to owners who haven't seen it yet
    if (!hasSeenCelebration && ownerMode === 'enabled') {
      setShow(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('deployment_celebration_seen', 'true');
    setTimeout(() => setShow(false), 300);
  };

  const handleOpenTest = () => {
    localStorage.setItem('deployment_celebration_seen', 'true');
    if (onOpenTest) {
      onOpenTest();
    }
  };

  if (!show || dismissed) return null;

  return (
    <div 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        dismissed ? 'opacity-0 -translate-y-full' : 'opacity-100 translate-y-0'
      }`}
    >
      <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="flex-shrink-0">
                <Rocket className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-lg">
                  🎉 Deployment Successful!
                </div>
                <div className="text-sm text-green-50">
                  Your Edge Function is live! Click "Run Test" to verify Discord notifications →
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={handleOpenTest}
                size="sm"
                className="bg-white text-green-700 hover:bg-green-50"
              >
                Run Test
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <button
                onClick={handleDismiss}
                className="p-1 hover:bg-white/20 rounded transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
