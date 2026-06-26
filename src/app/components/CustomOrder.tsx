import { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { PaymentFormCheckout } from './PaymentFormCheckout';
import { CheckCircle2, Loader2, DollarSign, Box, Instagram, Facebook, Twitter, Plus, Trash2, ShoppingCart, Package } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { EDGE_FUNCTION_BASE_URL, SUPABASE_ANON_KEY } from '../lib/api-config';


type PaymentMethod = 'stripe' | null;

interface LetterItem {
  letter: string;
  quantity: number;
  size: string; // 'extra-small', 'small', 'medium', 'large', or 'extra-large'
}



export function CustomOrder() {
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    size: '',
    material: 'sterling-silver', // Default to sterling silver since it's the only option
    details: '',
    // Shipping address fields
    addressLine1: '',
    addressLine2: '',
    city: '',
    stateOrProvinceCode: '',
    postalCode: '',
    phoneNumber: '',
  });
  
  // Separate state for cart items and hardware parts
  const [cartItems, setCartItems] = useState<LetterItem[]>([]);
  const [bailsCart, setBailsCart] = useState<{ size: string; quantity: number; price: number }[]>([]);
  const [prongsCart, setProngsCart] = useState<{ size: string; quantity: number; price: number }[]>([]);
  const [currentLetter, setCurrentLetter] = useState('');
  const [currentQuantity, setCurrentQuantity] = useState<number | ''>('');
  const [currentSize, setCurrentSize] = useState('medium'); // Default to medium
  
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>(null);
  const [priceBreakdown, setPriceBreakdown] = useState<{
    lettersSubtotal?: number;
    hardwareCost?: number;
    assemblyFee?: number;
    itemSubtotal: number;
    shippingFee: number;
    total: number;
  } | null>(null);
  const [loadingPrice, setLoadingPrice] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [completedOrderId, setCompletedOrderId] = useState<string | null>(null);

  // Check for restored order state on mount
  useEffect(() => {
    // Check if we're coming from a cancelled payment (URL parameter)
    const urlParams = new URLSearchParams(window.location.search);
    const shouldRestore = urlParams.get('restore') === 'payment';
    
    const restoredOrder = localStorage.getItem('forged_order_state');
    console.log('🔍 Checking for restored order state:', restoredOrder ? 'Found' : 'Not found');
    console.log('🔍 URL restore parameter:', shouldRestore ? 'YES' : 'NO');
    
    if (restoredOrder && shouldRestore) {
      try {
        const orderState = JSON.parse(restoredOrder);
        console.log('✅ Restoring order state:', orderState);
        
        setFormData(orderState.formData);
        setCartItems(orderState.cartItems);
        setBailsCart(orderState.bailsCart);
        setProngsCart(orderState.prongsCart);
        setPriceBreakdown(orderState.priceBreakdown);
        setShowPayment(true);
        
        // Clear the stored state after restoring
        localStorage.removeItem('forged_order_state');
        
        // Clear the URL parameter
        window.history.replaceState({}, '', '/#custom-orders');
        
        // Scroll to the custom order section after a brief delay
        setTimeout(() => {
          const element = document.getElementById('custom-orders');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 100);
        
        console.log('🎉 Order state restored successfully - showing payment view');
      } catch (error) {
        console.error('❌ Error restoring order state:', error);
      }
    } else if (shouldRestore && !restoredOrder) {
      console.warn('⚠️ Restore requested but no order state found');
    } else {
      console.log('ℹ️ No order state to restore');
    }
  }, []);

  // Helper functions defined before useEffects
  const calculatePriceLocally = () => {
    console.log('💻 Using local price calculation for cart:', cartItems);
    
    // Calculate letter costs based on size
    const getSizeValue = (size: string): number => {
      const sizeMap: { [key: string]: number } = {
        'extra-small': 1,
        'small': 2,
        'medium': 3,
        'large': 4,
        'extra-large': 5,
      };
      return sizeMap[size] || 3;
    };

    let lettersSubtotal = 0;
    cartItems.forEach(item => {
      const pricePerLetter = getSizeValue(item.size);
      const itemCost = pricePerLetter * item.quantity;
      console.log(`  - ${item.letter} x${item.quantity} @ ${item.size} = $${itemCost} ($${pricePerLetter} each)`);
      lettersSubtotal += itemCost;
    });
    
    console.log(`  Total letters cost: $${lettersSubtotal}`);

    // Calculate hardware costs (bails and prongs)
    let hardwareCost = 0;
    
    // Bails
    bailsCart.forEach(item => {
      const itemCost = item.price * item.quantity;
      console.log(`  - Bail ${item.size.toUpperCase()} x${item.quantity} = $${itemCost} ($${item.price} each)`);
      hardwareCost += itemCost;
    });
    
    // Prongs
    prongsCart.forEach(item => {
      const itemCost = item.price * item.quantity;
      console.log(`  - Prong ${item.size.toUpperCase()} x${item.quantity} = $${itemCost} ($${item.price} each)`);
      hardwareCost += itemCost;
    });
    
    console.log(`  Total hardware cost: $${hardwareCost}`);

    // Calculate totals
    const itemSubtotal = lettersSubtotal + hardwareCost;
    const shippingFee = 10; // $10 flat rate
    const total = itemSubtotal + shippingFee;

    console.log('💰 Final local calculation:', {
      lettersSubtotal,
      hardwareCost,
      itemSubtotal,
      shippingFee,
      total
    });

    setPriceBreakdown({
      lettersSubtotal,
      hardwareCost,
      itemSubtotal,
      shippingFee,
      total,
    });
  };

  // Calculate price when cart items, hardware, or material changes
  useEffect(() => {
    if (formData.material && (cartItems.length > 0 || bailsCart.length > 0 || prongsCart.length > 0)) {
      console.log('🔄 Price calculation triggered:', { 
        material: formData.material, 
        letterCount: cartItems.length,
        bailsCount: bailsCart.length,
        prongsCount: prongsCart.length
      });
      // Always use local calculation for consistency
      calculatePriceLocally();
    } else {
      console.log('❌ Price calculation skipped:', { 
        hasMaterial: !!formData.material, 
        itemCount: cartItems.length + bailsCart.length + prongsCart.length
      });
      setPriceBreakdown(null);
    }
  }, [cartItems, bailsCart, prongsCart, formData.material]);



  // Get price for a specific size
  const getSizePrice = (size: string): number => {
    const prices: { [key: string]: number } = {
      'extra-small': 1,
      'small': 2,
      'medium': 3,
      'large': 4,
      'extra-large': 5,
    };
    return prices[size] || 0;
  };

  // Calculate estimated subtotal from cart items
  const calculateEstimatedSubtotal = (): number => {
    return cartItems.reduce((sum, item) => {
      return sum + (getSizePrice(item.size) * item.quantity);
    }, 0);
  };

  // Get estimated total with shipping (no hardware or assembly)
  const getEstimatedTotal = (): number => {
    const subtotal = calculateEstimatedSubtotal();
    const shipping = 10; // $10 flat rate
    return subtotal + shipping;
  };

  const getTotalLetterCount = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form - require at least one item (letters, bails, or prongs)
    const hasItems = cartItems.length > 0 || bailsCart.length > 0 || prongsCart.length > 0;
    if (!formData.customerName || !formData.email || !hasItems || !formData.material) {
      alert('Please fill in all required fields and add at least one item to your order');
      return;
    }

    // OLD CODE TO REMOVE - Validate connected nameplate requirements
    if (false && formData.pendantStyle === 'connected') {
      // Check if Extra Small is in the cart - NOT allowed for connected nameplates
      const hasExtraSmall = cartItems.some(item => item.size === 'extra-small');
      if (hasExtraSmall) {
        alert('⚠️ Connected Nameplate Requirements:\\n\\n• Extra Small size is NOT available for connected nameplates\\n• Please use Small, Medium, Large, or Extra Large sizes only\\n\\nRemove Extra Small items from your cart to proceed.');
        return;
      }

      // Check for minimum letters based on sizes in cart
      const totalLetters = getTotalLetterCount();
      const hasSmallOrMedium = cartItems.some(item => item.size === 'small' || item.size === 'medium');
      const hasLargeOrXL = cartItems.some(item => item.size === 'large' || item.size === 'extra-large');
      
      // If cart has S/M sizes, require 4 letters minimum
      // If cart has ONLY L/XL sizes, require 3 letters minimum
      const minLetters = hasSmallOrMedium ? 4 : 3;
      
      if (totalLetters < minLetters) {
        const sizeInfo = hasSmallOrMedium 
          ? '(Small/Medium sizes require min 4 letters)' 
          : '(Large/XL sizes: min 3 letters)';
        alert(`⚠️ Connected Nameplate Requirements:\n\n• Minimum ${minLetters} letters required ${sizeInfo}\n• You currently have: ${totalLetters} letter(s)\n\nPlease add more letters to create a connected nameplate.`);
        return;
      }

      // Check for exactly 2 bails of the same size
      if (formData.hardwareChoice === 'bails') {
        const bailSize = bailOptions[0]?.size;
        const bailQty = bailOptions[0]?.quantity || 0;
        
        if (bailQty !== 2) {
          alert('⚠️ Connected Nameplate Requirements:\n\n• Exactly 2 bails of the same size are required\n• You currently have: ' + bailQty + ' bail(s)\n\nPlease update your bail quantity to 2.');
          return;
        }
      }
    }

    // Validate Houston-only shipping
    const city = formData.city.toLowerCase().trim();
    const state = formData.stateOrProvinceCode.toUpperCase().trim();
    
    if (state !== 'TX' || city !== 'houston') {
      alert('⚠️ We currently only ship to Houston, Texas.\n\nPlease ensure:\n• City: Houston\n• State: TX\n\nThank you for your understanding!');
      return;
    }

    // Save order state before showing payment
    const orderState = {
      formData,
      cartItems,
      bailsCart,
      prongsCart,
      priceBreakdown
    };
    console.log('💾 Saving order state to localStorage:', orderState);
    localStorage.setItem('forged_order_state', JSON.stringify(orderState));
    console.log('✅ Order state saved successfully');
    
    // Debug: Verify it was saved
    const saved = localStorage.getItem('forged_order_state');
    console.log('🔍 Verification - State in localStorage:', saved ? 'EXISTS' : 'MISSING');

    setShowPayment(true);
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
  };

  const handlePaymentSuccess = (orderId?: string) => {
    if (orderId) {
      setCompletedOrderId(orderId);
    }
    // Clear any stored order state on successful payment
    localStorage.removeItem('forged_order_state');
    setOrderComplete(true);
    setShowPayment(false);
    setSelectedPaymentMethod(null);
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
    setSelectedPaymentMethod(null);
  };

  const addItemToCart = () => {
    if (!currentLetter || currentQuantity === '' || currentQuantity < 1) {
      alert('Please enter a valid letter and quantity');
      return;
    }

    // Note: Validation for connected nameplate minimum letters is done at checkout, not when adding to cart
    if (false && formData.pendantStyle === 'connected') {
      const minLetters = (currentSize === 'large' || currentSize === 'extra-large') ? 3 : 4;
      if (currentQuantity < minLetters) {
        const sizeLabel = currentSize === 'large' ? 'Large' : currentSize === 'extra-large' ? 'Extra Large' : currentSize.charAt(0).toUpperCase() + currentSize.slice(1);
        alert(`⚠️ Connected Nameplate Requirement:\n\n• Minimum ${minLetters} letters required for ${sizeLabel} size\n• You currently have: ${currentQuantity} letter(s)\n\nPlease increase the quantity to at least ${minLetters} letters.`);
        return;
      }
    }
    if (!currentSize) {
      alert('Please select a size');
      return;
    }

    const letter = currentLetter.toUpperCase().trim();
    
    // Validate it's a single letter A-Z
    if (!/^[A-Z]$/.test(letter)) {
      alert('Please enter a single letter from A to Z');
      return;
    }

    // Check if same letter with same size already exists
    const existingIndex = cartItems.findIndex(
      item => item.letter === letter && item.size === currentSize
    );
    
    if (existingIndex >= 0) {
      // Update existing item quantity
      const updatedItems = [...cartItems];
      updatedItems[existingIndex].quantity += currentQuantity;
      setCartItems(updatedItems);
    } else {
      // Add new item with its size
      setCartItems([...cartItems, { letter, quantity: currentQuantity, size: currentSize }]);
    }

    // Reset inputs
    setCurrentLetter('');
    setCurrentQuantity('');
    setCurrentSize('medium'); // Reset to default
  };

  const removeItemFromCart = (index: number) => {
    const updatedItems = cartItems.filter((_, i) => i !== index);
    setCartItems(updatedItems);
  };

  const updateItemQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    const updatedItems = [...cartItems];
    updatedItems[index].quantity = newQuantity;
    setCartItems(updatedItems);
  };

  const updateItemSize = (index: number, newSize: string) => {
    const updatedItems = [...cartItems];
    updatedItems[index].size = newSize;
    setCartItems(updatedItems);
  };

  if (orderComplete) {
    return (
      <section id="custom-orders" className="py-12 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="border-border">
              <CardContent className="p-6 md:p-12 text-center">
                <CheckCircle2 className="w-14 h-14 md:w-16 md:h-16 text-green-500 mx-auto mb-4 md:mb-6" />
                <h2 className="text-2xl md:text-3xl mb-3 md:mb-4">Order Confirmed!</h2>
                <p className="text-base md:text-lg text-muted-foreground mb-4 md:mb-6">
                  Thank you for your custom order, {formData.customerName}!
                </p>
                <p className="text-sm md:text-base text-muted-foreground mb-4">
                  We've received your payment and order details. We'll begin crafting your 
                  personalized jewelry immediately.
                </p>

                {/* Order ID Display */}
                {completedOrderId && (
                  <div className="p-3 md:p-4 bg-green-50 border-2 border-green-300 rounded-lg mb-4 md:mb-6">
                    <p className="text-xs md:text-sm text-green-900 mb-2">
                      <strong>📋 Your Order ID:</strong>
                    </p>
                    <p className="text-lg md:text-2xl font-mono bg-white px-3 md:px-4 py-2 rounded border border-green-400 inline-block break-all">
                      {completedOrderId}
                    </p>
                    <p className="text-xs text-green-800 mt-2">
                      Save this ID for tracking and reference
                    </p>
                  </div>
                )}

                {/* Social Media Contact Reminder */}
                <div className="p-4 md:p-6 bg-blue-50 border-2 border-blue-300 rounded-lg mb-4 md:mb-6">
                  <p className="text-xs md:text-sm mb-2 md:mb-3">
                    <strong className="text-blue-900 text-sm md:text-base">📱 Important: Stay Connected!</strong>
                  </p>
                  <p className="text-xs md:text-sm text-blue-900 mb-2 md:mb-3">
                    We'll reach out to you through social media for updates, design confirmations, and shipping details.
                  </p>
                  <div className="flex justify-center gap-4 md:gap-6 mb-2 md:mb-3">
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700">
                      <Instagram className="w-7 h-7 md:w-8 md:h-8" />
                    </a>
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                      <Facebook className="w-7 h-7 md:w-8 md:h-8" />
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:text-sky-600">
                      <Twitter className="w-7 h-7 md:w-8 md:h-8" />
                    </a>
                  </div>
                  <p className="text-xs text-blue-800">
                    Please ensure you're following us and have DMs enabled
                  </p>
                </div>

                <Button 
                  onClick={() => window.location.reload()} 
                  className="mt-4 md:mt-6 w-full sm:w-auto"
                  size="lg"
                >
                  Place Another Order
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  // Payment modal
  if (showPayment) {
    return (
      <section id="custom-orders" className="py-12 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="border-border">
              <CardContent className="p-4 md:p-8">
                <h2 className="text-xl md:text-2xl mb-4 md:mb-6">Complete Your Payment</h2>
                
                {!selectedPaymentMethod ? (
                  <>
                    <div className="mb-6">
                      <h3 className="mb-2">Order Summary</h3>
                      <p><strong>Name:</strong> {formData.customerName}</p>
                      <p><strong>Email:</strong> {formData.email}</p>
                      <p><strong>Items:</strong> {cartItems.map(item => `${item.quantity}x ${item.letter} (${item.size})`).join(', ')}</p>
                      {priceBreakdown && (
                        <div className="mt-4 p-4 bg-muted rounded">
                          {priceBreakdown.itemSubtotal !== undefined && (
                            <p><strong>Subtotal:</strong> ${priceBreakdown.itemSubtotal.toFixed(2)}</p>
                          )}
                          {priceBreakdown.shippingFee !== undefined && (
                            <p><strong>Shipping:</strong> ${priceBreakdown.shippingFee.toFixed(2)}</p>
                          )}
                          {priceBreakdown.total !== undefined && (
                            <p className="text-xl mt-2"><strong>Total:</strong> ${priceBreakdown.total.toFixed(2)}</p>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <h3 className="mb-4 text-base md:text-lg">Proceed to Payment</h3>
                    <p className="text-sm text-muted-foreground mb-4">Secure checkout with Card, Cash App, or Link</p>
                    <div className="grid grid-cols-1 gap-3 md:gap-4">
                      <Button 
                        onClick={() => handlePaymentMethodSelect('stripe')}
                        className="h-16 md:h-20 text-base md:text-lg"
                      >
                        <DollarSign className="mr-2 w-5 h-5" />
                        Continue to Checkout
                      </Button>
                    </div>
                    
                    <Button 
                      onClick={handlePaymentCancel}
                      variant="outline"
                      className="w-full mt-4"
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <PaymentFormCheckout
                    amount={priceBreakdown?.total || 0}
                    shippingCost={priceBreakdown?.shippingFee || 10}
                    hardwareCost={priceBreakdown?.hardwareCost || 0}
                    assemblyFee={priceBreakdown?.assemblyFee || 0}
                    bailOptions={bailsCart}
                    prongsOptions={prongsCart}
                    extraJumpRings={0}
                    formData={{
                      ...formData,
                      items: cartItems,
                    }}
                    onCancel={handlePaymentCancel}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="custom-orders" className="py-12 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <Badge className="mb-3 md:mb-4 text-xs md:text-sm">Custom Orders</Badge>
            <h2 className="text-3xl md:text-4xl lg:text-5xl mb-3 md:mb-4">Create Your Custom Piece</h2>
            <p className="text-lg md:text-xl text-muted-foreground">
              Hand-crafted initial jewelry made just for you
            </p>
          </div>

          <Card className="border-border">
            <CardContent className="p-4 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-base md:text-lg flex items-center gap-2">
                    <span>👤</span> Personal Information
                  </h3>
                  
                  <div>
                    <Label htmlFor="customerName" className="text-sm md:text-base mb-2 block">Full Name *</Label>
                    <Input
                      id="customerName"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      placeholder="John Doe"
                      required
                      className="bg-white border-2 border-gray-300 h-12 md:h-14 shadow-sm text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm md:text-base mb-2 block">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@example.com"
                      required
                      className="bg-white border-2 border-gray-300 h-12 md:h-14 shadow-sm text-base"
                    />
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="space-y-4 pt-6 border-t">
                  <h3 className="text-base md:text-lg flex items-center gap-2">
                    <Box className="w-5 h-5" />
                    Shipping Address (Houston, TX Only)
                  </h3>
                  
                  <div className="p-3 md:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-xs md:text-sm text-yellow-900">
                      <strong>⚠️ Important:</strong> We currently only ship to Houston, Texas addresses.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="addressLine1" className="text-sm md:text-base mb-2 block">Street Address *</Label>
                    <Input
                      id="addressLine1"
                      value={formData.addressLine1}
                      onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                      placeholder="123 Main St"
                      required
                      className="bg-white border-2 border-gray-300 h-12 md:h-14 shadow-sm text-base"
                    />
                  </div>

                  <div>
                    <Label htmlFor="addressLine2" className="text-sm md:text-base mb-2 block">Apartment, Suite, etc. (Optional)</Label>
                    <Input
                      id="addressLine2"
                      value={formData.addressLine2}
                      onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                      placeholder="Apt 4B"
                      className="bg-white border-2 border-gray-300 h-12 md:h-14 shadow-sm text-base"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city" className="text-sm md:text-base mb-2 block">City *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="Houston"
                        required
                        className="bg-white border-2 border-gray-300 h-12 md:h-14 shadow-sm text-base"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state" className="text-sm md:text-base mb-2 block">State *</Label>
                      <Input
                        id="state"
                        value={formData.stateOrProvinceCode}
                        onChange={(e) => setFormData({ ...formData, stateOrProvinceCode: e.target.value })}
                        placeholder="TX"
                        required
                        maxLength={2}
                        className="bg-white border-2 border-gray-300 h-12 md:h-14 shadow-sm text-base"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="postalCode" className="text-sm md:text-base mb-2 block">ZIP Code *</Label>
                      <Input
                        id="postalCode"
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        placeholder="77001"
                        required
                        className="bg-white border-2 border-gray-300 h-12 md:h-14 shadow-sm text-base"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phoneNumber" className="text-sm md:text-base mb-2 block">Phone Number *</Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        placeholder="(555) 123-4567"
                        required
                        className="bg-white border-2 border-gray-300 h-12 md:h-14 shadow-sm text-base"
                      />
                    </div>
                  </div>
                </div>

                {/* Material Selection */}
                <div className="space-y-4 pt-6 border-t">
                  <h3 className="text-lg flex items-center gap-2">
                    <span>✨</span> Material Selection
                  </h3>
                  
                  <div>
                    <Label className="text-base">Material *</Label>
                    <Select
                      value={formData.material}
                      onValueChange={(value) => setFormData({ ...formData, material: value })}
                    >
                      <SelectTrigger className="bg-white border-2 border-gray-300 h-12 shadow-sm">
                        <SelectValue placeholder="Select material" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sterling-silver">925 Sterling Silver</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Letter Selection */}
                <div className="space-y-4 pt-6 border-t">
                  <h3 className="text-lg flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Add Letters to Your Order
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="letter" className="text-base">Letter (A-Z)</Label>
                      <Input
                        id="letter"
                        value={currentLetter}
                        onChange={(e) => setCurrentLetter(e.target.value.toUpperCase())}
                        placeholder="A"
                        maxLength={1}
                        className="bg-white border-2 border-gray-300 h-12 shadow-sm uppercase"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="quantity" className="text-base">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={currentQuantity}
                        onChange={(e) => setCurrentQuantity(parseInt(e.target.value) || '')}
                        placeholder="1"
                        className="bg-white border-2 border-gray-300 h-12 shadow-sm"
                      />
                    </div>

                    <div>
                      <Label htmlFor="size" className="text-base">Size</Label>
                      <Select
                        value={currentSize}
                        onValueChange={(value) => setCurrentSize(value)}
                      >
                        <SelectTrigger className="bg-white border-2 border-gray-300 h-12 shadow-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="extra-small">Extra Small ($1)</SelectItem>
                          <SelectItem value="small">Small ($2)</SelectItem>
                          <SelectItem value="medium">Medium ($3)</SelectItem>
                          <SelectItem value="large">Large ($4)</SelectItem>
                          <SelectItem value="extra-large">Extra Large ($5)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={addItemToCart}
                    className="w-full h-12"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>

                  {/* Cart Display */}
                  {cartItems.length > 0 && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
                      <h4 className="mb-3">Your Cart ({getTotalLetterCount()} letters)</h4>
                      <div className="space-y-2">
                        {cartItems.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                            <div className="flex items-center gap-4">
                              <span className="text-2xl">{item.letter}</span>
                              <div className="text-sm">
                                <div>Qty: {item.quantity}</div>
                                <div className="text-muted-foreground">
                                  {item.size.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} 
                                  (${getSizePrice(item.size)} each)
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 1)}
                                className="w-16 h-8"
                              />
                              <Select
                                value={item.size}
                                onValueChange={(value) => updateItemSize(index, value)}
                              >
                                <SelectTrigger className="w-24 h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="extra-small">XS</SelectItem>
                                  <SelectItem value="small">S</SelectItem>
                                  <SelectItem value="medium">M</SelectItem>
                                  <SelectItem value="large">L</SelectItem>
                                  <SelectItem value="extra-large">XL</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                type="button"
                                onClick={() => removeItemFromCart(index)}
                                variant="ghost"
                                size="sm"
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Hardware Parts - Bails & Prongs */}
                <div className="space-y-4 pt-6 border-t">
                  <h3 className="text-lg flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Add Hardware Parts (Optional)
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Add sterling silver bails or prongs to your order
                  </p>

                  {/* Bails Section */}
                  <div className="space-y-3">
                    <h4 className="flex items-center gap-2">Sterling Silver Bails</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { size: 'xs', price: 1.50, label: 'XS' },
                        { size: 's', price: 2.00, label: 'S' },
                        { size: 'm', price: 2.50, label: 'M' },
                        { size: 'l', price: 3.00, label: 'L' }
                      ].map(bail => {
                        const inCart = bailsCart.find(item => item.size === bail.size);
                        return (
                          <div key={bail.size} className="p-3 border-2 border-gray-200 rounded-lg bg-white">
                            <div className="mb-2">
                              <div className="text-sm">{bail.label} Bail</div>
                              <div className="text-xs text-muted-foreground">${bail.price.toFixed(2)}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="0"
                                value={inCart?.quantity || ''}
                                onChange={(e) => {
                                  const qty = parseInt(e.target.value) || 0;
                                  if (qty === 0) {
                                    setBailsCart(bailsCart.filter(item => item.size !== bail.size));
                                  } else {
                                    const existing = bailsCart.findIndex(item => item.size === bail.size);
                                    if (existing >= 0) {
                                      const updated = [...bailsCart];
                                      updated[existing] = { size: bail.size, quantity: qty, price: bail.price };
                                      setBailsCart(updated);
                                    } else {
                                      setBailsCart([...bailsCart, { size: bail.size, quantity: qty, price: bail.price }]);
                                    }
                                  }
                                }}
                                className="w-16 h-8 text-sm"
                                placeholder="0"
                              />
                              <span className="text-xs">qty</span>
                            </div>
                            {inCart && inCart.quantity > 0 && (
                              <div className="text-xs text-purple-600 mt-1">
                                ${(inCart.quantity * bail.price).toFixed(2)}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Prongs Section */}
                  <div className="space-y-3">
                    <h4 className="flex items-center gap-2">Sterling Silver Prongs</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { size: 'half-carat', price: 1.75, label: '½ Carat' },
                        { size: '1-carat', price: 2.75, label: '1 Carat' }
                      ].map(prong => {
                        const inCart = prongsCart.find(item => item.size === prong.size);
                        return (
                          <div key={prong.size} className="p-3 border-2 border-gray-200 rounded-lg bg-white">
                            <div className="mb-2">
                              <div className="text-sm">{prong.label} Prong</div>
                              <div className="text-xs text-muted-foreground">${prong.price.toFixed(2)}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                min="0"
                                value={inCart?.quantity || ''}
                                onChange={(e) => {
                                  const qty = parseInt(e.target.value) || 0;
                                  if (qty === 0) {
                                    setProngsCart(prongsCart.filter(item => item.size !== prong.size));
                                  } else {
                                    const existing = prongsCart.findIndex(item => item.size === prong.size);
                                    if (existing >= 0) {
                                      const updated = [...prongsCart];
                                      updated[existing] = { size: prong.size, quantity: qty, price: prong.price };
                                      setProngsCart(updated);
                                    } else {
                                      setProngsCart([...prongsCart, { size: prong.size, quantity: qty, price: prong.price }]);
                                    }
                                  }
                                }}
                                className="w-16 h-8 text-sm"
                                placeholder="0"
                              />
                              <span className="text-xs">qty</span>
                            </div>
                            {inCart && inCart.quantity > 0 && (
                              <div className="text-xs text-purple-600 mt-1">
                                ${(inCart.quantity * prong.price).toFixed(2)}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Hardware Cart Summary */}
                  {(bailsCart.length > 0 || prongsCart.length > 0) && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                      <h4 className="mb-3">Hardware in Cart</h4>
                      <div className="space-y-2">
                        {bailsCart.map((item, index) => (
                          <div key={`bail-${index}`} className="flex items-center justify-between p-2 bg-white rounded text-sm">
                            <span>{item.size.toUpperCase()} Bail × {item.quantity}</span>
                            <span className="text-purple-600">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                        {prongsCart.map((item, index) => {
                          const displaySize = item.size === 'half-carat' ? '½ Carat' : item.size === '1-carat' ? '1 Carat' : item.size.toUpperCase();
                          return (
                            <div key={`prong-${index}`} className="flex items-center justify-between p-2 bg-white rounded text-sm">
                              <span>{displaySize} Prong × {item.quantity}</span>
                              <span className="text-purple-600">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Summary Calculator */}
                {(cartItems.length > 0 || bailsCart.length > 0 || prongsCart.length > 0) && (
                  <div className="space-y-4 pt-6 border-t">
                    <h3 className="text-lg flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Order Summary & Total
                    </h3>
                    
                    <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-300 rounded-xl p-6 shadow-lg">
                      {/* Letters Breakdown */}
                      {cartItems.length > 0 && (
                        <div className="mb-4">
                          <h4 className="mb-3 text-purple-900">Custom Letters</h4>
                          <div className="space-y-2 bg-white rounded-lg p-3">
                            {cartItems.map((item, idx) => {
                              const itemTotal = getSizePrice(item.size) * item.quantity;
                              return (
                                <div key={idx} className="flex justify-between items-center text-sm">
                                  <span className="flex items-center gap-2">
                                    <span className="text-xl">{item.letter}</span>
                                    <span className="text-muted-foreground">
                                      {item.size.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} × {item.quantity}
                                    </span>
                                  </span>
                                  <span className="text-purple-600">${itemTotal.toFixed(2)}</span>
                                </div>
                              );
                            })}
                            <div className="border-t pt-2 mt-2 flex justify-between items-center">
                              <span>Letters Subtotal:</span>
                              <span className="text-purple-700">${calculateEstimatedSubtotal().toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Hardware Breakdown */}
                      {(bailsCart.length > 0 || prongsCart.length > 0) && (
                        <div className="mb-4">
                          <h4 className="mb-3 text-purple-900">Hardware Parts</h4>
                          <div className="space-y-2 bg-white rounded-lg p-3">
                            {bailsCart.map((item, idx) => {
                              const itemTotal = item.price * item.quantity;
                              return (
                                <div key={`bail-${idx}`} className="flex justify-between items-center text-sm">
                                  <span className="text-muted-foreground">
                                    {item.size.toUpperCase()} Bail × {item.quantity}
                                  </span>
                                  <span className="text-purple-600">${itemTotal.toFixed(2)}</span>
                                </div>
                              );
                            })}
                            {prongsCart.map((item, idx) => {
                              const itemTotal = item.price * item.quantity;
                              const displaySize = item.size === 'half-carat' ? '½ Carat' : item.size === '1-carat' ? '1 Carat' : item.size.toUpperCase();
                              return (
                                <div key={`prong-${idx}`} className="flex justify-between items-center text-sm">
                                  <span className="text-muted-foreground">
                                    {displaySize} Prong × {item.quantity}
                                  </span>
                                  <span className="text-purple-600">${itemTotal.toFixed(2)}</span>
                                </div>
                              );
                            })}
                            <div className="border-t pt-2 mt-2 flex justify-between items-center">
                              <span>Hardware Subtotal:</span>
                              <span className="text-purple-700">${(priceBreakdown?.hardwareCost || 0).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Total Calculation */}
                      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-4 shadow-md">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-sm opacity-90">
                            <span>Items Subtotal:</span>
                            <span>${(priceBreakdown?.itemSubtotal || 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm opacity-90">
                            <span>Shipping (Flat Rate):</span>
                            <span>$10.00</span>
                          </div>
                          <div className="border-t-2 border-white/30 pt-2 mt-2 flex justify-between items-center">
                            <span className="text-xl">Total:</span>
                            <span className="text-2xl">${(priceBreakdown?.total || 0).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Quick Calculation Reference */}
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs">
                        <p className="text-blue-900 mb-1">
                          💡 <strong>Calculation:</strong> {calculateEstimatedSubtotal().toFixed(2)} (Letters) + {(priceBreakdown?.hardwareCost || 0).toFixed(2)} (Hardware) + 10.00 (Shipping) = ${(priceBreakdown?.total || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Details */}
                <div className="space-y-4 pt-6 border-t">
                  <h3 className="text-lg">Additional Details (Optional)</h3>
                  <div>
                    <Label htmlFor="details" className="text-base">Special Requests or Notes</Label>
                    <Textarea
                      id="details"
                      value={formData.details}
                      onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                      placeholder="Any special requests for your custom piece?"
                      rows={4}
                      className="bg-white border-2 border-gray-300 shadow-sm"
                    />
                  </div>
                </div>

                {/* Price Estimate */}
                {cartItems.length > 0 && (
                  <div className="p-8 bg-gradient-to-br from-purple-50 to-purple-100 border-4 border-purple-400 rounded-xl shadow-lg">
                    <h3 className="mb-6 flex items-center gap-2 text-purple-900">
                      <DollarSign className="w-6 h-6" />
                      Estimated Total
                    </h3>
                    
                    {/* Debug Info - Show ALL breakdown values */}
                    {priceBreakdown && (
                      <div className="mb-4 p-3 bg-blue-50 border-2 border-blue-300 rounded-lg text-xs font-mono">
                        <p className="font-bold text-blue-900 mb-2">🔍 Full Price Breakdown:</p>
                        <div className="space-y-1 text-blue-800">
                          <div className="flex justify-between">
                            <span>Letters:</span>
                            <span className="font-bold">${(priceBreakdown.lettersSubtotal ?? 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Hardware:</span>
                            <span className="font-bold">${(priceBreakdown.hardwareCost ?? 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between bg-yellow-100 px-2 py-1 rounded">
                            <span>Assembly Fee:</span>
                            <span className="font-bold text-red-900">${(priceBreakdown.assemblyFee ?? 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between border-t border-blue-300 pt-1">
                            <span>Items Subtotal:</span>
                            <span className="font-bold">${(priceBreakdown.itemSubtotal ?? 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Shipping:</span>
                            <span className="font-bold">${(priceBreakdown.shippingFee ?? 10).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between border-t-2 border-blue-500 pt-1 mt-1">
                            <span className="font-bold">TOTAL:</span>
                            <span className="font-bold text-lg">${(priceBreakdown.total ?? 0).toFixed(2)}</span>
                          </div>

                        </div>
                      </div>
                    )}
                    

                    
                    {loadingPrice ? (
                      <div className="flex items-center gap-2 text-lg">
                        <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                        <span className="text-purple-900">Calculating price...</span>
                      </div>
                    ) : priceBreakdown ? (
                      <div className="space-y-3">
                        {/* Letters Subtotal */}
                        {(priceBreakdown.lettersSubtotal !== undefined || cartItems.length > 0) && (
                          <div className="flex justify-between items-center text-base bg-white/60 p-3 rounded-lg">
                            <span className="text-purple-900">Letters ({getTotalLetterCount()}):</span>
                            <span className="text-purple-900">${(priceBreakdown.lettersSubtotal ?? calculateEstimatedSubtotal()).toFixed(2)}</span>
                          </div>
                        )}
                        
                        {/* Hardware Cost */}
                        {priceBreakdown.hardwareCost !== undefined && priceBreakdown.hardwareCost > 0 && (
                          <div className="flex justify-between items-center text-base bg-white/60 p-3 rounded-lg">
                            <span className="text-purple-900">
                              Hardware ({bailsCart.reduce((sum, b) => sum + b.quantity, 0) + prongsCart.reduce((sum, p) => sum + p.quantity, 0)} items):
                            </span>
                            <span className="text-purple-900">${priceBreakdown.hardwareCost.toFixed(2)}</span>
                          </div>
                        )}
                        
                        {/* Assembly Fee */}
                        {priceBreakdown.assemblyFee !== undefined && priceBreakdown.assemblyFee > 0 && (
                          <div className="flex justify-between items-center text-base bg-yellow-100 border-2 border-yellow-500 p-3 rounded-lg">
                            <span className="text-purple-900 font-bold">
                              ⚙️ Assembly Fee ({formData.pendantStyle === 'connected' ? 'Connected Nameplate' : formData.pendantStyle === 'bar' ? 'Bar Style' : formData.pendantStyle === 'separated' ? 'Separated Letters' : 'Unknown'}):
                            </span>
                            <span className="text-purple-900 font-bold">${priceBreakdown.assemblyFee.toFixed(2)}</span>
                          </div>
                        )}
                        
                        {/* Items Subtotal (if we have breakdown) */}
                        {priceBreakdown.itemSubtotal !== undefined && (priceBreakdown.lettersSubtotal !== undefined || priceBreakdown.hardwareCost !== undefined || priceBreakdown.assemblyFee !== undefined) && (
                          <div className="flex justify-between items-center text-lg bg-purple-200/50 p-4 rounded-lg border-2 border-purple-300">
                            <span className="text-purple-900">Items Subtotal:</span>
                            <span className="text-purple-900">${priceBreakdown.itemSubtotal.toFixed(2)}</span>
                          </div>
                        )}
                        
                        {/* Shipping */}
                        {priceBreakdown.shippingFee !== undefined && (
                          <div className="flex justify-between items-center text-lg bg-white/60 p-4 rounded-lg">
                            <span className="text-purple-900">Shipping (Houston, TX):</span>
                            <span className="text-purple-900">${priceBreakdown.shippingFee.toFixed(2)}</span>
                          </div>
                        )}
                        
                        {/* Total */}
                        {priceBreakdown.total !== undefined && (
                          <>
                            <div className="flex justify-between items-center text-2xl pt-4 border-t-4 border-purple-400 bg-white p-5 rounded-lg shadow-md">
                              <span className="text-purple-900">Total:</span>
                              <span className="text-purple-900">${(priceBreakdown.total || getEstimatedTotal()).toFixed(2)}</span>
                            </div>
                            
                            {/* Calculation Summary */}
                            <div className="mt-2 p-3 bg-gray-100 border border-gray-300 rounded-lg text-sm">
                              <p className="font-bold text-gray-900 mb-1">💡 Total Calculation:</p>
                              <div className="space-y-1 text-gray-700 font-mono">
                                <div>Letters: ${(priceBreakdown.lettersSubtotal ?? 0).toFixed(2)}</div>
                                {(priceBreakdown.hardwareCost ?? 0) > 0 && (
                                  <div>+ Hardware: ${(priceBreakdown.hardwareCost ?? 0).toFixed(2)}</div>
                                )}
                                {(priceBreakdown.assemblyFee ?? 0) > 0 && (
                                  <div className="font-bold text-red-700">+ Assembly: ${(priceBreakdown.assemblyFee ?? 0).toFixed(2)}</div>
                                )}
                                <div>+ Shipping: ${(priceBreakdown.shippingFee ?? 10).toFixed(2)}</div>
                                <div className="border-t border-gray-400 pt-1 mt-1 font-bold">
                                  = ${(priceBreakdown.total ?? 0).toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <p className="text-lg text-purple-800 bg-white/60 p-4 rounded-lg">Select material to see pricing</p>
                    )}
                  </div>
                )}

                {/* Social Media Contact Notice */}
                <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
                  <h3 className="mb-3 flex items-center gap-2">
                    <span>📱</span> Contact & Communication
                  </h3>
                  <p className="text-sm text-blue-900 mb-3">
                    We communicate exclusively through social media for order updates, design confirmations, and shipping details.
                  </p>
                  <div className="flex gap-4 mb-3">
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 transition-colors">
                      <Instagram className="w-6 h-6" />
                    </a>
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 transition-colors">
                      <Facebook className="w-6 h-6" />
                    </a>
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:text-sky-600 transition-colors">
                      <Twitter className="w-6 h-6" />
                    </a>
                  </div>
                  <p className="text-xs text-blue-800">
                    Please ensure you're following us and have direct messages enabled
                  </p>
                </div>

                <Button type="submit" className="w-full" size="lg">
                  Proceed to Payment
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
