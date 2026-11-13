import React, { useCallback, useEffect, useState } from 'react';
import {
  Building2,
  Coins,
  ArrowLeftRight,
  Settings,
  Plus,
  RefreshCw,
  Edit3,
  CheckCircle2,
} from 'lucide-react';
import { PageHeader } from '../../components/PageHeader';
import { Modal } from '../../components/Modal';
import { financeService } from '../../services/financeService';
import { useAuth } from '../../hooks/useAuth';
import type {
  BranchDto,
  BusinessSettingResponse,
  CurrencyDto,
  ExchangeRateDto,
} from '../../types';
import { extractErrorMessage, formatDateTime } from '../../utils/formatters';

export const FinancePage: React.FC = () => {
  const { refreshFinanceContext } = useAuth();

  const [branches, setBranches] = useState<BranchDto[]>([]);
  const [settings, setSettings] = useState<BusinessSettingResponse[]>([]);
  const [currencies, setCurrencies] = useState<CurrencyDto[]>([]);
  const [rates, setRates] = useState<ExchangeRateDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Branch Modal
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchDto | null>(null);
  const [branchCode, setBranchCode] = useState('');
  const [branchName, setBranchName] = useState('');
  const [branchAddress, setBranchAddress] = useState('');
  const [branchPhone, setBranchPhone] = useState('');
  const [branchActive, setBranchActive] = useState(true);

  // Currency Modal
  const [currencyModalOpen, setCurrencyModalOpen] = useState(false);
  const [currCode, setCurrCode] = useState('');
  const [currName, setCurrName] = useState('');
  const [currSymbol, setCurrSymbol] = useState('');
  const [currDecimals, setCurrDecimals] = useState(2);

  // Exchange Rate Modal
  const [rateModalOpen, setRateModalOpen] = useState(false);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('KHR');
  const [rateValue, setRateValue] = useState('4100');
  const [rateSource, setRateSource] = useState('National Bank of Cambodia');

  // Business Setting Modal
  const [editingSetting, setEditingSetting] = useState<BusinessSettingResponse | null>(null);
  const [settingBaseCurrency, setSettingBaseCurrency] = useState('KHR');
  const [settingTimezone, setSettingTimezone] = useState('Asia/Phnom_Penh');
  const [settingNegativeStock, setSettingNegativeStock] = useState(false);

  const loadFinanceData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [bData, sData, cData, rData] = await Promise.all([
        financeService.getAllBranches(),
        financeService.getAllBusinessSettings(),
        financeService.getAllCurrencies(),
        financeService.getAllExchangeRates(),
      ]);
      setBranches(bData);
      setSettings(sData);
      setCurrencies(cData);
      setRates(rData);
      await refreshFinanceContext();
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to fetch finance data from backend'));
    } finally {
      setLoading(false);
    }
  }, [refreshFinanceContext]);

  useEffect(() => {
    loadFinanceData();
  }, [loadFinanceData]);

  const openNewBranch = () => {
    setEditingBranch(null);
    setBranchCode('');
    setBranchName('');
    setBranchAddress('');
    setBranchPhone('');
    setBranchActive(true);
    setBranchModalOpen(true);
  };

  const openEditBranch = (b: BranchDto) => {
    setEditingBranch(b);
    setBranchCode(b.code);
    setBranchName(b.name);
    setBranchAddress(b.address || '');
    setBranchPhone(b.phone || '');
    setBranchActive(b.isActive ?? true);
    setBranchModalOpen(true);
  };

  const handleSaveBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    try {
      if (editingBranch?.id) {
        await financeService.updateBranch(editingBranch.id, {
          code: branchCode,
          name: branchName,
          address: branchAddress,
          phone: branchPhone,
          isActive: branchActive,
        });
        setSuccessMsg(`Updated branch ${branchCode}`);
      } else {
        await financeService.createBranch({
          code: branchCode,
          name: branchName,
          address: branchAddress,
          phone: branchPhone,
          isActive: branchActive,
        });
        setSuccessMsg(`Created branch ${branchCode}`);
      }
      setBranchModalOpen(false);
      await loadFinanceData();
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to save branch'));
    }
  };

  const handleSaveCurrency = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    try {
      await financeService.saveCurrency({
        code: currCode.toUpperCase(),
        name: currName,
        symbol: currSymbol,
        decimalPlaces: currDecimals,
        isActive: true,
      });
      setCurrencyModalOpen(false);
      setCurrCode('');
      setCurrName('');
      setCurrSymbol('');
      setSuccessMsg(`Saved currency ${currCode.toUpperCase()}`);
      await loadFinanceData();
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to save currency'));
    }
  };

  const handleCreateRate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    try {
      await financeService.createExchangeRate({
        fromCurrency: fromCurrency.toUpperCase(),
        toCurrency: toCurrency.toUpperCase(),
        rate: Number(rateValue),
        validFrom: new Date().toISOString(),
        source: rateSource,
      });
      setRateModalOpen(false);
      setSuccessMsg(`Added exchange rate: 1 ${fromCurrency} = ${rateValue} ${toCurrency}`);
      await loadFinanceData();
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to create exchange rate'));
    }
  };

  const handleUpdateSetting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSetting) return;
    setError(null);
    setSuccessMsg(null);
    try {
      await financeService.updateSettingsByBranchId(editingSetting.branchId, {
        baseCurrencyCode: settingBaseCurrency,
        timezone: settingTimezone,
        allowNegativeStock: settingNegativeStock,
      });
      setEditingSetting(null);
      setSuccessMsg(`Updated business settings for ${editingSetting.branchName}`);
      await loadFinanceData();
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to update business settings'));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finance, Branches & Currencies"
        subtitle="Connected live to /branches, /business-settings, /currencies, and /exchange-rates"
        actions={
          <>
            <button
              type="button"
              onClick={loadFinanceData}
              className="px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Sync Backend</span>
            </button>
            <button
              type="button"
              onClick={openNewBranch}
              className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Branch</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrencyModalOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <Coins className="w-3.5 h-3.5" />
              <span>Add Currency</span>
            </button>
            <button
              type="button"
              onClick={() => setRateModalOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>New Exchange Rate</span>
            </button>
          </>
        }
      />

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Branches Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <h2 className="font-semibold text-slate-900">Branches ({branches.length})</h2>
            </div>
            <span className="text-xs text-slate-400">GET / POST / PUT /branches</span>
          </div>
          <div className="divide-y divide-slate-100">
            {branches.map((b) => (
              <div key={b.id || b.code} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{b.name}</span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-mono">
                      {b.code}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${b.isActive !== false
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-slate-100 text-slate-500'
                        }`}
                    >
                      {b.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {b.address || 'No address'} {b.phone ? `• ${b.phone}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openEditBranch(b)}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-emerald-700 hover:bg-emerald-50 flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              </div>
            ))}
            {branches.length === 0 && (
              <div className="p-6 text-center text-sm text-slate-400">No branches found.</div>
            )}
          </div>
        </div>

        {/* Business Settings Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-indigo-600" />
              <h2 className="font-semibold text-slate-900">Branch Business Settings</h2>
            </div>
            <span className="text-xs text-slate-400">PUT /business-settings/branch/:id</span>
          </div>
          <div className="divide-y divide-slate-100">
            {settings.map((s) => (
              <div key={s.id} className="p-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-bold text-slate-900">
                    {s.branchName}{' '}
                    <span className="text-xs font-mono text-slate-500">({s.branchCode})</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-medium">
                      Base Currency: {s.baseCurrencyCode} ({s.baseCurrencySymbol})
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100">TZ: {s.timezone}</span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-100">
                      Negative Stock: {s.allowNegativeStock ? 'Allowed' : 'Blocked'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingSetting(s);
                    setSettingBaseCurrency(s.baseCurrencyCode);
                    setSettingTimezone(s.timezone);
                    setSettingNegativeStock(s.allowNegativeStock);
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-indigo-700 hover:bg-indigo-50 flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Configure</span>
                </button>
              </div>
            ))}
            {settings.length === 0 && (
              <div className="p-6 text-center text-sm text-slate-400">
                No business settings found.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Currencies Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Currencies ({currencies.length})</h2>
            <span className="text-xs text-slate-400">/currencies</span>
          </div>
          <div className="divide-y divide-slate-100">
            {currencies.map((c) => (
              <div key={c.code} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900">
                    {c.code} — {c.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    Decimals: {c.decimalPlaces} • Status: {c.isActive !== false ? 'Active' : 'Inactive'}
                  </div>
                </div>
                <span className="text-lg font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg">
                  {c.symbol}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Exchange Rates Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Exchange Rates ({rates.length})</h2>
            <span className="text-xs text-slate-400">GET / POST /exchange-rates</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-200">
                  <th className="py-3 px-4">Pair</th>
                  <th className="py-3 px-4">Rate</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Valid From</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {rates.map((r, i) => (
                  <tr key={r.id || i} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {r.fromCurrency} → {r.toCurrency}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                      {Number(r.rate).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-600">{r.source || 'Manual'}</td>
                    <td className="py-3 px-4 text-xs text-slate-500">
                      {formatDateTime(r.validFrom)}
                    </td>
                  </tr>
                ))}
                {rates.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      No exchange rates recorded yet. Click "New Exchange Rate" to add USD → KHR.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Branch Modal */}
      <Modal
        isOpen={branchModalOpen}
        onClose={() => setBranchModalOpen(false)}
        title={editingBranch ? `Edit Branch: ${editingBranch.code}` : 'Create New Branch'}
      >
        <form onSubmit={handleSaveBranch} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Branch Code *</label>
            <input
              type="text"
              required
              placeholder="e.g. MAIN, BKK1, TK"
              value={branchCode}
              onChange={(e) => setBranchCode(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Branch Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Boeung Keng Kang 1 Branch"
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Address</label>
            <input
              type="text"
              value={branchAddress}
              onChange={(e) => setBranchAddress(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
            <input
              type="text"
              value={branchPhone}
              onChange={(e) => setBranchPhone(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={branchActive}
              onChange={(e) => setBranchActive(e.target.checked)}
            />
            <span>Branch is Active</span>
          </label>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setBranchModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold"
            >
              Save Branch
            </button>
          </div>
        </form>
      </Modal>

      {/* Currency Modal */}
      <Modal
        isOpen={currencyModalOpen}
        onClose={() => setCurrencyModalOpen(false)}
        title="Add / Update Currency"
      >
        <form onSubmit={handleSaveCurrency} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ISO 4217 Code (3 letters) *
            </label>
            <input
              type="text"
              required
              minLength={3}
              maxLength={3}
              placeholder="THB, EUR, CNY..."
              value={currCode}
              onChange={(e) => setCurrCode(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Currency Name *</label>
            <input
              type="text"
              required
              placeholder="Khmer Riel"
              value={currName}
              onChange={(e) => setCurrName(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Symbol *</label>
              <input
                type="text"
                required
                placeholder="฿"
                value={currSymbol}
                onChange={(e) => setCurrSymbol(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Decimal Places (0-4)
              </label>
              <input
                type="number"
                min={0}
                max={4}
                required
                value={currDecimals}
                onChange={(e) => setCurrDecimals(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrencyModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
            >
              Save Currency
            </button>
          </div>
        </form>
      </Modal>

      {/* Exchange Rate Modal */}
      <Modal
        isOpen={rateModalOpen}
        onClose={() => setRateModalOpen(false)}
        title="Record Exchange Rate"
      >
        <form onSubmit={handleCreateRate} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">From Currency</label>
              <select
                value={fromCurrency}
                onChange={(e) => setFromCurrency(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              >
                {currencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">To Currency</label>
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
              >
                {currencies.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Rate *</label>
            <input
              type="number"
              step="0.0001"
              min="0.0001"
              required
              value={rateValue}
              onChange={(e) => setRateValue(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Source</label>
            <input
              type="text"
              value={rateSource}
              onChange={(e) => setRateSource(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setRateModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-xs font-semibold"
            >
              Save Exchange Rate
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Business Settings Modal */}
      <Modal
        isOpen={Boolean(editingSetting)}
        onClose={() => setEditingSetting(null)}
        title={`Configure Settings: ${editingSetting?.branchName || ''}`}
      >
        <form onSubmit={handleUpdateSetting} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Base Currency</label>
            <select
              value={settingBaseCurrency}
              onChange={(e) => setSettingBaseCurrency(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} — {c.name} ({c.symbol})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Timezone</label>
            <input
              type="text"
              value={settingTimezone}
              onChange={(e) => setSettingTimezone(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={settingNegativeStock}
              onChange={(e) => setSettingNegativeStock(e.target.checked)}
            />
            <span>Allow Negative Stock during POS Sales</span>
          </label>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditingSetting(null)}
              className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold"
            >
              Update Settings
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

