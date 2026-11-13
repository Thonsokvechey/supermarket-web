import React from 'react';
import { PageHeader } from '../../components/PageHeader';
import { erpService } from '../../services/erpService';
import { useAuth } from '../../hooks/useAuth';
import { formatDateTime, formatKhr, formatUsd } from '../../utils/formatters';

export const ReportsPage: React.FC = () => {
  const { usdToKhrRate, branches, currencies } = useAuth();
  const transactions = erpService.getPosTransactions();
  const products = erpService.getProducts();
  const purchaseOrders = erpService.getPurchaseOrders();

  const totalPosRevenueUsd = transactions.reduce((s, t) => s + t.totalUsd, 0);
  const totalPurchasingUsd = purchaseOrders.reduce((s, p) => s + p.totalUsd, 0);
  const totalStockCostUsd = products.reduce(
    (s, p) => s + p.stockQuantity * p.costPriceUsd,
    0
  );
  const totalStockRetailUsd = products.reduce(
    (s, p) => s + p.stockQuantity * p.sellingPriceUsd,
    0
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Financial & Operations Reports"
        subtitle="Consolidated summary across POS sales, inventory valuation, purchasing, and multi-currency settings"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="text-xs font-medium text-slate-500">Gross POS Sales</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {formatUsd(totalPosRevenueUsd)}
          </div>
          <div className="text-xs text-emerald-700 mt-1">
            {formatKhr(totalPosRevenueUsd * usdToKhrRate)}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="text-xs font-medium text-slate-500">Purchase Orders Spend</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {formatUsd(totalPurchasingUsd)}
          </div>
          <div className="text-xs text-slate-500 mt-1">{purchaseOrders.length} Purchase Orders</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="text-xs font-medium text-slate-500">Inventory Cost Value</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {formatUsd(totalStockCostUsd)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Retail: {formatUsd(totalStockRetailUsd)}
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200">
          <div className="text-xs font-medium text-slate-500">Projected Margin</div>
          <div className="text-2xl font-bold text-emerald-700 mt-1">
            {formatUsd(totalStockRetailUsd - totalStockCostUsd)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {branches.length || 1} Active Branches • {currencies.length || 2} Currencies
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">
            Complete POS Sales Ledger ({transactions.length})
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-200">
                <th className="py-3 px-4">Receipt No</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4">Cashier</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Total (USD)</th>
                <th className="py-3 px-4">Total (KHR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{t.receiptNo}</td>
                  <td className="py-3 px-4 text-xs text-slate-500">
                    {formatDateTime(t.createdAt)}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs">{t.branchCode}</td>
                  <td className="py-3 px-4">{t.cashier}</td>
                  <td className="py-3 px-4">{t.itemsCount}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-xs font-semibold">
                      {t.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">{formatUsd(t.totalUsd)}</td>
                  <td className="py-3 px-4 text-emerald-700 font-semibold">
                    {formatKhr(t.totalKhr)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

