import React, { useMemo, useState } from 'react';
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  QrCode,
  Banknote,
  CreditCard,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { erpService } from '../../services/erpService';
import { useAuth } from '../../hooks/useAuth';
import type { PosCartItem, PosTransaction, Product } from '../../types';
import { formatKhr, formatUsd } from '../../utils/formatters';

export const PosPage: React.FC = () => {
  const { user, activeBranch, usdToKhrRate } = useAuth();
  const [products, setProducts] = useState<Product[]>(() => erpService.getProducts());
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [cart, setCart] = useState<PosCartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'KHQR' | 'CARD'>('KHQR');
  const [lastReceipt, setLastReceipt] = useState<PosTransaction | null>(null);

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return ['ALL', ...Array.from(set)];
  }, [products]);

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesQuery =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search);
    return matchesCategory && matchesQuery;
  });

  const addToCart = (product: Product) => {
    setLastReceipt(null);
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1, discountPercent: 0 }];
    });
  };

  const updateQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const subtotalUsd = cart.reduce(
    (sum, item) => sum + item.product.sellingPriceUsd * item.quantity,
    0
  );
  const totalKhr = subtotalUsd * usdToKhrRate;

  const handleCheckout = () => {
    if (cart.length === 0) return;

    const tx: PosTransaction = {
      id: `tx-${Date.now()}`,
      receiptNo: `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(
        100 + Math.random() * 900
      )}`,
      createdAt: new Date().toISOString(),
      cashier: user?.username || 'Cashier',
      branchCode: activeBranch?.code || 'MAIN',
      itemsCount: cart.reduce((sum, i) => sum + i.quantity, 0),
      totalUsd: subtotalUsd,
      totalKhr,
      paymentMethod,
    };

    erpService.recordPosTransaction(
      tx,
      cart.map((c) => ({ productId: c.product.id, quantity: c.quantity }))
    );

    setProducts(erpService.getProducts());
    setLastReceipt(tx);
    setCart([]);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Point of Sale (POS) Terminal"
        subtitle={`Branch: ${activeBranch?.name || 'Main Branch'} (${
          activeBranch?.code || 'MAIN'
        }) • Rate: 1 USD = ${usdToKhrRate.toLocaleString()} ៛`}
      />

      {lastReceipt && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-900">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <div className="text-sm">
              <span className="font-bold">Sale Completed!</span> Receipt{' '}
              <code className="font-mono font-bold">{lastReceipt.receiptNo}</code> •{' '}
              {formatUsd(lastReceipt.totalUsd)} ({formatKhr(lastReceipt.totalKhr)}) via{' '}
              {lastReceipt.paymentMethod}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setLastReceipt(null)}
            className="text-xs font-semibold text-emerald-700 hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Scan barcode or search product name / SKU..."
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredProducts.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => addToCart(p)}
                className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all text-left flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>{p.sku}</span>
                    <span>Stock: {p.stockQuantity}</span>
                  </div>
                  <div className="font-semibold text-sm text-slate-900 mt-1 line-clamp-2">
                    {p.name}
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                  <span className="text-base font-bold text-emerald-700">
                    {formatUsd(p.sellingPriceUsd)}
                  </span>
                  <span className="text-xs text-slate-500">
                    {formatKhr(p.sellingPriceUsd * usdToKhrRate)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Cart & Checkout Panel */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col h-fit sticky top-20">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <ShoppingCart className="w-4 h-4 text-emerald-600" />
              <span>Current Order ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
            </div>
            {cart.length > 0 && (
              <button
                type="button"
                onClick={() => setCart([])}
                className="text-xs text-rose-600 hover:underline flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>

          <div className="p-4 divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {cart.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-400">
                Click any product on the left or scan barcode to add to cart.
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="py-3 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-900 truncate">
                      {item.product.name}
                    </div>
                    <div className="text-xs text-slate-500">
                      {formatUsd(item.product.sellingPriceUsd)} × {item.quantity} ={' '}
                      <strong className="text-slate-800">
                        {formatUsd(item.product.sellingPriceUsd * item.quantity)}
                      </strong>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => updateQty(item.product.id, -1)}
                      className="p-1 rounded-md border border-slate-200 hover:bg-slate-100"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQty(item.product.id, 1)}
                      className="p-1 rounded-md border border-slate-200 hover:bg-slate-100"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-5 bg-slate-50 border-t border-slate-200 space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Total (USD)</span>
                <span className="font-bold text-lg text-slate-900">{formatUsd(subtotalUsd)}</span>
              </div>
              <div className="flex justify-between text-sm text-emerald-800">
                <span>Total (KHR)</span>
                <span className="font-bold text-lg">{formatKhr(totalKhr)}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'KHQR', label: 'KHQR', icon: QrCode },
                  { id: 'CASH', label: 'Cash', icon: Banknote },
                  { id: 'CARD', label: 'Card', icon: CreditCard },
                ] as const
              ).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setPaymentMethod(id)}
                  className={`py-2 px-2 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 ${
                    paymentMethod === id
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={cart.length === 0}
              onClick={handleCheckout}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-sm shadow-xs transition-colors"
            >
              Complete Payment ({formatUsd(subtotalUsd)})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

