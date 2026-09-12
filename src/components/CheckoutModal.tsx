import { useEffect, useState } from 'react';
import { X, Truck, Store, Package, MapPin, Wallet, CreditCard, QrCode, Check } from 'lucide-react';
import { formatPrice } from '../context/formatters';

export interface SavedAddress {
  name: string;
  phone: string;
  address: string;
}

export interface CheckoutDetails {
  shippingMethod: 'pickup' | 'standard';
  paymentMethod: 'cash' | 'credit-card' | 'qr';
  recipientName: string;
  recipientPhone: string;
  shippingAddress: string;
}

export interface CheckoutSellerGroup {
  key: string;
  storeName: string;
  source: 'OFFICIAL' | 'MARKETPLACE';
  itemCount: number;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  subtotal: number;
  sellerGroups: CheckoutSellerGroup[];
  savedAddress: SavedAddress;
  onConfirm: (details: CheckoutDetails) => void;
}

const SHIPPING_OPTIONS = [
  {
    id: 'pickup',
    label: 'Store Pickup',
    description: 'Pick up your order at our store counter',
    fee: 0,
    icon: Store,
  },
  {
    id: 'standard',
    label: 'Standard Delivery',
    description: 'Delivered in 2–3 business days',
    fee: 50,
    icon: Truck,
  },
] as const;

type ShippingId = (typeof SHIPPING_OPTIONS)[number]['id'];

const PAYMENT_OPTIONS = [
  {
    id: 'cash',
    label: 'Cash Payment',
    description: 'Pay in cash when you receive your order',
    icon: Wallet,
  },
  {
    id: 'credit-card',
    label: 'Credit Card',
    description: 'Pay securely at checkout',
    icon: CreditCard,
  },
  {
    id: 'qr',
    label: 'QR Payment',
    description: 'Scan with your banking app',
    icon: QrCode,
  },
] as const;

type PaymentId = (typeof PAYMENT_OPTIONS)[number]['id'];

export const CheckoutModal = ({ isOpen, onClose, subtotal, sellerGroups, savedAddress, onConfirm }: CheckoutModalProps) => {
  const [shippingMethod, setShippingMethod] = useState<ShippingId>('pickup');
  const [paymentMethod, setPaymentMethod] = useState<PaymentId>('cash');
  const [addressMode, setAddressMode] = useState<'saved' | 'new'>('saved');
  const [newAddress, setNewAddress] = useState({ name: '', phone: '', address: '' });
  const [cardDetails, setCardDetails] = useState({ number: '', name: '', expiry: '', cvc: '' });

  const sellerCount = Math.max(sellerGroups.length, 1);
  const hasMultipleSellers = sellerCount > 1;

  useEffect(() => {
    if (hasMultipleSellers) setShippingMethod('standard');
  }, [hasMultipleSellers]);

  if (!isOpen) return null;

  const needsAddress = shippingMethod !== 'pickup';
  const selectedShipping = SHIPPING_OPTIONS.find((opt) => opt.id === shippingMethod)!;
  const shippingFee = selectedShipping.fee * sellerCount;
  const total = subtotal + shippingFee;

  const isNewAddressValid =
    newAddress.name.trim() !== '' && newAddress.phone.trim() !== '' && newAddress.address.trim() !== '';
  const isSavedAddressValid =
    savedAddress.name.trim() !== '' && savedAddress.phone.trim() !== '' && savedAddress.address.trim() !== '';
  const canConfirm = !needsAddress || (addressMode === 'saved' ? isSavedAddressValid : isNewAddressValid);

  const handleNewAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  };

  const handleCardDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardDetails({ ...cardDetails, [e.target.name]: e.target.value });
  };

  const handleConfirm = () => {
    if (!canConfirm) return;
    const address = addressMode === 'new' ? newAddress : savedAddress;
    onConfirm({
      shippingMethod,
      paymentMethod,
      recipientName: address.name,
      recipientPhone: address.phone,
      shippingAddress: address.address,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div>
            <h3 className="text-base font-bold text-gray-900">Checkout</h3>
            <p className="text-xs text-gray-400 mt-0.5">Choose how you'd like to receive and pay for your order</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-700">Orders by seller</p>
            <div className="mt-2 space-y-1.5">
              {sellerGroups.map((seller) => (
                <div key={seller.key} className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate font-semibold text-gray-800">{seller.storeName}</span>
                  <span className={`shrink-0 text-[10px] font-bold uppercase tracking-wide ${seller.source === 'MARKETPLACE' ? 'text-orange-600' : 'text-blue-600'}`}>
                    {seller.itemCount} item{seller.itemCount === 1 ? '' : 's'}
                  </span>
                </div>
              ))}
            </div>
            {hasMultipleSellers && (
              <p className="mt-3 border-t border-gray-200 pt-3 text-xs leading-relaxed text-gray-500">
                Your cart contains {sellerCount} sellers. We will create one order per seller, and Standard Delivery is required.
              </p>
            )}
          </div>

          {/* Shipping Method */}
          <div>
            <h4 className="flex items-center gap-2 text-xs font-bold text-gray-900 uppercase tracking-wide mb-3">
              <Truck size={14} /> Shipping Method
            </h4>
            <div className="space-y-2">
              {SHIPPING_OPTIONS.map((opt) => {
                const isUnavailable = hasMultipleSellers && opt.id === 'pickup';
                const isSelected = shippingMethod === opt.id && !isUnavailable;
                return (
                  <button
                    type="button"
                    key={opt.id}
                    disabled={isUnavailable}
                    onClick={() => !isUnavailable && setShippingMethod(opt.id)}
                    className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition text-left ${isUnavailable ? 'cursor-not-allowed opacity-50 bg-gray-50 border border-gray-200' : 'cursor-pointer'} ${
                      isSelected
                        ? 'border-2 border-blue-600 bg-blue-50/40'
                        : 'border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <opt.icon size={18} className={isSelected ? 'text-blue-600' : 'text-gray-400'} />
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold ${isSelected ? 'text-blue-600' : 'text-gray-800'}`}>
                          {opt.label}
                        </p>
                        <p className="text-xs text-gray-400">{isUnavailable ? 'Available when all items are from one seller' : opt.description}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold shrink-0 ${isSelected ? 'text-blue-600' : 'text-gray-700'}`}>
                      {opt.fee === 0 ? 'Free' : hasMultipleSellers ? `${formatPrice(opt.fee)} × ${sellerCount}` : formatPrice(opt.fee)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Delivery Address */}
          <div>
            <h4 className="flex items-center gap-2 text-xs font-bold text-gray-900 uppercase tracking-wide mb-3">
              <MapPin size={14} /> Delivery Address
            </h4>

            {!needsAddress ? (
              <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
                <Store size={14} className="shrink-0" />
                No address needed — you'll pick up this order at our store counter.
              </div>
            ) : (
              <>
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setAddressMode('saved')}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                      addressMode === 'saved' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Saved Address
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddressMode('new')}
                    className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                      addressMode === 'new' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    New Address
                  </button>
                </div>

                {addressMode === 'saved' ? (
                  <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 space-y-0.5">
                    <p className="font-semibold text-gray-900">{savedAddress.name}</p>
                    <p className="text-gray-500">{savedAddress.phone}</p>
                    <p className="leading-relaxed">{savedAddress.address}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <input
                      type="text"
                      name="name"
                      value={newAddress.name}
                      onChange={handleNewAddressChange}
                      placeholder="Recipient Name"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                    />
                    <input
                      type="tel"
                      name="phone"
                      value={newAddress.phone}
                      onChange={handleNewAddressChange}
                      placeholder="Phone Number"
                      className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                    />
                    <textarea
                      name="address"
                      value={newAddress.address}
                      onChange={handleNewAddressChange}
                      placeholder="Full Address"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm resize-none"
                    />
                    <p className="text-[11px] text-gray-400">This address is used for this order only.</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <h4 className="flex items-center gap-2 text-xs font-bold text-gray-900 uppercase tracking-wide mb-3">
              <Wallet size={14} /> Payment Method
            </h4>
            <div className="grid grid-cols-3 gap-2.5">
              {PAYMENT_OPTIONS.map((opt) => {
                const isSelected = paymentMethod === opt.id;
                return (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => setPaymentMethod(opt.id)}
                    className={`relative flex flex-col items-start gap-1.5 p-3 rounded-xl transition text-left cursor-pointer ${
                      isSelected
                        ? 'border-2 border-blue-600 bg-blue-50/40'
                        : 'border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {isSelected && <Check size={14} className="absolute top-2.5 right-2.5 text-blue-600 stroke-[2.5]" />}
                    <opt.icon size={18} className={isSelected ? 'text-blue-600' : 'text-gray-400'} />
                    <div>
                      <p className={`text-xs font-semibold ${isSelected ? 'text-blue-600' : 'text-gray-800'}`}>
                        {opt.label}
                      </p>
                      <p className="text-[10px] text-gray-400 leading-snug">{opt.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Credit Card details */}
            {paymentMethod === 'credit-card' && (
              <div className="mt-3 space-y-3">
                <input
                  type="text"
                  name="number"
                  value={cardDetails.number}
                  onChange={handleCardDetailsChange}
                  placeholder="Card Number"
                  inputMode="numeric"
                  maxLength={19}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                />
                <input
                  type="text"
                  name="name"
                  value={cardDetails.name}
                  onChange={handleCardDetailsChange}
                  placeholder="Name on Card"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                />
                <div className="flex gap-3">
                  <input
                    type="text"
                    name="expiry"
                    value={cardDetails.expiry}
                    onChange={handleCardDetailsChange}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="w-1/2 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  />
                  <input
                    type="text"
                    name="cvc"
                    value={cardDetails.cvc}
                    onChange={handleCardDetailsChange}
                    placeholder="CVC"
                    inputMode="numeric"
                    maxLength={4}
                    className="w-1/2 px-3 py-2 border border-gray-200 rounded-md bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>
            )}

            {/* QR payment code */}
            {paymentMethod === 'qr' && (
              <div className="mt-3 flex flex-col items-center gap-3 bg-gray-50 border border-dashed border-gray-200 rounded-xl p-6">
                <img src="/qr-payment.png" alt="Scan to pay QR code" className="w-40 h-40 object-contain bg-white rounded-lg" />
                <p className="text-sm text-black text-center">
                  {formatPrice(total)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-gray-100 px-6 py-5 space-y-3">
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-semibold text-gray-800">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{hasMultipleSellers ? `Shipping Fee (${sellerCount} sellers)` : 'Shipping Fee'}</span>
              <span className="font-semibold text-gray-800">
                {shippingFee === 0 ? 'Free' : formatPrice(shippingFee)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-100">
              <span className="text-sm font-bold text-gray-900">Total</span>
              <span className="text-lg font-bold text-blue-600">{formatPrice(total)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white disabled:text-gray-400 font-bold py-3 rounded-full text-sm transition cursor-pointer"
          >
            Confirm Order — {formatPrice(total)}
          </button>

          {!canConfirm && (
            <p className="text-[11px] text-red-500 text-center">Please fill in your delivery address to continue.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
