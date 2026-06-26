import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface TestResult {
  test: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  message?: string;
  details?: any;
}

export function FrontendVerification() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);

  const updateResult = (test: string, status: TestResult['status'], message?: string, details?: any) => {
    setResults(prev => {
      const existing = prev.find(r => r.test === test);
      if (existing) {
        return prev.map(r => r.test === test ? { ...r, status, message, details } : r);
      }
      return [...prev, { test, status, message, details }];
    });
  };

  const runAllTests = async () => {
    setRunning(true);
    setResults([]);

    // Test 1: Environment Variables
    updateResult('env-vars', 'running');
    if (!projectId || !publicAnonKey) {
      updateResult('env-vars', 'failed', 'Missing environment variables', { projectId: !!projectId, publicAnonKey: !!publicAnonKey });
    } else {
      updateResult('env-vars', 'passed', '✅ Environment variables configured', { 
        projectId: projectId,
        anonKeyPreview: publicAnonKey.substring(0, 20) + '...'
      });
    }

    // Test 2: Health Endpoint
    updateResult('health', 'running');
    try {
      const url = `https://${projectId}.supabase.co/functions/v1/server/health`;
      console.log('Testing:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        updateResult('health', 'passed', '✅ Health endpoint working', data);
      } else {
        updateResult('health', 'failed', `❌ HTTP ${response.status}`, data);
      }
    } catch (error: any) {
      updateResult('health', 'failed', '❌ Fetch failed', { error: error.message });
    }

    // Test 3: Debug Env Endpoint
    updateResult('debug-env', 'running');
    try {
      const url = `https://${projectId}.supabase.co/functions/v1/server/debug-env`;
      console.log('Testing:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        updateResult('debug-env', 'passed', '✅ Debug endpoint working', data);
      } else {
        updateResult('debug-env', 'failed', `❌ HTTP ${response.status}`, data);
      }
    } catch (error: any) {
      updateResult('debug-env', 'failed', '❌ Fetch failed', { error: error.message });
    }

    // Test 4: Get Price Endpoint
    updateResult('get-price', 'running');
    try {
      const url = `https://${projectId}.supabase.co/functions/v1/server/get-price`;
      console.log('Testing:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          material: 'sterling-silver',
          items: [{ letter: 'A', quantity: 1, size: 'medium' }],
          pendantStyle: 'none',
          bailOptions: [],
          extraJumpRings: 0
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        updateResult('get-price', 'passed', '✅ Price calculation working', data);
      } else {
        updateResult('get-price', 'failed', `❌ HTTP ${response.status}`, data);
      }
    } catch (error: any) {
      updateResult('get-price', 'failed', '❌ Fetch failed', { error: error.message });
    }

    // Test 5: CORS Check
    updateResult('cors', 'running');
    try {
      const url = `https://${projectId}.supabase.co/functions/v1/server/health`;
      
      const response = await fetch(url, {
        method: 'OPTIONS',
        headers: {
          'Origin': window.location.origin,
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Authorization, Content-Type'
        }
      });

      if (response.ok || response.status === 204) {
        updateResult('cors', 'passed', '✅ CORS configured correctly');
      } else {
        updateResult('cors', 'failed', `❌ CORS issue: ${response.status}`);
      }
    } catch (error: any) {
      updateResult('cors', 'failed', '❌ CORS check failed', { error: error.message });
    }

    setRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case 'passed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>🔍 Frontend Configuration Verification</CardTitle>
        <CardDescription>
          Verify all frontend components can reach the Edge Function
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <Button onClick={runAllTests} disabled={running} className="flex-1">
            {running ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              <>Run All Verification Tests</>
            )}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-3">
            {results.map((result) => (
              <div key={result.test} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <h3 className="font-medium capitalize">{result.test.replace('-', ' ')}</h3>
                    {result.message && (
                      <p className="text-sm text-muted-foreground">{result.message}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    result.status === 'passed' ? 'bg-green-100 text-green-700' :
                    result.status === 'failed' ? 'bg-red-100 text-red-700' :
                    result.status === 'running' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {result.status}
                  </span>
                </div>

                {result.details && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                      View Details
                    </summary>
                    <pre className="text-xs mt-2 p-3 bg-gray-50 rounded overflow-auto max-h-40">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="border-t pt-4 space-y-3">
          <h3 className="font-medium">📋 Configuration Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="p-3 bg-gray-50 rounded">
              <p className="font-medium">Project ID:</p>
              <code className="text-xs">{projectId || 'NOT SET'}</code>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <p className="font-medium">Anon Key:</p>
              <code className="text-xs break-all">
                {publicAnonKey ? `${publicAnonKey.substring(0, 30)}...` : 'NOT SET'}
              </code>
            </div>
            <div className="p-3 bg-gray-50 rounded">
              <p className="font-medium">Edge Function URL:</p>
              <code className="text-xs break-all">
                https://{projectId}.supabase.co/functions/v1/server
              </code>
            </div>
          </div>
        </div>

        <div className="border-t pt-4 space-y-2">
          <h3 className="font-medium">🛠️ Troubleshooting</h3>
          <div className="text-sm space-y-2 text-muted-foreground">
            <p>• <strong>Environment Variables:</strong> Make sure projectId and publicAnonKey are set in /utils/supabase/info.tsx</p>
            <p>• <strong>CORS Issues:</strong> Edge Function should have CORS enabled with origin: &quot;*&quot;</p>
            <p>• <strong>Authorization Header:</strong> All requests must include Authorization: Bearer with your anon key</p>
            <p>• <strong>404 Errors:</strong> Verify the Edge Function is deployed with the correct name &quot;server&quot;</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
