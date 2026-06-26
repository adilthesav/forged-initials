import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle2, XCircle, Loader2, AlertCircle, Terminal, ExternalLink } from 'lucide-react';
import { projectId } from '../utils/supabase/info';

export function InstantDiagnostic() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runQuickTest = async () => {
    setTesting(true);
    setResult(null);

    const healthUrl = `https://${projectId}.supabase.co/functions/v1/server/health`;

    try {
      console.log('Testing:', healthUrl);
      
      const response = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setResult({
          status: 'success',
          message: '✅ Edge Function is DEPLOYED and working!',
          data: data,
          nextStep: 'Now you can proceed with adding the Discord webhook secret and testing.'
        });
      } else {
        setResult({
          status: 'error',
          message: '❌ Edge Function returned an error',
          httpStatus: response.status,
          nextStep: 'The function exists but has an error. Check the logs.'
        });
      }
    } catch (error: any) {
      setResult({
        status: 'not-deployed',
        message: '🚨 Edge Function is NOT DEPLOYED!',
        error: error.message,
        nextStep: 'You need to deploy it first using the Supabase CLI or Dashboard.'
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              🚨 Getting "Failed to Fetch" Errors?
            </h3>
            <p className="text-sm text-gray-700 mb-3">
              This means your Edge Function is <strong>NOT deployed to Supabase</strong> yet.
              Click the button below to check if it's deployed.
            </p>
          </div>
        </div>

        <Button 
          onClick={runQuickTest}
          disabled={testing}
          className="w-full bg-red-600 hover:bg-red-700"
          size="lg"
        >
          {testing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Testing Connection...
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 mr-2" />
              🔍 Test If Edge Function Is Deployed
            </>
          )}
        </Button>

        {result && (
          <div className={`p-4 rounded-lg border-2 ${
            result.status === 'success' 
              ? 'bg-green-50 border-green-300' 
              : 'bg-red-50 border-red-300'
          }`}>
            <div className="flex items-start gap-3">
              {result.status === 'success' ? (
                <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className={`font-semibold mb-2 ${
                  result.status === 'success' ? 'text-green-900' : 'text-red-900'
                }`}>
                  {result.message}
                </div>

                {result.data && (
                  <div className="text-sm text-green-800 mb-3">
                    <div>Version: {result.data.version}</div>
                    <div>Status: {result.data.status}</div>
                  </div>
                )}

                {result.httpStatus && (
                  <div className="text-sm text-red-800 mb-3">
                    HTTP Status: {result.httpStatus}
                  </div>
                )}

                {result.error && (
                  <div className="text-sm text-red-800 mb-3 font-mono bg-white p-2 rounded border border-red-300">
                    {result.error}
                  </div>
                )}

                <div className={`text-sm font-medium mb-3 ${
                  result.status === 'success' ? 'text-green-900' : 'text-red-900'
                }`}>
                  📋 Next Step:
                </div>
                <div className={`text-sm ${
                  result.status === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {result.nextStep}
                </div>

                {result.status === 'not-deployed' && (
                  <div className="mt-4 space-y-4">
                    <div className="p-4 bg-white border-2 border-red-400 rounded-lg">
                      <div className="font-semibold text-red-900 mb-3 flex items-center gap-2">
                        <Terminal className="w-5 h-5" />
                        Deploy Using Supabase CLI (Fastest):
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="text-red-800 mb-2">
                          Open your terminal in the project folder and run:
                        </div>
                        <code className="block bg-gray-900 text-green-400 p-3 rounded font-mono text-xs">
                          supabase functions deploy server
                        </code>
                        <div className="text-xs text-red-700 mt-2">
                          Don't have Supabase CLI? Install it first:
                        </div>
                        <code className="block bg-gray-900 text-blue-400 p-2 rounded font-mono text-xs">
                          npm install -g supabase
                        </code>
                      </div>
                    </div>

                    <div className="p-4 bg-white border border-red-300 rounded-lg">
                      <div className="font-semibold text-red-900 mb-3">
                        Or Deploy via Supabase Dashboard:
                      </div>
                      <ol className="list-decimal ml-5 space-y-2 text-sm text-red-800">
                        <li>
                          <a
                            href={`https://supabase.com/dashboard/project/${projectId}/functions`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 underline font-medium"
                          >
                            Open Supabase Edge Functions
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </li>
                        <li>Click "Deploy a new function" or find the "server" function</li>
                        <li>Deploy or redeploy it</li>
                        <li>Come back and test again</li>
                      </ol>
                    </div>

                    <div className="text-xs text-red-600 bg-white p-3 rounded border border-red-300">
                      <strong>⚠️ Important:</strong> The Edge Function code is in your local files 
                      at <code className="bg-red-100 px-1">/supabase/functions/server/</code> but 
                      it needs to be uploaded to Supabase servers. That's what deployment does!
                    </div>
                  </div>
                )}

                {result.status === 'success' && (
                  <div className="mt-4 p-4 bg-white border-2 border-green-400 rounded-lg">
                    <div className="font-semibold text-green-900 mb-2">🎉 Great! Now:</div>
                    <ol className="list-decimal ml-5 space-y-1 text-sm text-green-800">
                      <li>Go to "🚀 Setup" tab</li>
                      <li>Add your Discord webhook URL to Supabase secrets</li>
                      <li>Redeploy the Edge Function</li>
                      <li>Test the Discord notification</li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <div className="font-medium mb-1">🔍 What this test does:</div>
          <div>Tests if the Edge Function is accessible at:</div>
          <code className="block mt-1 text-xs bg-white p-2 rounded border">
            https://{projectId}.supabase.co/functions/v1/server/health
          </code>
        </div>
      </div>
    </Card>
  );
}
