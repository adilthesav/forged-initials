import { Card } from './ui/card';
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';

interface EmergencyStatusProps {
  status: 'idle' | 'testing' | 'success' | 'error';
  message?: string;
}

export function EmergencyStatus({ status, message }: EmergencyStatusProps) {
  if (status === 'idle') {
    return (
      <Card className="p-4 bg-yellow-50 border-2 border-yellow-400">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-8 h-8 text-yellow-600 flex-shrink-0" />
          <div>
            <div className="font-bold text-yellow-900">⏳ Not Yet Tested</div>
            <div className="text-sm text-yellow-800">
              Click the button below to diagnose your Discord setup
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (status === 'testing') {
    return (
      <Card className="p-4 bg-blue-50 border-2 border-blue-400">
        <div className="flex items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 flex-shrink-0 animate-spin" />
          <div>
            <div className="font-bold text-blue-900">🔍 Testing Everything...</div>
            <div className="text-sm text-blue-800">
              Checking your Edge Function, secrets, and Discord webhook (5 seconds)
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (status === 'success') {
    return (
      <Card className="p-4 bg-green-50 border-2 border-green-500">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0" />
          <div>
            <div className="font-bold text-green-900 text-lg">🎉 Everything Is Working!</div>
            <div className="text-sm text-green-800">
              {message || 'Your Discord integration is fully operational. Check your Discord channel for the test notification!'}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  if (status === 'error') {
    return (
      <Card className="p-4 bg-red-50 border-2 border-red-500">
        <div className="flex items-center gap-3">
          <XCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
          <div>
            <div className="font-bold text-red-900 text-lg">⚠️ Issue Found</div>
            <div className="text-sm text-red-800">
              {message || 'See the detailed instructions below to fix the issue'}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return null;
}
