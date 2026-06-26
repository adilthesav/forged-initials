import { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { CheckCircle2, XCircle, Loader2, AlertTriangle } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

type SystemStatus = 'checking' | 'healthy' | 'degraded' | 'down' | 'error';

interface StatusInfo {
  status: SystemStatus;
  message: string;
  details?: string;
  color: string;
  icon: React.ReactNode;
}

export function SystemStatusIndicator() {
  const [status, setStatus] = useState<StatusInfo>({
    status: 'checking',
    message: 'Checking system status...',
    color: 'bg-blue-100 border-blue-300 text-blue-900',
    icon: <Loader2 className="w-5 h-5 animate-spin" />
  });

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const checkSystemStatus = async () => {
    try {
      // Quick health check
      const healthUrl = `https://${projectId}.supabase.co/functions/v1/server/health`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        // System is up, now check configuration
        const envUrl = `https://${projectId}.supabase.co/functions/v1/server/debug-env`;
        try {
          const envResponse = await fetch(envUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`
            }
          });

          if (envResponse.ok) {
            const envData = await envResponse.json();
            const hasDiscord = envData.discord?.configured && envData.discord?.startsWithHttp;
            const hasStripe = envData.stripe?.configured && envData.stripe?.isValid;

            if (hasDiscord && hasStripe) {
              setStatus({
                status: 'healthy',
                message: '✅ All Systems Operational',
                details: 'Function deployed, Discord configured, Stripe ready',
                color: 'bg-green-100 border-green-300 text-green-900',
                icon: <CheckCircle2 className="w-5 h-5" />
              });
            } else {
              setStatus({
                status: 'degraded',
                message: '⚠️ Partially Configured',
                details: `Missing: ${!hasDiscord ? 'Discord ' : ''}${!hasStripe ? 'Stripe' : ''}`,
                color: 'bg-yellow-100 border-yellow-300 text-yellow-900',
                icon: <AlertTriangle className="w-5 h-5" />
              });
            }
          } else {
            setStatus({
              status: 'degraded',
              message: '⚠️ Configuration Check Failed',
              details: 'Function is running but some endpoints may not work',
              color: 'bg-yellow-100 border-yellow-300 text-yellow-900',
              icon: <AlertTriangle className="w-5 h-5" />
            });
          }
        } catch {
          setStatus({
            status: 'healthy',
            message: '✅ Function Deployed',
            details: 'Core function is running',
            color: 'bg-green-100 border-green-300 text-green-900',
            icon: <CheckCircle2 className="w-5 h-5" />
          });
        }
      } else {
        setStatus({
          status: 'down',
          message: '❌ Function Not Responding',
          details: `HTTP ${response.status} - May need deployment`,
          color: 'bg-red-100 border-red-300 text-red-900',
          icon: <XCircle className="w-5 h-5" />
        });
      }
    } catch (error: any) {
      const isNetworkError = 
        error.name === 'TypeError' || 
        error.message.includes('Failed to fetch') ||
        error.message.includes('aborted');

      if (isNetworkError) {
        setStatus({
          status: 'down',
          message: '🔴 Function Not Deployed',
          details: 'Run: supabase functions deploy server',
          color: 'bg-red-100 border-red-300 text-red-900',
          icon: <XCircle className="w-5 h-5" />
        });
      } else {
        setStatus({
          status: 'error',
          message: '❌ Status Check Failed',
          details: error.message,
          color: 'bg-red-100 border-red-300 text-red-900',
          icon: <XCircle className="w-5 h-5" />
        });
      }
    }
  };

  return (
    <Card className={`p-4 border-2 ${status.color} transition-all duration-300`}>
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          {status.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold">
            {status.message}
          </div>
          {status.details && (
            <div className="text-sm opacity-90 mt-0.5">
              {status.details}
            </div>
          )}
        </div>
        {status.status === 'checking' && (
          <div className="text-xs opacity-75">
            Testing...
          </div>
        )}
      </div>
    </Card>
  );
}
