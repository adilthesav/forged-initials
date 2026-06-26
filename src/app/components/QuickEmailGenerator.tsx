import { EmailFormatterTabs } from './EmailFormatterTabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Mail, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';

interface QuickEmailGeneratorProps {
  onNavigate?: (page: 'home' | 'contact' | 'test' | 'email') => void;
}

export function QuickEmailGenerator({ onNavigate }: QuickEmailGeneratorProps) {
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {onNavigate && (
        <div className="mb-4">
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
        </div>
      )}

      <Card className="border-2 border-green-500 shadow-lg mb-6">
        <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Mail className="w-8 h-8 text-green-600" />
            Quick Email Generator
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Generate customer emails without going through the full testing dashboard.
            Perfect for quick order confirmations and shipping tracking!
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-2xl mb-2">1️⃣</div>
              <div className="font-semibold text-blue-900 mb-1">Choose Type</div>
              <p className="text-sm text-blue-700">
                Order Receipt or Shipping Tracking
              </p>
            </div>
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="text-2xl mb-2">2️⃣</div>
              <div className="font-semibold text-purple-900 mb-1">Fill & Copy</div>
              <p className="text-sm text-purple-700">
                Enter details and copy the formatted email
              </p>
            </div>
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="text-2xl mb-2">3️⃣</div>
              <div className="font-semibold text-green-900 mb-1">Send Email</div>
              <p className="text-sm text-green-700">
                Paste into your email client and send
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <EmailFormatterTabs />
      
      <Card className="border border-orange-200 bg-orange-50 mt-6">
        <CardContent className="pt-6">
          <div className="text-sm space-y-2 text-orange-800">
            <div className="font-semibold text-orange-900">💡 Pro Tips:</div>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Use "Fill Test Data" to see examples</li>
              <li><strong>Receipt:</strong> Items format A×30, B×42, D×11 - pricing auto-calculated</li>
              <li><strong>Tracking:</strong> Enter FedEx tracking number - link auto-generated</li>
              <li>Click the text area to select all text easily</li>
              <li>Save this page as a bookmark for quick access</li>
              <li>Send receipt after payment, tracking after shipping</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
