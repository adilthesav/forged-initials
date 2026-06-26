import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Copy, CheckCircle2, Mail } from 'lucide-react';
import { Textarea } from './ui/textarea';

interface OrderItem {
  type: 'letter' | 'bail' | 'prong';
  letter?: string;
  size?: string;
  quantity: number;
}

export function EmailFormatter() {
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    orderId: '',
    customerName: '',
    email: '',
    items: '',
    material: '925 Sterling Silver',
    size: 'Medium',
    addressLine1: '',
    addressLine2: '',
    city: 'Houston',
    stateOrProvinceCode: 'TX',
    postalCode: '',
    phoneNumber: '',
  });

  const parseItems = (itemsString: string): OrderItem[] => {
    // Parse items from format like:
    // - Letters: "A×30, B×42" or "A:30, B:42"
    // - Bails: "bail-m×5" or "bail-medium×5"
    // - Prongs: "prong-l×3" or "prong-large×3"
    const items: OrderItem[] = [];
    const parts = itemsString.split(',').map(s => s.trim());
    
    for (const part of parts) {
      // Check for bail
      const bailMatch = part.match(/bail[-\s]*(xs|s|m|l|extra small|small|medium|large|extrasmall)\s*[×:x]\s*(\d+)/i);
      if (bailMatch) {
        let size = bailMatch[1].toLowerCase().replace(/\s+/g, '');
        // Normalize size to short form
        if (size === 'extrasmall') size = 'xs';
        else if (size === 'small') size = 's';
        else if (size === 'medium') size = 'm';
        else if (size === 'large') size = 'l';
        
        items.push({
          type: 'bail',
          size,
          quantity: parseInt(bailMatch[2]),
        });
        continue;
      }
      
      // Check for prong
      const prongMatch = part.match(/prong[-\s]*(xs|s|m|l|extra small|small|medium|large|extrasmall)\s*[×:x]\s*(\d+)/i);
      if (prongMatch) {
        let size = prongMatch[1].toLowerCase().replace(/\s+/g, '');
        // Normalize size to short form
        if (size === 'extrasmall') size = 'xs';
        else if (size === 'small') size = 's';
        else if (size === 'medium') size = 'm';
        else if (size === 'large') size = 'l';
        
        items.push({
          type: 'prong',
          size,
          quantity: parseInt(prongMatch[2]),
        });
        continue;
      }
      
      // Check for letter
      const letterMatch = part.match(/([A-Z])\s*[×:x]\s*(\d+)/i);
      if (letterMatch) {
        items.push({
          type: 'letter',
          letter: letterMatch[1].toUpperCase(),
          quantity: parseInt(letterMatch[2]),
        });
      }
    }
    
    return items;
  };

  const calculatePricing = (items: OrderItem[], size: string) => {
    const sizePrices: Record<string, number> = {
      'Extra Small': 1.00,
      'Small': 2.00,
      'Medium': 3.00,
      'Large': 4.00,
      'Extra Large': 5.00,
    };
    
    const bailPrices: Record<string, number> = {
      xs: 1.5,
      s: 2,
      m: 2.5,
      l: 3,
    };
    
    const prongPrices: Record<string, number> = {
      xs: 1.25,
      s: 1.75,
      m: 2.25,
      l: 2.75,
    };
    
    const pricePerPiece = sizePrices[size] || 3.00;
    
    const itemizedPricing = items.map(item => {
      let price = 0;
      if (item.type === 'letter') {
        price = pricePerPiece;
      } else if (item.type === 'bail' && item.size) {
        price = bailPrices[item.size] || 0;
      } else if (item.type === 'prong' && item.size) {
        price = prongPrices[item.size] || 0;
      }
      
      return {
        ...item,
        price,
        itemTotal: item.quantity * price,
      };
    });
    
    const subtotal = itemizedPricing.reduce((sum, item) => sum + item.itemTotal, 0);
    const shipping = 10.00;
    const total = subtotal + shipping;
    
    return { itemizedPricing, subtotal, shipping, total, pricePerPiece };
  };

  const generateEmailText = () => {
    const items = parseItems(formData.items);
    if (items.length === 0) {
      return 'Please enter items in format: A×30, bail-m×5, prong-l×3';
    }
    
    const { itemizedPricing, subtotal, shipping, total, pricePerPiece } = calculatePricing(items, formData.size);
    const totalPieces = items.reduce((sum, item) => sum + item.quantity, 0);
    
    // Helper to format size
    const formatSize = (size: string) => {
      const sizeMap: Record<string, string> = {
        xs: 'XS',
        s: 'S',
        m: 'M',
        l: 'L',
      };
      return sizeMap[size] || size.toUpperCase();
    };
    
    // Separate items by type
    const letters = itemizedPricing.filter(item => item.type === 'letter');
    const bails = itemizedPricing.filter(item => item.type === 'bail');
    const prongs = itemizedPricing.filter(item => item.type === 'prong');
    
    // Build items list
    const itemsListParts: string[] = [];
    if (letters.length > 0) {
      itemsListParts.push(letters.map(item => `  • Letter ${item.letter}: ${item.quantity} pieces`).join('\n'));
    }
    if (bails.length > 0) {
      itemsListParts.push(bails.map(item => `  • Bail (${formatSize(item.size!)}): ${item.quantity} pieces`).join('\n'));
    }
    if (prongs.length > 0) {
      itemsListParts.push(prongs.map(item => `  • Prong (${formatSize(item.size!)}): ${item.quantity} pieces`).join('\n'));
    }
    const itemsList = itemsListParts.join('\n');
    
    // Build pricing breakdown
    const pricingParts: string[] = [];
    if (letters.length > 0) {
      pricingParts.push(letters.map(item => `  • Letter ${item.letter} × ${item.quantity} = $${item.itemTotal.toFixed(2)}`).join('\n'));
    }
    if (bails.length > 0) {
      pricingParts.push(bails.map(item => `  • Bail (${formatSize(item.size!)}) × ${item.quantity} = $${item.itemTotal.toFixed(2)} ($${(item as any).price.toFixed(2)} each)`).join('\n'));
    }
    if (prongs.length > 0) {
      pricingParts.push(prongs.map(item => `  • Prong (${formatSize(item.size!)}) × ${item.quantity} = $${item.itemTotal.toFixed(2)} ($${(item as any).price.toFixed(2)} each)`).join('\n'));
    }
    const pricingBreakdown = pricingParts.join('\n');

    return `Subject: Order Confirmation - Forged Initials Order #${formData.orderId}

---

Hi ${formData.customerName},

Thank you for your custom jewelry order with Forged Initials! We're excited to craft your personalized pieces.

**Order Details:**
Order ID: ${formData.orderId}
Date: ${new Date().toLocaleDateString()}

**Your Custom Order:**
${itemsList}

**Specifications:**
  • Material: ${formData.material}${letters.length > 0 ? `\n  • Letter Size: ${formData.size}` : ''}
  • Total Pieces: ${totalPieces}${letters.length > 0 ? `\n  • Price per letter: $${pricePerPiece.toFixed(2)}` : ''}

**Pricing Breakdown:**
${pricingBreakdown}
  • Subtotal: $${subtotal.toFixed(2)}
  • Shipping (FedEx Ground to Houston): $${shipping.toFixed(2)}
  • **Total: $${total.toFixed(2)}**

**Shipping Address:**
${formData.customerName}
${formData.addressLine1}
${formData.addressLine2 ? formData.addressLine2 + '\n' : ''}${formData.city}, ${formData.stateOrProvinceCode} ${formData.postalCode}
Phone: ${formData.phoneNumber}

**What Happens Next:**
1. We'll handcraft your custom jewelry pieces
2. Quality check and careful packaging
3. Ship via FedEx Ground with tracking
4. You'll receive tracking information once shipped

**Questions or Special Requests?**
Contact us on social media:
  • Instagram: @forgedinitials
  • Facebook: @forgedinitials
  • Twitter: @forgedinitials

Thank you for choosing Forged Initials for your custom jewelry!

Best regards,
Forged Initials Team
Custom Handcrafted Sterling Silver Jewelry

---

** This is an automated confirmation. Please save this email for your records. **`;
  };

  const emailText = generateEmailText();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(emailText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const fillTestData = () => {
    setFormData({
      orderId: 'TEST-' + Date.now().toString(36).toUpperCase(),
      customerName: 'Jane Smith',
      email: 'jane.smith@example.com',
      items: 'A×30, bail-m×5, prong-l×3',
      material: '925 Sterling Silver',
      size: 'Medium',
      addressLine1: '456 Test Avenue',
      addressLine2: 'Suite 100',
      city: 'Houston',
      stateOrProvinceCode: 'TX',
      postalCode: '77002',
      phoneNumber: '(555) 987-6543',
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Generate Customer Receipt Email
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Fill in order details to generate formatted email text. Copy and send to customer.
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
              <Label htmlFor="orderId">Order ID *</Label>
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
              <Label htmlFor="items">Items (Letters, Bails, Prongs) *</Label>
              <Input
                id="items"
                value={formData.items}
                onChange={(e) => setFormData({ ...formData, items: e.target.value })}
                placeholder="e.g., A×30, bail-m×5, prong-l×3"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Format: A×30, bail-m×5, prong-l×3 (sizes: xs, s, m, l)
              </p>
            </div>

            <div>
              <Label htmlFor="size">Size</Label>
              <select
                id="size"
                value={formData.size}
                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value="Extra Small">Extra Small ($1/pc)</option>
                <option value="Small">Small ($2/pc)</option>
                <option value="Medium">Medium ($3/pc)</option>
                <option value="Large">Large ($4/pc)</option>
                <option value="Extra Large">Extra Large ($5/pc)</option>
              </select>
            </div>

            <div>
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="e.g., (555) 123-4567"
              />
            </div>

            <div>
              <Label htmlFor="addressLine1">Address Line 1 *</Label>
              <Input
                id="addressLine1"
                value={formData.addressLine1}
                onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                placeholder="e.g., 123 Main Street"
              />
            </div>

            <div>
              <Label htmlFor="addressLine2">Address Line 2</Label>
              <Input
                id="addressLine2"
                value={formData.addressLine2}
                onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                placeholder="e.g., Apt 4B"
              />
            </div>

            <div>
              <Label htmlFor="postalCode">ZIP Code *</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                placeholder="e.g., 77001"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-green-200">
        <CardHeader className="bg-green-50">
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-green-600" />
              📧 Ready to Copy & Send
            </span>
            <Button
              onClick={copyToClipboard}
              variant={copied ? 'outline' : 'default'}
              className={copied ? 'bg-green-100 border-green-600' : 'bg-green-600 hover:bg-green-700'}
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Email Text
                </>
              )}
            </Button>
          </CardTitle>
          <p className="text-sm text-green-700">
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
          
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm">
            <div className="font-semibold text-blue-900 mb-2">📝 How to Send:</div>
            <ol className="list-decimal list-inside space-y-1 text-blue-800">
              <li>Click "Copy Email Text" button above</li>
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