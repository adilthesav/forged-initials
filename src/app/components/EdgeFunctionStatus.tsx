import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle2, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function EdgeFunctionStatus() {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkHealth = async () => {
    setStatus('checking');
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/health`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      if (response.ok) {
        setStatus('online');
        setLastChecked(new Date());
      } else {
        setStatus('offline');
        setLastChecked(new Date());
      }
    } catch (error) {
      setStatus('offline');
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    checkHealth();
    // Check every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  // Don't show anything if online
  if (status === 'online') {
    return null;
  }

  // Show checking state
  if (status === 'checking') {
    return (
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
        <div className="flex items-center">
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin mr-3" />
          <p className="text-sm text-blue-700">Checking backend status...</p>
        </div>
      </div>
    );
  }

  // Show offline alert
  return (
    <Alert className="bg-yellow-50 border-yellow-400 mb-6">
      <AlertCircle className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="text-yellow-900">
        <div className="space-y-2">
          <p className="mb-2">
            <strong>⚠️ Edge Function Not Deployed</strong>
          </p>
          <p className="text-sm">
            The payment backend isn't deployed yet. The website will use local pricing calculations as a fallback, but payment processing won't work until you deploy.
          </p>
          <div className="mt-3 space-y-1 text-sm">
            <p><strong>Quick Deploy:</strong></p>
            <ol className="list-decimal ml-5 space-y-1">
              <li>Open your terminal</li>
              <li>Navigate to your project folder</li>
              <li>Run: <code className="bg-yellow-100 px-2 py-0.5 rounded">supabase functions deploy server</code></li>
            </ol>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <a 
              href="https://supabase.com/docs/guides/functions/deploy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-700 underline flex items-center gap-1"
            >
              Deployment Guide <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-gray-400">•</span>
            <button
              onClick={checkHealth}
              className="text-sm text-blue-600 hover:text-blue-700 underline"
            >
              Check Again
            </button>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
