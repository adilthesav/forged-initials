import { useState } from 'react';
import { Package, CheckCircle, XCircle, AlertCircle, Loader2, Truck, Map, Shield, RefreshCw } from 'lucide-react';
import { callEdgeFunction, EDGE_FUNCTION_BASE_URL } from '../lib/api-config';

interface TestResult {
  name: string;
  status: 'idle' | 'running' | 'success' | 'error';
  message?: string;
  details?: any;
  timestamp?: string;
}

export function FedExTestingDashboard() {
  const [tests, setTests] = useState<Record<string, TestResult>>({
    credentials: { name: 'FedEx API Credentials', status: 'idle' },
    authentication: { name: 'OAuth Authentication', status: 'idle' },
    labelGeneration: { name: 'Shipping Label Generation', status: 'idle' },
    addressValidation: { name: 'Houston Address Validation', status: 'idle' },
    tracking: { name: 'Tracking API', status: 'idle' },
    integration: { name: 'Full Integration Test', status: 'idle' },
  });

  const [serverInfo, setServerInfo] = useState<any>(null);

  const updateTest = (key: string, updates: Partial<TestResult>) => {
    setTests(prev => ({
      ...prev,
      [key]: { ...prev[key], ...updates, timestamp: new Date().toISOString() }
    }));
  };

  // Test 1: Check Server Configuration
  const testServerConfig = async () => {
    updateTest('credentials', { status: 'running' });
    
    try {
      const response = await callEdgeFunction('health');
      const data = await response.json();
      
      setServerInfo(data);
      
      updateTest('credentials', {
        status: 'success',
        message: 'Server is running and reachable',
        details: data
      });
    } catch (error) {
      updateTest('credentials', {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to reach server'
      });
    }
  };

  // Test 2: Test FedEx Authentication
  const testFedExAuth = async () => {
    updateTest('authentication', { status: 'running' });
    
    try {
      const response = await callEdgeFunction('test-fedex-auth', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok && data.success) {
        updateTest('authentication', {
          status: 'success',
          message: 'FedEx authentication successful',
          details: data
        });
      } else {
        updateTest('authentication', {
          status: 'error',
          message: data.message || 'Authentication failed',
          details: data
        });
      }
    } catch (error) {
      updateTest('authentication', {
        status: 'error',
        message: error instanceof Error ? error.message : 'Authentication test failed'
      });
    }
  };

  // Test 3: Test Shipping Label Generation
  const testLabelGeneration = async () => {
    updateTest('labelGeneration', { status: 'running' });
    
    try {
      const testOrder = {
        orderId: `TEST-${Date.now()}`,
        shippingAddress: {
          fullName: 'Test Customer',
          addressLine1: '1000 Main St',
          city: 'Houston',
          stateOrProvinceCode: 'TX',
          postalCode: '77002',
          countryCode: 'US',
          phoneNumber: '7135551234',
        },
        packageDetails: {
          weight: 0.5,
          length: 6,
          width: 4,
          height: 2,
        }
      };

      const response = await callEdgeFunction('test-fedex-label', {
        method: 'POST',
        body: JSON.stringify(testOrder)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        updateTest('labelGeneration', {
          status: 'success',
          message: `Label created successfully${data.trackingNumber ? `: ${data.trackingNumber}` : ''}`,
          details: data
        });
      } else {
        updateTest('labelGeneration', {
          status: 'error',
          message: data.message || 'Label generation failed',
          details: data
        });
      }
    } catch (error) {
      updateTest('labelGeneration', {
        status: 'error',
        message: error instanceof Error ? error.message : 'Label generation test failed'
      });
    }
  };

  // Test 4: Test Address Validation (Houston Only)
  const testAddressValidation = async () => {
    updateTest('addressValidation', { status: 'running' });
    
    try {
      const validAddress = {
        city: 'Houston',
        stateOrProvinceCode: 'TX',
        postalCode: '77002',
      };

      const invalidAddress = {
        city: 'Dallas',
        stateOrProvinceCode: 'TX',
        postalCode: '75201',
      };

      const response = await callEdgeFunction('test-address-validation', {
        method: 'POST',
        body: JSON.stringify({ validAddress, invalidAddress })
      });

      const data = await response.json();

      if (response.ok && data.validPassed && data.invalidBlocked) {
        updateTest('addressValidation', {
          status: 'success',
          message: 'Houston-only validation working correctly',
          details: data
        });
      } else {
        updateTest('addressValidation', {
          status: 'error',
          message: 'Address validation not working correctly',
          details: data
        });
      }
    } catch (error) {
      updateTest('addressValidation', {
        status: 'error',
        message: error instanceof Error ? error.message : 'Address validation test failed'
      });
    }
  };

  // Test 5: Test Tracking
  const testTracking = async () => {
    updateTest('tracking', { status: 'running' });
    
    try {
      // First create a test shipment, then track it
      const testOrderId = `TRACK-TEST-${Date.now()}`;
      
      const response = await callEdgeFunction('test-tracking', {
        method: 'POST',
        body: JSON.stringify({ orderId: testOrderId })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        updateTest('tracking', {
          status: 'success',
          message: `Tracking system working${data.trackingNumber ? ` (${data.trackingNumber})` : ''}`,
          details: data
        });
      } else {
        updateTest('tracking', {
          status: 'error',
          message: data.message || 'Tracking test failed',
          details: data
        });
      }
    } catch (error) {
      updateTest('tracking', {
        status: 'error',
        message: error instanceof Error ? error.message : 'Tracking test failed'
      });
    }
  };

  // Test 6: Full Integration Test
  const testFullIntegration = async () => {
    updateTest('integration', { status: 'running' });
    
    try {
      // Simulate a full order flow
      const testOrderId = `INTEGRATION-${Date.now()}`;
      
      const response = await callEdgeFunction('test-full-integration', {
        method: 'POST',
        body: JSON.stringify({
          orderId: testOrderId,
          customerName: 'Integration Test',
          email: 'test@example.com',
          items: [{ letter: 'A', size: '0.75ct', price: 350 }],
          addressLine1: '1000 Main St',
          city: 'Houston',
          stateOrProvinceCode: 'TX',
          postalCode: '77002',
          phoneNumber: '7135551234',
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        updateTest('integration', {
          status: 'success',
          message: 'Full integration test passed - Order → Label → Tracking',
          details: data
        });
      } else {
        updateTest('integration', {
          status: 'error',
          message: data.message || 'Integration test failed',
          details: data
        });
      }
    } catch (error) {
      updateTest('integration', {
        status: 'error',
        message: error instanceof Error ? error.message : 'Integration test failed'
      });
    }
  };

  const runAllTests = async () => {
    await testServerConfig();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testFedExAuth();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testAddressValidation();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testLabelGeneration();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testTracking();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await testFullIntegration();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'running':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-white/20 rounded-lg">
            <Truck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl">FedEx Shipping Test Dashboard</h1>
            <p className="text-blue-100 mt-1">
              Verify your FedEx integration is working correctly
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          Quick Actions
        </h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={runAllTests}
            disabled={Object.values(tests).some(t => t.status === 'running')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className="w-5 h-5" />
            Run All Tests
          </button>
          
          <button
            onClick={() => setTests(Object.keys(tests).reduce((acc, key) => ({
              ...acc,
              [key]: { ...tests[key], status: 'idle', message: undefined, details: undefined }
            }), {}))}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
          >
            <XCircle className="w-5 h-5" />
            Clear Results
          </button>
        </div>
      </div>

      {/* Server Info */}
      {serverInfo && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="text-lg mb-3 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Server Configuration
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Status</p>
              <p className="font-mono">{serverInfo.status}</p>
            </div>
            <div>
              <p className="text-gray-600">Version</p>
              <p className="font-mono">{serverInfo.version}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-gray-600 mb-1">Message</p>
              <p className="text-sm">{serverInfo.message}</p>
            </div>
          </div>
        </div>
      )}

      {/* Test Results */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl mb-6 flex items-center gap-2">
          <Map className="w-5 h-5 text-purple-600" />
          Test Results
        </h2>
        
        <div className="space-y-4">
          {Object.entries(tests).map(([key, test]) => (
            <div key={key} className={`border-2 rounded-lg p-4 ${getStatusBg(test.status)}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  {getStatusIcon(test.status)}
                  <div className="flex-1">
                    <h3 className="font-medium">{test.name}</h3>
                    {test.message && (
                      <p className="text-sm text-gray-600 mt-1">{test.message}</p>
                    )}
                    {test.timestamp && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(test.timestamp).toLocaleTimeString()}
                      </p>
                    )}
                    {test.details && (
                      <details className="mt-2">
                        <summary className="text-sm text-blue-600 cursor-pointer hover:text-blue-700">
                          View Details
                        </summary>
                        <pre className="mt-2 p-3 bg-white rounded border text-xs overflow-x-auto">
                          {JSON.stringify(test.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    switch(key) {
                      case 'credentials': testServerConfig(); break;
                      case 'authentication': testFedExAuth(); break;
                      case 'labelGeneration': testLabelGeneration(); break;
                      case 'addressValidation': testAddressValidation(); break;
                      case 'tracking': testTracking(); break;
                      case 'integration': testFullIntegration(); break;
                    }
                  }}
                  disabled={test.status === 'running'}
                  className="px-3 py-1 text-sm bg-white border-2 border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Test
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Troubleshooting Tips */}
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
        <h3 className="text-lg mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          Troubleshooting Tips
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-yellow-600 mt-0.5">•</span>
            <span>
              <strong>Authentication Failed:</strong> Check if your credentials match the environment (Sandbox vs Production)
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-600 mt-0.5">•</span>
            <span>
              <strong>Mock Mode:</strong> If FEDEX_USE_MOCK=true, tests will use fake data instead of real API calls
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-600 mt-0.5">•</span>
            <span>
              <strong>Houston Only:</strong> Address validation should block non-Houston addresses
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-600 mt-0.5">•</span>
            <span>
              <strong>Auto-Fallback:</strong> System automatically falls back to mock mode if FedEx API fails
            </span>
          </li>
        </ul>
      </div>

      {/* Environment Info */}
      <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-6">
        <h3 className="text-lg mb-3">Expected Environment Variables</h3>
        <div className="space-y-2 text-sm font-mono">
          <div className="p-2 bg-white rounded">FEDEX_CLIENT_ID</div>
          <div className="p-2 bg-white rounded">FEDEX_CLIENT_SECRET</div>
          <div className="p-2 bg-white rounded">FEDEX_ACCOUNT_NUMBER</div>
          <div className="p-2 bg-white rounded">FEDEX_USE_SANDBOX (true/false)</div>
          <div className="p-2 bg-white rounded">FEDEX_USE_MOCK (true/false)</div>
        </div>
      </div>
    </div>
  );
}