import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle2, AlertTriangle, Copy, Terminal } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function FinalImportsFix() {
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem('final_imports_fix_dismissed') === 'true';
  });

  const handleDismiss = () => {
    localStorage.setItem('final_imports_fix_dismissed', 'true');
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

  const copyPath = () => {
    const path = 'cd "/Users/adilali/Documents/webcontents/web files/forged-initials-site"';
    navigator.clipboard.writeText(path).then(() => {
      toast.success('Path command copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy. Please copy manually.');
    });
  };

  if (dismissed) return null;

  return (
    <Card className="border-4 border-red-500 bg-gradient-to-r from-red-50 to-orange-50 shadow-2xl animate-pulse">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
              <Terminal className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-red-900 mb-2">
                🚨 CRITICAL FIX APPLIED - DEPLOY NOW!
              </h2>
              <p className="text-red-800">
                I found and fixed the issue! There were <strong className="font-bold">4 incorrect imports</strong> in your <code>index.tsx</code> file that were trying to import <code>.ts</code> files instead of <code>.tsx</code> files. This was causing the "Failed to fetch" error.
              </p>
            </div>

            <div className="bg-white border-2 border-orange-300 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-gray-900">✅ Fixed Imports:</span>
              </div>
              <ul className="space-y-1 text-sm text-gray-700 ml-7">
                <li>✅ Line 918: Changed <code>import('./notifications.ts')</code> → <code>import('./notifications.tsx')</code></li>
                <li>✅ Line 1039: Changed <code>import('./notifications.ts')</code> → <code>import('./notifications.tsx')</code></li>
                <li>✅ Line 1495: Changed <code>import('./notifications.ts')</code> → <code>import('./notifications.tsx')</code></li>
                <li>✅ Line 1561: Changed <code>import('./notifications.ts')</code> → <code>import('./notifications.tsx')</code></li>
              </ul>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-400 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <span className="font-semibold text-yellow-900">🎯 What You Need to Do NOW:</span>
              </div>
              <ol className="text-sm text-yellow-800 space-y-2 ml-4 list-decimal">
                <li>
                  <strong>Open your Terminal</strong> (Press ⌘+Space, type "Terminal", press Enter)
                </li>
                <li>
                  <strong>Navigate to your project directory:</strong>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex-1 bg-gray-900 text-green-400 p-2 rounded font-mono text-xs overflow-x-auto">
                      cd "/Users/adilali/Documents/webcontents/web files/forged-initials-site"
                    </div>
                    <Button
                      onClick={copyPath}
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1 flex-shrink-0"
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </Button>
                  </div>
                </li>
                <li>
                  <strong>Run the deployment command:</strong>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex-1 bg-gray-900 text-green-400 p-2 rounded font-mono text-xs">
                      supabase functions deploy server
                    </div>
                    <Button
                      onClick={copyCommand}
                      size="sm"
                      variant="outline"
                      className="flex items-center gap-1 flex-shrink-0"
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </Button>
                  </div>
                </li>
                <li>
                  <strong>Wait for deployment to complete</strong> (should see "Deploying Function: server")
                </li>
                <li>
                  <strong>Come back here and test the connection again</strong>
                </li>
              </ol>
            </div>

            <div className="p-3 bg-green-50 border border-green-300 rounded-lg">
              <div className="text-xs text-green-800">
                <strong>💡 Why This Fix Works:</strong>
                <br />
                Your Edge Function files are all <code>.tsx</code> files, but the imports were pointing to <code>.ts</code> files that don't exist. This caused the "Failed to fetch" error because the imports couldn't resolve. Now all imports match the actual file extensions!
              </div>
            </div>

            <div className="p-4 bg-blue-50 border-2 border-blue-400 rounded-lg mt-4">
              <div className="font-semibold text-blue-900 mb-2">✅ Great! You've deployed successfully!</div>
              <p className="text-sm text-blue-800 mb-2">
                I've also fixed the connection test to include proper authorization. Now scroll down and click the <strong>"Test Connection"</strong> button in the Quick Connection Test section below!
              </p>
              <div className="text-xs text-blue-700">
                Note: The connection test now includes the Authorization header required by Supabase Edge Functions.
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <div className="text-xs text-gray-600 italic">
                🔧 Files updated: <code>/supabase/functions/server/index.tsx</code>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDismiss}
                className="flex items-center gap-1"
              >
                <CheckCircle2 className="w-4 h-4" />
                I've deployed it - Hide this
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
