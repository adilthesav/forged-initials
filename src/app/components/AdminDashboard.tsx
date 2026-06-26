import React, { useState, useEffect } from 'react';
import { Download, RefreshCw, Search, Filter, DollarSign, Package, Calendar, User, Trash2 } from 'lucide-react';

const EDGE_FUNCTION_URL = 'https://vpxuizymtmcnsgmpnhel.supabase.co/functions/v1/server';

interface OrderItem {
  letter: string;
  size: string;
  price: number;
  quantity?: number;
}

interface Shipment {
  trackingNumber: string;
  labelUrl?: string;
  carrier?: string;
  service?: string;
  status?: string;
  createdAt?: string;
}

interface Order {
  orderId: string;
  customerName: string;
  email: string;
  phoneNumber?: string;
  items: OrderItem[];
  material?: string;
  pendantStyle?: string;
  bailOptions?: any[];
  prongsOptions?: any[];
  details?: string;
  amount?: number;
  status?: string;
  paymentMethod?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  stateOrProvinceCode?: string;
  postalCode?: string;
  createdAt: string;
  updatedAt?: string;
  shipment?: Shipment | null;
}

export function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isInFigmaIframe, setIsInFigmaIframe] = useState(false);
  const [isFetchError, setIsFetchError] = useState(false);
  
  // Admin authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Detect if running in Figma's iframe
  useEffect(() => {
    const inIframe = window.self !== window.top;
    const isFigma = window.location.hostname.includes('figma.com');
    setIsInFigmaIframe(inIframe || isFigma);
    
    // Check if admin password is stored in sessionStorage
    const storedPassword = sessionStorage.getItem('admin_password');
    if (storedPassword) {
      setAdminPassword(storedPassword);
      setIsAuthenticated(true);
      setLoading(false); // Don't auto-load until authenticated
    } else {
      setLoading(false); // Don't auto-load until authenticated
    }
  }, []);

  // Load orders on mount ONLY if authenticated
  useEffect(() => {
    if (isAuthenticated && adminPassword) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  const handleAdminLogin = async () => {
    if (!adminPassword.trim()) {
      setAuthError('Please enter admin password');
      return;
    }
    
    setAuthLoading(true);
    setAuthError(null);
    
    try {
      // Test authentication by fetching orders
      const cacheBuster = `?t=${Date.now()}`;
      const url = `${EDGE_FUNCTION_URL}/orders${cacheBuster}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-Admin-Password': adminPassword,
          'Cache-Control': 'no-cache',
        },
        cache: 'no-store',
      });
      
      if (response.status === 401) {
        setAuthError('❌ Invalid admin password');
        setAuthLoading(false);
        return;
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Store password in sessionStorage (cleared on browser close)
        sessionStorage.setItem('admin_password', adminPassword);
        setIsAuthenticated(true);
        
        // Load orders
        const validOrders = (data.orders || []).filter((order: any) => {
          return typeof order === 'object' && order !== null && !Array.isArray(order);
        });
        setOrders(validOrders);
      } else {
        setAuthError(data.error || 'Authentication failed');
      }
    } catch (err: any) {
      setAuthError('Failed to authenticate. Check password and connection.');
      console.error('Auth error:', err);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_password');
    setIsAuthenticated(false);
    setAdminPassword('');
    setOrders([]);
  };

  const handleDeleteOrder = async (orderId: string) => {
    // Confirm deletion
    const confirmed = window.confirm(
      `Are you sure you want to delete order ${orderId}?\n\nThis action cannot be undone.`
    );
    
    if (!confirmed) return;
    
    try {
      const response = await fetch(`${EDGE_FUNCTION_URL}/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'X-Admin-Password': adminPassword,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete order: HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Remove order from local state
        setOrders(orders.filter(order => order.orderId !== orderId));
        alert(`✅ Order ${orderId} has been deleted successfully`);
      } else {
        throw new Error(data.error || 'Failed to delete order');
      }
    } catch (err: any) {
      console.error('Delete error:', err);
      alert(`❌ Failed to delete order: ${err.message}`);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    setIsFetchError(false);
    try {
      // Add cache busting
      const cacheBuster = `?t=${Date.now()}`;
      const url = `${EDGE_FUNCTION_URL}/orders${cacheBuster}`;
      
      console.log('🔄 Fetching orders from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-Admin-Password': adminPassword,
          'Cache-Control': 'no-cache',
        },
        cache: 'no-store',
      });
      
      console.log('📡 Response status:', response.status, response.statusText);
      console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response not OK:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      
      console.log('📦 Orders response:', data);
      console.log('📦 Debug info:', data.debug);
      console.log('📦 Raw orders array:', data.orders);
      
      if (data.success) {
        // EXTRA SAFETY: Filter out any strings on the frontend too
        const validOrders = (data.orders || []).filter((order: any) => {
          const isValid = typeof order === 'object' && order !== null && !Array.isArray(order);
          if (!isValid) {
            console.warn('⚠️ Frontend filtered out invalid order:', typeof order, order);
          }
          return isValid;
        });
        
        setOrders(validOrders);
        console.log('✅ Loaded orders:', validOrders.length, '(filtered from', data.orders?.length, ')');
      } else {
        setError(data.error || 'Failed to fetch orders');
        console.error('❌ Error:', data);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch orders';
      setError(errorMessage);
      setIsFetchError(true);
      console.error('❌ Fetch error:', err);
      console.error('❌ Error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      });
      
      // Show user-friendly error with instructions
      if (errorMessage.includes('Failed to fetch')) {
        setError('Network error: Cannot connect to server. Please check:\n1. Edge Function is deployed\n2. Internet connection is working\n3. CORS is configured correctly');
      }
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    if (filteredOrders.length === 0) {
      alert('No orders to export');
      return;
    }

    // CSV Headers
    const headers = [
      'Order ID',
      'Date',
      'Customer Name',
      'Email',
      'Phone',
      'Items',
      'Material',
      'Pendant Style',
      'Details',
      'Amount',
      'Status',
      'Payment Method',
      'Address Line 1',
      'Address Line 2',
      'City',
      'State',
      'ZIP',
      'Tracking Number',
      'Shipping Status',
      'Created At',
      'Updated At'
    ];

    // CSV Rows
    const rows = filteredOrders.map(order => {
      const itemsStr = order.items
        ?.map(item => `${item.quantity || 1}x ${item.letter} (${item.size}) - $${item.price}`)
        .join('; ') || '';
      
      return [
        order.orderId || '',
        formatDate(order.createdAt) || '',
        order.customerName || '',
        order.email || '',
        order.phoneNumber || '',
        itemsStr,
        order.material || '',
        order.pendantStyle || '',
        order.details || '',
        order.amount || calculateTotal(order.items),
        order.status || 'processing',
        order.paymentMethod || 'stripe',
        order.addressLine1 || '',
        order.addressLine2 || '',
        order.city || '',
        order.stateOrProvinceCode || '',
        order.postalCode || '',
        order.shipment?.trackingNumber || '',
        order.shipment?.status || '',
        order.createdAt || '',
        order.updatedAt || ''
      ].map(value => `"${String(value).replace(/"/g, '""')}"`); // Escape quotes
    });

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `forged-initials-orders-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
    // For Excel, we'll create an HTML table and use the Excel XML format
    if (filteredOrders.length === 0) {
      alert('No orders to export');
      return;
    }

    const html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Orders</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
      </head>
      <body>
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Customer Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Items</th>
              <th>Material</th>
              <th>Pendant Style</th>
              <th>Details</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Payment Method</th>
              <th>Address Line 1</th>
              <th>Address Line 2</th>
              <th>City</th>
              <th>State</th>
              <th>ZIP</th>
              <th>Tracking Number</th>
              <th>Shipping Status</th>
            </tr>
          </thead>
          <tbody>
            ${filteredOrders.map(order => `
              <tr>
                <td>${order.orderId || ''}</td>
                <td>${formatDate(order.createdAt) || ''}</td>
                <td>${order.customerName || ''}</td>
                <td>${order.email || ''}</td>
                <td>${order.phoneNumber || ''}</td>
                <td>${order.items?.map(item => `${item.quantity || 1}x ${item.letter} (${item.size}) - $${item.price}`).join('; ') || ''}</td>
                <td>${order.material || ''}</td>
                <td>${order.pendantStyle || ''}</td>
                <td>${order.details || ''}</td>
                <td>${order.amount || calculateTotal(order.items)}</td>
                <td>${order.status || 'processing'}</td>
                <td>${order.paymentMethod || 'stripe'}</td>
                <td>${order.addressLine1 || ''}</td>
                <td>${order.addressLine2 || ''}</td>
                <td>${order.city || ''}</td>
                <td>${order.stateOrProvinceCode || ''}</td>
                <td>${order.postalCode || ''}</td>
                <td>${order.shipment?.trackingNumber || ''}</td>
                <td>${order.shipment?.status || ''}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `forged-initials-orders-${new Date().toISOString().split('T')[0]}.xls`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateTotal = (items: OrderItem[]) => {
    if (!items || items.length === 0) return 0;
    return items.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  };

  // Helper to format items for display
  const formatOrderItems = (order: Order) => {
    if (!order.items || order.items.length === 0) {
      return 'No items';
    }
    
    const itemStrings: string[] = [];
    
    // Add letters
    order.items.forEach(item => {
      if (item.letter) {
        itemStrings.push(`${item.quantity || 1}x Letter "${item.letter}" (${item.size}) - $${item.price?.toFixed(2) || '0.00'}`);
      }
    });
    
    // Add bails
    if (order.bailOptions && order.bailOptions.length > 0) {
      order.bailOptions.forEach(bail => {
        itemStrings.push(`${bail.quantity || 1}x Bail (${bail.size}) - $${bail.price?.toFixed(2) || '0.00'}`);
      });
    }
    
    // Add prongs
    if (order.prongsOptions && order.prongsOptions.length > 0) {
      order.prongsOptions.forEach(prong => {
        itemStrings.push(`${prong.quantity || 1}x Prong (${prong.size}) - $${prong.price?.toFixed(2) || '0.00'}`);
      });
    }
    
    return itemStrings.length > 0 ? itemStrings.join('; ') : 'No items';
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shipment?.trackingNumber?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const totalRevenue = filteredOrders
    .filter(order => order.status === 'paid' || order.status === 'shipped' || order.status === 'delivered')
    .reduce((sum, order) => sum + (order.amount || calculateTotal(order.items)), 0);
  const totalOrders = filteredOrders.length;
  const pendingOrders = filteredOrders.filter(o => o.status === 'pending' || o.status === 'processing' || o.status === 'pending-verification').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="size-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Show login screen if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-md mx-auto p-6 mt-20">
        <div className="bg-white rounded-lg border-2 border-gray-200 shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center size-16 bg-blue-100 rounded-full mb-4">
              <User className="size-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Admin Access Required</h2>
            <p className="text-gray-600 text-sm">
              Enter your admin password to access the Order Management Dashboard
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700 mb-2">
                Admin Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={adminPassword}
                onChange={(e) => {
                  setAdminPassword(e.target.value);
                  setAuthError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAdminLogin();
                  }
                }}
                placeholder="Enter your admin password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={authLoading}
              />
            </div>

            {authError && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                {authError}
              </div>
            )}

            <button
              onClick={handleAdminLogin}
              disabled={authLoading || !adminPassword.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {authLoading ? (
                <>
                  <RefreshCw className="size-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  <User className="size-4" />
                  Login to Dashboard
                </>
              )}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              🔒 Secure access - Only authorized administrators can view orders
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>📋 Admin Dashboard Features:</strong>
          </p>
          <ul className="mt-2 space-y-1 text-xs text-blue-700">
            <li>• View all customer orders and details</li>
            <li>• Export data to CSV or Excel spreadsheets</li>
            <li>• Search and filter by status, customer, tracking number</li>
            <li>• Track total revenue and pending orders</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1400px] mx-auto p-6 space-y-6">
      {/* Figma Iframe Warning */}
      {isInFigmaIframe && isFetchError && (
        <div className="bg-orange-50 border-2 border-orange-500 rounded-lg p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 text-3xl">⚠️</div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-orange-900 mb-2">
                Figma Preview Limitation Detected
              </h3>
              <p className="text-orange-800 mb-3">
                The Admin Dashboard cannot load orders inside Figma's preview due to Content Security Policy restrictions.
              </p>
              <div className="bg-white rounded-lg p-4 mb-3">
                <p className="font-semibold text-gray-900 mb-2">✅ Your API is working! Try this:</p>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                  <li>Open this URL in a new browser tab to see your orders JSON:
                    <div className="mt-1 p-2 bg-gray-100 rounded font-mono text-xs break-all">
                      {EDGE_FUNCTION_URL}/orders
                    </div>
                  </li>
                  <li className="mt-2">Or, deploy your app to a live URL and access the Admin Dashboard there</li>
                </ol>
              </div>
              <button
                onClick={() => window.open(`${EDGE_FUNCTION_URL}/orders`, '_blank')}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Open Orders API in New Tab →
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Order Management</h1>
          <p className="text-gray-600 mt-1">View and export all customer orders</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchOrders}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <RefreshCw className="size-4" />
            Refresh
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
          >
            <User className="size-4" />
            Logout
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="size-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="size-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-2xl font-bold">{totalOrders}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Calendar className="size-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Orders</p>
              <p className="text-2xl font-bold">{pendingOrders}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Export */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders, customers, tracking..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="processing">Processing</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="pending-verification">Pending Verification</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Export Buttons */}
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="size-4" />
            Export CSV
          </button>

          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="size-4" />
            Export Excel
          </button>
        </div>

        <div className="text-sm text-gray-600">
          Showing {filteredOrders.length} of {orders.length} orders
        </div>
      </div>

      {/* Orders Table */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Package className="size-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg text-gray-600">No orders found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tracking</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.orderId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.orderId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium text-gray-900">{order.customerName}</div>
                      <div className="text-gray-500 text-xs">{order.email}</div>
                      {order.phoneNumber && <div className="text-gray-500 text-xs">{order.phoneNumber}</div>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="max-w-xs space-y-1">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="text-xs">
                            {item.quantity || 1}x {item.letter} ({item.size}) - ${item.price}
                          </div>
                        ))}
                        {order.bailOptions && order.bailOptions.length > 0 && order.bailOptions.map((bail, idx) => (
                          <div key={`bail-${idx}`} className="text-xs text-blue-700">
                            {bail.quantity || 1}x Bail ({bail.size}) - ${bail.price}
                          </div>
                        ))}
                        {order.prongsOptions && order.prongsOptions.length > 0 && order.prongsOptions.map((prong, idx) => (
                          <div key={`prong-${idx}`} className="text-xs text-green-700">
                            {prong.quantity || 1}x Prong ({prong.size}) - ${prong.price}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${(order.amount || calculateTotal(order.items)).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'paid' || order.status === 'shipped' || order.status === 'delivered'
                          ? 'bg-green-100 text-green-800'
                          : order.status === 'pending' || order.status === 'processing' || order.status === 'pending-verification'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status || 'processing'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.paymentMethod === 'stripe'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {order.paymentMethod || 'stripe'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {order.shipment?.trackingNumber ? (
                        <div>
                          <div className="font-mono text-xs">{order.shipment.trackingNumber}</div>
                          <div className="text-xs text-gray-500">{order.shipment.status}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">No tracking</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {order.addressLine1 && (
                        <div className="text-xs">
                          <div>{order.addressLine1}</div>
                          {order.addressLine2 && <div>{order.addressLine2}</div>}
                          <div>{order.city}, {order.stateOrProvinceCode} {order.postalCode}</div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        onClick={() => handleDeleteOrder(order.orderId)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors border border-red-200"
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}