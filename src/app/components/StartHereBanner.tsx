import { Card } from './ui/card';
import { Zap, CheckCircle2 } from 'lucide-react';

export function StartHereBanner() {
  return (
    <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 border-0 shadow-xl">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center flex-shrink-0">
          <Zap className="w-9 h-9 text-purple-600" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-3">
            ⚡ Fix Errors in 3 Simple Steps
          </h2>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 font-bold">1</span>
              </div>
              <div>
                <div className="font-semibold mb-1">Check the Status Indicator Below</div>
                <div className="text-white/90">
                  It automatically checks if your system is working. Look for green (good) or red (needs fixing).
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 font-bold">2</span>
              </div>
              <div>
                <div className="font-semibold mb-1">Click "Run Complete Diagnostic"</div>
                <div className="text-white/90">
                  This tests all your endpoints (takes 10 seconds). It will show exactly what's wrong.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-white/10 rounded-lg p-3 backdrop-blur-sm">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <div>
                <div className="font-semibold mb-1">Copy & Paste the Solution</div>
                <div className="text-white/90">
                  The diagnostic gives you the exact command to run. Just copy it and paste in your terminal.
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-white/20 rounded-lg backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <div>
                <strong>That's it!</strong> The tool does all the detective work. You just run the command it gives you.
              </div>
            </div>
          </div>

          <div className="mt-3 text-xs opacity-90">
            💡 <strong>Pro Tip:</strong> Most errors are fixed with one command: <code className="bg-white/20 px-2 py-1 rounded">supabase functions deploy server</code>
          </div>
        </div>
      </div>
    </Card>
  );
}
