import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { AlertTriangle, CheckCircle2, Copy, ExternalLink, X } from 'lucide-react';
import { projectId } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

export function CriticalFixBanner() {
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem('critical_fix_banner_dismissed') === 'true';
  });

  const handleDismiss = () => {
    localStorage.setItem('critical_fix_banner_dismissed', 'true');
    setDismissed(true);
  };

  const copyCommand = () => {
    const command = 'supabase functions deploy server';
    navigator.clipboard.writeText(command).then(() => {
      toast.success('Command copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy. Please copy manually.');
    });
  };

  if (dismissed) return null;

  return (
    <Card className="border-4 border-orange-500 bg-gradient-to-r from-orange-50 to-yellow-50 shadow-2xl">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-orange-900 mb-2">
                🔧 CRITICAL FIX APPLIED - REDEPLOY REQUIRED!
              </h2>
              <p className="text-orange-800">
                Your Edge Function was failing due to incorrect file extension imports. 
                <strong className="font-bold"> I've fixed the code</strong>, but you need to <strong className="font-bold">redeploy</strong> for it to take effect!
              </p>
            </div>

            <div className="bg-white border-2 border-orange-300 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-900">What I Fixed:</span>
              </div>
              <ul className="space-y-1 text-sm text-gray-700 ml-7">
                <li>• Updated module imports to use correct .tsx extensions</li>
                <li>• Fixed all file paths in index.tsx, payments.tsx, and shipping.tsx</li>
                <li>• Fixed dynamic imports in webhook handlers</li>
              </ul>
            </div>

            <div className="bg-orange-100 border-2 border-orange-400 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-700" />
                <span className="font-semibold text-orange-900">Action Required:</span>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-orange-800 font-semibold">
                  Run this command in your terminal:
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-gray-900 text-green-400 px-4 py-3 rounded-lg font-mono text-sm">
                    supabase functions deploy server
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyCommand}
                    className="flex-shrink-0"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
              <div className="font-semibold text-blue-900 mb-2">📊 After Deployment:</div>
              <ol className="text-sm text-blue-800 space-y-1 ml-4 list-decimal">
                <li>Come back to this page and refresh</li>
                <li>Go to the "🔬 FIX NOW" tab</li>
                <li>Run the Quick Connection Test</li>
                <li>You should see ✅ "Edge Function is responding!"</li>
              </ol>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                size="lg"
                variant="default"
                className="flex-1 bg-orange-600 hover:bg-orange-700"
                asChild
              >
                <a
                  href={`https://supabase.com/dashboard/project/${projectId}/functions`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-5 h-5" />
                  View Supabase Dashboard
                </a>
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                onClick={handleDismiss}
                className="px-6"
              >
                <X className="w-5 h-5 mr-2" />
                Dismiss (I'll deploy later)
              </Button>
            </div>

            <div className="text-xs text-gray-600 pt-2">
              💡 <strong>Tip:</strong> The deployment usually takes 30-60 seconds. 
              After you see the success message, wait a moment before testing.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
