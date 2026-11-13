import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Store,
  Boxes,
  Building2,
  Users,
  AlertTriangle,
  ArrowUpRight,
  Coins,
  ShieldCheck,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { useAuth } from '../../hooks/useAuth';
import { erpService } from '../../services/erpService';
import { authService } from '../../services/authService';
import { formatKhr, formatUsd, formatDateTime } from '../../utils/formatters';

export const DashboardPage: React.FC = () => {
  const { branches, currencies, usdToKhrRate, backendOnline, activeBranch } = useAuth();
  const [userCount, setUserCount] = useState<number>(0);
  const [roleCount, setRoleCount] = useState<number>(0);

  const products = erpService.getProducts();
  const transactions = erpService.getPosTransactions();
  const employees = erpService.getEmployees();
  const lowStockProducts = products.filter((p) => p.stockQuantity <= p.reorderLevel);

  const totalSalesUsd = transactions.reduce((sum, t) => sum + t.totalUsd, 0);
  const totalInventoryValueUsd = products.reduce(
    (sum, p) => sum + p.stockQuantity * p.sellingPriceUsd,
    0
  );

  useEffect(() => {
    authService
      .getAllUsers()
      .then((u) => setUserCount(u.length))
      .catch(() => {});
    authService
      .getAllRoles()
      .then((r) => setRoleCount(r.length))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Supermarket Overview"
        subtitle={`Active Branch: ${activeBranch?.name || 'Main Branch'} • Real-time ERP & POS Dashboard`}
        actions={
          <Link
            to="/pos"
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
          >
            <Store className="w-4 h-4" />
            <span>Open POS Terminal</span>
          </Link>
        }
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>POS Revenue (Today)</span>
            <Store className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{formatUsd(totalSalesUsd)}</div>
          <div className="mt-1 text-xs text-emerald-700 font-medium">
            ≈ {formatKhr(totalSalesUsd * usdToKhrRate)} ({transactions.length} receipts)
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Stock Retail Valuation</span>
            <Boxes className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {formatUsd(totalInventoryValueUsd)}
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {products.length} SKUs • {lowStockProducts.length} low stock
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Branches & Currencies (Backend)</span>
            <Building2 className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {branches.length || 1} Branches
          </div>
          <div className="mt-1 text-xs text-slate-500 flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-amber-500" />
            <span>
              {currencies.map((c) => c.code).join(', ') || 'USD, KHR'} (1$ ={' '}
              {usdToKhrRate.toLocaleString()}៛)
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Users, Roles & Staff</span>
            <ShieldCheck className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">
            {userCount} Users / {roleCount} Roles
          </div>
          <div className="mt-1 text-xs text-slate-500">
            {employees.length} Staff • Backend {backendOnline ? 'Connected' : 'Offline'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent POS Receipts */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Recent POS Transactions</h2>
            <Link
              to="/pos"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>New Sale</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-200">
                  <th className="py-3 px-4">Receipt #</th>
                  <th className="py-3 px-4">Time</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Total (USD)</th>
                  <th className="py-3 px-4">Total (KHR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {transactions.slice(0, 6).map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                      {tx.receiptNo}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-500">
                      {formatDateTime(tx.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                        {tx.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {formatUsd(tx.totalUsd)}
                    </td>
                    <td className="py-3 px-4 text-emerald-700 font-medium">
                      {formatKhr(tx.totalKhr)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h2 className="font-semibold text-slate-900">Low Stock Alerts</h2>
            </div>
            <Link to="/inventory" className="text-xs font-semibold text-emerald-700">
              View All
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {lowStockProducts.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-400">
                All products are well stocked!
              </div>
            ) : (
              lowStockProducts.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-sm text-slate-900">{item.name}</div>
                    <div className="text-xs text-slate-500">
                      SKU: {item.sku} • Reorder Level: {item.reorderLevel}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold shrink-0">
                    {item.stockQuantity} {item.unit}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

