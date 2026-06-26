import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Copy, CheckCircle2, Box } from 'lucide-react';
import { Textarea } from './ui/textarea';

export function TrackingEmailFormatter() {
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    orderId: '',
    customerName: '',
    email: '',
    trackingNumber: '',
    carrierName: 'FedEx Ground',
    estimatedDelivery: '',
  });

  const generateTrackingUrl = (trackingNumber: string) => {
    if (!trackingNumber) return '';
    // FedEx tracking URL format
    return `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`;
  };

  const generateTrackingEmailText = () => {
    if (!formData.trackingNumber || !formData.customerName) {
      return 'Please enter at least Customer Name and Tracking Number';
    }

    const trackingUrl = generateTrackingUrl(formData.trackingNumber);
    const deliveryInfo = formData.estimatedDelivery 
      ? `\n**Estimated Delivery:** ${formData.estimatedDelivery}`
      : '';

    return `Subject: Your Order Has Shipped! - Forged Initials${formData.orderId ? ` Order #${formData.orderId}` : ''}

---

Hi ${formData.customerName},

Great news! Your custom jewelry order from Forged Initials has been shipped and is on its way to you! 📦

**Shipping Details:**
${formData.orderId ? `  • Order ID: ${formData.orderId}` : ''}
  • Tracking Number: ${formData.trackingNumber}
  • Carrier: ${formData.carrierName}${deliveryInfo}
  • Ship Date: ${new Date().toLocaleDateString()}

**Track Your Package:**

You can track your shipment in real-time using the link below:

🔗 ${trackingUrl}

Or visit FedEx.com and enter tracking number: **${formData.trackingNumber}**

**What to Expect:**

1. **In Transit** - Your package is on its way
2. **Out for Delivery** - Package will arrive today
3. **Delivered** - Package has been delivered to your address

You'll receive updates from ${formData.carrierName} as your package moves through the delivery network.

**Package Contents:**

Your handcrafted 925 Sterling Silver letter jewelry pieces, carefully packaged and ready to enjoy!

**Delivery Questions?**

If you have any questions about your delivery or if you need to make any changes to your shipping address, please contact ${formData.carrierName} directly using the tracking number above.

**Stay Connected:**

Follow us on social media for new designs and special offers:
  • Instagram: @forgedinitials
  • Facebook: @forgedinitials
  • Twitter: @forgedinitials

Thank you for choosing Forged Initials! We hope you love your custom jewelry.

Best regards,
Forged Initials Team
Custom Handcrafted Sterling Silver Jewelry

---

** Questions? Reach out to us on social media! **`;
  };

  const emailText = generateTrackingEmailText();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(emailText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const fillTestData = () => {
    const today = new Date();
    const deliveryDate = new Date(today);
    deliveryDate.setDate(deliveryDate.getDate() + 3);
    
    setFormData({
      orderId: 'ORD-' + Date.now().toString(36).toUpperCase(),
      customerName: 'Jane Smith',
      email: 'jane.smith@example.com',
      trackingNumber: '123456789012',
      carrierName: 'FedEx Ground',
      estimatedDelivery: deliveryDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      }),
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Box className="w-5 h-5" />
            Generate Tracking Email
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Fill in shipping details to generate a formatted tracking email. Copy and send to your customer.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={fillTestData} variant="outline" size="sm">
              Fill Test Data
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="orderId">Order ID (Optional)</Label>
              <Input
                id="orderId"
                value={formData.orderId}
                onChange={(e) => setFormData({ ...formData, orderId: e.target.value })}
                placeholder="e.g., ORD-ABC123"
              />
            </div>

            <div>
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="e.g., John Doe"
              />
            </div>

            <div>
              <Label htmlFor="email">Customer Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="e.g., customer@example.com"
              />
            </div>

            <div>
              <Label htmlFor="trackingNumber">FedEx Tracking Number *</Label>
              <Input
                id="trackingNumber"
                value={formData.trackingNumber}
                onChange={(e) => setFormData({ ...formData, trackingNumber: e.target.value })}
                placeholder="e.g., 123456789012"
                className="font-mono"
              />
            </div>

            <div>
              <Label htmlFor="carrierName">Carrier</Label>
              <select
                id="carrierName"
                value={formData.carrierName}
                onChange={(e) => setFormData({ ...formData, carrierName: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value="FedEx Ground">FedEx Ground</option>
                <option value="FedEx Express">FedEx Express</option>
                <option value="FedEx Home Delivery">FedEx Home Delivery</option>
                <option value="FedEx 2Day">FedEx 2Day</option>
              </select>
            </div>

            <div>
              <Label htmlFor="estimatedDelivery">Estimated Delivery (Optional)</Label>
              <Input
                id="estimatedDelivery"
                value={formData.estimatedDelivery}
                onChange={(e) => setFormData({ ...formData, estimatedDelivery: e.target.value })}
                placeholder="e.g., Friday, October 25"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Leave blank if unknown
              </p>
            </div>
          </div>

          {formData.trackingNumber && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm space-y-2">
                <div className="font-semibold text-blue-900">📦 FedEx Tracking Link:</div>
                <a 
                  href={generateTrackingUrl(formData.trackingNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {generateTrackingUrl(formData.trackingNumber)}
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-blue-50">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Box className="w-5 h-5 text-blue-600" />
              📦 Ready to Copy & Send
            </span>
            <Button
              onClick={copyToClipboard}
              variant={copied ? 'outline' : 'default'}
              className={copied ? 'bg-blue-100 border-blue-600' : 'bg-blue-600 hover:bg-blue-700'}
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Tracking Email
                </>
              )}
            </Button>
          </CardTitle>
          <p className="text-sm text-blue-700">
            To: <strong>{formData.email || 'customer@example.com'}</strong>
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <Textarea
            value={emailText}
            readOnly
            className="font-mono text-sm min-h-[600px] bg-slate-50 border-2"
            onClick={(e) => {
              const textarea = e.target as HTMLTextAreaElement;
              textarea.select();
            }}
          />
          
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-sm">
            <div className="font-semibold text-green-900 mb-2">📝 How to Send:</div>
            <ol className="list-decimal list-inside space-y-1 text-green-800">
              <li>Click "Copy Tracking Email" button above</li>
              <li>Open your email client (Gmail, Outlook, etc.)</li>
              <li>Create new email to: <strong>{formData.email || 'customer@example.com'}</strong></li>
              <li>Paste the copied text (Ctrl+V or Cmd+V)</li>
              <li>Send the email!</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
