import { useState } from 'react';
import { Search, Package, Truck, CheckCircle, Clock, MapPin, Phone, Mail, Calendar, ExternalLink } from 'lucide-react';

interface OrderDetails {
  orderId: string;
  customerName: string;
  email: string;
  phoneNumber: string;
  items: Array<{
    letter?: string;
    size?: string;
    price?: number;
    quantity?: number;
    type?: string;
  }>;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateOrProvinceCode: string;
  postalCode: string;
  details?: string;
  total?: number;
  amount?: number;
  paymentMethod?: string;
  orderDate: string;
  status: string;
}

interface ShipmentDetails {
  trackingNumber?: string;
  labelUrl?: string;
  estimatedDelivery?: string;
  carrier: 'fedex';
  service: string;
  status: 'pending' | 'label_created' | 'shipped' | 'in_transit' | 'delivered';
  createdAt: string;
  updatedAt: string;
}

interface TrackingResponse {
  order: OrderDetails;
  shipment?: ShipmentDetails;
}

export function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [trackingData, setTrackingData] = useState<TrackingResponse | null>(null);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderNumber.trim()) {
      setError('Please enter an order number');
      return;
    }

    setLoading(true);
    setError('');
    setTrackingData(null);

    try {
      const response = await fetch(`https://vpxuizymtmcnsgmpnhel.supabase.co/functions/v1/server/track/${orderNumber.trim()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Order not found. Please check your order number and try again.');
        }
        throw new Error('Failed to fetch order details. Please try again.');
      }

      const data = await response.json();
      setTrackingData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Tracking error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status: string): number => {
    const statusMap: { [key: string]: number } = {
      'pending': 1,
      'processing': 1,
      'label_created': 2,
      'shipped': 3,
      'in_transit': 3,
      'delivered': 4,
    };
    return statusMap[status] || 1;
  };

  const getStatusColor = (status: string): string => {
    const colorMap: { [key: string]: string } = {
      'pending': 'text-yellow-600',
      'processing': 'text-yellow-600',
      'label_created': 'text-blue-600',
      'shipped': 'text-purple-600',
      'in_transit': 'text-purple-600',
      'delivered': 'text-green-600',
    };
    return colorMap[status] || 'text-gray-600';
  };

  const getStatusBgColor = (status: string): string => {
    const colorMap: { [key: string]: string } = {
      'pending': 'bg-yellow-100 border-yellow-300',
      'processing': 'bg-yellow-100 border-yellow-300',
      'label_created': 'bg-blue-100 border-blue-300',
      'shipped': 'bg-purple-100 border-purple-300',
      'in_transit': 'bg-purple-100 border-purple-300',
      'delivered': 'bg-green-100 border-green-300',
    };
    return colorMap[status] || 'bg-gray-100 border-gray-300';
  };

  const formatStatus = (status: string): string => {
    const statusMap: { [key: string]: string } = {
      'pending': 'Order Received',
      'processing': 'Processing Order',
      'label_created': 'Label Created',
      'shipped': 'Shipped',
      'in_transit': 'In Transit',
      'delivered': 'Delivered',
    };
    return statusMap[status] || status;
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl mb-2">Track Your Order</h1>
          <p className="text-gray-600">
            Enter your order number to view the status of your custom jewelry
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 mb-8">
          <form onSubmit={handleTrack} className="space-y-4">
            <div>
              <label htmlFor="orderNumber" className="block text-sm mb-2">
                Order Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="orderNumber"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="e.g., ORDER-1234567890ABC"
                  className="w-full px-4 py-3 pr-12 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                />
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Your order number was sent to your email after purchase
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Tracking...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Track Order
                </>
              )}
            </button>
          </form>
        </div>

        {/* Tracking Results */}
        {trackingData && (
          <div className="space-y-6">
            {/* Order Status Timeline */}
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
              <h2 className="text-2xl mb-6 flex items-center gap-2">
                <Package className="w-6 h-6 text-blue-600" />
                Order Status
              </h2>

              {/* Status Badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border-2 mb-6 ${getStatusBgColor(trackingData.shipment?.status || trackingData.order.status)}`}>
                <div className={`w-3 h-3 rounded-full ${getStatusColor(trackingData.shipment?.status || trackingData.order.status).replace('text-', 'bg-')}`} />
                <span className={getStatusColor(trackingData.shipment?.status || trackingData.order.status)}>
                  {formatStatus(trackingData.shipment?.status || trackingData.order.status)}
                </span>
              </div>

              {/* Timeline */}
              <div className="relative space-y-8 ml-4">
                {/* Order Received */}
                <div className="relative flex items-start gap-4">
                  <div className={`absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center z-10 ${getStatusStep(trackingData.shipment?.status || trackingData.order.status) >= 1 ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  {getStatusStep(trackingData.shipment?.status || trackingData.order.status) > 1 && (
                    <div className="absolute left-5 top-10 w-0.5 h-full bg-green-500 -z-0" />
                  )}
                  <div className="ml-14">
                    <h3 className="font-medium">Order Received</h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(trackingData.order.orderDate)}
                    </p>
                  </div>
                </div>

                {/* Label Created */}
                <div className="relative flex items-start gap-4">
                  <div className={`absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center z-10 ${getStatusStep(trackingData.shipment?.status || trackingData.order.status) >= 2 ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  {getStatusStep(trackingData.shipment?.status || trackingData.order.status) > 2 && (
                    <div className="absolute left-5 top-10 w-0.5 h-full bg-green-500 -z-0" />
                  )}
                  <div className="ml-14">
                    <h3 className="font-medium">Shipping Label Created</h3>
                    <p className="text-sm text-gray-600">
                      {trackingData.shipment?.createdAt ? formatDate(trackingData.shipment.createdAt) : 'Preparing...'}
                    </p>
                  </div>
                </div>

                {/* Shipped */}
                <div className="relative flex items-start gap-4">
                  <div className={`absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center z-10 ${getStatusStep(trackingData.shipment?.status || trackingData.order.status) >= 3 ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <Truck className="w-6 h-6 text-white" />
                  </div>
                  {getStatusStep(trackingData.shipment?.status || trackingData.order.status) > 3 && (
                    <div className="absolute left-5 top-10 w-0.5 h-full bg-green-500 -z-0" />
                  )}
                  <div className="ml-14">
                    <h3 className="font-medium">In Transit</h3>
                    <p className="text-sm text-gray-600">
                      {trackingData.shipment?.status === 'shipped' || trackingData.shipment?.status === 'in_transit'
                        ? 'Your package is on the way'
                        : 'Waiting for pickup'}
                    </p>
                  </div>
                </div>

                {/* Delivered */}
                <div className="relative flex items-start gap-4">
                  <div className={`absolute left-0 top-0 w-10 h-10 rounded-full flex items-center justify-center z-10 ${getStatusStep(trackingData.shipment?.status || trackingData.order.status) >= 4 ? 'bg-green-500' : 'bg-gray-300'}`}>
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="ml-14">
                    <h3 className="font-medium">Delivered</h3>
                    <p className="text-sm text-gray-600">
                      {trackingData.shipment?.status === 'delivered'
                        ? 'Your order has been delivered'
                        : 'Awaiting delivery'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Details */}
            {trackingData.shipment && (
              <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                <h2 className="text-2xl mb-6 flex items-center gap-2">
                  <Truck className="w-6 h-6 text-purple-600" />
                  Shipping Details
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Carrier</p>
                    <p className="font-medium">FedEx</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">Service</p>
                    <p className="font-medium">
                      {trackingData.shipment.service.replace('_', ' ')}
                    </p>
                  </div>

                  {trackingData.shipment.trackingNumber && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600 mb-1">Tracking Number</p>
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-lg">{trackingData.shipment.trackingNumber}</p>
                        {!trackingData.shipment.trackingNumber.startsWith('MOCK') && (
                          <a
                            href={`https://www.fedex.com/fedextrack/?tracknumbers=${trackingData.shipment.trackingNumber}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Track on FedEx
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  {trackingData.shipment.estimatedDelivery && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600 mb-1">Estimated Delivery</p>
                      <p className="font-medium">{formatDate(trackingData.shipment.estimatedDelivery)}</p>
                    </div>
                  )}
                </div>

                {trackingData.shipment.labelUrl && (
                  <div className="mt-6 pt-6 border-t">
                    <a
                      href={trackingData.shipment.labelUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <Package className="w-4 h-4" />
                      View Shipping Label
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Order Details */}
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
              <h2 className="text-2xl mb-6 flex items-center gap-2">
                <Package className="w-6 h-6 text-blue-600" />
                Order Details
              </h2>

              <div className="space-y-6">
                {/* Order Number */}
                <div className="pb-4 border-b">
                  <p className="text-sm text-gray-600 mb-1">Order Number</p>
                  <p className="font-mono text-lg">{trackingData.order.orderId}</p>
                </div>

                {/* Items */}
                <div className="pb-4 border-b">
                  <p className="text-sm text-gray-600 mb-3">Items</p>
                  <div className="space-y-2">
                    {trackingData.order.items && Array.isArray(trackingData.order.items) && trackingData.order.items.length > 0 ? (
                      trackingData.order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                          <div>
                            {item.letter ? (
                              <p className="font-medium">
                                Letter "{item.letter}" - {item.size || 'Standard'}
                              </p>
                            ) : (
                              <p className="font-medium">
                                {item.type || 'Item'} {item.quantity && item.quantity > 1 ? `(×${item.quantity})` : ''}
                              </p>
                            )}
                          </div>
                          {item.price && (
                            <p className="font-medium">${item.price.toFixed(2)}</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="bg-gray-50 p-3 rounded-lg text-gray-600 text-sm">
                        No items information available
                      </div>
                    )}
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center text-lg">
                  <p>Order Total</p>
                  <p className="font-bold text-blue-600">
                    ${((trackingData.order.total || trackingData.order.amount || 0).toFixed(2))}
                  </p>
                </div>

                {/* Custom Details */}
                {trackingData.order.details && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-2">Custom Details</p>
                    <p className="text-sm bg-gray-50 p-3 rounded-lg">{trackingData.order.details}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
              <h2 className="text-2xl mb-6 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-green-600" />
                Shipping Address
              </h2>

              <div className="space-y-2 text-gray-700">
                <p className="font-medium">{trackingData.order.customerName}</p>
                <p>{trackingData.order.addressLine1}</p>
                {trackingData.order.addressLine2 && <p>{trackingData.order.addressLine2}</p>}
                <p>
                  {trackingData.order.city}, {trackingData.order.stateOrProvinceCode} {trackingData.order.postalCode}
                </p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 md:p-8 border-2 border-blue-200">
              <h2 className="text-xl mb-4">Need Help?</h2>
              <p className="text-gray-700 mb-4">
                If you have questions about your order, please contact us:
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <a href="mailto:forgedinitals@outlook.com" className="hover:text-blue-600 transition-colors">
                    forgedinitals@outlook.com
                  </a>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                We communicate exclusively through social media for order updates and questions.
              </p>
            </div>
          </div>
        )}

        {/* Help Section */}
        {!trackingData && (
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <h2 className="text-xl mb-4">How to Find Your Order Number</h2>
            <div className="space-y-3 text-gray-700">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  1
                </div>
                <p>Check your email for the order confirmation sent after purchase</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </div>
                <p>Your order number starts with "ORDER-" followed by numbers and letters</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </div>
                <p>Enter the complete order number above to track your shipment</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}