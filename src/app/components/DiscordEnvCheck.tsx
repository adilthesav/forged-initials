import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function DiscordEnvCheck() {
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<any>(null);

  const checkDiscordConfig = async () => {
    setChecking(true);
    setResult(null);
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/debug-env`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setResult(data);
      } else {
        setResult({ error: `HTTP ${response.status}` });
      }
    } catch (error: any) {
      setResult({ error: error.message || 'Failed to check environment' });
    } finally {
      setChecking(false);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      <div>
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          🔍 Discord Environment Check
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Verify if the Discord webhook URL is configured in Supabase Edge Function secrets.
        </p>
      </div>

      <Button 
        onClick={checkDiscordConfig}
        disabled={checking}
        className="w-full"
      >
        {checking ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Checking Discord Config...
          </>
        ) : (
          '🔍 Check Discord Webhook Status'
        )}
      </Button>

      {result && (
        <div className="space-y-3 mt-4">
          {result.error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <XCircle className="w-5 h-5" />
                <span className="font-semibold">Error checking environment</span>
              </div>
              <p className="text-sm text-red-700 mt-2">{result.error}</p>
            </div>
          ) : result.discord ? (
            <div>
              <div className={`p-4 rounded-lg border ${
                result.discord.configured && result.discord.startsWithHttp
                  ? 'bg-green-50 border-green-200'
                  : 'bg-orange-50 border-orange-200'
              }`}>
                <div className="flex items-start gap-2">
                  {result.discord.configured && result.discord.startsWithHttp ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className={`font-semibold ${
                      result.discord.configured && result.discord.startsWithHttp
                        ? 'text-green-900'
                        : 'text-orange-900'
                    }`}>
                      Discord Webhook URL
                    </div>
                    <div className="text-sm mt-1">
                      <div className="space-y-1">
                        <div>
                          <span className="text-gray-600">Configured:</span>{' '}
                          <span className={result.discord.configured ? 'text-green-700' : 'text-red-700'}>
                            {result.discord.configured ? '✅ Yes' : '❌ No'}
                          </span>
                        </div>
                        {result.discord.configured && (
                          <>
                            <div>
                              <span className="text-gray-600">Length:</span>{' '}
                              <span className="text-gray-800">{result.discord.length} characters</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Valid URL:</span>{' '}
                              <span className={result.discord.startsWithHttp ? 'text-green-700' : 'text-red-700'}>
                                {result.discord.startsWithHttp ? '✅ Yes (starts with http)' : '❌ No (should start with https://)'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Preview:</span>{' '}
                              <code className="text-xs bg-white px-2 py-1 rounded border">
                                {result.discord.preview}
                              </code>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {!result.discord.configured && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                  <div className="font-semibold mb-1">⚠️ Action Required:</div>
                  <p>
                    The Discord webhook URL is not configured. Follow the setup guide above to add it to Supabase Edge Function secrets.
                  </p>
                </div>
              )}

              {result.discord.configured && !result.discord.startsWithHttp && (
                <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-800">
                  <div className="font-semibold mb-1">⚠️ Invalid URL Format:</div>
                  <p>
                    The Discord webhook URL should start with "https://discord.com/api/webhooks/". 
                    Please check the value in Supabase Edge Function secrets.
                  </p>
                </div>
              )}

              {result.discord.configured && result.discord.startsWithHttp && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                  <div className="font-semibold mb-1">✅ Looks Good!</div>
                  <p>
                    Your Discord webhook URL appears to be configured correctly. 
                    Try the test button below to send a test notification to Discord.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <pre className="text-xs overflow-auto">{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
