import React, { useState } from 'react';
import { Plus, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Modal } from '../../components/Modal';
import { erpService } from '../../services/erpService';
import { useAuth } from '../../hooks/useAuth';
import type { PurchaseOrder } from '../../types';
import { formatKhr, formatUsd } from '../../utils/formatters';

export const PurchasingPage: React.FC = () => {
  const { activeBranch, usdToKhrRate } = useAuth();
  const [orders, setOrders] = useState<PurchaseOrder[]>(() => erpService.getPurchaseOrders());
  const suppliers = erpService.getSuppliers();
  const products = erpService.getProducts();

  const [modalOpen, setModalOpen] = useState(false);
  const [supplierId, setSupplierId] = useState(suppliers[0]?.id || '');
  const [productId, setProductId] = useState(products[0]?.id || '');
  const [quantity, setQuantity] = useState('50');
  const [expectedDate, setExpectedDate] = useState(
    new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 10)
  );

  const handleCreatePo = (e: React.FormEvent) => {
    e.preventDefault();
    const supplier = suppliers.find((s) => s.id === supplierId);
    const product = products.find((p) => p.id === productId);
    if (!supplier || !product) return;

    const qty = Number(quantity);
    const totalUsd = qty * product.costPriceUsd;
    const po: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber: `PO-2026-0${orders.length + 101}`,
      supplierId: supplier.id,
      supplierName: supplier.name,
      branchName: activeBranch?.name || 'Main Branch',
      orderDate: new Date().toISOString().slice(0, 10),
      expectedDate,
      status: 'ORDERED',
      totalUsd,
      items: [
        {
          productId: product.id,
          productName: product.name,
          quantity: qty,
          unitCostUsd: product.costPriceUsd,
        },
      ],
    };

    setOrders(erpService.savePurchaseOrder(po));
    setModalOpen(false);
  };

  const handleMarkReceived = (po: PurchaseOrder) => {
    if (po.status === 'RECEIVED') return;
    po.items.forEach((item) => {
      erpService.adjustStock(item.productId, item.quantity);
    });
    const updated: PurchaseOrder = { ...po, status: 'RECEIVED' };
    setOrders(erpService.savePurchaseOrder(updated));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Purchasing & Goods Receiving (PO)"
        subtitle="Create purchase orders and receive stock directly into Inventory"
        actions={
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Create Purchase Order</span>
          </button>
        }
      />

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-200">
                <th className="py-3 px-4">PO Number</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Total (USD / KHR)</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {orders.map((po) => (
                <tr key={po.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4">
                    <div className="font-mono font-bold text-slate-900">{po.poNumber}</div>
                    <div className="text-xs text-slate-400">Due: {po.expectedDate}</div>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{po.supplierName}</td>
                  <td className="py-3 px-4 text-slate-600">{po.branchName}</td>
                  <td className="py-3 px-4 text-xs text-slate-600">
                    {po.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ')}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{formatUsd(po.totalUsd)}</div>
                    <div className="text-xs text-emerald-700">
                      {formatKhr(po.totalUsd * usdToKhrRate)}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        po.status === 'RECEIVED'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-sky-50 text-sky-700'
                      }`}
                    >
                      {po.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {po.status !== 'RECEIVED' ? (
                      <button
                        type="button"
                        onClick={() => handleMarkReceived(po)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Receive Stock</span>
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">Stock Received</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New Purchase Order"
      >
        <form onSubmit={handleCreatePo} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier</label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Product</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — Cost: {formatUsd(p.costPriceUsd)}/{p.unit}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Order Quantity *
              </label>
              <input
                type="number"
                min={1}
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Expected Delivery
              </label>
              <input
                type="date"
                required
                value={expectedDate}
                onChange={(e) => setExpectedDate(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold"
            >
              Submit PO
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

