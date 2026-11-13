import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { ACCESS_TOKEN_KEY, USER_INFO_KEY } from '../../services/apiClient';
import { authService } from '../../services/authService';
import { financeService } from '../../services/financeService';
import type { BranchDto, CurrencyDto, ExchangeRateDto, LoginRequest, UserInfo } from '../../types';

export interface AuthContextValue {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  branches: BranchDto[];
  activeBranch: BranchDto | null;
  setActiveBranch: (branch: BranchDto) => void;
  currencies: CurrencyDto[];
  exchangeRates: ExchangeRateDto[];
  usdToKhrRate: number;
  backendOnline: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshFinanceContext: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(() => {
    try {
      const saved = localStorage.getItem(USER_INFO_KEY);
      return saved ? (JSON.parse(saved) as UserInfo) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [branches, setBranches] = useState<BranchDto[]>([]);
  const [activeBranch, setActiveBranch] = useState<BranchDto | null>(null);
  const [currencies, setCurrencies] = useState<CurrencyDto[]>([]);
  const [exchangeRates, setExchangeRates] = useState<ExchangeRateDto[]>([]);
  const [backendOnline, setBackendOnline] = useState<boolean>(false);

  const refreshFinanceContext = useCallback(async () => {
    try {
      const [branchList, currencyList, rateList] = await Promise.all([
        financeService.getAllBranches(),
        financeService.getAllCurrencies(),
        financeService.getAllExchangeRates(),
      ]);
      setBranches(branchList);
      setCurrencies(currencyList);
      setExchangeRates(rateList);
      setBackendOnline(true);
      setActiveBranch((prev) => prev || branchList[0] || null);
    } catch {
      setBackendOnline(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      await refreshFinanceContext();
      const token = localStorage.getItem(ACCESS_TOKEN_KEY);
      if (token) {
        try {
          const me = await authService.getMe();
          if (mounted) setUser(me);
        } catch {
          // Keep cached user if backend is temporarily unreachable, or clear if 401 cleared token
          if (!localStorage.getItem(ACCESS_TOKEN_KEY) && mounted) {
            setUser(null);
          }
        }
      }
      if (mounted) setIsLoading(false);
    };
    init();
    return () => {
      mounted = false;
    };
  }, [refreshFinanceContext]);

  const login = useCallback(
    async (payload: LoginRequest) => {
      const res = await authService.login(payload);
      setUser(res.user);
      await refreshFinanceContext();
    },
    [refreshFinanceContext]
  );

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const usdToKhrRate = useMemo(() => {
    const match = exchangeRates.find(
      (r) => r.fromCurrency === 'USD' && r.toCurrency === 'KHR'
    );
    return match ? Number(match.rate) : 4100;
  }, [exchangeRates]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      branches,
      activeBranch,
      setActiveBranch,
      currencies,
      exchangeRates,
      usdToKhrRate,
      backendOnline,
      login,
      logout,
      refreshFinanceContext,
    }),
    [
      user,
      isLoading,
      branches,
      activeBranch,
      currencies,
      exchangeRates,
      usdToKhrRate,
      backendOnline,
      login,
      logout,
      refreshFinanceContext,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

