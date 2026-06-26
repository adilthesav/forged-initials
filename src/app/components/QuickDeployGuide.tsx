import { Card } from './ui/card';
import { Terminal, Rocket } from 'lucide-react';

export function QuickDeployGuide() {
  return (
    <Card className="p-6 space-y-4 bg-blue-50 border-2 border-blue-300">
      <div className="flex items-start gap-3">
        <Rocket className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 mb-2">
            🚀 Deploy Your Edge Function (5 Minutes)
          </h3>
          <p className="text-sm text-blue-800 mb-4">
            Your Discord bot code is ready, but needs to be deployed to Supabase!
          </p>

          <div className="bg-white rounded-lg p-4 space-y-3 border border-blue-200">
            <div className="flex items-start gap-2">
              <Terminal className="w-4 h-4 text-blue-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <div className="font-semibold text-sm text-blue-900 mb-2">Terminal Commands:</div>
                
                <div className="space-y-2">
                  <div>
                    <div className="text-xs text-gray-600 mb-1">1. Install Supabase CLI:</div>
                    <code className="block bg-gray-900 text-green-400 p-2 rounded text-xs">
                      npm install -g supabase
                    </code>
                  </div>

                  <div>
                    <div className="text-xs text-gray-600 mb-1">2. Login to Supabase:</div>
                    <code className="block bg-gray-900 text-green-400 p-2 rounded text-xs">
                      supabase login
                    </code>
                  </div>

                  <div>
                    <div className="text-xs text-gray-600 mb-1">3. Link your project:</div>
                    <code className="block bg-gray-900 text-green-400 p-2 rounded text-xs">
                      supabase link --project-ref vpxuizymtmcnsgmpnhel
                    </code>
                  </div>

                  <div>
                    <div className="text-xs text-gray-600 mb-1">4. Deploy the function:</div>
                    <code className="block bg-gray-900 text-green-400 p-2 rounded text-xs">
                      supabase functions deploy server
                    </code>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-3 mt-3">
              <div className="text-xs text-gray-600 space-y-1">
                <p>💡 <strong>Tip:</strong> Run these commands from your project directory</p>
                <p>📁 Make sure you're in the folder containing the <code className="bg-gray-100 px-1">supabase/</code> directory</p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-xs">
            <strong>⚠️ First time?</strong> When running <code className="bg-white px-1">supabase login</code>, 
            it will open your browser to authenticate. Just follow the prompts!
          </div>
        </div>
      </div>
    </Card>
  );
}
