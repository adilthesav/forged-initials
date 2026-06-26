import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { CheckCircle2, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface EndpointTest {
  name: string;
  path: string;
  method: 'GET' | 'POST';
  status: 'pending' | 'success' | 'error' | 'not-found';
  message?: string;
}

export function DeploymentChecker() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<EndpointTest[]>([]);

  const checkDeployment = async () => {
    setTesting(true);
    
    const endpoints: EndpointTest[] = [
      { name: 'Health Check', path: '/health', method: 'GET', status: 'pending' },
      { name: 'Test Notification', path: '/test-notification', method: 'GET', status: 'pending' },
      { name: 'Test Discord Notification', path: '/test-discord-notification', method: 'GET', status: 'pending' },
      { name: 'Order Test', path: '/order/test', method: 'GET', status: 'pending' },
    ];

    setResults([...endpoints]);

    for (let i = 0; i < endpoints.length; i++) {
      const endpoint = endpoints[i];
      
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/server${endpoint.path}`,
          {
            method: endpoint.method,
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (response.status === 404) {
          endpoint.status = 'not-found';
          endpoint.message = 'Endpoint not found - needs deployment';
        } else if (response.ok) {
          const data = await response.json();
          endpoint.status = 'success';
          endpoint.message = data.message || 'OK';
        } else {
          endpoint.status = 'error';
          endpoint.message = `HTTP ${response.status}`;
        }
      } catch (error: any) {
        endpoint.status = 'error';
        endpoint.message = error.message || 'Failed to fetch';
      }

      setResults([...endpoints]);
    }

    setTesting(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'not-found':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'pending':
        return <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'not-found':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const hasErrors = results.some(r => r.status === 'error' || r.status === 'not-found');
  const allSuccess = results.length > 0 && results.every(r => r.status === 'success');

  return (
    <Card className="p-6 space-y-4">
      <div>
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          🔍 Deployment Status Checker
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Check which endpoints are deployed and working. This helps diagnose "Failed to fetch" errors.
        </p>
      </div>

      <Button 
        onClick={checkDeployment}
        disabled={testing}
        className="w-full"
      >
        {testing ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Checking Endpoints...
          </>
        ) : (
          '🔍 Check Deployment Status'
        )}
      </Button>

      {results.length > 0 && (
        <div className="space-y-3 mt-4">
          <h4 className="font-semibold text-sm">Endpoint Status:</h4>
          
          {results.map((endpoint, idx) => (
            <div 
              key={idx}
              className={`p-3 rounded-lg border ${getStatusColor(endpoint.status)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(endpoint.status)}
                  <div>
                    <div className="font-medium text-sm">{endpoint.name}</div>
                    <div className="text-xs text-gray-600">{endpoint.path}</div>
                  </div>
                </div>
                {endpoint.message && (
                  <div className="text-xs text-gray-600 ml-2">{endpoint.message}</div>
                )}
              </div>
            </div>
          ))}

          {hasErrors && !testing && (
            <div className="mt-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
              <div className="font-semibold text-red-900 mb-2">
                ⚠️ Deployment Required!
              </div>
              <p className="text-sm text-red-800 mb-3">
                Some endpoints are missing or not working. You need to deploy the Edge Function.
              </p>
              
              <div className="bg-white p-3 rounded border border-red-200 text-sm space-y-2">
                <div className="font-semibold text-red-900">📝 Deployment Steps:</div>
                <ol className="list-decimal ml-5 space-y-1 text-red-800">
                  <li>Install Supabase CLI: <code className="bg-red-100 px-1">npm install -g supabase</code></li>
                  <li>Login: <code className="bg-red-100 px-1">supabase login</code></li>
                  <li>Link project: <code className="bg-red-100 px-1">supabase link --project-ref vpxuizymtmcnsgmpnhel</code></li>
                  <li>Deploy function: <code className="bg-red-100 px-1">supabase functions deploy server</code></li>
                </ol>
              </div>
            </div>
          )}

          {allSuccess && (
            <div className="mt-4 p-4 bg-green-50 border-2 border-green-300 rounded-lg">
              <div className="font-semibold text-green-900 mb-2">
                ✅ All Endpoints Working!
              </div>
              <p className="text-sm text-green-800">
                All test endpoints are deployed and accessible. You can now test Discord notifications!
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
