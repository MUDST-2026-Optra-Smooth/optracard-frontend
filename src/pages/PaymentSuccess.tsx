import { Link, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, Home, ShoppingBag, CreditCard, Wallet, QrCode, ArrowRight, Truck, Store } from 'lucide-react';
import { formatPrice } from '../context/formatters';

interface PaymentSuccessState {
  orderNumbers?: string[];
  paymentMethod?: 'cash' | 'credit-card' | 'qr';
  shippingMethod?: 'pickup' | 'standard';
  recipientName?: string;
  recipientPhone?: string;
  shippingAddress?: string;
  subtotal?: number;
  total?: number;
  itemCount?: number;
}

export const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = (location.state as PaymentSuccessState | null) ?? null;

  const orderNumbers = state?.orderNumbers ?? [];
  const paymentMethod = state?.paymentMethod ?? 'credit-card';
  const shippingMethod = state?.shippingMethod ?? 'standard';
  const total = state?.total;

  const getPaymentMethodDetails = (method: 'cash' | 'credit-card' | 'qr') => {
    switch (method) {
      case 'credit-card':
        return {
          name: 'Credit / Debit Card',
          description: 'Payment processed and confirmed securely',
          icon: CreditCard,
          badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
        };
      case 'qr':
        return {
          name: 'QR Code Payment',
          description: 'QR Payment verified and received',
          icon: QrCode,
          badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
        };
      case 'cash':
      default:
        return {
          name: 'Cash Payment',
          description: shippingMethod === 'pickup' ? 'Pay upon store pickup' : 'Cash on delivery (COD)',
          icon: Wallet,
          badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
        };
    }
  };

  const paymentInfo = getPaymentMethodDetails(paymentMethod);
  const PaymentIcon = paymentInfo.icon;

  const isCash = paymentMethod === 'cash';

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
        {/* Top Header Card */}
        <div className="bg-gradient-to-b from-emerald-50 via-teal-50/40 to-white px-6 pt-10 pb-8 text-center border-b border-gray-100">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 mb-5 ring-8 ring-emerald-50 shadow-inner">
            <CheckCircle2 size={44} className="stroke-[2.2]" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            {isCash ? 'Order Placed Successfully!' : 'Payment Successful!'}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 max-w-md mx-auto">
            {isCash
              ? 'Thank you for your order! Your request has been confirmed and is being prepared.'
              : 'Thank you for your purchase! Your payment has been processed successfully.'}
          </p>
        </div>

        {/* Order Details Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Order Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Payment Method */}
            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/70 flex items-start gap-3.5">
              <div className="p-2.5 rounded-lg bg-white shadow-xs border border-gray-100 text-gray-700">
                <PaymentIcon size={22} className="text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Payment Method</span>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">{paymentInfo.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{paymentInfo.description}</p>
              </div>
            </div>

            {/* Delivery / Shipping Method */}
            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/70 flex items-start gap-3.5">
              <div className="p-2.5 rounded-lg bg-white shadow-xs border border-gray-100 text-gray-700">
                {shippingMethod === 'pickup' ? (
                  <Store size={22} className="text-emerald-600" />
                ) : (
                  <Truck size={22} className="text-emerald-600" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-medium uppercase tracking-wider text-gray-500">Shipping Option</span>
                <p className="text-sm font-semibold text-gray-900 mt-0.5">
                  {shippingMethod === 'pickup' ? 'Store Pickup' : 'Standard Delivery'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {shippingMethod === 'pickup' ? 'Pick up at store counter' : 'Delivered to your address'}
                </p>
              </div>
            </div>
          </div>

          {/* Order Numbers & Total Info */}
          <div className="rounded-xl border border-gray-200 bg-white p-5 divide-y divide-gray-100 space-y-3.5">
            {orderNumbers.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3.5">
                <span className="text-sm text-gray-500 font-medium">
                  {orderNumbers.length === 1 ? 'Order Number' : 'Order Numbers'}
                </span>
                <div className="flex flex-wrap gap-2">
                  {orderNumbers.map((num) => (
                    <Link
                      key={num}
                      to={`/order-history/${num}`}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold bg-gray-100 text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition"
                    >
                      #{num}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {typeof total === 'number' && (
              <div className="flex items-center justify-between pt-3.5">
                <span className="text-sm font-medium text-gray-700">Total Amount</span>
                <span className="text-lg font-bold text-gray-900">{formatPrice(total)}</span>
              </div>
            )}

            {state?.recipientName && (
              <div className="pt-3.5 text-xs text-gray-500 space-y-1">
                <div className="font-medium text-gray-700 text-sm">Recipient Details:</div>
                <p>
                  {state.recipientName} {state.recipientPhone ? `• ${state.recipientPhone}` : ''}
                </p>
                {state.shippingAddress && <p className="text-gray-600">{state.shippingAddress}</p>}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Home size={18} />
              Return to Home
            </button>

            <Link
              to="/order-history"
              className="w-full sm:flex-1 py-3.5 px-6 rounded-xl border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-700 font-semibold text-sm transition flex items-center justify-center gap-2 text-center shadow-xs"
            >
              <ShoppingBag size={18} />
              View Order History
              <ArrowRight size={16} className="text-gray-400" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

