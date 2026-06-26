import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { AlertCircle, CheckCircle, Loader2, XCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

type TestStatus = 'idle' | 'loading' | 'success' | 'error';

interface TestResult {
  status: TestStatus;
  message: string;
  details?: any;
  error?: string;
}

export function QuickHealthCheck() {
  const [healthCheck, setHealthCheck] = useState<TestResult>({ status: 'idle', message: '' });
  const [envCheck, setEnvCheck] = useState<TestResult>({ status: 'idle', message: '' });

  const runHealthCheck = async () => {
    setHealthCheck({ status: 'loading', message: 'Testing...' });
    
    try {
      const url = `https://${projectId}.supabase.co/functions/v1/server/health`;
      console.log('Health check URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setHealthCheck({ 
        status: 'success', 
        message: '✅ Edge Function is online and responding!',
        details: data
      });
    } catch (error: any) {
      console.error('Health check error:', error);
      setHealthCheck({ 
        status: 'error', 
        message: '❌ Edge Function is not accessible',
        error: error.message
      });
    }
  };

  const runEnvCheck = async () => {
    setEnvCheck({ status: 'loading', message: 'Checking...' });
    
    try {
      const url = `https://${projectId}.supabase.co/functions/v1/server/debug-env`;
      console.log('Environment check URL:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Environment data:', data);
      
      // Check if Stripe is configured
      if (!data.stripe?.configured) {
        setEnvCheck({ 
          status: 'error', 
          message: '❌ STRIPE_SECRET_KEY is not configured in Edge Function',
          details: data
        });
      } else if (!data.stripe?.isValid) {
        setEnvCheck({ 
          status: 'error', 
          message: '⚠️ Stripe key is set but invalid format',
          details: data
        });
      } else {
        setEnvCheck({ 
          status: 'success', 
          message: '✅ All environment variables configured correctly!',
          details: data
        });
      }
    } catch (error: any) {
      console.error('Environment check error:', error);
      setEnvCheck({ 
        status: 'error', 
        message: '❌ Cannot check environment variables',
        error: error.message
      });
    }
  };

  const runAllTests = async () => {
    await runHealthCheck();
    // Wait a bit before next test
    await new Promise(resolve => setTimeout(resolve, 500));
    await runEnvCheck();
  };

  const getStatusIcon = (status: TestStatus) => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: TestStatus) => {
    const classes = {
      'idle': 'bg-gray-100 text-gray-600',
      'loading': 'bg-blue-100 text-blue-700',
      'success': 'bg-green-100 text-green-700',
      'error': 'bg-red-100 text-red-700'
    };
    
    const labels = {
      'idle': 'Not tested',
      'loading': 'Testing...',
      'success': 'Passed',
      'error': 'Failed'
    };

    return (
      <span className={`px-3 py-1 rounded-full ${classes[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔍 Quick System Diagnostic
        </CardTitle>
        <CardDescription>
          Test if your Edge Function is deployed and Stripe is configured
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Run All Button */}
        <div className="flex gap-3">
          <Button onClick={runAllTests} size="lg" className="flex-1">
            <Loader2 className="mr-2 h-4 w-4" />
            Run All Diagnostic Tests
          </Button>
        </div>

        {/* Test Results */}
        <div className="space-y-4">
          {/* Health Check */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(healthCheck.status)}
                <div>
                  <h3 className="font-medium">Test 1: Edge Function Health</h3>
                  <p className="text-sm text-muted-foreground">
                    Verifies the Edge Function is deployed and accessible
                  </p>
                </div>
              </div>
              {getStatusBadge(healthCheck.status)}
            </div>
            
            {healthCheck.message && (
              <div className={`p-3 rounded ${
                healthCheck.status === 'success' ? 'bg-green-50' : 
                healthCheck.status === 'error' ? 'bg-red-50' : 'bg-gray-50'
              }`}>
                <p className="text-sm">{healthCheck.message}</p>
                {healthCheck.error && (
                  <p className="text-sm text-red-600 mt-2">
                    Error: {healthCheck.error}
                  </p>
                )}
                {healthCheck.details && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-medium">
                      View Details
                    </summary>
                    <pre className="text-xs mt-2 p-2 bg-white rounded overflow-auto">
                      {JSON.stringify(healthCheck.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            )}
          </div>

          {/* Environment Check */}
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(envCheck.status)}
                <div>
                  <h3 className="font-medium">Test 2: Stripe Configuration</h3>
                  <p className="text-sm text-muted-foreground">
                    Checks if STRIPE_SECRET_KEY is set and valid
                  </p>
                </div>
              </div>
              {getStatusBadge(envCheck.status)}
            </div>
            
            {envCheck.message && (
              <div className={`p-3 rounded ${
                envCheck.status === 'success' ? 'bg-green-50' : 
                envCheck.status === 'error' ? 'bg-red-50' : 'bg-gray-50'
              }`}>
                <p className="text-sm">{envCheck.message}</p>
                {envCheck.error && (
                  <p className="text-sm text-red-600 mt-2">
                    Error: {envCheck.error}
                  </p>
                )}
                {envCheck.details && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-medium">
                      View Configuration Status
                    </summary>
                    <pre className="text-xs mt-2 p-2 bg-white rounded overflow-auto max-h-60">
                      {JSON.stringify(envCheck.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Troubleshooting Guide */}
        <div className="border-t pt-4 space-y-3">
          <h3 className="font-medium">📚 If Tests Fail:</h3>
          <div className="space-y-2 text-sm">
            <div className="flex gap-2">
              <span className="text-red-500">❌</span>
              <div>
                <strong>Health Check Failed:</strong>
                <p className="text-muted-foreground">
                  Your Edge Function isn't accessible. Check if it's deployed in Supabase Dashboard → Edge Functions
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="text-red-500">❌</span>
              <div>
                <strong>Stripe Not Configured:</strong>
                <p className="text-muted-foreground">
                  Go to Supabase Dashboard → Edge Functions → Secrets → Add STRIPE_SECRET_KEY
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <span className="text-yellow-500">⚠️</span>
              <div>
                <strong>Invalid Stripe Key Format:</strong>
                <p className="text-muted-foreground">
                  Your key should start with "sk_test_" or "sk_live_". Double-check you copied it correctly.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Copy */}
        <div className="border-t pt-4">
          <h3 className="font-medium mb-2">🔗 Your Edge Function URL:</h3>
          <code className="block p-3 bg-gray-100 rounded text-sm break-all">
            https://{projectId}.supabase.co/functions/v1/server/health
          </code>
          <p className="text-sm text-muted-foreground mt-2">
            You can also test this URL directly in your browser (should return JSON)
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
