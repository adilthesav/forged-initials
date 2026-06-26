import { useState, useEffect } from 'react';
import { AlertCircle, X, ExternalLink } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function DeploymentBanner() {
  const [isDeployed, setIsDeployed] = useState<boolean | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check if user has dismissed the banner
    const dismissed = localStorage.getItem('deployment_banner_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
      setChecking(false);
      return;
    }

    checkDeployment();
  }, []);

  const checkDeployment = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/health`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );
      
      setIsDeployed(response.ok);
      setChecking(false);
    } catch (error) {
      setIsDeployed(false);
      setChecking(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('deployment_banner_dismissed', 'true');
    setIsDismissed(true);
  };

  // Don't show banner if:
  // - Still checking
  // - User dismissed it
  // - Edge Function is deployed
  if (checking || isDismissed || isDeployed) {
    return null;
  }

  return (
    <div className="hidden md:block bg-orange-600 text-white py-3 px-4 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div className="text-sm">
            <span className="font-semibold">⚠️ Setup Required:</span> Edge Function not deployed. 
            Payment processing won't work until deployed.
            <a 
              href="#deploy-instructions" 
              className="ml-2 underline hover:text-orange-100"
              onClick={(e) => {
                e.preventDefault();
                // Scroll to bottom and open testing dashboard
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                setTimeout(() => {
                  // Trigger 5 clicks on copyright to open dashboard
                  const event = new CustomEvent('openTestDashboard');
                  window.dispatchEvent(event);
                }, 500);
              }}
            >
              View Setup Guide
            </a>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <a
            href="https://github.com/yourusername/forged-initials/blob/main/DEPLOY_NOW.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-white text-orange-600 px-3 py-1.5 rounded hover:bg-orange-50 transition-colors flex items-center gap-1 flex-shrink-0"
          >
            Deploy Guide
            <ExternalLink className="w-3 h-3" />
          </a>
          
          <button
            onClick={handleDismiss}
            className="text-white hover:text-orange-100 transition-colors flex-shrink-0"
            aria-label="Dismiss banner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
