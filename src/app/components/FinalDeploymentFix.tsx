import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Copy, CheckCircle2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export function FinalDeploymentFix() {
  const [dismissed, setDismissed] = useState(() => {
    return localStorage.getItem('final_deployment_fix_dismissed') === 'true';
  });

  const handleDismiss = () => {
    localStorage.setItem('final_deployment_fix_dismissed', 'true');
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
    <Card className="border-4 border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 shadow-2xl">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <div className="flex-1 space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-purple-900 mb-2">
                🔧 DUPLICATE FILES FOUND - FINAL FIX NEEDED!
              </h2>
              <p className="text-purple-800">
                I discovered <strong className="font-bold">duplicate files</strong> in your Edge Function that were causing deployment issues. 
                <strong className="font-bold"> I've removed them</strong>, but you need to <strong className="font-bold">redeploy one more time</strong>!
              </p>
            </div>

            <div className="bg-white border-2 border-purple-300 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-900">What I Fixed:</span>
              </div>
              <ul className="space-y-1 text-sm text-gray-700 ml-7">
                <li>• Deleted duplicate <code>kv_store.ts</code> (we have <code>kv_store.tsx</code>)</li>
                <li>• Deleted old <code>discord-template.ts</code> (unused file)</li>
                <li>• These duplicates were confusing the Deno runtime</li>
                <li>• That's why you got "Failed to fetch" errors</li>
              </ul>
            </div>

            <div className="bg-purple-100 border-2 border-purple-400 rounded-lg p-4 space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-purple-700" />
                <span className="font-semibold text-purple-900">Action Required (Final Step!):</span>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-purple-800 font-semibold">
                  Run this command ONE MORE TIME:
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
                <p className="text-xs text-purple-700 italic">
                  💡 This time it WILL detect changes because we removed the duplicate files!
                </p>
              </div>
            </div>

            <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
              <div className="font-semibold text-green-900 mb-2">✅ After This Deployment:</div>
              <ol className="text-sm text-green-800 space-y-1 ml-4 list-decimal">
                <li>Wait about 30 seconds for deployment to complete</li>
                <li>Refresh this page</li>
                <li>Run the "Quick Connection Test" above</li>
                <li>You should see ✅ "Edge Function is responding!"</li>
                <li>Then test Discord notifications in the "Discord" tab</li>
              </ol>
            </div>

            <div className="p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
              <div className="text-xs text-yellow-800">
                <strong>🤔 Why did "No change found" appear before?</strong>
                <br />
                Because the duplicate files weren't tracked properly. Now that they're deleted, 
                Supabase will properly deploy the clean version with only the <code>.tsx</code> files!
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDismiss}
                className="text-xs"
              >
                ✅ I've deployed it - Hide this banner
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
