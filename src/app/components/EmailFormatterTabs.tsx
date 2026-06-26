import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { EmailFormatter } from './EmailFormatter';
import { TrackingEmailFormatter } from './TrackingEmailFormatter';
import { Receipt, Box } from 'lucide-react';

export function EmailFormatterTabs() {
  return (
    <div className="space-y-4">
      <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200 rounded-lg">
        <div className="font-semibold text-gray-900 mb-2">✉️ Email Copy & Paste Tools</div>
        <p className="text-sm text-gray-700">
          Generate professional emails to send to your customers. Choose receipt confirmation or shipping tracking.
        </p>
      </div>

      <Tabs defaultValue="receipt" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="receipt" className="flex items-center gap-2">
            <Receipt className="w-4 h-4" />
            Order Receipt
          </TabsTrigger>
          <TabsTrigger value="tracking" className="flex items-center gap-2">
            <Box className="w-4 h-4" />
            Shipping Tracking
          </TabsTrigger>
        </TabsList>

        <TabsContent value="receipt" className="space-y-4 mt-6">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm">
            <div className="font-semibold text-green-900 mb-1">📧 Order Receipt Email</div>
            <p className="text-green-800">
              Send order confirmation with itemized pricing breakdown to customers after they place an order.
            </p>
          </div>
          <EmailFormatter />
        </TabsContent>

        <TabsContent value="tracking" className="space-y-4 mt-6">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
            <div className="font-semibold text-blue-900 mb-1">📦 Shipping Tracking Email</div>
            <p className="text-blue-800">
              Send shipping confirmation with FedEx tracking information when you ship the order.
            </p>
          </div>
          <TrackingEmailFormatter />
        </TabsContent>
      </Tabs>
    </div>
  );
}
