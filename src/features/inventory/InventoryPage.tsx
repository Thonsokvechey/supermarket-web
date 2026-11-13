import React, { useState } from 'react';
import { Plus, Search, PackagePlus, PackageMinus } from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Modal } from '../../components/Modal';
import { erpService } from '../../services/erpService';
import { useAuth } from '../../hooks/useAuth';
import type { Product } from '../../types';
import { formatKhr, formatUsd } from '../../utils/formatters';

export const InventoryPage: React.FC = () => {
  const { usdToKhrRate } = useAuth();
  const [products, setProducts] = useState<Product[]>(() => erpService.getProducts());
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  // New Product state
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Beverages');
  const [unit, setUnit] = useState('Unit');
  const [costPrice, setCostPrice] = useState('1.00');
  const [sellingPrice, setSellingPrice] = useState('1.50');
  const [stockQty, setStockQty] = useState('50');
  const [reorderLevel, setReorderLevel] = useState('15');

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode.includes(search)
  );

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const created: Product = {
      id: `prd-${Date.now()}`,
      sku,
      barcode,
      name,
      category,
      unit,
      costPriceUsd: Number(costPrice),
      sellingPriceUsd: Number(sellingPrice),
      stockQuantity: Number(stockQty),
      reorderLevel: Number(reorderLevel),
      isActive: true,
    };
    setProducts(erpService.saveProduct(created));
    setModalOpen(false);
    setSku('');
    setBarcode('');
    setName('');
  };

  const handleAdjustStock = (id: string, delta: number) => {
    setProducts(erpService.adjustStock(id, delta));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory & Product Catalog"
        subtitle={`Dual-currency pricing synchronized with backend exchange rate (1 USD = ${usdToKhrRate.toLocaleString()} ៛)`}
        actions={
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        }
      />

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative max-w-md w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product name, SKU, or barcode..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 focus:border-emerald-500 focus:outline-none"
            />
          </div>
          <span className="text-xs text-slate-500">{filtered.length} products shown</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-200">
                <th className="py-3 px-4">SKU / Barcode</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Cost (USD)</th>
                <th className="py-3 px-4">Price (USD / KHR)</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4 text-right">Quick Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filtered.map((p) => {
                const isLow = p.stockQuantity <= p.reorderLevel;
                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="font-mono text-xs font-bold text-slate-800">{p.sku}</div>
                      <div className="font-mono text-[11px] text-slate-400">{p.barcode}</div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{p.name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs">
                        {p.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{formatUsd(p.costPriceUsd)}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{formatUsd(p.sellingPriceUsd)}</div>
                      <div className="text-xs text-emerald-700">
                        {formatKhr(p.sellingPriceUsd * usdToKhrRate)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          isLow
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-800'
                        }`}
                      >
                        {p.stockQuantity} {p.unit}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleAdjustStock(p.id, -5)}
                          title="Remove 5 units"
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-rose-50 hover:text-rose-700 text-slate-600"
                        >
                          <PackageMinus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAdjustStock(p.id, 10)}
                          title="Add 10 units"
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600"
                        >
                          <PackagePlus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add New Product"
      >
        <form onSubmit={handleCreateProduct} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">SKU *</label>
              <input
                type="text"
                required
                placeholder="BEV-010"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Barcode *</label>
              <input
                type="text"
                required
                placeholder="884600100999"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Unit</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cost Price (USD)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Selling Price (USD)
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Initial Stock
              </label>
              <input
                type="number"
                required
                value={stockQty}
                onChange={(e) => setStockQty(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reorder Level
              </label>
              <input
                type="number"
                required
                value={reorderLevel}
                onChange={(e) => setReorderLevel(e.target.value)}
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
              Save Product
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

