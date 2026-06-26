import { useState, useEffect } from 'react';
import { AlertCircle, X, ExternalLink, Check } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function StripeConfigBanner() {
  const [stripeConfigured, setStripeConfigured] = useState<boolean | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Check if user has dismissed the banner
    const dismissed = localStorage.getItem('stripe_config_banner_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
      setChecking(false);
      return;
    }

    checkStripeConfig();
  }, []);

  const checkStripeConfig = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/debug-env`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        const isConfigured = data.stripe?.configured && data.stripe?.isValid;
        setStripeConfigured(isConfigured);
      } else {
        setStripeConfigured(false);
      }
      setChecking(false);
    } catch (error) {
      setStripeConfigured(false);
      setChecking(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('stripe_config_banner_dismissed', 'true');
    setIsDismissed(true);
  };

  const handleOpenSupabase = () => {
    window.open(`https://supabase.com/dashboard/project/${projectId}/functions`, '_blank');
  };

  const handleOpenStripe = () => {
    window.open('https://dashboard.stripe.com/apikeys', '_blank');
  };

  // Don't show banner if:
  // - Still checking
  // - User dismissed it
  // - Stripe is properly configured
  if (checking || isDismissed || stripeConfigured) {
    return null;
  }

  return (
    <div className="hidden md:block bg-purple-600 text-white py-3 px-4 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div className="text-sm">
            <span className="font-semibold">🔐 Stripe Setup Required:</span> Add your STRIPE_SECRET_KEY to enable payment processing.
            <button 
              onClick={handleOpenSupabase}
              className="ml-2 underline hover:text-purple-100"
            >
              Configure Now
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenStripe}
            className="text-xs bg-white text-purple-600 px-3 py-1.5 rounded hover:bg-purple-50 transition-colors flex items-center gap-1 flex-shrink-0"
          >
            Get Stripe Key
            <ExternalLink className="w-3 h-3" />
          </button>
          
          <button
            onClick={handleOpenSupabase}
            className="text-xs bg-purple-700 text-white px-3 py-1.5 rounded hover:bg-purple-800 transition-colors flex items-center gap-1 flex-shrink-0"
          >
            Add to Supabase
            <ExternalLink className="w-3 h-3" />
          </button>
          
          <button
            onClick={handleDismiss}
            className="text-white hover:text-purple-100 transition-colors flex-shrink-0 ml-2"
            aria-label="Dismiss banner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
