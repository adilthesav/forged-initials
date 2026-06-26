import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Bell, CheckCircle2, XCircle, Loader2, Key, Box, Mail, ArrowLeft } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { DiagnosticPanel } from './DiagnosticPanel';
import { EmailFormatterTabs } from './EmailFormatterTabs';
import { StripeSetupCheck } from './StripeSetupCheck';
import { PaymentDiagnostics } from './PaymentDiagnostics';
import { DeploymentQuickGuide } from './DeploymentQuickGuide';
import { QuickHealthCheck } from './QuickHealthCheck';
import { FrontendVerification } from './FrontendVerification';
import { QuickFix404 } from './QuickFix404';
import { DiscordTestButton } from './DiscordTestButton';
import { DeploymentChecker } from './DeploymentChecker';
import { QuickDeployGuide } from './QuickDeployGuide';
import { DiscordWebhookGuide } from './DiscordWebhookGuide';
import { DiscordEnvCheck } from './DiscordEnvCheck';
import { FinalDiscordSetup } from './FinalDiscordSetup';
import { EdgeFunctionDiagnostics } from './EdgeFunctionDiagnostics';
import { InstantDiagnostic } from './InstantDiagnostic';
import { EmergencyTest } from './EmergencyTest';
import { HowToCopyText } from './HowToCopyText';
import { DeploymentSuccess } from './DeploymentSuccess';
import { ComprehensiveDiagnostic } from './ComprehensiveDiagnostic';
import { QuickFixGuide } from './QuickFixGuide';
import { SystemStatusIndicator } from './SystemStatusIndicator';
import { StartHereBanner } from './StartHereBanner';
import { DeploymentCelebrationBanner } from './DeploymentCelebrationBanner';
import { QuickConnectionTest } from './QuickConnectionTest';
import { CriticalFixBanner } from './CriticalFixBanner';
import { FinalDeploymentFix } from './FinalDeploymentFix';
import { DeploymentSuccessConfirmation } from './DeploymentSuccessConfirmation';
import { FinalImportsFix } from './FinalImportsFix';
import { RedeploymentReminder } from './RedeploymentReminder';
import { RedeployNowBanner } from './RedeployNowBanner';
import { FedExTestingDashboard } from './FedExTestingDashboard';
import { AdminDashboard } from './AdminDashboard';
import { StripeKeySetupGuide } from './StripeKeySetupGuide';

interface TestSystemProps {
  onNavigate?: (page: 'home' | 'contact' | 'test') => void;
}

export function TestSystem({ onNavigate }: TestSystemProps = {}) {
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);
  const [envCheck, setEnvCheck] = useState<any>(null);
  const [checkingEnv, setCheckingEnv] = useState(false);
  const [verifyingFedEx, setVerifyingFedEx] = useState(false);
  const [activeTab, setActiveTab] = useState('stripe');

  // Test shipping form
  const [shippingTest, setShippingTest] = useState({
    fullName: 'John Doe',
    addressLine1: '123 Main Street',
    addressLine2: 'Apt 4B',
    city: 'Houston',
    stateOrProvinceCode: 'TX',
    postalCode: '77001',
    countryCode: 'US',
    phoneNumber: '(555) 123-4567',
  });

  // Tracking email form
  const [trackingForm, setTrackingForm] = useState({
    orderId: '',
    trackingNumber: '',
    customMessage: '', // Optional personal message to customer
    customerEmail: '', // Optional: directly specify customer email
  });
  const [sendingTracking, setSendingTracking] = useState(false);
  const [creatingTestOrder, setCreatingTestOrder] = useState(false);
  
  // Receipt email form
  const [receiptForm, setReceiptForm] = useState({
    orderId: '',
    customerEmail: '', // Optional: directly specify customer email
  });
  const [sendingReceipt, setSendingReceipt] = useState(false);

  const checkEnvironment = async () => {
    setCheckingEnv(true);
    setResult(null);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/debug-env`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setEnvCheck(data);
        setResult({
          success: true,
          message: '✅ Environment configuration checked successfully',
          details: data,
        });
      } else {
        setEnvCheck({ error: 'Failed to check environment' });
        setResult({
          success: false,
          message: '❌ Failed to check environment configuration',
        });
      }
    } catch (error) {
      console.error('Error checking environment:', error);
      setEnvCheck({ error: 'Request failed' });
      setResult({
        success: false,
        message: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setCheckingEnv(false);
    }
  };

  const sendTestDiscordNotification = async () => {
    setIsSending(true);
    setResult(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/test-notification`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: '✅ Test Discord notification sent successfully! Check your Discord server for a test order with sample customer info.',
          details: data,
        });
      } else {
        setResult({
          success: false,
          message: `❌ Failed: ${data.error || 'Unknown error'}`,
          details: data,
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsSending(false);
    }
  };

  const testFullOrderFlow = async () => {
    setIsSending(true);
    setResult(null);

    try {
      // Create a test order with full customer info
      const testOrderData = {
        customerName: 'Jane Smith',
        email: 'jane.smith@example.com',
        letters: 'JMS',
        quantity: 3,
        size: 'medium',
        material: 'sterling-silver',
        details: 'Test order with full customer information for Discord notification',
        amount: 7.20, // $3 * 1.0 * 3 = $7.20
        // Full shipping address
        addressLine1: '456 Test Avenue',
        addressLine2: 'Suite 100',
        city: 'Houston',
        stateOrProvinceCode: 'TX',
        postalCode: '77002',
        phoneNumber: '(555) 987-6543',
      };

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/cashapp-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(testOrderData),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: '✅ Complete order flow test successful! Check Discord for full customer info including name, email, phone, and complete shipping address.',
          details: {
            orderId: data.orderId,
            customerData: testOrderData,
          },
        });
      } else {
        setResult({
          success: false,
          message: `❌ Failed: ${data.error || 'Unknown error'}`,
          details: data,
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsSending(false);
    }
  };

  const testShipping = async () => {
    setIsSending(true);
    setResult(null);

    try {
      // First, create a test order in the database
      const testOrderData = {
        customerName: shippingTest.fullName,
        email: 'test-shipping@forgedinitials.com',
        letters: 'TST',
        quantity: 2,
        size: 'medium',
        material: 'sterling-silver',
        details: 'Test order for FedEx shipping label generation',
        amount: 6.00, // $3 * 1.0 * 2
        // Include full shipping address
        addressLine1: shippingTest.addressLine1,
        addressLine2: shippingTest.addressLine2,
        city: shippingTest.city,
        stateOrProvinceCode: shippingTest.stateOrProvinceCode,
        postalCode: shippingTest.postalCode,
        phoneNumber: shippingTest.phoneNumber,
      };

      // Create the order first
      const orderResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/cashapp-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(testOrderData),
        }
      );

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        setResult({
          success: false,
          message: `❌ Failed to create test order: ${orderData.error || 'Unknown error'}`,
          details: orderData,
        });
        return;
      }

      const testOrderId = orderData.orderId;

      // Now create the FedEx shipment for this order
      const shipmentResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/create-shipment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            orderId: testOrderId,
            shippingAddress: {
              fullName: shippingTest.fullName,
              addressLine1: shippingTest.addressLine1,
              addressLine2: shippingTest.addressLine2,
              city: shippingTest.city,
              stateOrProvinceCode: shippingTest.stateOrProvinceCode,
              postalCode: shippingTest.postalCode,
              countryCode: shippingTest.countryCode,
              phoneNumber: shippingTest.phoneNumber,
            },
            weight: 0.25, // Test weight in lbs
          }),
        }
      );

      const shipmentData = await shipmentResponse.json();

      if (shipmentResponse.ok) {
        setResult({
          success: true,
          message: '✅ FedEx shipping test successful! Shipping label created. Order also sent to Discord with full customer info.',
          details: {
            orderId: testOrderId,
            trackingNumber: shipmentData.shipment?.trackingNumber,
            labelUrl: shipmentData.shipment?.labelUrl,
            shipmentData: shipmentData.shipment,
          },
        });
      } else {
        setResult({
          success: false,
          message: `❌ Failed to create shipment: ${shipmentData.error || 'Unknown error'}`,
          details: shipmentData,
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setIsSending(false);
    }
  };

  const verifyFedExCredentials = async () => {
    setVerifyingFedEx(true);
    setResult(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/verify-fedex-credentials`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        setResult({
          success: true,
          message: data.message || '✅ FedEx credentials are valid!',
          details: data,
        });
      } else {
        setResult({
          success: false,
          message: data.error || '❌ FedEx credentials verification failed',
          details: data,
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setVerifyingFedEx(false);
    }
  };

  const sendTrackingEmail = async () => {
    setSendingTracking(true);
    setResult(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/send-tracking-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(trackingForm),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: '✅ Tracking email sent successfully! Check your inbox (and spam folder).',
          details: data,
        });
      } else {
        setResult({
          success: false,
          message: `❌ Failed to send tracking email: ${data.error || 'Unknown error'}`,
          details: data,
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setSendingTracking(false);
    }
  };

  const sendReceiptEmail = async () => {
    setSendingReceipt(true);
    setResult(null);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/send-receipt-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(receiptForm),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: '✅ Receipt email sent successfully! Check your inbox (and spam folder).',
          details: data,
        });
      } else {
        setResult({
          success: false,
          message: `❌ Failed to send receipt email: ${data.error || 'Unknown error'}`,
          details: data,
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setSendingReceipt(false);
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl space-y-6">
      {onNavigate && (
        <div className="mb-4 flex gap-2">
          <Button
            onClick={() => {
              onNavigate('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
          <Button
            onClick={() => {
              if (onNavigate) {
                // @ts-ignore - adding seo-audit to navigate
                onNavigate('seo-audit');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            size="sm"
          >
            🔍 SEO Audit
          </Button>
        </div>
      )}
      
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-6 h-6 text-primary" />
            🧪 System Testing Dashboard
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Test your Discord notifications, customer emails (receipts & tracking), and FedEx shipping integration
          </p>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-6 text-xs">
              <TabsTrigger value="stripe">💳 Stripe</TabsTrigger>
              <TabsTrigger value="formatter">✉️ Email</TabsTrigger>
              <TabsTrigger value="config">⚙️ Config</TabsTrigger>
              <TabsTrigger value="order">📦 Order</TabsTrigger>
              <TabsTrigger value="shipping">🚚 Ship</TabsTrigger>
              <TabsTrigger value="orders">📋 Orders</TabsTrigger>
            </TabsList>

            {/* FIX ERRORS TAB - NEW FIRST TAB! */}
            <TabsContent value="fix-errors" className="space-y-6">
              {/* FINAL IMPORTS FIX - CRITICAL! */}
              <FinalImportsFix />
              
              {/* DEPLOYMENT SUCCESS - CELEBRATE THE WIN! */}
              <DeploymentSuccessConfirmation 
                onTestDiscord={() => {
                  setActiveTab('discord');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
              
              {/* FINAL DEPLOYMENT FIX - DUPLICATE FILES REMOVED! */}
              <FinalDeploymentFix />
              
              {/* CRITICAL FIX BANNER - MUST SEE! */}
              <CriticalFixBanner />
              
              {/* Deployment Celebration - Show success! */}
              <DeploymentCelebrationBanner 
                onSwitchToDiscord={() => {
                  setActiveTab('discord');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
              
              {/* Quick Connection Test - SUPER SIMPLE TEST FIRST! */}
              <div>
                <div className="text-sm font-semibold mb-2 text-gray-700">
                  ⚡ Step 1: Quick Connection Test (Start Here!)
                </div>
                <QuickConnectionTest />
              </div>
              
              {/* Start Here Banner - Makes it foolproof */}
              <StartHereBanner />
              
              {/* Quick Status Check */}
              <div>
                <div className="text-sm font-semibold mb-2 text-gray-700">
                  📊 Step 2: Quick Status Check (runs automatically)
                </div>
                <SystemStatusIndicator />
              </div>
              
              {/* Comprehensive Diagnostic */}
              <div id="comprehensive-diagnostic">
                <div className="text-sm font-semibold mb-2 text-gray-700">
                  🔬 Step 3: Run Complete Diagnostic
                </div>
                <ComprehensiveDiagnostic />
              </div>
              
              {/* Quick Fix Guide */}
              <div>
                <div className="text-sm font-semibold mb-2 text-gray-700">
                  🛠️ Step 4: Common Solutions Reference
                </div>
                <QuickFixGuide />
              </div>
            </TabsContent>

            {/* Discord Final Setup Tab - FEATURED! */}
            <TabsContent value="discord-setup" className="space-y-4">
              {/* DEPLOYMENT SUCCESS - CELEBRATE! */}
              <DeploymentSuccess />
              
              {/* HOW TO COPY TEXT GUIDE */}
              <HowToCopyText />
              
              {/* EMERGENCY TEST - STRESS-FREE DIAGNOSIS */}
              <EmergencyTest />
              
              <FinalDiscordSetup />
            </TabsContent>

            {/* Quick 404 Fix Tab - MOST IMPORTANT! */}
            <TabsContent value="404fix" className="space-y-4">
              <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg mb-4">
                <div className="font-semibold text-red-900 mb-2">🚨 Start Here if You Have HTTP 404 Errors!</div>
                <p className="text-sm text-red-800">
                  If you're seeing "HTTP 404" or "Failed to fetch" errors when trying to place orders, 
                  this tool will help you diagnose and fix the issue in minutes.
                </p>
              </div>
              
              <QuickFix404 />
            </TabsContent>

            {/* Stripe Setup Check Tab - NEW! */}
            <TabsContent value="stripe" className="space-y-4">
              <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg mb-4">
                <div className="font-semibold text-blue-900 mb-2">💳 Stripe Payment Setup Verification</div>
                <p className="text-sm text-blue-800">
                  If you're getting "Payment initialization failed" errors, run these checks to diagnose the issue.
                  This will verify your Stripe API key is configured correctly and the payment endpoints are accessible.
                </p>
              </div>
              
              {/* Frontend Verification - FIRST THING TO RUN! */}
              <FrontendVerification />
              
              <div className="border-t pt-6 mt-6 space-y-4">
                <h3 className="font-semibold text-lg">Backend Health Checks</h3>
                
                {/* Quick Health Check */}
                <QuickHealthCheck />
              </div>
              
              <div className="border-t pt-6 space-y-4">
                <h3 className="font-semibold text-lg">Detailed Diagnostics</h3>
                
                {/* Deployment Quick Guide - Shows first if not deployed */}
                <DeploymentQuickGuide />
                
                <PaymentDiagnostics />
                
                <div className="mt-4">
                  <StripeSetupCheck />
                </div>
              </div>
            </TabsContent>

            {/* Email Formatter Tab - NEW! */}
            <TabsContent value="formatter" className="space-y-4">
              <EmailFormatterTabs />
            </TabsContent>

            {/* Diagnostic Tab - NEW! */}
            <TabsContent value="diagnostic" className="space-y-4">
              <div className="space-y-4">
                <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-lg">
                  <div className="font-semibold text-orange-900 mb-2">🔍 Email Backup Diagnostic</div>
                  <p className="text-sm text-orange-800">
                    Use this panel to diagnose why the green embed (customer email backup) isn't showing in Discord.
                    This will test if the Edge Function is returning itemized pricing data.
                  </p>
                </div>
                
                <DiagnosticPanel />

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                  <div className="font-semibold text-blue-900 mb-2">📚 Documentation:</div>
                  <ul className="space-y-1 text-blue-800">
                    <li>• <strong>Deployment Help:</strong> See <code className="bg-blue-100 px-1 rounded">DEPLOY_EDGE_FUNCTION.md</code></li>
                    <li>• <strong>Testing Guide:</strong> See <code className="bg-blue-100 px-1 rounded">TEST_DISCORD_BACKUP.md</code></li>
                    <li>• <strong>Fix Summary:</strong> See <code className="bg-blue-100 px-1 rounded">FIX_SUMMARY.md</code></li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            {/* Configuration Tab */}
            <TabsContent value="config" className="space-y-4">
              <div className="space-y-4">
                {/* Stripe Setup Guide - Show First */}
                <StripeKeySetupGuide />

                <p className="text-sm text-muted-foreground">
                  Check your environment configuration for Stripe, Discord, FedEx, and email settings.
                </p>

                <Button
                  onClick={checkEnvironment}
                  disabled={checkingEnv}
                  className="w-full"
                >
                  {checkingEnv ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Checking Configuration...
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4 mr-2" />
                      Check Environment Configuration
                    </>
                  )}
                </Button>

                {envCheck && !envCheck.error && (
                  <div className="space-y-3 p-4 bg-muted rounded-lg">
                    <div className="font-semibold">Configuration Status:</div>
                    
                    {envCheck.stripe && (
                      <div className={`p-3 rounded ${envCheck.stripe.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                        <div className={envCheck.stripe.isValid ? 'text-green-700' : 'text-red-700'}>
                          🔑 <strong>Stripe:</strong> {envCheck.stripe.isValid ? '✅ Valid' : '❌ Invalid'}
                        </div>
                        {!envCheck.stripe.isValid && envCheck.stripe.preview && (
                          <div className="text-xs mt-1 text-red-600">Preview: {envCheck.stripe.preview}</div>
                        )}
                      </div>
                    )}
                    
                    {envCheck.discord && (
                      <div className={`p-3 rounded ${envCheck.discord.configured ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                        <div className={envCheck.discord.configured ? 'text-green-700' : 'text-yellow-700'}>
                          💬 <strong>Discord:</strong> {envCheck.discord.configured ? '✅ Configured' : '⚠️ Not configured'}
                        </div>
                      </div>
                    )}
                    
                    {envCheck.fedex && (
                      <div className={`p-3 rounded ${envCheck.fedex.configured && envCheck.fedex.accountNumber ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                        <div className={envCheck.fedex.configured && envCheck.fedex.accountNumber ? 'text-green-700' : 'text-yellow-700'}>
                          📦 <strong>FedEx:</strong> {envCheck.fedex.configured && envCheck.fedex.accountNumber ? '✅ Configured' : '⚠️ Incomplete'}
                        </div>
                      </div>
                    )}
                    
                    {envCheck.email && (
                      <div className="space-y-4">
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
                          <strong className="text-blue-900">📧 Email Configuration Status:</strong>
                          <div className="mt-2">
                            {envCheck?.email?.configured ? (
                              <div className="text-green-700 font-semibold">
                                ✅ Email service is configured and ready!
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="text-orange-700 font-semibold">
                                  ⚠️ Email service not configured
                                </div>
                                <div className="text-sm text-orange-800 mt-2 space-y-1">
                                  <p><strong>To send tracking emails, you need to:</strong></p>
                                  <ol className="list-decimal ml-5 space-y-1">
                                    <li>Create free account at <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="underline">resend.com</a></li>
                                    <li>Get your API key from dashboard</li>
                                    <li>Add to Supabase: Edge Functions → Secrets</li>
                                    <li>Name: <code className="bg-white px-1 py-0.5 rounded">RESEND_API_KEY</code></li>
                                    <li>Value: Your Resend API key</li>
                                  </ol>
                                  <p className="mt-2 text-xs">
                                    📖 <strong>See EMAIL_SETUP_GUIDE.md for step-by-step instructions</strong>
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Discord Test Tab */}
            <TabsContent value="discord" className="space-y-4">
              <div className="space-y-4">
                {/* CRITICAL: Must Redeploy NOW */}
                <RedeployNowBanner />
                
                {/* CRITICAL: Redeployment Reminder */}
                <RedeploymentReminder />

                <div className="p-4 bg-orange-50 border-2 border-orange-300 rounded-lg mb-4">
                  <div className="font-semibold text-orange-900 mb-2">⚠️ Getting "Failed to fetch" errors?</div>
                  <p className="text-sm text-orange-800">
                    If you're seeing "Failed to fetch" errors, it means the Edge Function endpoints aren't deployed yet.
                    Use the Deployment Checker below to diagnose which endpoints are missing.
                  </p>
                </div>

                {/* FIRST: Check what's deployed */}
                <DeploymentChecker />

                {/* Deployment Guide */}
                <QuickDeployGuide />

                <div className="border-t pt-6 mt-6">
                  <h3 className="font-semibold text-lg mb-4">📝 Discord Webhook Configuration</h3>
                  <DiscordWebhookGuide />
                </div>

                <div className="border-t pt-6 mt-6">
                  <h3 className="font-semibold text-lg mb-4">🔍 Verify Discord Configuration</h3>
                  <DiscordEnvCheck />
                </div>

                <div className="border-t pt-6 mt-6">
                  <div className="p-4 bg-green-50 border-2 border-green-300 rounded-lg mb-4">
                    <div className="font-semibold text-green-900 mb-2">🎉 Discord Bot Test (After Deployment)</div>
                    <p className="text-sm text-green-800">
                      Once endpoints are deployed (see checker above) AND the Discord webhook URL is configured (see guide above), use this to test your Discord bot integration!
                    </p>
                  </div>

                  {/* Discord Bot Test */}
                  <DiscordTestButton />
                </div>

                <div className="border-t pt-6 mt-6">
                  <h3 className="font-semibold mb-4">Legacy Test (Old Format)</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Send a test notification to your Discord server. This will send a sample order without full customer details.
                  </p>
                  
                  <Button
                    onClick={sendTestDiscordNotification}
                    disabled={isSending}
                    className="w-full"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Sending Test Notification...
                      </>
                    ) : (
                      <>
                        <Bell className="w-4 h-4 mr-2" />
                        Send Test Discord Notification
                      </>
                    )}
                  </Button>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 mt-4">
                    <strong>Note:</strong> This sends a basic test notification. Use the "Full Order" tab to test with complete customer information including shipping address.
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Full Order Test Tab */}
            <TabsContent value="order" className="space-y-4">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Test the complete order flow with full customer information. This will send a Discord notification with name, email, phone, and complete shipping address.
                </p>
                
                <Button
                  onClick={testFullOrderFlow}
                  disabled={isSending}
                  className="w-full"
                  variant="default"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Testing Order Flow...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Test Full Order with Customer Info
                    </>
                  )}
                </Button>

                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg text-sm">
                  <div className="font-semibold text-purple-900 mb-2">Test Order Details:</div>
                  <ul className="space-y-1 text-purple-800">
                    <li>• <strong>Customer:</strong> Jane Smith</li>
                    <li>• <strong>Email:</strong> jane.smith@example.com</li>
                    <li>• <strong>Phone:</strong> (555) 987-6543</li>
                    <li>• <strong>Address:</strong> 456 Test Avenue, Suite 100, Houston, TX 77002</li>
                    <li>• <strong>Order:</strong> JMS - 3 pieces, Medium, Sterling Silver</li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            {/* Shipping Test Tab */}
            <TabsContent value="shipping" className="space-y-4">
              <FedExTestingDashboard />
            </TabsContent>

            {/* Orders Management Tab */}
            <TabsContent value="orders" className="space-y-4">
              <AdminDashboard />
            </TabsContent>

            {/* OLD SHIPPING CONTENT - REPLACED WITH FEDEX TESTING DASHBOARD */}
            <TabsContent value="shipping-old" className="space-y-4" style={{display: 'none'}}>
              <div className="space-y-4">
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Box className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-red-800">
                      <div className="font-semibold mb-2">⚠️ FedEx Credentials Issue</div>
                      <p className="mb-2">
                        Your current FedEx credentials are being rejected by the API. This could mean:
                      </p>
                      <ul className="list-disc ml-5 space-y-1 mb-3">
                        <li><strong>Wrong Environment:</strong> Your credentials might be for production but system is using sandbox (or vice versa)</li>
                        <li><strong>Invalid Credentials:</strong> The API Key, Secret, or Account Number might be incorrect</li>
                        <li><strong>Missing Permissions:</strong> Your FedEx account might not have API access enabled</li>
                      </ul>
                      <div className="p-3 bg-red-100 rounded border border-red-300 mt-3">
                        <p className="font-semibold mb-1">📋 How to Fix:</p>
                        <ol className="list-decimal ml-5 space-y-1 text-xs">
                          <li>Visit <a href="https://developer.fedex.com" target="_blank" rel="noopener noreferrer" className="underline">FedEx Developer Portal</a></li>
                          <li>Check if your credentials are for <strong>Test (Sandbox)</strong> or <strong>Production</strong></li>
                          <li>Make sure your FedEx account has shipping API access enabled</li>
                          <li>Update your environment variables with correct credentials</li>
                          <li>Set <code className="bg-red-200 px-1 rounded">FEDEX_USE_SANDBOX=true</code> for test credentials or <code className="bg-red-200 px-1 rounded">FEDEX_USE_SANDBOX=false</code> for production</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-green-800">
                      <div className="font-semibold mb-1">✅ AUTO-FALLBACK ENABLED</div>
                      <p className="mb-2">
                        <strong>Good news!</strong> The system now automatically falls back to <strong>Mock Mode</strong> when FedEx credentials fail. This means:
                      </p>
                      <ul className="list-disc ml-5 space-y-1">
                        <li>✅ Your orders will still process successfully</li>
                        <li>✅ Mock tracking numbers will be generated (e.g., <code className="bg-green-100 px-1 rounded">MOCK-FALLBACK-1737395829</code>)</li>
                        <li>✅ All order data is saved and sent to Discord</li>
                        <li>⚠️ No real shipping labels will be created (you'll need to manually create them)</li>
                      </ul>
                      <p className="mt-2 text-xs opacity-75">
                        This is temporary until you fix your FedEx credentials using the guide above or the <code className="bg-green-100 px-1 rounded">FEDEX_CREDENTIALS_FIX.md</code> file.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Box className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <div className="font-semibold mb-1">🎭 Manual Mock Mode (Optional)</div>
                      <p className="mb-2">
                        If you want to explicitly use Mock Mode (without waiting for credentials to fail), set: <code className="bg-blue-100 px-1 rounded">FEDEX_USE_MOCK=true</code>
                      </p>
                      <p className="text-xs opacity-75">
                        This is useful if you want to test the full order flow without any FedEx API calls at all.
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">
                  Test FedEx shipping label generation with a sample Houston address. This creates a test order and generates a shipping label.
                </p>

                <Button
                  onClick={verifyFedExCredentials}
                  disabled={verifyingFedEx}
                  className="w-full"
                  variant="outline"
                >
                  {verifyingFedEx ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying Credentials...
                    </>
                  ) : (
                    <>
                      <Key className="w-4 h-4 mr-2" />
                      Verify FedEx Credentials
                    </>
                  )}
                </Button>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={shippingTest.fullName}
                      onChange={(e) => setShippingTest({ ...shippingTest, fullName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={shippingTest.phoneNumber}
                      onChange={(e) => setShippingTest({ ...shippingTest, phoneNumber: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="address1">Address Line 1</Label>
                    <Input
                      id="address1"
                      value={shippingTest.addressLine1}
                      onChange={(e) => setShippingTest({ ...shippingTest, addressLine1: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="address2">Address Line 2 (Optional)</Label>
                    <Input
                      id="address2"
                      value={shippingTest.addressLine2}
                      onChange={(e) => setShippingTest({ ...shippingTest, addressLine2: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={shippingTest.city}
                      onChange={(e) => setShippingTest({ ...shippingTest, city: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={shippingTest.stateOrProvinceCode}
                      onChange={(e) => setShippingTest({ ...shippingTest, stateOrProvinceCode: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input
                      id="zip"
                      value={shippingTest.postalCode}
                      onChange={(e) => setShippingTest({ ...shippingTest, postalCode: e.target.value })}
                    />
                  </div>
                </div>

                <Button
                  onClick={testShipping}
                  disabled={isSending}
                  className="w-full"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Test Shipment...
                    </>
                  ) : (
                    <>
                      <Box className="w-4 h-4 mr-2" />
                      Test FedEx Shipping Label
                    </>
                  )}
                </Button>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                  <strong>Note:</strong> This will:
                  <ul className="list-disc ml-5 mt-2 space-y-1">
                    <li>Create a test order in the database</li>
                    <li>Send order notification to Discord with full customer info</li>
                    <li>Generate a FedEx shipping label (sandbox/test mode by default)</li>
                    <li>Return tracking number and downloadable label PDF</li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            {/* Customer Emails Tab */}
            <TabsContent value="emails" className="space-y-6">
              <div className="space-y-6">
                {/* Receipt/Confirmation Email Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Mail className="w-5 h-5" />
                      Order Receipt/Confirmation Email
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Send a professional order confirmation email with complete order details and pricing breakdown. This is automatically sent when orders are placed, but you can manually send it here.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="receiptOrderId">Order ID</Label>
                        <Input
                          id="receiptOrderId"
                          placeholder="ORDER-1234567890123"
                          value={receiptForm.orderId}
                          onChange={(e) => setReceiptForm({ ...receiptForm, orderId: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="receiptCustomerEmail">Customer Email (Optional)</Label>
                        <Input
                          id="receiptCustomerEmail"
                          placeholder="customer@example.com"
                          value={receiptForm.customerEmail}
                          onChange={(e) => setReceiptForm({ ...receiptForm, customerEmail: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">
                          If provided, email will be sent here instead of the order's email address.
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={sendReceiptEmail}
                      disabled={sendingReceipt || !receiptForm.orderId}
                      className="w-full"
                    >
                      {sendingReceipt ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending Receipt Email...
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4 mr-2" />
                          Send Receipt Email
                        </>
                      )}
                    </Button>

                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                      <strong>✨ What the customer will receive:</strong>
                      <ul className="list-disc ml-5 mt-2 space-y-1">
                        <li>Beautiful email with Forged Initials branding</li>
                        <li>Order confirmation with Order ID</li>
                        <li>Complete itemized pricing breakdown</li>
                        <li>Each letter with quantity and individual pricing</li>
                        <li>Material, size, and total pieces information</li>
                        <li>Subtotal, shipping ($10), and total paid</li>
                        <li>Payment method confirmation</li>
                        <li>Special instructions (if provided)</li>
                        <li>What happens next timeline</li>
                        <li>Social media links for questions</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Tracking Email Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Box className="w-5 h-5" />
                      Shipping Tracking Email
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Send a professional tracking email when the order ships with FedEx tracking details and order summary.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="trackingOrderId">Order ID</Label>
                          <Input
                            id="trackingOrderId"
                            placeholder="ORDER-1234567890123"
                            value={trackingForm.orderId}
                            onChange={(e) => setTrackingForm({ ...trackingForm, orderId: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="trackingNumber">FedEx Tracking Number</Label>
                          <Input
                            id="trackingNumber"
                            placeholder="794603456789"
                            value={trackingForm.trackingNumber}
                            onChange={(e) => setTrackingForm({ ...trackingForm, trackingNumber: e.target.value })}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="customMessage">Personal Message (Optional)</Label>
                        <Textarea
                          id="customMessage"
                          placeholder="Add a personal thank you message or special note to your customer..."
                          value={trackingForm.customMessage}
                          onChange={(e) => setTrackingForm({ ...trackingForm, customMessage: e.target.value })}
                          rows={3}
                        />
                        <p className="text-xs text-muted-foreground">
                          This will be included in the email along with the automated order details and tracking information.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="trackingCustomerEmail">Customer Email (Optional)</Label>
                        <Input
                          id="trackingCustomerEmail"
                          placeholder="customer@example.com"
                          value={trackingForm.customerEmail}
                          onChange={(e) => setTrackingForm({ ...trackingForm, customerEmail: e.target.value })}
                        />
                        <p className="text-xs text-muted-foreground">
                          If provided, email will be sent here instead of the order's email address.
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={sendTrackingEmail}
                      disabled={sendingTracking || !trackingForm.orderId || !trackingForm.trackingNumber}
                      className="w-full"
                    >
                      {sendingTracking ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending Tracking Email...
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4 mr-2" />
                          Send Tracking Email
                        </>
                      )}
                    </Button>

                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                      <strong>📦 What the customer will receive:</strong>
                      <ul className="list-disc ml-5 mt-2 space-y-1">
                        <li>Professional email with Forged Initials branding</li>
                        <li>FedEx tracking number with direct tracking link</li>
                        <li>Complete order summary (items with quantities)</li>
                        <li>Order ID for reference</li>
                        <li>Material, size, and total amount paid</li>
                        <li>Estimated delivery time (3-5 business days)</li>
                        <li>Social media links for questions</li>
                        <li>Your custom message (if provided)</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Result Display */}
          {result && (
            <div
              className={`mt-6 p-4 rounded-lg border-2 ${
                result.success
                  ? 'bg-green-50 border-green-300'
                  : 'bg-red-50 border-red-300'
              }`}
            >
              <div className="flex items-start gap-3">
                {result.success ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`font-semibold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                    {result.message}
                  </p>
                  
                  {/* Show detailed help for FedEx credential errors */}
                  {result.details?.help && Array.isArray(result.details.help) && (
                    <div className="mt-4 p-4 bg-white rounded-lg border border-red-200">
                      <div className="space-y-1 text-sm text-red-900 font-mono">
                        {result.details.help.map((line: string, idx: number) => (
                          <div key={idx} className={line === '' ? 'h-2' : ''}>{line}</div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Show quick fixes */}
                  {result.details?.quickFixes && Array.isArray(result.details.quickFixes) && (
                    <div className="mt-3 p-3 bg-yellow-50 rounded border border-yellow-300">
                      <div className="font-semibold text-yellow-900 text-sm mb-2">💡 Quick Fixes:</div>
                      <ul className="list-disc ml-5 space-y-1 text-sm text-yellow-800">
                        {result.details.quickFixes.map((fix: string, idx: number) => (
                          <li key={idx}>{fix}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Show next steps for success */}
                  {result.details?.nextSteps && Array.isArray(result.details.nextSteps) && (
                    <div className="mt-3 p-3 bg-green-100 rounded border border-green-300">
                      <div className="font-semibold text-green-900 text-sm mb-2">🎉 Next Steps:</div>
                      <ul className="list-disc ml-5 space-y-1 text-sm text-green-800">
                        {result.details.nextSteps.map((step: string, idx: number) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Show fallback note */}
                  {result.details?.fallbackNote && (
                    <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-300 text-sm text-blue-800">
                      {result.details.fallbackNote}
                    </div>
                  )}
                  
                  {/* Show diagnostics */}
                  {result.details?.diagnostics && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm opacity-75 hover:opacity-100 font-semibold">
                        🔍 View Diagnostics
                      </summary>
                      <div className="mt-2 p-3 bg-white/50 rounded text-xs space-y-1">
                        {Object.entries(result.details.diagnostics).map(([key, value]) => (
                          <div key={key}>
                            <span className="font-semibold">{key}:</span> {String(value)}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                  
                  {/* Show full details */}
                  {result.details && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm opacity-75 hover:opacity-100">
                        View all details
                      </summary>
                      <pre className="mt-2 p-3 bg-white/50 rounded text-xs overflow-auto max-h-64">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}